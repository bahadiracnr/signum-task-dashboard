import { Injectable } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class AppService {
  constructor(private readonly neo4jService: Neo4jService) {}
  async getHello(): Promise<string> {
    const res = await this.neo4jService.read(
      `MATCH (n) RETURN count(n) AS count`,
    );

    return `There are ${res.records[0].get('count')} nodes in the database`;
  }
}
