import { Module } from '@nestjs/common';
import { StructureService } from './structure.service';
import { StructureController } from './structure.controller';
import { FloorModule } from 'src/floor/floor.module';

@Module({
  imports: [FloorModule],
  controllers: [StructureController],
  providers: [StructureService],
})
export class StructureModule {}
