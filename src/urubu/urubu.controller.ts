import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UrubuService } from './urubu.service';

@Controller('urubu')
export class UrubuController {
  constructor(private readonly urubuService: UrubuService) {}

  @Post('deposit')
  deposit(@Body() { username, amount }: { username: string; amount: number }) {
    return this.urubuService.deposit(username, amount);
  }

  @Post('withdraw')
  withdraw(@Body() { username, amount }: { username: string; amount: number }) {
    return this.urubuService.withdraw(username, amount);
  }

  @Post('transfer')
  transfer(
    @Body()
    {
      senderUsername,
      receiverUsername,
      amount,
    }: {
      senderUsername: string;
      receiverUsername: string;
      amount: number;
    },
  ) {
    return this.urubuService.transfer(senderUsername, receiverUsername, amount);
  }

  @Get('balance/:username')
  getBalance(@Param('username') username: string) {
    return this.urubuService.getBalance(username);
  }

  @Get('transaction-history/:username')
  getTransactionHistory(@Param('username') username: string) {
    return this.urubuService.getTransactionHistory(username);
  }
}
