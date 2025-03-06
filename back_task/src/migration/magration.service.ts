import { Injectable, OnModuleInit } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';

@Injectable()
export class MigrationService implements OnModuleInit {
  constructor(private readonly neo4jService: Neo4jService) {}

  async onModuleInit() {
    console.log('Running initial migrations for Task Service...');
    await this.setupInitialProjectWithTasksNode();
  }

  private async setupInitialProjectWithTasksNode() {
    const projectName = 'Projects';

    // 1. Project var mı kontrol et
    const projectExists = await this.neo4jService.read(
      `
      MATCH (p:Project {name: $name}) RETURN p
      `,
      { name: projectName },
    );

    if (projectExists.records.length > 0) {
      console.log(
        `Project "${projectName}" already exists. Skipping project creation.`,
      );
    } else {
      console.log(`Creating initial Project "${projectName}"...`);
      await this.neo4jService.write(
        `
        CREATE (p:Project {name: $name})
        `,
        { name: projectName },
      );
    }

    // 2. tasks node var mı kontrol et
    const tasksNodeExists = await this.neo4jService.read(
      `
      MATCH (p:Project {name: $name})-[:HAS_TASKS]->(t:Tasks) 
      RETURN t
      `,
      { name: projectName },
    );

    if (tasksNodeExists.records.length > 0) {
      console.log('Tasks node already exists. Skipping tasks node creation.');
    } else {
      console.log('Creating "tasks" node and linking to Project...');
      await this.neo4jService.write(
        `
        MATCH (p:Project {name: $name})
        CREATE (p)-[:HAS_TASKS]->(:Tasks)
        `,
        { name: projectName },
      );
    }

    console.log('Initial migration for Project and Tasks node completed.');
  }
}
