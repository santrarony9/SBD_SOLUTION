import { Module, Global } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LogBufferService } from './log-buffer.service';
import { TrafficService } from './traffic.service';

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [DiagnosticsController],
    providers: [LogBufferService, TrafficService],
    exports: [LogBufferService, TrafficService],
})
export class DiagnosticsModule { }
