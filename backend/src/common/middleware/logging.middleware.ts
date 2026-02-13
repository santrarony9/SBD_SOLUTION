import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogBufferService } from '../../diagnostics/log-buffer.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    constructor(private readonly logBuffer: LogBufferService) { }

    use(req: Request, res: Response, next: NextFunction) {
        try {
            const { method, originalUrl, body, query } = req;
            const userAgent = req.get('user-agent') || '';
            const start = Date.now();

            res.on('finish', () => {
                try {
                    const { statusCode } = res;
                    const contentLength = res.get('content-length');
                    const delay = Date.now() - start;

                    const message = `${method} ${originalUrl} ${statusCode} ${contentLength}b - ${delay}ms - ${userAgent}`;
                    this.logger.log(`${message}`);
                    // this.logger.log(`Query: ${JSON.stringify(query)}`);
                    // this.logger.log(`Body: ${JSON.stringify(body)}`); // Commented out to prevent circular json errors

                    if (this.logBuffer) {
                        this.logBuffer.addLog(message);
                    }
                } catch (err) {
                    console.error('LoggingMiddleware finish error', err);
                }
            });

            next();
        } catch (error) {
            console.error('LoggingMiddleware loop error', error);
            next();
        }
    }
}
