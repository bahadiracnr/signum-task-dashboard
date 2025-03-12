import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { Neo4jModule } from 'nest-neo4j';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { StructureModule } from './structure/structure.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    Neo4jModule.forRoot({
      scheme: 'bolt',
      host: 'localhost',
      port: 7687,
      username: 'neo4j',
      password: 'Kjhgfdsa',
      database: 'structure',
    }),
    StructureModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
