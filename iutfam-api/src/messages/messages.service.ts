import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async listRecent(chatId: string, limit = 50) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) throw new NotFoundException('Chat not found');

    return this.prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, email: true, username: true }, // <<< ICI
        },
      },
    });
  }

  async create(params: { chatId: string; content: string; senderId: string }) {
    const { chatId, content, senderId } = params;

    const [chat, user] = await Promise.all([
      this.prisma.chat.findUnique({ where: { id: chatId } }),
      this.prisma.user.findUnique({ where: { id: senderId } }),
    ]);
    if (!chat) throw new NotFoundException('Chat not found');
    if (!user) throw new NotFoundException('Sender not found');

    return this.prisma.message.create({
      data: { chatId, content, senderId },
      include: {
        sender: {
          select: { id: true, email: true, username: true }, // <<< ET LÀ
        },
      },
    });
  }
}
