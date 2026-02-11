import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogBufferService } from '../../diagnostics/log-buffer.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    constructor(private readonly logBuffer: LogBufferService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, body, query } = req;
        const userAgent = req.get('user-agent') || '';
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            const delay = Date.now() - start;

            const message = `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${delay}ms - ${userAgent}`;
            this.logger.log(`${message} \nQuery: ${JSON.stringify(query)} \nBody: ${JSON.stringify(body)}`);
            this.logBuffer.addLog(message);
        });

        next();
    }
}
