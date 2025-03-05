import { Module } from '@nestjs/common';
import { TaskModule } from './tasks/task.module';
import { ConfigModule } from '@nestjs/config';
import { Neo4jModule } from './neo4j/neo4j.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), Neo4jModule, TaskModule],
})
export class AppModule {}
