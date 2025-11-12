import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // on ajoute

@Controller('messages')
export class MessagesController {
  constructor(private readonly svc: MessagesService) {}

  @Get()
  list(@Query('chatId') chatId = 'GENERAL_SINGLETON', @Query('limit') limit = '50') {
    return this.svc.listRecent(chatId, Number(limit));
  }

  //  On protège la création par le guard JWT
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: CreateMessageDto, @Req() req: any) {
    const senderId = req.user.sub; //  on récupère le vrai ID du user connecté
    return this.svc.create({
      chatId: body.chatId ?? 'GENERAL_SINGLETON',
      content: body.content,
      senderId,
    });
  }
}
