import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { StructureService } from './structure.service';
import { StructureType } from 'src/enums/StrcutureType';

@Controller('structure')
export class StructureController {
  constructor(private readonly structureService: StructureService) {}

  @Post()
  createStructure(@Body() body: Record<string, any>) {
    return this.structureService.createStructure(body);
  }

  @Get()
  getStructures(@Query('type') type: StructureType, @Query('id') id: string) {
    return this.structureService.getStructures(type, id);
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
