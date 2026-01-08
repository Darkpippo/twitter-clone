import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { TweetsModule } from '../tweets/tweets.module'; 

@Module({
  imports: [AuthModule, TweetsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
