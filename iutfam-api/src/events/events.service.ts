import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.event.findMany({
      where: { published: true },
      orderBy: { startsAt: 'asc' },
      select: {
        id: true, title: true, location: true, startsAt: true, endsAt: true,
        createdAt: true, createdById: true,
      },
    });
  }

  async byId(id: string) {
    const ev = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true, title: true, description: true, location: true,
        startsAt: true, endsAt: true, published: true,
        createdAt: true, updatedAt: true,
        createdBy: { select: { id: true, username: true, displayName: true } },
      },
    });
    if (!ev) throw new NotFoundException('Event not found');
    return ev;
  }

  async create(userId: string, dto: CreateEventDto) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startsAt: new Date(dto.startsAt),
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        published: dto.published ?? true,
        createdById: userId,
      },
      select: { id: true },
    });
  }
}
