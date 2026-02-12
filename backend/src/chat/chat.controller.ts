import { Controller, Post, Body, Logger, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { Request } from 'express';

@Controller('chat')
export class ChatController {
    private readonly logger = new Logger(ChatController.name);

    constructor(private readonly chatService: ChatService) { }

    @Post()
    async chat(
        @Body() body: { message: string, history: any[], userId?: string },
        @Req() req: Request
    ) {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        this.logger.log(`Chat request from ${ip}: ${JSON.stringify(body)}`);

        try {
            if (!body || !body.message) {
                return { text: "Error: Message is required." };
            }

            const response = await this.chatService.generateResponse(body.message, body.userId, body.history, ip as string);

            if (!response) {
                this.logger.error("ChatService returned null/undefined");
                return { text: "System Error: No response from Chat Service." };
            }

            return response;
        } catch (error) {
            this.logger.error("ChatController Error", error);
            return { text: `Controller Error: ${error.message}` };
        }
    }
}
