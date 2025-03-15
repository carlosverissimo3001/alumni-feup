/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import * as fs from 'fs';
import * as path from 'path';
import { QueueName } from './consts';
import { getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync(
    path.join(__dirname, '../..', 'swagger-spec.json'),
    JSON.stringify(document, null, 2),
  );

  // Add CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // for local development
  if (process.env.APP_ENV === 'development') {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    const queues = Object.values(QueueName).map((name) =>
      app.get<Queue>(getQueueToken(name)),
    );

    createBullBoard({
      queues: queues.map((queue) => new BullAdapter(queue)),
      serverAdapter,
    });

    app.use('/admin/queues', serverAdapter.getRouter());
  }

  SwaggerModule.setup('docs', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
