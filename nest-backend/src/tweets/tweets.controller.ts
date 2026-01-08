import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, SetMetadata } from '@nestjs/common';
import { TweetsService } from './tweets.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

const Public = () => SetMetadata('isPublic', true);

@Controller('api/tweets')
@UseGuards(JwtAuthGuard)
export class TweetsController {
  constructor(private tweetsService: TweetsService) {}

  @Get()
  @Public()
  getTweets() {
    return this.tweetsService.getAll();
  }

  @Post()
  createTweet(@Body('content') content: string, @Request() req) {
    return this.tweetsService.create(content, req.user);
  }

  @Post(':id/like')
  toggleLikePost(@Param('id') id: string, @Request() req) {
    return this.tweetsService.toggleLike(id, req.user);
  }

  @Delete(':id/like')
  toggleLikeDelete(@Param('id') id: string, @Request() req) {
    return this.tweetsService.toggleLike(id, req.user);
  }

  @Get(':id/comment')
  getComments(@Param('id') id: string) {
    return this.tweetsService.getComments(id);
  }

  @Post(':id/comment')
  createComment(@Param('id') id: string, @Body('content') content: string, @Request() req) {
    return this.tweetsService.createComment(content, id, req.user);
  }

  @Post(':id/retweet')
  @UseGuards(JwtAuthGuard)
  retweet(@Param('id') id: string, @Request() req) {
    return this.tweetsService.retweet(id, req.user);
  }
}
