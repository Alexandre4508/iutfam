import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.service.byId(id);
  }

  @UseGuards(JwtAuthGuard) // création réservée aux users connectés
  @Post()
  create(@Req() req: any, @Body() dto: CreateEventDto) {
    const userId = req.user?.sub;
    return this.service.create(userId, dto);
  }
}
