import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TrafficService } from '../../diagnostics/traffic.service';

@Injectable()
export class TrafficMiddleware implements NestMiddleware {
    constructor(private readonly traffic: TrafficService) { }

    use(req: Request, res: Response, next: NextFunction) {
        // Record the request timestamp
        this.traffic.recordRequest();
        next();
    }
}
