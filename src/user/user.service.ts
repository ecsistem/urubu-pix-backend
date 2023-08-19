import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(username: string, password: string): Promise<User> {
    console.log('username', username);
    console.log('password', password);
    if (!username || username.trim() === '') {
      throw new BadRequestException('O nome de usuário é inválido');
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new BadRequestException('Nome de usuário já existe');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usernameUppercase = username.toLowerCase();
    return this.prisma.user.create({
      data: {
        username: usernameUppercase,
        password: hashedPassword,
        balance: 0,
        transactions: [],
      },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async listUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
