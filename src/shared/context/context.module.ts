import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { getLogFilePath } from 'src/utils/logs';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                targets: [
                  {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      destination: 1,
                    },
                  },
                  {
                    target: 'pino-pretty',
                    options: {
                      colorize: false,
                      translateTime: 'SYS:standard',
                      destination: getLogFilePath(),
                    },
                  },
                ],
              }
            : undefined,
        redact: ['req.headers'],
        serializers: {
          req: (req) => {
            if (!req) return {};
            const { headers, ...filteredReq } = req;
            return filteredReq;
          },
        },
      },
    }),
  ],
})
export class ContextModule {}
