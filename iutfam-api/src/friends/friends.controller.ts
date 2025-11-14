import { Controller, Get, Post, Query, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friends: FriendsService) {}

  @Get('me')
  getMyFriends(@Req() req: any) {
    const userId = req.user?.sub;
    return this.friends.getMyFriends(userId);
  }

  @Get('requests')
  getMyRequests(@Req() req: any) {
    const userId = req.user?.sub;
    return this.friends.getMyIncomingRequests(userId); // 👈 BIEN CETTE MÉTHODE
  }

  @Get('search')
  search(@Req() req: any, @Query('q') q: string) {
    const userId = req.user?.sub;
    return this.friends.searchUsers(userId, q ?? '');
  }

  @Post('request')
  sendRequest(@Req() req: any, @Body('targetUserId') targetUserId: string) {
    const userId = req.user?.sub;
    return this.friends.sendRequest(userId, targetUserId);
  }

  @Post(':id/accept')
  accept(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub;
    return this.friends.accept(userId, id);
  }

  @Post(':id/reject')
  reject(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub;
    return this.friends.reject(userId, id);
  }
}
