import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const appPromise = NestFactory.create(AppModule);

async function bootstrap() {
  const app = await appPromise;
  app.enableCors(); // Vercel might need CORS
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
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp(req, res);
};
