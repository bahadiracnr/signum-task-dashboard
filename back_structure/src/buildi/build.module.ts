import { Module } from '@nestjs/common';
import { BuildService } from './build.service';
import { BuildController } from './build.controller';
import { FloorModule } from 'src/floor/floor.module';

@Module({
  imports: [FloorModule],
  controllers: [BuildController],
  providers: [BuildService],
})
export class BuildModule {}
