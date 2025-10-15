import { BadRequestException, Body, Controller, Post, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { isEmailAllowed } from './utils';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    // 1) trouver l'utilisateur
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('Email ou mot de passe invalide');

    // 2) vérifier le mot de passe
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new BadRequestException('Email ou mot de passe invalide');

    // 3) émettre les JWT (access + refresh)
    const payload = { sub: user.id, username: user.username };

    const accessTtl = (process.env.JWT_ACCESS_TTL ?? '15m') as any;   // ← cast pour typer expiresIn
    const refreshTtl = (process.env.JWT_REFRESH_TTL ?? '30d') as any; // ← idem

    const accessToken = await this.jwt.signAsync(payload, { expiresIn: accessTtl });
    const refreshToken = await this.jwt.signAsync(payload, { expiresIn: refreshTtl });

    // 4) poser les cookies httpOnly (dev: secure=false)
    res.cookie('access_token', accessToken, { httpOnly: true, sameSite: 'lax', path: '/' });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, sameSite: 'lax', path: '/' });

    // 5) réponse légère pour le front
    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName ?? user.username,
      },
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { ok: true };
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    if (!isEmailAllowed(dto.email)) {
      throw new BadRequestException('Email non autorisé');
    }

    const hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        passwordHash: hash,
        displayName: dto.displayName ?? dto.username,
      },
    });

    // Associer à la classe choisie (créée si absente)
    const cls = await this.prisma.classGroup.upsert({
      where: { name: dto.className },
      create: { name: dto.className },
      update: {},
    });

    await this.prisma.userClass.create({
      data: { userId: user.id, classGroupId: cls.id },
    });

    // Ajouter le user au chat GENERAL + chat de classe (créés au seed ou à la volée)
    const general = await this.prisma.chat.upsert({
      where: { id: 'GENERAL_SINGLETON' },
      create: { id: 'GENERAL_SINGLETON', type: 'GENERAL' },
      update: {},
    });

    await this.prisma.chatParticipant.createMany({
      data: [{ chatId: general.id, userId: user.id }],
      skipDuplicates: true,
    });

    const classChatId = `CLASS_${cls.id}`; // ID unique dérivé de la classe
    const classChat = await this.prisma.chat.upsert({
      where: { id: classChatId },
      create: { id: classChatId, type: 'CLASS', classId: cls.id },
      update: {},
    });

    await this.prisma.chatParticipant.create({
      data: { chatId: classChat.id, userId: user.id },
    });

    return { ok: true };
  }
}
