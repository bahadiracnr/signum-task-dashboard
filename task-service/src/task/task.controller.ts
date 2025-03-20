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

  @Put(':id')
  updateTask(@Param('id') id: string, @Body() body: Record<string, any>) {
    return this.TaskService.updateTask(id, body);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: string) {
    return this.TaskService.deleteTask(id);
  }
}
