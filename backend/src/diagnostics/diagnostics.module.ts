import { Module, Global } from '@nestjs/common';
import { DiagnosticsController } from './diagnostics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { LogBufferService } from './log-buffer.service';

@Global()
@Module({
    imports: [PrismaModule],
    controllers: [DiagnosticsController],
    providers: [LogBufferService],
    exports: [LogBufferService],
})
export class DiagnosticsModule { }
