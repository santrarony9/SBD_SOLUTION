import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const appPromise = NestFactory.create(AppModule);

async function bootstrap() {
  const app = await appPromise;
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'https://sbd-solutionfrontend.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT || 3001);
}

// If running directly (e.g. "npm run start")
if (require.main === module) {
  bootstrap();
}

// Export for Vercel (Serverless Function)
export default async (req: any, res: any) => {
  const app = await appPromise;
  await app.init();
  app.setGlobalPrefix('api');
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
};
