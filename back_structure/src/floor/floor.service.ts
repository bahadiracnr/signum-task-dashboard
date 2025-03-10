import { Injectable, NotFoundException } from '@nestjs/common';
import { Floor } from './floor.entity';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class FloorService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async createFloor(data: Record<string, any>): Promise<Floor> {
    const query = `



        MATCH (s:Floor {name: "Floor"}) 
CREATE (t:Floor {FloorNo: $FloorNo, FloorName: $FloorName})
CREATE (s)-[:HAS_FLOOR]->(t) 
RETURN t

        
        `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Floor };
    const properties = node.properties;
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
    return node.properties;
  }

  async getAllFloor(): Promise<Floor[]> {
    const query = `
        MATCH (t:Floor)
        RETURN t
    `;
    const result = await this.neo4jService.read(query);

    return result.records.map((record) => {
      const node = record.get('t') as { properties: Floor }; // Neo4j node tipini zorluyoruz
      return node.properties;
    });
  }

  async deleteFloor(FloorNo: string) {
    const query = `
            MATCH (t:Floor {FloorNo: $FloorNo})
            DELETE t
        `;
    await this.neo4jService.write(query, { FloorNo });
    return { message: 'Floor deleted' };
  }
}
