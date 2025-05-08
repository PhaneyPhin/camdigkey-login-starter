import { ArgumentsHost, Catch, ExceptionFilter, HttpException, UnprocessableEntityException } from '@nestjs/common';
import { HttpErrorType } from './http-error-type';
import { ErrorType } from '../enums';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = +exception.getStatus();
    console.log(exception)
    if (exception instanceof UnprocessableEntityException) {
       return response.status(status).send(exception.getResponse())
    }

    let { errorType, message } = exception.getResponse() as {
      errorType: ErrorType | string;
      message: string | string[];
    };

    if (!errorType) {
      errorType = HttpErrorType[status];
      errorType = errorType ?? 'UNEXPECTED_ERROR';
    }

    response.status(status).json({
      statusCode: status,
      errorType,
      message,
      timestamp: new Date().getTime(),
    });
  }
}
