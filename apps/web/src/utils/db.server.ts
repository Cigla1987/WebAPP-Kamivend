import { AppError } from '@vending/domain';
import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';

export function isDbError(error: unknown): AppError | null {
  if (
    error instanceof DrizzleQueryError &&
    error.cause instanceof DatabaseError
  ) {
    return formatDbError(error.cause);
  }
  return null;
}

export function formatDbError(pgError: DatabaseError): AppError {
  switch (pgError.code) {
    case '23505': // unique_violation
      return new AppError('A record with this value already exists.');
    case '23503': // foreign_key_violation
      return new AppError('The referenced record does not exist.');
    case '23502': // not_null_violation
      return new AppError('A required field is missing.');
    case '22P02': // invalid_text_representation
      return new AppError('Invalid data format provided.');
    default:
      return new AppError('An unexpected database error occurred.');
  }
}
