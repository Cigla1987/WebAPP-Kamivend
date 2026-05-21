import { isDbError } from '#/utils/db.server';
import { createMiddleware } from '@tanstack/react-start';
import { ZodError } from 'zod';

export const errorMiddlewareFn = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      const dbError = isDbError(error);
      if (dbError) {
        console.log('dbError');
        throw new Error(dbError.message);
      }
      if (error instanceof ZodError) {
        console.log('zoderror', error);
      }
      // console.log('throwing default', error);
      throw error;
    }
  }
);
