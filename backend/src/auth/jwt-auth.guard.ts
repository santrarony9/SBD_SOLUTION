import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LogBufferService } from '../diagnostics/log-buffer.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly logBuffer: LogBufferService) {
        super();
    }

    handleRequest(err, user, info, context) {
        if (err || !user) {
            const msg = `[JwtAuthGuard DEBUG] Auth failed. Info: ${info?.message || 'No info'}. Err: ${err || 'No error'}`;
            console.error(msg);
            this.logBuffer.addLog(msg);
        }
        return super.handleRequest(err, user, info, context);
    }
}
