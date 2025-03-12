import { Module } from '@nestjs/common';
import { StructureService } from './structure.service';
import { StructureController } from './structure.controller';
import { BuildModule } from 'src/buildi/build.module';

@Module({
  imports: [BuildModule],
  controllers: [StructureController],
  providers: [StructureService],
})
export class StructureModule {}
