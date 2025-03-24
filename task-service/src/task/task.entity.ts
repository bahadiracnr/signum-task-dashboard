import { TaskStatus } from '../enums/TaskStatus';
export interface Task {
  location: string;
  status: TaskStatus;
}
