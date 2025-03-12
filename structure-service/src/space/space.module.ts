import { Module } from '@nestjs/common';
import { SpaceService } from './space.service';
import { SpaceController } from './space.controller';

@Module({
  imports: [],
  controllers: [SpaceController],
  providers: [SpaceService],
})
export class SpaceModule {}
