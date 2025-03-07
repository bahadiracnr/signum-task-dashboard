import { Module } from '@nestjs/common';
import { FloorService } from './floor.service';
import { FloorController } from './floor.controller';

@Module({
  imports: [],
  controllers: [FloorController],
  providers: [FloorService],
})
export class FloorModule {}
