import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { runWithCtx } from './context.store';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = uuidv4();
    const requestId = uuidv4();

    runWithCtx(
      async () => {
        next();
      },
      { correlationId, requestId },
    );
  }
}
