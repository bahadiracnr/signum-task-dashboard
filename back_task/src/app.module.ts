import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jModule } from 'nest-neo4j';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TaskModule } from './task/task.module';
import { MigrationService } from './migration/magration.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule.forRoot({
      scheme: 'bolt',
      host: 'localhost',
      port: 7687,
      username: 'neo4j',
      password: 'Kjhgfdsa',
      database: 'task',
    }),
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService, MigrationService],
})
export class AppModule {}
