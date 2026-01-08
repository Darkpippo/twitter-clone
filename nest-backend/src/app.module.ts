import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TweetsModule } from './tweets/tweets.module';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    TweetsModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-key-unknown',
      signOptions: { expiresIn: '24h' },
    }),
  ],
})
export class AppModule {}
