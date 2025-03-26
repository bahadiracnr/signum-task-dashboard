// src/kanban/types.ts

export interface KanbanCardType {
  id: string | number;
  name: string;
  description: string;
  location: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | string;
}

export interface ColumnType {
  id: string;
  title: string;
  cards: KanbanCardType[];
}
