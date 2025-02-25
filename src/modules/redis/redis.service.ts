// import { Injectable } from '@nestjs/common';
// import Redis from 'ioredis';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class RedisService {
//   private readonly redis: Redis;

//   constructor(private configService: ConfigService) {
//     this.redis = new Redis({
//       host: this.configService.get('REDIS_HOST'),
//       port: this.configService.get('REDIS_PORT'),
//     });
//   }

//   async sismember(key: string, value: string): Promise<number | null> {
//     return await this.redis.sismember(key, value);
//   }

//   async sadd(key: string, value: string) {
//     const ttl = this.configService.get('REDIS_TTL');
//     await this.redis.sadd(key, value);
//     await this.redis.expire(key, ttl);
//   }

//   async srem(key: string, value: string) {
//     await this.redis.srem(key, value);
//   }

//   async del(key: string) {
//     await this.redis.del(key);
//   }
// }
