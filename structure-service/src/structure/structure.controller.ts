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
  createStructures(
    @Query('type') type: StructureType,
    @Body() body: Record<string, any>,
  ) {
    return this.structureService.createStructures(type, body);
  }

  @Get()
  getStructures(@Query('type') type: StructureType, @Query('id') id: string) {
    return this.structureService.getStructures(type, id);
  }

  @Put(':no')
  updateStructures(
    @Param('no') no: string,
    @Query('type') type: StructureType,
    @Body() body: Record<string, any>,
  ) {
    return this.structureService.updateStructures(type, no, body);
  }

  @Delete(':no')
  deleteStructures(
    @Query('type') type: StructureType,
    @Param('no') no: string,
  ) {
    return this.structureService.deleteStructures(type, no);
  }
}
