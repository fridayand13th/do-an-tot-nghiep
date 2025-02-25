import { forwardRef, Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { StatisticService } from './statistic.service';

@Module({
  imports: [forwardRef(() => UsersModule), ConfigModule],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
