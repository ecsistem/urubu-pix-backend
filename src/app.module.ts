import { Module } from '@nestjs/common';
import { UrubuController } from './urubu/urubu.controller';
import { UrubuService } from './urubu/urubu.service';
import { PrismaService } from './prisma/prisma.service';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UrubuController, UserController],
  providers: [UrubuService, PrismaService, UserService],
})
export class AppModule {}
