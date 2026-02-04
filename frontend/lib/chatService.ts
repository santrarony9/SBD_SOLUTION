export interface ChatMessage {
    role: 'user' | 'bot';
    content: string;
}

export const sendMessageToBot = async (message: string): Promise<string> => {
    try {
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK;

        if (!webhookUrl) {
            // Simulation mode if no webhook is provided
            await new Promise(resolve => setTimeout(resolve, 1000));
            return "I'm a simulated bot response. Please configure NEXT_PUBLIC_N8N_CHAT_WEBHOOK in your .env file to connect to your n8n workflow.";
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const data = await response.json();
        // Assuming n8n returns something like { output: "response text" } or just the text
        // Adjust this based on your actual n8n output structure
        return data.output || data.text || data.message || "Received response from n8n";
    } catch (error) {
        console.error('Chat Error:', error);
        return "Sorry, I'm having trouble connecting to the server right now.";
    }
};
