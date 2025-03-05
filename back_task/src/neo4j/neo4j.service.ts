import { Injectable } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { neo4jConfig } from '../config/neo4j.config';

@Injectable()
export class Neo4jService {
  private driver: Driver;

  onModuleInit() {
    this.driver = neo4j.driver(
      `${neo4jConfig.scheme}://${neo4jConfig.host}:${neo4jConfig.port}`,
      neo4j.auth.basic(neo4jConfig.username, neo4jConfig.password),
    );
  }

  async read(query: string, params: Record<string, any> = {}) {
    const session = this.driver.session({
      database: neo4jConfig.database,
    });
    try {
      return await session.run(query, params);
    } finally {
      await session.close();
    }
  }

  async write(query: string, params: Record<string, any> = {}) {
    const session = this.driver.session({
      database: neo4jConfig.database,
    });
    try {
      return await session.run(query, params);
    } finally {
      await session.close();
    }
  }

  onModuleDestroy() {
    return this.driver.close();
  }
}
