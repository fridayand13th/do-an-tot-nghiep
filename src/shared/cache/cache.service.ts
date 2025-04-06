import { Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';
import { ErrorHelper } from 'src/helpers/error.utils';
import * as USER_MESSAGE from 'src/common/messages/user.message';

@Injectable()
export class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
  }

  async checkUsedToken(key: string, token: string) {
    let tokens: string[] = this.cache.get(key) || [];

    if (this.cache.has(`${key}:lock`)) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      return this.checkUsedToken(key, token);
    }
    this.cache.set(`${key}:lock`, true, 1);
    try {
      if (tokens.includes(token)) {
        ErrorHelper.BadRequestException(USER_MESSAGE.USED_TOKEN);
      }
      tokens.push(token);
      this.cache.set(key, tokens);
    } finally {
      this.cache.del(`${key}:lock`);
    }
  }
}
