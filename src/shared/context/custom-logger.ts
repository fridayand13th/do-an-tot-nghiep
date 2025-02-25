import { LoggerService, LogLevel } from '@nestjs/common';
import { ContextStore } from './context.store';
import { Logger } from 'nestjs-pino';

export class CustomLogger implements LoggerService {
  constructor(private readonly logger: Logger) {}
  error(message: any, ...optionalParams: any[]) {
    this.callInternalLogger('error', message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    this.callInternalLogger('warn', message, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]) {
    this.callInternalLogger('log', message, ...optionalParams);
  }

  callInternalLogger(level: string, message: any, ...optionalParams: any[]) {
    const context = ContextStore.getContext();
   
    const { correlationId, userId, requestId, className, handlerName } = context;

    return this.logger[level](message, {
      correlationId,
      userId,
      requestId,
      className,
      handlerName,
      ...optionalParams,
    });
  }
}
