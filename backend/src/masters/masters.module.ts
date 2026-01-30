import { Module } from '@nestjs/common';
import { MastersService } from './masters.service';
import { MastersController } from './masters.controller';

@Module({
  providers: [MastersService],
  controllers: [MastersController]
})
export class MastersModule {}
