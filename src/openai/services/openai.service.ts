import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Employee } from '@modules/employees/entity/employee.entity';

@Injectable()
export class OpenAiService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateAttendanceMessage(employee: Employee, type: 'check-in' | 'check-out', time: Date): Promise<string> {
        const prompt = `Generate an attendance ${type} notification for ${employee.name} at ${time.toISOString()}`;
        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // Change the model here
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 50,
        });
        return response.choices[0].message.content.trim(); // Updated for chat completion response format
    }
}
