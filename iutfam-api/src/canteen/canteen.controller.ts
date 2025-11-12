import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common';
import { CanteenService } from './canteen.service';
import { CreateMenuDto, RateMenuDto, CommentMenuDto } from './dto/create-menu.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('canteen')
export class CanteenController {
  constructor(private readonly svc: CanteenService) {}

  // Poster le menu du jour (ou d'une date) — pour l’instant toute personne loggée
  @UseGuards(JwtAuthGuard)
  @Post('menu')
  upsertMenu(@Body() dto: CreateMenuDto) {
    return this.svc.upsertMenu(dto);
  }

  // Récupérer le menu du jour (affichage principal)
  @Get('menu/today')
  getToday() {
    return this.svc.getToday();
  }

  // Menus précédents (pour le bandeau du bas)
  @Get('menus/previous')
  getPrevious(@Query('limit') limit?: string) {
    return this.svc.getPrevious(limit ? Number(limit) : 7);
  }

  // Noter un menu (1..10) — un seul vote modifiable par utilisateur
  @UseGuards(JwtAuthGuard)
  @Post('menu/:id/rate')
  rate(@Param('id') id: string, @Req() req: any, @Body() dto: RateMenuDto) {
    const userId = req.user?.sub;
    return this.svc.rate(id, userId, dto);
  }

  // Résumé des notes (moyenne + nombre)
  @Get('menu/:id/ratings/summary')
  ratingSummary(@Param('id') id: string) {
    return this.svc.ratingSummary(id);
  }

  // Commenter
  @UseGuards(JwtAuthGuard)
  @Post('menu/:id/comments')
  comment(@Param('id') id: string, @Req() req: any, @Body() dto: CommentMenuDto) {
    const userId = req.user?.sub;
    return this.svc.comment(id, userId, dto);
  }
}
