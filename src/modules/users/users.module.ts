import { UserPoints, Users } from '../../models';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TransactionsModule } from '../transactions/transactions.module';
import { PointsModule } from '../points/points.module';
import { RatePlanModule } from '../rate-plans/rate-plan.module';
import { NoticeModule } from '../notices/notices.module';
import { ApiKeyModule } from '../api-key/api-key.module';
import { ApiSampleModule } from '../api-sample/api-sample.module';
import { QuestionAndAnswersModule } from '../question-and-answers/question-and-answers.module';
import { S3Module } from '../s3/s3.module';
// import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Users, UserPoints]),
    TransactionsModule,
    PointsModule,
    RatePlanModule,
    NoticeModule,
    ApiKeyModule,
    ApiSampleModule,
    QuestionAndAnswersModule,
    S3Module,
    //RedisModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
