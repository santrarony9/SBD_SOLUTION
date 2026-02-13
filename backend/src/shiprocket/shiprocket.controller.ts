import { Controller, Get } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';

@Controller('shiprocket')
export class ShiprocketController {
    constructor(private readonly shiprocketService: ShiprocketService) { }

    @Get('test-auth')
    async testAuth() {
        const result = await this.shiprocketService.testAuth();
        if (result.success) {
            return { status: 'success', message: 'Shiprocket Authentication Successful!', token_generated: true };
        } else {
            return { status: 'error', message: 'Authentication Failed', error: result.error };
        }
    }
}
