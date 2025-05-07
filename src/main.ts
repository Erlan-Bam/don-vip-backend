import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rawBodySaver = (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf-8');
    }
  };

  app.use(bodyParser.json({ limit: '50mb', verify: rawBodySaver }));
  app.use(
    bodyParser.urlencoded({
      extended: true,
      limit: '50mb',
      verify: rawBodySaver,
    }),
  );

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('Authentication endpoints')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      operationsSorter: (a: any, b: any) => {
        const order = { post: 1, patch: 2, delete: 3, get: 4 };

        const methodA = a.get('method').toLowerCase();
        const methodB = b.get('method').toLowerCase();

        if (order[methodA] < order[methodB]) return -1;
        if (order[methodA] > order[methodB]) return 1;
        return a.get('path').localeCompare(b.get('path'));
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        console.error(errors);
        return new BadRequestException(errors);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 6001);
}
bootstrap();
