import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { executeMigration } from '../database';

async function bootstrap() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  await executeMigration();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error(error);
});
