import { Controller, Get, Post, Body } from '@nestjs/common';
import { ShiprocketService } from './shiprocket.service';

@Controller('shiprocket')
export class ShiprocketController {
  constructor(private readonly shiprocketService: ShiprocketService) {}

  @Get('test-auth')
  async testAuth() {
    const result = await this.shiprocketService.testAuth();
    if (result.success) {
      return {
        status: 'success',
        message: 'Shiprocket Authentication Successful!',
        token_generated: true,
      };
    } else {
      return {
        status: 'error',
        message: 'Authentication Failed',
        error: result.error,
      };
    }
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    // Usually Shiprocket sends an array of updates or a single object.
    // Sometimes it's wrapped, so we pass the whole payload or extract it.
    // For safety, we'll just pass the payload.
    // Note: Shiprocket expects a 200 OK fast.
    this.shiprocketService.handleWebhook(payload).catch(console.error);
    return { status: 'success' };
  }
}
