import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    private readonly logger = new Logger(ChatController.name);

    constructor(private readonly chatService: ChatService) { }

    @Post()
    async chat(@Body() body: { message: string, history: any[], userId?: string }) {
        this.logger.log(`Chat request received: ${JSON.stringify(body)}`);

        try {
            if (!body || !body.message) {
                return { text: "Error: Message is required." };
            }

            const response = await this.chatService.generateResponse(body.message, body.userId, body.history);

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
