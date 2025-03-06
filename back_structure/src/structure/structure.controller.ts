import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { StructureService } from './structure.service';

@Controller('structure')
export class StructureController {
  constructor(private readonly structureService: StructureService) {}

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.structureService.createStructure(body);
  }

  @Get()
  getAllStructure() {
    return this.structureService.getAllStructure();
  }
  @Get(':structureNo')
  getStructure(@Param('structureNo') structureNo: string) {
    return this.structureService.getStructure(structureNo);
  }

  @Put(':structureNo')
  updateStructure(
    @Param('structureNo') structureNo: string,
    @Body() body: Record<string, any>,
  ) {
    return this.structureService.updateStructure(structureNo, body);
  }

  @Delete(':structureNo')
  deleteStructure(@Param('structureNo') structureNo: string) {
    return this.structureService.deleteStructure(structureNo);
  }
}
