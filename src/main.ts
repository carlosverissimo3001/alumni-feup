import { NestJS } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestJS.create(AppModule);
  
  // Add global prefix for all routes
  app.setGlobalPrefix('api');
  
  // ... rest of your setup (Swagger, etc.)
  await app.listen(3000);
}

bootstrap(); 