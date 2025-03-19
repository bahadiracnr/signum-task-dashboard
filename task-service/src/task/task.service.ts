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
 MATCH (s:task {name: "task"}) 
CREATE (t:tasks {no: $no, location: $location, status: $status})
CREATE (s)-[:HAS_TASKS]->(t) 
RETURN t
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Task };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async getTask(no: string) {
    const query = `
            MATCH (t:task {no: $no})
            RETURN t
        `;
    const result = await this.neo4jService.read(query, { no });
    const node = result.records[0].get('t') as { properties: Task };
    const properties = node.properties;

    if (result.records.length === 0) {
      throw new Error('Task not found');
    }

    return properties;
  }

  async updateTask(no: string, data: Record<string, any>) {
    const query = `
        MATCH (t:task {no: $no})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { no, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Task not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };

    await this.sendToKafka('update', { no, ...data });
    return node.properties;
  }

  async getAllTask(): Promise<Task[]> {
    const query = `
        MATCH (t:tasks)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Task };
      return node.properties;
    });
  }

  async deleteTask(no: string) {
    const query = `
            MATCH (t:task {no: $no})
            DELETE t
        `;
    await this.neo4jService.write(query, { no });
    await this.sendToKafka('delete', { no });
    return { message: 'Task deleted' };
  }
}
