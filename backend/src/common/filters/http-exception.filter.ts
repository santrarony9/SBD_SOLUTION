import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, Inject } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { LogBufferService } from '../../diagnostics/log-buffer.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(
        private readonly httpAdapterHost: HttpAdapterHost,
        private readonly logBuffer: LogBufferService
    ) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: exception instanceof HttpException ? exception.message : 'Internal Server Error',
            error: exception instanceof Error ? exception.stack : String(exception),
        };

        const logMessage = `Exception: ${JSON.stringify(responseBody)}`;
        this.logger.error(logMessage);
        this.logBuffer.addLog(logMessage);

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
