import { Body, Controller, Get, Post, Delete, Param, UseGuards, Request, SetMetadata } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

const Public = () => SetMetadata('isPublic', true);

@Controller('api/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Public()
  getUsers() {
    return this.usersService.getAll();
  }

  @Get(':id')
  @Public()
  getProfile(@Param('id') id: string) {
    console.log("User id: ", id);
    return this.usersService.getProfile(id);
  }

  @Post(':id/follow')
  follow(@Param('id') id: string, @Request() req) {
    return this.usersService.toggleFollow(id, req.user);
  }

  @Delete(':id/follow')
  unfollow(@Param('id') id: string, @Request() req) {
    return this.usersService.toggleFollow(id, req.user);  
  }

  @Get(':id/following')
  getFollowing(@Param('id') userId: string) {
    const followingIds = this.usersService.getFollowingIds(userId);
    return { followingIds };
  }

  @Get(':id/followers')
  @Public()
  getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }
}