import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

type ErrorResponseBody = {
  message?: string | string[];
  error?: string;
  statusCode?: number;
};

type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  timestamp: string;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorResponse = this.createErrorResponse(exception);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private createErrorResponse(exception: unknown): ApiErrorResponse {
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaError(exception);
    }

    if (exception instanceof BadRequestException) {
      return this.handleHttpException(exception, HttpStatus.BAD_REQUEST);
    }

    if (exception instanceof NotFoundException) {
      return this.handleHttpException(exception, HttpStatus.NOT_FOUND);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, exception.getStatus());
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return this.buildResponse(
        HttpStatus.BAD_REQUEST,
        'There was a problem with the information you provided. Please review your input and try again.',
      );
    }

    if (
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientRustPanicError
    ) {
      return this.buildResponse(
        HttpStatus.SERVICE_UNAVAILABLE,
        'Database is unavailable. Check MongoDB Atlas network access and DNS.',
      );
    }

    if (this.isDatabaseUnavailableError(exception)) {
      return this.buildResponse(
        HttpStatus.SERVICE_UNAVAILABLE,
        'Database is unavailable. Check MongoDB Atlas network access and DNS.',
      );
    }

    return this.buildResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
    );
  }

  private handleHttpException(
    exception: HttpException,
    statusCode: number,
  ): ApiErrorResponse {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return this.buildResponse(statusCode, response);
    }

    return this.buildResponse(
      statusCode,
      this.extractMessage(response, exception.message),
    );
  }

  private handlePrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): ApiErrorResponse {
    if (exception.code === 'P2025') {
      return this.buildResponse(
        HttpStatus.NOT_FOUND,
        "The blog post with this ID doesn't exist. Please check and re-enter.",
      );
    }

    if (exception.code === 'P2002') {
      return this.buildResponse(
        HttpStatus.BAD_REQUEST,
        'This title is already used. Please try another title.',
      );
    }

    if (this.isDatabaseUnavailableError(exception)) {
      return this.buildResponse(
        HttpStatus.SERVICE_UNAVAILABLE,
        'Database is unavailable. Check MongoDB Atlas network access and DNS.',
      );
    }

    return this.buildResponse(
      HttpStatus.SERVICE_UNAVAILABLE,
      'Unable to complete the database request right now. Please check your database connection and try again.',
    );
  }

  private isDatabaseUnavailableError(exception: unknown): boolean {
    const prismaError = exception as {
      code?: string;
      message?: string;
      meta?: {
        code?: string;
        message?: string;
      };
    };

    const rawMessage = [
      prismaError.code,
      prismaError.message,
      prismaError.meta?.code,
      prismaError.meta?.message,
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' ');

    return /server selection timeout|server selection timed out|no available servers|ReplicaSetNoPrimary|timed out|connection|dns|ENOTFOUND|ECONNREFUSED/i.test(
      rawMessage,
    );
  }

  private extractMessage(
    response: ErrorResponseBody,
    fallbackMessage: string,
  ): string {
    if (Array.isArray(response.message)) {
      return 'There was a problem with the information you provided. Please review your input and try again.';
    }

    if (typeof response.message === 'string') {
      return response.message;
    }

    if (typeof response.error === 'string') {
      return response.error;
    }

    return fallbackMessage;
  }

  private buildResponse(statusCode: number, message: string): ApiErrorResponse {
    return {
      success: false,
      statusCode,
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
