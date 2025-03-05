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

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() body: Record<string, any>) {
    return this.taskService.createTask(body);
  }

  @Get()
  getAllTasks() {
    return this.taskService.getAllTasks();
  }
  @Get(':taskNo')
  getTask(@Param('taskNo') taskNo: string) {
    return this.taskService.getTask(taskNo);
  }

  @Put(':taskNo')
  updateTask(
    @Param('taskNo') taskNo: string,
    @Body() body: Record<string, any>,
  ) {
    return this.taskService.updateTask(taskNo, body);
  }

  @Delete(':taskNo')
  deleteTask(@Param('taskNo') taskNo: string) {
    return this.taskService.deleteTask(taskNo);
  }
}
