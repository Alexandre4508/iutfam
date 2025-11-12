import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto, RateMenuDto, CommentMenuDto } from './dto/create-menu.dto';
import { addDays, startOfDay } from 'date-fns';

@Injectable()
export class CanteenService {
  constructor(private prisma: PrismaService) {}

  async upsertMenu(dto: CreateMenuDto) {
    const d = new Date(dto.date);
    return this.prisma.canteenMenu.upsert({
      where: { date: startOfDay(d) },
      update: {
        mainDish: dto.mainDish,
        sideDish: dto.sideDish,
        veggies: dto.veggies,
        dessert: dto.dessert,
        priceStudent: dto.priceStudent ? dto.priceStudent : null,
        hoursStart: dto.hoursStart,
        hoursEnd: dto.hoursEnd,
      },
      create: {
        date: startOfDay(d),
        mainDish: dto.mainDish,
        sideDish: dto.sideDish,
        veggies: dto.veggies,
        dessert: dto.dessert,
        priceStudent: dto.priceStudent ? dto.priceStudent : null,
        hoursStart: dto.hoursStart,
        hoursEnd: dto.hoursEnd,
      },
      include: { ratings: true, comments: true },
    });
  }

  async getToday() {
    const today = startOfDay(new Date());
    const m = await this.prisma.canteenMenu.findUnique({
      where: { date: today },
      include: { ratings: true, comments: { orderBy: { createdAt: 'desc' } } },
    });
    return m;
  }

  async getPrevious(limit = 7) {
    const today = startOfDay(new Date());
    return this.prisma.canteenMenu.findMany({
      where: { date: { lt: today } },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        ratings: true,
      },
    });
  }

  async rate(menuId: string, userId: string, dto: RateMenuDto) {
    // upsert pour permettre de modifier sa note
    return this.prisma.canteenRating.upsert({
      where: { menuId_userId: { menuId, userId } },
      update: { score: dto.score },
      create: { menuId, userId, score: dto.score },
    });
  }

  async comment(menuId: string, userId: string, dto: CommentMenuDto) {
    // Vérifie que le menu existe
    const menu = await this.prisma.canteenMenu.findUnique({ where: { id: menuId } });
    if (!menu) throw new NotFoundException('Menu not found');
    return this.prisma.canteenComment.create({
      data: { menuId, userId, text: dto.text },
    });
  }

  async ratingSummary(menuId: string) {
    const [count, sum] = await Promise.all([
      this.prisma.canteenRating.count({ where: { menuId } }),
      this.prisma.canteenRating.aggregate({ where: { menuId }, _sum: { score: true } }),
    ]);
    const avg = count ? (sum._sum.score ?? 0) / count : 0;
    return { count, average: avg };
  }
}
