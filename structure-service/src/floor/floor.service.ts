import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Floor } from './floor.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class FloorService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'floor-service',
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
      messages: [{ value: JSON.stringify({ service: 'floor', action, data }) }],
    });
  }

  async createFloor(data: Record<string, any>): Promise<Floor> {
    const query = `



    MATCH (fn:Build {BuildNo: $BuildNo})
CREATE (t:Floor {FloorNo: $FloorNo, FloorName: $FloorName})
CREATE (fn)-[:HAS_FLOOR]->(t) 
RETURN t


        
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Floor };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async getFloor(FloorNo: string) {
    const query = `
            MATCH (t:Floor {FloorNo: $FloorNo})
            RETURN t
        `;
    const result = await this.neo4jService.read(query, { FloorNo });
    const node = result.records[0].get('t') as { properties: Floor };
    const properties = node.properties;

    if (result.records.length === 0) {
      throw new Error('Floor not found');
    }

    return properties;
  }

  async updateFloor(FloorNo: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Floor {FloorNo: $FloorNo})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { FloorNo, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Floor not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { FloorNo, ...data });
    return node.properties;
  }

  async getAllFloor(): Promise<Floor[]> {
    const query = `
        MATCH (t:Floor)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Floor };
      return node.properties;
    });
  }

  async deleteFloor(FloorNo: string) {
    const query = `
            MATCH (t:Floor {FloorNo: $FloorNo})
            DELETE t
        `;
    await this.neo4jService.write(query, { FloorNo });
    await this.sendToKafka('delete', { FloorNo });
    return { message: 'Floor deleted' };
  }
}
