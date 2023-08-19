import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';
import * as schedule from 'node-schedule';

@Injectable()
export class UrubuService {
  constructor(private readonly prisma: PrismaService) {
    this.scheduleDailyUpdate(); // Chamada para iniciar o agendamento das atualizações diárias
  }

  async deposit(username: string, amount: number): Promise<User> {
    if (amount <= 0) {
      throw new BadRequestException(
        'O valor do depósito deve ser maior que zero',
      );
    }

    const user = await this.findUser(username);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: amount,
        },
        transactions: {
          push: `Depósito de ${amount}`,
        },
      },
    });
  }

  async withdraw(username: string, amount: number): Promise<User> {
    if (amount <= 0) {
      throw new BadRequestException('O valor do saque deve ser maior que zero');
    }

    const user = await this.findUser(username);

    if (user.balance < amount) {
      throw new BadRequestException('Saldo insuficiente para o saque');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: amount,
        },
        transactions: {
          push: `Saque de ${amount}`,
        },
      },
    });
  }

  async getTransactionHistory(username: string): Promise<string[]> {
    const user = await this.findUser(username);
    return user.transactions;
  }

  private async findUser(username: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(username: string): Promise<User> {
    const user = await this.findUser(username);
    const percentual = 1.0833;
    const updatedBalance = user.balance * percentual;
    return this.prisma.user.update({
      where: { id: user.id },
      data: { balance: updatedBalance },
    });
  }

  private scheduleDailyUpdate() {
    const rule = new schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;

    schedule.scheduleJob(rule, async () => {
      const users = await this.prisma.user.findMany();
      const percentual = 1.0839;

      for (const user of users) {
        const updatedBalance = user.balance * percentual;
        await this.prisma.user.update({
          where: { id: user.id },
          data: { balance: updatedBalance },
        });
      }

      console.log('Atualização diária dos saldos realizada.');
    });
  }
}
