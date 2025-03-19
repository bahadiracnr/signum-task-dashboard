import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
  constructor(private readonly TaskService: TaskService) {}

  @Post()
  createTask(@Body() body: Record<string, any>) {
    return this.TaskService.createTask(body);
  }

  @Get()
  getAllTask() {
    return this.TaskService.getAllTask();
  }
  @Get(':no')
  getTask(@Param('no') no: string) {
    return this.TaskService.getTask(no);
  }

  @Put(':no')
  updateTask(@Param('no') no: string, @Body() body: Record<string, any>) {
    return this.TaskService.updateTask(no, body);
  }

  @Delete(':no')
  deleteTask(@Param('no') no: string) {
    return this.TaskService.deleteTask(no);
  }
}
