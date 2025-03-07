import { Injectable, NotFoundException } from '@nestjs/common';
import { Build } from './build.entity';
import { Neo4jService } from 'nest-neo4j/dist';

@Injectable()
export class BuildService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async createBuild(data: Record<string, any>): Promise<Build> {
    const query = `
    
                 MATCH (Build:Build)  // Zaten var olan Tasks node'unu bul
             CREATE (t:Build {BuildNo: $BuildNo, BuildName: $BuildName})
            CREATE (Build)-[:HAS_BUILD]->(t)  // Yeni task'ı bu node'a bağla
            RETURN t
            `;
    const result = await this.neo4jService.write(query, data);
    const node = result.records[0].get('t') as { properties: Build };
    const properties = node.properties;
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
    return { message: 'Build deleted' };
  }
}
