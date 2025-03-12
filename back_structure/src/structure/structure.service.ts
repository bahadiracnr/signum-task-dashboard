import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Structure } from './structure.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class StructureService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'structure-service',
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
      messages: [
        { value: JSON.stringify({ service: 'structure', action, data }) },
      ],
    });
  }

  async createStructure(data: Record<string, any>): Promise<Structure> {
    const query = `

             MATCH (s:Strucutres {name: "Strucutres"})  // Mevcut "structure" düğümünü eşle
CREATE (t:Strucutres {structureNo: $structureNo, structureName: $structureName})
CREATE (s)-[:HAS_STRUCUTRES]->(t)  // Yeni düğümü sadece "structure" düğümüne bağla
RETURN t
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Structure };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async getStructure(structureNo: string) {
    const query = `
            MATCH (t:Structure {structureNo: $structureNo})
            RETURN t
        `;
    const result = await this.neo4jService.read(query, { structureNo });
    const node = result.records[0].get('t') as { properties: Structure };
    const properties = node.properties;

    if (result.records.length === 0) {
      throw new Error('Structure not found');
    }

    return properties;
  }

  async updateStructure(structureNo: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Structure {structureNo: $structureNo})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { structureNo, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Structure not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { structureNo, ...data });
    return node.properties;
  }

  async getAllStructure(): Promise<Structure[]> {
    const query = `
        MATCH (t:Structure)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Structure };
      return node.properties;
    });
  }

  async deleteStructure(structureNo: string) {
    const query = `
            MATCH (t:Structure {structureNo: $structureNo})
            DELETE t
        `;
    await this.neo4jService.write(query, { structureNo });
    await this.sendToKafka('delete', { structureNo });
    return { message: 'Structure deleted' };
  }
}
