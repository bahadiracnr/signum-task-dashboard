// src/kanban/components/kanban-card.tsx

import {
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { MapPin } from 'lucide-react';
import { KanbanCardType } from '../types';
import '../index.css';

interface KanbanCardProps {
  card: KanbanCardType;
  index: number;
}

export function KanbanCard({ card, index }: KanbanCardProps) {
  return (
    <Draggable draggableId={String(card.id)} index={index}>
      {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
        const isDragging = snapshot.isDragging;

        const style = {
          transform: provided.draggableProps.style?.transform,
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`kanban-card ${isDragging ? 'dragging' : ''}`}
            style={style}
          >
            <div className="flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <h3 className="text-lg font-semibold mb-2">{card.name}</h3>
                <p className="text-sm text-700 mb-2">{card.description}</p>
                <div className="card-location mb-2 flex items-center text-sm text-gray-600">
                  <MapPin size={14} className="mr-1" />
                  <span>{card.location}</span>
                </div>
                <div className="card-status text-xs text-gray-500">
                  {card.status}
                </div>
              </div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
}
