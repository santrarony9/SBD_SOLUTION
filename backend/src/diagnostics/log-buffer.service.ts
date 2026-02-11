import { Injectable } from '@nestjs/common';

@Injectable()
export class LogBufferService {
    private logs: string[] = [];
    private readonly MAX_LOGS = 100;

    addLog(message: string) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        this.logs.unshift(logEntry); // Add to beginning
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.pop(); // Remove oldest
        }
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
    }
}
