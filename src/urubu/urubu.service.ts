import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as schedule from 'node-schedule';

@Injectable()
export class UrubuService {
  private readonly MIN_DEPOSIT_AMOUNT = 200;

  constructor(private readonly prisma: PrismaService) {
    this.scheduleDailyUpdate();
  }

  async deposit(username: string, amount: number): Promise<User> {
    if (amount < this.MIN_DEPOSIT_AMOUNT) {
      throw new BadRequestException(
        `O valor do depósito deve ser pelo menos ${this.MIN_DEPOSIT_AMOUNT} reais`,
      );
    }

    const user = await this.findUser(username);

    return this.updateUserBalance(user.id, amount, `Depósito de ${amount}`);
  }

  async withdraw(username: string, amount: number): Promise<User> {
    if (amount <= 0) {
      throw new BadRequestException('O valor do saque deve ser maior que zero');
    }

    const user = await this.findUser(username);

    if (user.balance < amount) {
      throw new BadRequestException('Saldo insuficiente para o saque');
    }

    return this.updateUserBalance(user.id, -amount, `Saque de ${amount}`);
  }

  async getBalance(username: string): Promise<number> {
    const user = await this.findUser(username);
    return user.balance;
  }

  async transfer(
    senderUsername: string,
    receiverUsername: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException(
        'O valor da transferência deve ser maior que zero',
      );
    }

    const sender = await this.findUser(senderUsername);
    const receiver = await this.findUser(receiverUsername);

    if (sender.balance < amount) {
      throw new BadRequestException('Saldo insuficiente para a transferência');
    }

    await this.updateUserBalance(
      sender.id,
      -amount,
      `Transferência para ${receiverUsername}`,
    );
    await this.updateUserBalance(
      receiver.id,
      amount,
      `Transferência de ${senderUsername}`,
    );
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

  private async updateUserBalance(
    userId: number,
    amount: number,
    transactionDescription: string,
  ): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        balance: {
          increment: amount,
        },
        transactions: {
          push: transactionDescription,
        },
      },
    });

    return updatedUser;
  }

  private scheduleDailyUpdate() {
    const rule = new schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;

    schedule.scheduleJob(rule, async () => {
      const users = await this.prisma.user.findMany();
      const percentual = 1.085;

      for (const user of users) {
        const updatedBalance = user.balance * percentual;
        await this.updateUserBalance(
          user.id,
          updatedBalance - user.balance,
          'Atualização diária',
        );
      }

      console.log('Atualização diária dos saldos realizada.');
    });
  }
}
