import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

const server: Express = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe());
  await app.init();

  if (require.main === module) {
    // Running locally with `node main.ts`
    await app.listen(3000);
    console.log(`App running locally on: ${await app.getUrl()}`);
  }
}

bootstrap();

export default server; // Used by Vercel dev server
