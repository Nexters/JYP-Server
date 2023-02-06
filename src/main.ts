import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';
import {
  CustomHeaderInterceptor,
  TransformInterceptor,
} from './http/http.interceptor';
import {
  BadRequestExceptionFilter,
  ErrorFilter,
  HttpExceptionFilter,
  IndexOutOfRangeExceptionFilter,
  InvalidJwtPayloadExceptionFilter,
  JourneyNotExistExceptionFliter,
  LimitExceededExceptionFilter,
  UnauthorizedExceptionFilter,
  UnauthenticatedExceptionFilter,
  AlreadyJoinedJourneyExceptionFilter,
  ExpiredJourneyExceptionFilter,
} from './http/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(
    new ErrorFilter(),
    new HttpExceptionFilter(),
    new UnauthorizedExceptionFilter(),
    new InvalidJwtPayloadExceptionFilter(),
    new UnauthenticatedExceptionFilter(),
    new BadRequestExceptionFilter(),
    new LimitExceededExceptionFilter(),
    new JourneyNotExistExceptionFliter(),
    new IndexOutOfRangeExceptionFilter(),
    new AlreadyJoinedJourneyExceptionFilter(),
    new ExpiredJourneyExceptionFilter(),
  );
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new CustomHeaderInterceptor(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Server API')
    .setDescription('Dev Server Docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  await app.listen(3000);
}
bootstrap();
