import { Module } from '@nestjs/common';
import { FloorService } from './floor.service';
import { FloorController } from './floor.controller';
import { SpaceModule } from 'src/space/space.module';

@Module({
  imports: [SpaceModule],
  controllers: [FloorController],
  providers: [FloorService],
})
export class FloorModule {}
