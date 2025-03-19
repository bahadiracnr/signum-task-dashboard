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
MATCH (s:Structures {name: "Structures"})  
CREATE (b:Build {no: $no, coname: $coname})
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
    MATCH (fn:Build)
    WHERE id(fn) = $id
    CREATE (t:Floor {no: $no, coname: $coname})
    CREATE (fn)-[:HAS_FLOOR]->(t)
    RETURN t
    `;

    const result = await this.neo4jService.write(query, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      no: data.no,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      coname: data.coname,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: data.id,
    });

    const node = result.records[0].get('t') as { properties: Structure };
    const properties = node.properties;
    await this.sendToKafka('create', properties);
    return properties;
  }

  async createSpace(data: Record<string, any>): Promise<Structure> {
    const query = `
    MATCH (fn:Floor)
    WHERE id(fn) = $id
    CREATE (t:Space {no: $no, coname: $coname})
    CREATE (fn)-[:HAS_SPACE]->(t)
    RETURN t
    `;

    const result = await this.neo4jService.write(query, {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      no: data.no,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      coname: data.coname,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      id: data.id,
    });

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
        MATCH (s:Structures)-[:HAS_BUILD]->(b:Build)
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
        MATCH (s:Build)-[:HAS_FLOOR]->(b:Floor)
        OPTIONAL MATCH (b)-[:HAS_SPACE]->(f:Space)
        WHERE s.id = $id
        RETURN DISTINCT b, CASE WHEN f IS NOT NULL THEN true ELSE false END AS hasSpace
      `;
      const result = await this.neo4jService.read(query, { id });

      if (!result || !result.records || result.records.length === 0) {
        throw new Error('No results found');
      }

      return result.records.map((record) => {
        const node = record.get('b') as { properties: Structure };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const hasSpace = record.get('hasSpace');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { ...node.properties, hasSpace };
      });
    } catch (error) {
      console.error('Error occurred while fetching floors:', error);
      throw new Error(`Floor not found. Details:`);
    }
  }

  async getSpaces(id: string) {
    try {
      const query = `
        MATCH (f:Floor)-[:HAS_SPACE]->(s:Space)
        OPTIONAL MATCH (s)-[:IS_LOCATED_IN]->(b:Build)
        WHERE f.id = $id
        RETURN DISTINCT s, CASE WHEN b IS NOT NULL THEN true ELSE false END AS isLocatedInBuild
      `;

      const result = await this.neo4jService.read(query, { id });

      if (!result || !result.records || result.records.length === 0) {
        throw new Error('No results found');
      }

      return result.records.map((record) => {
        const node = record.get('s') as { properties: Structure };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const isLocatedInBuild = record.get('isLocatedInBuild');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return { ...node.properties, isLocatedInBuild };
      });
    } catch (error) {
      console.error('Error occurred while fetching spaces:', error);
      throw new Error('Space not found');
    }
  }

  async updateStructure(no: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Structure {no: $no})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { no, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Structure not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { no, ...data });
    return node.properties;
  }

  async updateStructures(
    type: StructureType,
    no: string,
    data: Record<string, any>,
  ) {
    if (type === StructureType.BUILD) {
      return this.updateBuild(no, data);
    } else if (type === StructureType.FLOOR) {
      return this.updateFloor(no, data);
    } else if (type === StructureType.SPACE) {
      return this.updateSpace(no, data);
    }
    throw new Error('Structure not found');
  }

  async updateBuild(no: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Build {no: $no})
        SET t += $data
        RETURN t
    `;

    const result = await this.neo4jService.write(query, { no, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Build not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { no, ...data });
    return node.properties;
  }

  async updateFloor(no: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Floor {no: $no})
        SET t += $data
        RETURN t
    `;
    const result = await this.neo4jService.write(query, { no, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Floor not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { no, ...data });
    return node.properties;
  }

  async updateSpace(no: string, data: Record<string, any>) {
    const query = `
        MATCH (t:Space {no: $no})
        SET t += $data
        RETURN t
    `;
    const result = await this.neo4jService.write(query, { no, data });

    if (result.records.length === 0) {
      throw new NotFoundException('Space not found');
    }

    const node = result.records[0].get('t') as {
      properties: Record<string, any>;
    };
    await this.sendToKafka('update', { no, ...data });
    return node.properties;
  }

  async deleteStructures(type: StructureType, no: string) {
    if (type === StructureType.BUILD) {
      return this.deleteBuild(no);
    } else if (type === StructureType.FLOOR) {
      return this.deleteFloor(no);
    } else if (type === StructureType.SPACE) {
      return this.deleteSpace(no);
    }
    throw new Error('Structure not found');
  }

  async deleteBuild(no: string) {
    const query = `
            MATCH (t:Build {no: $no})-[r]->()
DELETE r, t
        `;
    await this.neo4jService.write(query, { no });
    await this.sendToKafka('delete', { no });
    return { message: 'Build deleted' };
  }

  async deleteFloor(no: string) {
    const query = `
            MATCH (t:Floor {no: $no})-[r]->()
    DELETE r, t
        `;
    await this.neo4jService.write(query, { no });
    await this.sendToKafka('delete', { no });
    return { message: 'Floor deleted' };
  }

  async deleteSpace(no: string) {
    const query = `
            MATCH (t:Space {no: $no})-[r]->()
    DELETE r, t
        `;
    await this.neo4jService.write(query, { no });
    await this.sendToKafka('delete', { no });
    return { message: 'Space deleted' };
  }
}
