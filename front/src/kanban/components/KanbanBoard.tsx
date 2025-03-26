// src/kanban/components/KanbanBoard.tsx
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { KanbanCard } from './kanban-card';
import { Card } from 'primereact/card';
import { ColumnType, KanbanCardType } from '../types';
import { socket } from '../../socket';
import axios from 'axios';
import '../index.css';

export function KanbanBoard() {
  const [columns, setColumns] = useState<ColumnType[]>([]);

  useEffect(() => {
    const handleConnect = () => {
      socket.emit('getTasks');
    };

    const handleTasks = (tasks: KanbanCardType[]) => {
      const grouped = groupTasksToColumns(tasks);
      setColumns(grouped);
    };

    socket.on('connect', handleConnect);
    socket.on('tasks', handleTasks);

    // Initial fetch
    socket.emit('getTasks');

    return () => {
      socket.off('connect', handleConnect);
      socket.off('tasks', handleTasks);
    };
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId,
    );
    if (!sourceColumn || !destColumn) return;

    const movedCard = sourceColumn.cards[source.index];
    const newSourceCards = [...sourceColumn.cards];
    newSourceCards.splice(source.index, 1);
    const newDestCards = [...destColumn.cards];
    newDestCards.splice(destination.index, 0, movedCard);

    const updatedColumns = [...columns];
    updatedColumns[columns.indexOf(sourceColumn)] = {
      ...sourceColumn,
      cards: newSourceCards,
    };
    updatedColumns[columns.indexOf(destColumn)] = {
      ...destColumn,
      cards: newDestCards,
    };

    setColumns(updatedColumns);

    try {
      await axios.put(`http://localhost:5005/task/${movedCard.id}`, {
        status: destColumn.title,
      });
    } catch (err) {
      console.error('Status güncellenirken hata:', err);
    }
  };

  return (
    <div className="p-4 md:p-6 kanban-container">
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold m-0">Kanban Board</h1>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="kanban-columns-wrapper">
            {columns.map((column) => (
              <div key={column.id} className="kanban-column-wrapper">
                <Card className="kanban-column shadow-2">
                  <div className="kanban-column-header flex justify-between items-center">
                    <h2 className="text-xl font-bold m-0">{column.title}</h2>
                    <div className="column-count text-sm text-gray-500">
                      {column.cards.length}
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`kanban-column-content ${
                          snapshot.isDraggingOver ? 'dragging-over' : ''
                        }`}
                        style={{
                          backgroundColor: snapshot.isDraggingOver
                            ? 'var(--surface-50)'
                            : '',
                        }}
                      >
                        {column.cards.map((card, index) => (
                          <KanbanCard key={card.id} card={card} index={index} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}

// Kolonlara ayır
function groupTasksToColumns(tasks: KanbanCardType[]): ColumnType[] {
  const columns: Record<string, ColumnType> = {
    TODO: { id: 'column-1', title: 'TODO', cards: [] },
    IN_PROGRESS: { id: 'column-2', title: 'IN_PROGRESS', cards: [] },
    DONE: { id: 'column-3', title: 'DONE', cards: [] },
  };

  tasks.forEach((task) => {
    const column = columns[task.status] || columns['TODO'];
    column.cards.push(task);
  });

  return Object.values(columns);
}
