import { Module } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';
import { ShiprocketController } from './shiprocket.controller';

@Module({
    controllers: [ShiprocketController],
    providers: [ShiprocketService],
    exports: [ShiprocketService],
})
export class ShiprocketModule { }
