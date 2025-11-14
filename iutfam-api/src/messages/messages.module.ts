import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { PrivateChatsController } from './private.controller';

@Module({
  imports: [AuthModule],
  providers: [MessagesService, PrismaService, ChatGateway],
  controllers: [MessagesController, PrivateChatsController],
  exports: [MessagesService],
})
export class MessagesModule {}
