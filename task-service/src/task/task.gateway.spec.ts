import { Test, TestingModule } from '@nestjs/testing';
import { TaskGateway } from './task.gateway';
import { TaskService } from './task.service';

describe('TaskGateway', () => {
  let gateway: TaskGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskGateway,
        {
          provide: TaskService,
          useValue: {
            getAllTask: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    gateway = module.get<TaskGateway>(TaskGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit tasks correctly', async () => {
    const serverMock = { emit: jest.fn() };
    gateway.server = serverMock as any;
    await gateway.emitTasks();
    expect(serverMock.emit).toHaveBeenCalledWith('tasks', []);
  });
});
