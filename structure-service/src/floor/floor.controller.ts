import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { FloorService } from './floor.service';

@Controller('floor')
export class FloorController {
  constructor(private readonly FloorService: FloorService) {}

  @Post()
  createFloor(@Body() body: Record<string, any>) {
    return this.FloorService.createFloor(body);
  }

  @Get()
  getAllFloor() {
    return this.FloorService.getAllFloor();
  }
  @Get(':FloorNo')
  getFloor(@Param('FloorNo') FloorNo: string) {
    return this.FloorService.getFloor(FloorNo);
  }

  @Put(':FloorNo')
  updateFloor(
    @Param('FloorNo') FloorNo: string,
    @Body() body: Record<string, any>,
  ) {
    return this.FloorService.updateFloor(FloorNo, body);
  }

  @Delete(':FloorNo')
  deleteFloor(@Param('FloorNo') FloorNo: string) {
    return this.FloorService.deleteFloor(FloorNo);
  }
}
