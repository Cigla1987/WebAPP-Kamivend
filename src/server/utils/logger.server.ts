import pino from 'pino';
import { serverEnv as env } from '#/config/env';

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',

  // Base context (helpful in production logs)
  base: {
    env: env.NODE_ENV,
    app: 'vending', // change to your app name
  },

  redact:
    env.NODE_ENV === 'production'
      ? {
          paths: [
            'req.body.password',
            'req.body.confirmPassword',
            'req.headers.cookie',
            'req.headers.authorization',
            '*.password',
            '*.secret',
            '*.token',
          ],
          censor: '[REDACTED]',
        }
      : undefined,

  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname,app',
            levelFirst: true, // nicer formatting
          },
        }
      : undefined,

  // Optional: timestamp format in production (JSON logs)
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
