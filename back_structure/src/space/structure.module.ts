import { Module } from '@nestjs/common';
import { StructureService } from './structure.service';
import { StructureController } from './structure.controller';

@Module({
  imports: [],
  controllers: [StructureController],
  providers: [StructureService],
})
export class StructureModule {}
