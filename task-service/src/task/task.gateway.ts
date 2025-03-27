import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { TaskService } from './task.service';
import { subscribe } from 'diagnostics_channel';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => TaskService))
    private readonly taskService: TaskService,
  ) {}

  // Client
  async handleConnection(client: Socket) {
    const tasks = await this.taskService.getAllTask();
    client.emit('tasks', tasks);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // MANUEL
  async emitTasks() {
    const tasks = await this.taskService.getAllTask();
    this.server.emit('tasks', tasks);
  }

  // FETCH
  @SubscribeMessage('getTasks')
  async handleGetTasks(@ConnectedSocket() client: Socket) {
    const tasks = await this.taskService.getAllTask();
    client.emit('tasks', tasks);
  }

  // UPDATE
  @SubscribeMessage('updateTask')
  async handleUpdateTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: string; status: Record<string, any> },
  ) {
    console.log('🟡 updateTask received:', data);
    await this.taskService.updateTask(data.id, { status: data.status });
  }
}
