import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

// Only call bootstrap if this file is being run directly
if (require.main === module) {
  bootstrap();
}