import { useState, useEffect, useCallback, useMemo } from "react";
import { KanbanBoard, KanbanColumn, ColumnPagination } from "@/types/kanban";
import * as kanbanService from "@/services/kanbanService";
import { useKanbanFilters } from "./useKanbanFilters";

export const useKanban = () => {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<ColumnPagination>({});

  // Initialize filters
  const {
    filters,
    uniqueClients,
    filterTasks,
    setClientFilter,
    setChatStatusFilter,
    setShowUnreadOnly,
    setSearchQuery,
    resetFilters,
    hasActiveFilters,
  } = useKanbanFilters(board?.tasks || {});

  // Load initial board data
  useEffect(() => {
    const loadBoard = async () => {
      try {
        setIsLoading(true);
        const data = await kanbanService.getKanbanBoard();
        setBoard(data);
        
        // Initialize pagination for each column
        const initialPagination: ColumnPagination = {};
        Object.keys(data.columns).forEach(columnId => {
          const column = data.columns[columnId];
          initialPagination[columnId] = {
            page: 1,
            limit: 5,
            total: column.taskIds.length,
          };
        });
        setPagination(initialPagination);
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

      // Update pagination total
      setPagination(prev => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          total: prev[columnId].total + 1,
        },
      }));
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  }, [board]);

  // Handle pagination change
  const handlePageChange = useCallback((columnId: string, newPage: number) => {
    setPagination(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        page: newPage,
      },
    }));
  }, []);

  // Get filtered board with filters applied
  const filteredBoard = useMemo(() => {
    if (!board) return null;

    const newBoard = { ...board };
    const newColumns: Record<string, KanbanColumn> = {};

    // Apply filters to each column
    Object.keys(board.columns).forEach(columnId => {
      const column = board.columns[columnId];
      const filteredTaskIds = filterTasks(column.taskIds);
      
      newColumns[columnId] = {
        ...column,
        taskIds: filteredTaskIds,
      };
    });

    return {
      ...newBoard,
      columns: newColumns,
    };
  }, [board, filterTasks]);

  // Update pagination when filters change
  useEffect(() => {
    if (!filteredBoard) return;

    const newPagination: ColumnPagination = {};
    Object.keys(filteredBoard.columns).forEach(columnId => {
      const column = filteredBoard.columns[columnId];
      newPagination[columnId] = {
        page: 1, // Reset to page 1 when filters change
        limit: 5,
        total: column.taskIds.length,
      };
    });
    setPagination(newPagination);
  }, [filteredBoard]);

  // Get paginated tasks for a column
  const getPaginatedTasks = useCallback((columnId: string) => {
    if (!filteredBoard || !pagination[columnId]) return [];
    
    const column = filteredBoard.columns[columnId];
    const { page, limit } = pagination[columnId];
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return column.taskIds
      .slice(start, end)
      .map(taskId => filteredBoard.tasks[taskId]);
  }, [filteredBoard, pagination]);

  return {
    board: filteredBoard,
    isLoading,
    error,
    pagination,
    handleDragEnd,
    handleCreateTask,
    handlePageChange,
    getPaginatedTasks,
    // Filter controls
    filters,
    uniqueClients,
    setClientFilter,
    setChatStatusFilter,
    setShowUnreadOnly,
    setSearchQuery,
    resetFilters,
    hasActiveFilters,
  };
};
