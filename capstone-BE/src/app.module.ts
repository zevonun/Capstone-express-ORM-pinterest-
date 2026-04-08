import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ImagesModule } from './images/images.module';
import { UsersModule } from './users/users.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [ ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ImagesModule,
    UsersModule,
    CommentsModule,
   ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
