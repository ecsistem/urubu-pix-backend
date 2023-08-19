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
  @Post('update')
  update(@Body() { username }: { username: string }) {
    return this.urubuService.update(username);
  }

  @Get('transaction-history/:username')
  getTransactionHistory(@Param('username') username: string) {
    return this.urubuService.getTransactionHistory(username);
  }
}
