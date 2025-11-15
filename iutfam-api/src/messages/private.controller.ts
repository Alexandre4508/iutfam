import {
  BadRequestException,
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
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
    if (!me) {
      throw new BadRequestException('User not found in token');
    }
    if (!targetUserId) {
      throw new BadRequestException('targetUserId missing');
    }
    if (me === targetUserId) {
      throw new BadRequestException("Tu ne peux pas discuter avec toi-même");
    }

    // ID déterministe basé sur l'ordre des 2 IDs
    const [a, b] = me < targetUserId ? [me, targetUserId] : [targetUserId, me];
    const chatId = `PRIVATE_${a}_${b}`;

    // On vérifie si le chat existe déjà
    let chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    // Sinon on le crée (une seule fois)
    if (!chat) {
      chat = await this.prisma.chat.create({
        data: {
          id: chatId,
          type: ChatType.PRIVATE,

          // si tu as un champ "type" dans Chat, adapte la ligne ci-dessous :
          // type: 'PRIVATE',
        },
      });
    }

    return { chatId: chat.id };
  }
}
