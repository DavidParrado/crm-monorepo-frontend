import { KanbanBoard, TaskDetail, KanbanTask } from "@/types/kanban";
import { KANBAN_MOCK_DATA, TASK_DETAIL_MOCK } from "@/data/kanban-mock";

/**
 * Simulates fetching the Kanban board data.
 * In the future, this will use the http adapter.
 */
export const getKanbanBoard = async (): Promise<KanbanBoard> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return KANBAN_MOCK_DATA;
};

/**
 * Simulates fetching a task's detailed data.
 * In the future, this will use the http adapter.
 */
export const getTaskDetail = async (taskId: string): Promise<TaskDetail> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const taskDetail = TASK_DETAIL_MOCK[taskId];
  if (!taskDetail) {
    throw new Error(`Task ${taskId} not found`);
  }
  
  return taskDetail;
};

/**
 * Simulates moving a task to a different column.
 * In the future, this will use the http adapter to persist the change.
 */
export const moveTask = async (
  taskId: string,
  fromColumnId: string,
  toColumnId: string
): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  console.log(`Moving task ${taskId} from ${fromColumnId} to ${toColumnId}`);
};

/**
 * Simulates creating a new task.
 * In the future, this will use the http adapter.
 */
export interface CreateTaskDto {
  title: string;
  description?: string;
  clientId: number;
  columnId: string;
}

export const createTask = async (data: CreateTaskDto): Promise<KanbanTask> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Generate a new task ID
  const newTaskId = `task-${Date.now()}`;
  
  // In a real app, this would fetch the client data from the backend
  // For now, we'll create mock client data
  const newTask: KanbanTask = {
    id: newTaskId,
    title: data.title,
    description: data.description,
    columnId: data.columnId,
    client: {
      id: `client-${data.clientId}`,
      name: `Client ${data.clientId}`,
      avatarUrl: `https://ui-avatars.com/api/?name=Client+${data.clientId}`,
    },
    chatwootInfo: {
      conversationStatus: 'none',
      unreadCount: 0,
      lastMessageTimestamp: null,
    },
  };
  
  return newTask;
};
