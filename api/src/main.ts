import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { VALIDATION_CONFIG } from './validators';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trust proxy is required for Secure cookies to work behind Vercel/reverse proxies
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(cookieParser())
  app.use(compression())

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: frontendUrl,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });


  app.useGlobalPipes(VALIDATION_CONFIG);
  await app.listen(process.env.PORT ?? 3010);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
