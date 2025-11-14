import { Controller, Post, Req, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { ChatType } from '@prisma/client';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class PrivateChatsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('private')
  async getOrCreatePrivateChat(
    @Req() req: any,
    @Body('targetUserId') targetUserId: string,
  ) {
    const me: string | undefined = req.user?.sub;
    if (!me) throw new Error('User not found in token');
    if (!targetUserId) throw new Error('targetUserId missing');
    if (me === targetUserId) {
      throw new Error("Impossible de discuter avec toi-même");
    }

    // 1) Chercher un chat privé existant entre les 2 utilisateurs
    const existing = await this.prisma.chat.findFirst({
      where: {
        type: ChatType.PRIVATE,
        participants: {
          some: { userId: me },
        },
        AND: {
          participants: {
            some: { userId: targetUserId },
          },
        },
      },
    });

    if (existing) {
      return { chatId: existing.id };
    }

    // 2) Sinon, créer le chat + les 2 participants
    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.PRIVATE,
        participants: {
          create: [
            { userId: me },
            { userId: targetUserId },
          ],
        },
      },
    });

    return { chatId: chat.id };
  }
}
