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
  @Get(':taskNo')
  getTask(@Param('taskNo') taskNo: string) {
    return this.TaskService.getTask(taskNo);
  }

  @Put(':taskNo')
  updateTask(
    @Param('taskNo') taskNo: string,
    @Body() body: Record<string, any>,
  ) {
    return this.TaskService.updateTask(taskNo, body);
  }

  @Delete(':taskNo')
  deleteTask(@Param('taskNo') taskNo: string) {
    return this.TaskService.deleteTask(taskNo);
  }
}
