import { AwsSesProvider } from 'src/modules/aws-ses/aws-ses.provider';
import { AwsSesService } from 'src/modules/aws-ses/aws-ses.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [AwsSesService, AwsSesProvider],
  exports: [AwsSesService],
})
export class AwsSesModule {}
