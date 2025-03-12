import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Build } from './build.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class BuildService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'build-service',
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
      messages: [{ value: JSON.stringify({ service: 'build', action, data }) }],
    });
  }

  async createBuild(data: Record<string, any>): Promise<Build> {
    const query = `
    



        MATCH (s:Build {name: "Build"}) 
CREATE (t:Build {BuildNo: $BuildNo, BuildName: $BuildName})
CREATE (s)-[:HAS_BUILD]->(t) 
RETURN t


            
            `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Build };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async getBuild(BuildNo: string) {
    const query = `
            MATCH (t:Build {BuildNo: $BuildNo})
            RETURN t
        `;
    const result = await this.neo4jService.read(query, { BuildNo });
    const node = result.records[0].get('t') as { properties: Build };
    const properties = node.properties;

    if (result.records.length === 0) {
      throw new Error('Build not found');
    }

    return properties;
  }

  async updateBuild(BuildNo: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Build {BuildNo: $BuildNo})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { BuildNo, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Build not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { BuildNo, ...data });
    return node.properties;
  }

  async getAllBuild(): Promise<Build[]> {
    const query = `
        MATCH (t:Build)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Build }; // Neo4j node tipini zorluyoruz
      return node.properties;
    });
  }

  async deleteBuild(BuildNo: string) {
    const query = `
            MATCH (t:Build {BuildNo: $BuildNo})
            DELETE t
        `;
    await this.neo4jService.write(query, { BuildNo });
    await this.sendToKafka('delete', { BuildNo });
    return { message: 'Build deleted' };
  }
}
