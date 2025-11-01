import { useState, useEffect, useCallback } from "react";
import { KanbanBoard, KanbanTask, KanbanColumn } from "@/types/kanban";
import * as kanbanService from "@/services/kanbanService";

export const useKanban = () => {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial board data
  useEffect(() => {
    const loadBoard = async () => {
      try {
        setIsLoading(true);
        const data = await kanbanService.getKanbanBoard();
        setBoard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load board');
      } finally {
        setIsLoading(false);
      }
    };

    loadBoard();
  }, []);

  // Handle drag and drop
  const handleDragEnd = useCallback(async (
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    destinationIndex: number
  ) => {
    if (!board) return;

    // Optimistic UI update
    setBoard(prevBoard => {
      if (!prevBoard) return null;

      const newBoard = { ...prevBoard };
      const sourceColumn = { ...newBoard.columns[sourceColumnId] };
      const destColumn = { ...newBoard.columns[destinationColumnId] };

      // Remove from source
      sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);

      // Add to destination
      destColumn.taskIds.splice(destinationIndex, 0, taskId);

      // Update task's columnId
      const task = { ...newBoard.tasks[taskId] };
      task.columnId = destinationColumnId;

      newBoard.columns[sourceColumnId] = sourceColumn;
      newBoard.columns[destinationColumnId] = destColumn;
      newBoard.tasks[taskId] = task;

      return newBoard;
    });

    // Call service to persist
    try {
      await kanbanService.moveTask(taskId, sourceColumnId, destinationColumnId);
    } catch (err) {
      console.error('Failed to move task:', err);
      // In a real app, you'd revert the optimistic update here
    }
  }, [board]);

  // Handle task creation
  const handleCreateTask = useCallback(async (
    title: string,
    description: string | undefined,
    clientId: number,
    columnId: string
  ) => {
    if (!board) return;

    try {
      const newTask = await kanbanService.createTask({
        title,
        description,
        clientId,
        columnId,
      });

      // Optimistic UI update
      setBoard(prevBoard => {
        if (!prevBoard) return null;

        const newBoard = { ...prevBoard };
        const column = { ...newBoard.columns[columnId] };

        // Add task to tasks object
        newBoard.tasks[newTask.id] = newTask;

        // Add task ID to column
        column.taskIds = [...column.taskIds, newTask.id];
        newBoard.columns[columnId] = column;

        return newBoard;
      });
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  }, [board]);

  return {
    board,
    isLoading,
    error,
    handleDragEnd,
    handleCreateTask,
  };
};
