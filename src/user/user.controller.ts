import { Controller, Post, Body, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('list-users')
  async listUsers(): Promise<User[]> {
    return this.userService.listUsers();
  }

  @Post('create-user')
  async createUser(
    @Body() { username, password }: { username: string; password: string },
  ): Promise<User> {
    return this.userService.createUser(username, password);
  }
}
