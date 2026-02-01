import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Spark Blue Backend v2.0 - Diagnostics Active';
  }
}
