import { Controller, Get, Post, Body } from '@nestjs/common';
import { LogService } from './log.service';

@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  async createLog(
    @Body()
    body: {
      service: string;
      action: string;
      data: Record<string, any>;
    },
  ) {
    return this.logService.createLog(body.service, body.action, body.data);
  }

  @Get()
  async getAllLogs() {
    return this.logService.getLogs();
  }
}
