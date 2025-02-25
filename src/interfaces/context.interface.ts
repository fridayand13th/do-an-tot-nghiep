export interface RequestContext {
  correlationId?: string;
  requestId?: string;
  userId?: number;
  className?: string;
  handlerName?: string;
}
