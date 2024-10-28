import { Module } from '@nestjs/common';
import { OpenAiService } from './services/openai.service';


@Module({
    providers: [OpenAiService],
    exports: [OpenAiService], // Export OpenAiService to be used in other modules
})
export class OpenAiModule { }
