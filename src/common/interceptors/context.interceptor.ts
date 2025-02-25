import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ContextStore } from 'src/shared/context/context.store';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const userId = req.user?.id;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    ContextStore.updateContext({
      userId,
      className,
      handlerName,
    });
    return next.handle();
  }
}
