import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita CORS para permitir que o frontend (localhost:8081) consulte a API (localhost:3000)
  app.enableCors();

  // Ativa a validação automática global de DTOs e limpa campos não declarados (whitelist)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true, // Converte tipos automaticamente (ex: string para number no payload se decorado)
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
