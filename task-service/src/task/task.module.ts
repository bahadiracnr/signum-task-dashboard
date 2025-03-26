import { Module, forwardRef } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskGateway } from './task.gateway';
import { Neo4jModule } from 'nest-neo4j';
import { TaskController } from './task.controller';

@Module({
  imports: [Neo4jModule],
  controllers: [TaskController],
  providers: [TaskService, TaskGateway],
})
export class TaskModule {}
