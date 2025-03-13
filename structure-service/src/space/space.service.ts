import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Space } from './space.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class SpaceService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'space-service',
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
      messages: [{ value: JSON.stringify({ service: 'space', action, data }) }],
    });
  }

  async createSpace(data: Record<string, any>): Promise<Space> {
    const query = `



    MATCH (fn:Floor {FloorNo: $FloorNo})
CREATE (t:Space {SpaceNo: $SpaceNo, SpaceName: $SpaceName})
CREATE (fn)-[:HAS_FLOOR]->(t) 
RETURN t


            `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Space };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async getSpace(SpaceNo: string) {
    const query = `
            MATCH (t:Space {SpaceNo: $SpaceNo})
            RETURN t
        `;
    const result = await this.neo4jService.read(query, { SpaceNo });
    const node = result.records[0].get('t') as { properties: Space };
    const properties = node.properties;

    if (result.records.length === 0) {
      throw new Error('Space not found');
    }

    return properties;
  }

  async updateSpace(SpaceNo: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Space {SpaceNo: $SpaceNo})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { SpaceNo, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Space not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { SpaceNo, ...data });
    return node.properties;
  }

  async getAllSpace(): Promise<Space[]> {
    const query = `
        MATCH (t:Space)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Space }; // Neo4j node tipini zorluyoruz
      return node.properties;
    });
  }

  async deleteSpace(SpaceNo: string) {
    const query = `
            MATCH (t:Space {SpaceNo: $SpaceNo})
            DELETE t
        `;
    await this.neo4jService.write(query, { SpaceNo });
    await this.sendToKafka('delete', { SpaceNo });
    return { message: 'Space deleted' };
  }
}
