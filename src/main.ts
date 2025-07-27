// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

async function createApp() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe());
  await app.init();
  return server;
}

// Local dev entry point
if (require.main === module) {
  createApp().then((app) => {
    app.listen(3000, () => {
      console.log('App running locally on http://localhost:3000');
    });
  });
}

// Vercel export
export default async function handler(req, res) {
  const app = await createApp();
  return app(req, res);
}
