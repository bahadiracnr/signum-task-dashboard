import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SpaceService } from './space.service';

@Controller('space')
export class SpaceController {
  constructor(private readonly SpaceService: SpaceService) {}

  @Post()
  createSpace(@Body() body: Record<string, any>) {
    return this.SpaceService.createSpace(body);
  }

  @Get()
  getAllSpace() {
    return this.SpaceService.getAllSpace();
  }
  @Get(':SpaceNo')
  getSpace(@Param('SpaceNo') SpaceNo: string) {
    return this.SpaceService.getSpace(SpaceNo);
  }

  @Put(':SpaceNo')
  updateSpace(
    @Param('SpaceNo') SpaceNo: string,
    @Body() body: Record<string, any>,
  ) {
    return this.SpaceService.updateSpace(SpaceNo, body);
  }

  @Delete(':SpaceNo')
  deleteSpace(@Param('SpaceNo') SpaceNo: string) {
    return this.SpaceService.deleteSpace(SpaceNo);
  }
}
