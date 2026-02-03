import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
      credentials: false,
    });
    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

// If running directly (e.g. "npm run start")
if (require.main === module) {
  bootstrap().then(() => {
    console.log('Application started successfully');
  });
}

// Export for Vercel (Serverless Function)
export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};
