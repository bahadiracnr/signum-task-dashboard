import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Task } from './task.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class TaskService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'task-service',
    brokers: ['localhost:9092'],
  });

  private producer: Producer;
  constructor(private readonly neo4jService: Neo4jService) {}
  async onModuleInit() {
    this.producer = this.kafka.producer();
    await this.producer.connect();
  }

  private async sendToKafka(action: string, data: Record<string, any>) {
    await this.producer.send({
      topic: 'logs',
      messages: [{ value: JSON.stringify({ service: 'task', action, data }) }],
    });
  }

  async createTask(data: Record<string, any>): Promise<Task> {
    const query = `
 MATCH (s:Tasks {name: "Tasks"}) 
CREATE (t:Task {taskNo: $taskNo, taskLocation: $taskLocation, taskStatus: $taskStatus})
CREATE (s)-[:HAS_TASKS]->(t) 
RETURN t
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Task };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async getTask(taskNo: string) {
    const query = `
            MATCH (t:Task {taskNo: $taskNo})
            RETURN t
        `;
    const result = await this.neo4jService.read(query, { taskNo });
    const node = result.records[0].get('t') as { properties: Task };
    const properties = node.properties;

    if (result.records.length === 0) {
      throw new Error('Task not found');
    }

    return properties;
  }

  async updateTask(taskNo: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Task {taskNo: $taskNo})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { taskNo, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Task not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };

    await this.sendToKafka('update', { taskNo, ...data });
    return node.properties;
  }

  async getAllTask(): Promise<Task[]> {
    const query = `
        MATCH (t:Task)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Task };
      return node.properties;
    });
  }

  async deleteTask(taskNo: string) {
    const query = `
            MATCH (t:Task {taskNo: $taskNo})
            DELETE t
        `;
    await this.neo4jService.write(query, { taskNo });
    await this.sendToKafka('delete', { taskNo });
    return { message: 'Task deleted' };
  }
}
