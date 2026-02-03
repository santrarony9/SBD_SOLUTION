import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const appPromise = NestFactory.create(AppModule);

async function bootstrap() {
  try {
    const app = await appPromise;
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
      credentials: false,
    });
    await app.listen(process.env.PORT || 3001);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Error during application bootstrap:', error);
    process.exit(1);
  }
}

// If running directly (e.g. "npm run start")
if (require.main === module) {
  bootstrap();
}

// Export for Vercel (Serverless Function)
export default async (req: any, res: any) => {
  try {
    const app = await appPromise;
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
      credentials: false,
    });
    await app.init();
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp(req, res);
  } catch (error) {
    console.error('Serverless function verification failed:', error);
    res.status(500).json({ status: 'ERROR', message: 'Internal Server Error', error: String(error) });
  }
};
