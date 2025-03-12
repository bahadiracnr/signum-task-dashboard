import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { BuildService } from './build.service';

@Controller('build')
export class BuildController {
  constructor(private readonly BuildService: BuildService) {}

  @Post()
  createBuild(@Body() body: Record<string, any>) {
    return this.BuildService.createBuild(body);
  }

  @Get()
  getAllBuild() {
    return this.BuildService.getAllBuild();
  }
  @Get(':BuildNo')
  getBuild(@Param('BuildNo') BuildNo: string) {
    return this.BuildService.getBuild(BuildNo);
  }

  @Put(':BuildNo')
  updateBuild(
    @Param('BuildNo') BuildNo: string,
    @Body() body: Record<string, any>,
  ) {
    return this.BuildService.updateBuild(BuildNo, body);
  }

  @Delete(':BuildNo')
  deleteBuild(@Param('BuildNo') BuildNo: string) {
    return this.BuildService.deleteBuild(BuildNo);
  }
}
