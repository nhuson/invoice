import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const payload = body as Record<string, unknown>;
        message = (payload.message as string | string[]) ?? exception.message;
        error = (payload.error as string) ?? error;
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      error = 'Internal Server Error';
    } else if (error === 'Internal Server Error') {
      error = HttpStatus[status]
        ? HttpStatus[status]
            .toString()
            .split('_')
            .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
            .join(' ')
        : error;
    }

    response.status(status).json({ statusCode: status, message, error });
  }
}
