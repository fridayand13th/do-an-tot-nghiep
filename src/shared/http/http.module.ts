import { HttpModule as NestHttpModuleRoot } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';

export const NestHttpModule = NestHttpModuleRoot.register({
  timeout: 5000,
});

@Global()
@Module({
  imports: [NestHttpModule],
  exports: [NestHttpModule],
})
export class HttpModule {}
