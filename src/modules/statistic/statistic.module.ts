import { forwardRef, Module } from '@nestjs/common';
import { StatisticController } from './statistic.controller';
import { UsersModule } from '../users/users.module';
import { PointsModule } from '../points/points.module';
import { RequestModule } from '../requests/requests.module';
import { LearningRequestModule } from '../learning-request/learning-request.module';
import { ConfigModule } from '@nestjs/config';
import { StatisticService } from './statistic.service';

@Module({
  imports: [forwardRef(() => UsersModule), PointsModule, RequestModule, LearningRequestModule, ConfigModule],
  controllers: [StatisticController],
  providers: [StatisticService],
  exports: [StatisticService],
})
export class StatisticModule {}
