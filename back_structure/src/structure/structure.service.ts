import { Injectable, NotFoundException } from '@nestjs/common';
import { Structure } from './structure.entity';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class StructureService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async createStructure(data: Record<string, any>): Promise<Structure> {
    const query = `

             MATCH (Strucutres:Strucutres)  // Zaten var olan Tasks node'unu bul
         CREATE (t:Strucutres {structureNo: $structureNo, structureName: $structureName})
        CREATE (Strucutres)-[:HAS_STRUCUTRES]->(t)  // Yeni task'ı bu node'a bağla
        RETURN t
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Structure };
    const properties = node.properties;
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
    return node.properties;
  }

  async getAllStructure(): Promise<Structure[]> {
    const query = `
        MATCH (t:Structure)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Structure }; // Neo4j node tipini zorluyoruz
      return node.properties;
    });
  }

  async deleteStructure(structureNo: string) {
    const query = `
            MATCH (t:Structure {structureNo: $structureNo})
            DELETE t
        `;
    await this.neo4jService.write(query, { structureNo });
    return { message: 'Structure deleted' };
  }
}
