import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError, EntityNotFoundError, TypeORMError } from 'typeorm';

// Interface for PostgreSQL error codes
interface PostgresError extends Error {
  code: string;
  detail?: string;
  table?: string;
  constraint?: string;
}

@Catch(QueryFailedError, EntityNotFoundError, TypeORMError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseExceptionFilter.name);

  catch(exception: TypeORMError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Database error occurred';
    let code = 'DB_ERROR';
    let detail: string | undefined;

    // Handle specific database errors
    if (exception instanceof QueryFailedError) {
      // Cast to PostgresError to access PostgreSQL specific error codes
      const pgError = exception.driverError as PostgresError;

      if (pgError && pgError.code) {
        // PostgreSQL error codes
        switch (pgError.code) {
          case '23505': // unique_violation
            status = HttpStatus.CONFLICT;
            message = 'Duplicate entry';
            code = 'DUPLICATE_ENTRY';
            detail = pgError.detail;
            break;
          case '23503': // foreign_key_violation
            status = HttpStatus.BAD_REQUEST;
            message = 'Related record not found';
            code = 'FOREIGN_KEY_VIOLATION';
            detail = pgError.detail;
            break;
          case '23502': // not_null_violation
            status = HttpStatus.BAD_REQUEST;
            message = 'Required field is missing';
            code = 'NOT_NULL_VIOLATION';
            detail = pgError.detail;
            break;
          case '42P01': // undefined_table
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Database schema error';
            code = 'UNDEFINED_TABLE';
            break;
          case '57014': // query_canceled
            status = HttpStatus.REQUEST_TIMEOUT;
            message = 'Query execution timeout';
            code = 'QUERY_TIMEOUT';
            break;
          default:
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Database query failed';
            code = 'QUERY_FAILED';
            detail = `Error code: ${pgError.code}`;
        }
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Entity not found';
      code = 'ENTITY_NOT_FOUND';
    }

    // Log the error with details
    this.logger.error(
      `Database error: ${message} - ${exception.message}`,
      exception.stack,
    );

    // Return a standardized error response
    const errorResponse = {
      statusCode: status,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add detail if available
    if (detail) {
      Object.assign(errorResponse, { detail });
    }

    response.status(status).json(errorResponse);
  }
}
