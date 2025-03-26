// src/kanban/types.ts

export interface KanbanCardType {
  id: string | number;
  name: string;
  description: string;
  location: string;
  status: 'To Do' | 'In Progress' | 'Done' | string;
}

export interface ColumnType {
  id: string;
  title: string;
  cards: KanbanCardType[];
}
