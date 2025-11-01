import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanBoard as KanbanBoardType, KanbanTask, ColumnPagination } from "@/types/kanban";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { CreateTaskModal } from "./CreateTaskModal";

interface KanbanBoardProps {
  board: KanbanBoardType;
  pagination: ColumnPagination;
  onDragEnd: (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    destinationIndex: number
  ) => void;
  onCreateTask: (title: string, description: string | undefined, clientId: number, columnId: string) => Promise<void>;
  onPageChange: (columnId: string, page: number) => void;
  getPaginatedTasks: (columnId: string) => KanbanTask[];
}

export const KanbanBoard = ({ 
  board, 
  pagination, 
  onDragEnd, 
  onCreateTask,
  onPageChange,
  getPaginatedTasks,
}: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const task = board.tasks[taskId];
    setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = board.tasks[taskId];
    const sourceColumnId = task.columnId;
    const destinationColumnId = over.id as string;

    if (sourceColumnId === destinationColumnId) return;

    const destinationColumn = board.columns[destinationColumnId];
    const destinationIndex = destinationColumn.taskIds.length;

    onDragEnd(taskId, sourceColumnId, destinationColumnId, destinationIndex);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleCloseModal = () => {
    setSelectedTaskId(null);
  };

  const handleOpenCreateTask = (columnId: string) => {
    setCreateTaskColumnId(columnId);
  };

  const handleCloseCreateTask = () => {
    setCreateTaskColumnId(null);
  };

  const handleSubmitCreateTask = async (
    title: string,
    description: string | undefined,
    clientId: number
  ) => {
    if (createTaskColumnId) {
      await onCreateTask(title, description, clientId, createTaskColumnId);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
          {board.columnOrder.map((columnId) => {
            const column = board.columns[columnId];
            const paginatedTasks = getPaginatedTasks(columnId);
            const columnPagination = pagination[columnId];
            const totalPages = Math.ceil(columnPagination.total / columnPagination.limit);

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={paginatedTasks}
                onTaskClick={handleTaskClick}
                onCreateTask={handleOpenCreateTask}
                currentPage={columnPagination.page}
                totalPages={totalPages}
                totalTasks={columnPagination.total}
                onPageChange={(page) => onPageChange(columnId, page)}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <KanbanCard task={activeTask} onClick={() => {}} />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={handleCloseModal}
      />

      <CreateTaskModal
        isOpen={!!createTaskColumnId}
        onClose={handleCloseCreateTask}
        onSubmit={handleSubmitCreateTask}
        columnTitle={createTaskColumnId ? board.columns[createTaskColumnId]?.title || "" : ""}
      />
    </>
  );
};
