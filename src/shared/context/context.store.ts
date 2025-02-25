import { AsyncLocalStorage } from 'async_hooks';
import { RequestContext } from 'src/interfaces/context.interface';



const globalStore = new AsyncLocalStorage<RequestContext>();

export const ContextStore = {
  getContext(): RequestContext {
    const context = globalStore.getStore();
    if (!context) {
      return {};
    }
    return { ...context };
  },

  updateContext(obj: Partial<RequestContext>): void {
    const context = globalStore.getStore();
    if (context) {
      Object.assign(context, obj);
    }
  },
};

export const runWithCtx = (fx: (ctx: RequestContext) => any, context: RequestContext = {}) => {
  return globalStore.run(context, () => {
    return fx(context);
  });
};
