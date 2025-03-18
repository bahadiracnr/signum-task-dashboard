import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Structure } from './structure.entity';
import { Neo4jService } from 'nest-neo4j/dist';
import { Kafka, Producer } from 'kafkajs';
import { StructureType } from 'src/enums/StrcutureType';

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

  async createStructures(
    type: StructureType,
    data: Record<string, any>,
  ): Promise<Structure> {
    if (type === StructureType.BUILD) {
      return this.createBuild(data);
    } else if (type === StructureType.FLOOR) {
      return this.createFloor(data);
    } else if (type === StructureType.SPACE) {
      return this.createSpace(data);
    }
    throw new Error('Structure not found');
  }

  async createBuild(data: Record<string, any>): Promise<Structure> {
    const query = `
MATCH (s:Strucutres {name: "Strucutres"})  
CREATE (b:Build {BuildNo: $BuildNo, BuildName: $BuildName})
CREATE (s)-[:HAS_BUILD]->(b)  
RETURN b
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('b') as { properties: Structure };

    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async createFloor(data: Record<string, any>): Promise<Structure> {
    const query = `
    MATCH (fn:Build {BuildNo: $BuildNo})
CREATE (t:Floor {FloorNo: $FloorNo, FloorName: $FloorName})
CREATE (fn)-[:HAS_FLOOR]->(t) 
RETURN t
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Structure };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async createSpace(data: Record<string, any>): Promise<Structure> {
    const query = `
    MATCH (fn:Floor {FloorNo: $FloorNo})
CREATE (t:Space {SpaceNo: $SpaceNo, SpaceName: $SpaceName})
CREATE (fn)-[:HAS_FLOOR]->(t) 
RETURN t
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Structure };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async getStructures(type: StructureType, id: string) {
    if (type === StructureType.BUILD) {
      return this.getBuilds();
    } else if (type === StructureType.FLOOR) {
      return this.getFloors(id);
    } else if (type === StructureType.SPACE) {
      return this.getSpaces(id);
    }

    throw new Error('Structure not found');
  }

  async getBuilds() {
    try {
      const query = `
        MATCH (s:Strucutres)-[:HAS_BUILD]->(b:Build)
        OPTIONAL MATCH (b)-[:HAS_FLOOR]->(f:Floor)
        RETURN DISTINCT b, CASE WHEN f IS NOT NULL THEN true ELSE false END AS hasFloor
      `;
      const result = await this.neo4jService.read(query);

      if (!result || !result.records || result.records.length === 0) {
        throw new Error('No results found');
      }

      return result.records.map((record) => {
        const node = record.get('b') as { properties: Structure };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const hasFloor = record.get('hasFloor');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { ...node.properties, hasFloor };
      });
    } catch (error) {
      console.error('Error occurred while fetching builds:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Building not found. Details: ${error.message}`);
    }
  }

  async getFloors(id: string) {
    try {
      const query = `
      


MATCH (b:Build)-[:HAS_FLOOR]->(f:Floor)
      WHERE b.BuildNo = $id
      RETURN f
      
      `;
      const result = await this.neo4jService.read(query, { id });
      return result.records.map((record) => {
        const node = record.get('f') as { properties: Structure };
        return node.properties;
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Floor not found');
    }
  }

  async getSpaces(id: string) {
    try {
      const query = `



      MATCH (f:Floor)-[:HAS_FLOOR]->(s:Space)
      WHERE f.FloorNo = $id
      RETURN s

      `;
      const result = await this.neo4jService.read(query, { id });
      return result.records.map((record) => {
        const node = record.get('s') as { properties: Structure };
        return node.properties;
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error('Space not found');
    }
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
