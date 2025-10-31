import { KanbanBoard, TaskDetail } from "@/types/kanban";

export const KANBAN_MOCK_DATA: KanbanBoard = {
  columnOrder: ['col-1-todo', 'col-2-progress', 'col-3-done'],
  columns: {
    'col-1-todo': {
      id: 'col-1-todo',
      title: 'To Do',
      taskIds: ['task-1', 'task-2'],
    },
    'col-2-progress': {
      id: 'col-2-progress',
      title: 'In Progress',
      taskIds: ['task-3'],
    },
    'col-3-done': {
      id: 'col-3-done',
      title: 'Done',
      taskIds: [],
    },
  },
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Follow up on payment',
      description: 'Client mentioned they would pay on Friday. Call to confirm.',
      columnId: 'col-1-todo',
      client: {
        id: 'client-abc',
        name: 'Company X',
        avatarUrl: 'https://ui-avatars.com/api/?name=Company+X',
      },
      chatwootInfo: {
        conversationStatus: 'open',
        unreadCount: 3,
        lastMessageTimestamp: '2025-10-31T17:30:00Z',
      },
    },
    'task-2': {
      id: 'task-2',
      title: 'Send proposal for Module B',
      description: 'Prepare and send the detailed proposal for the new module implementation.',
      columnId: 'col-1-todo',
      client: {
        id: 'client-xyz',
        name: 'Client Y',
        avatarUrl: 'https://ui-avatars.com/api/?name=Client+Y',
      },
      chatwootInfo: {
        conversationStatus: 'resolved',
        unreadCount: 0,
        lastMessageTimestamp: '2025-10-30T10:00:00Z',
      },
    },
    'task-3': {
      id: 'task-3',
      title: 'Resolve billing bug',
      description: 'Investigate and fix the billing calculation issue reported by the client.',
      columnId: 'col-2-progress',
      client: {
        id: 'client-abc',
        name: 'Company X',
        avatarUrl: 'https://ui-avatars.com/api/?name=Company+X',
      },
      chatwootInfo: {
        conversationStatus: 'none',
        unreadCount: 0,
        lastMessageTimestamp: null,
      },
    },
  },
};

export const TASK_DETAIL_MOCK: Record<string, TaskDetail> = {
  'task-1': {
    ...KANBAN_MOCK_DATA.tasks['task-1'],
    chatHistory: [
      {
        id: 'cw-msg-1',
        content: 'Hi, did you receive my invoice?',
        senderType: 'contact',
        timestamp: '2025-10-31T17:29:00Z',
      },
      {
        id: 'cw-msg-2',
        content: 'Hello! Yes, we are processing it now.',
        senderType: 'agent',
        timestamp: '2025-10-31T17:29:30Z',
      },
      {
        id: 'cw-msg-3',
        content: 'Perfect, thank you!',
        senderType: 'contact',
        timestamp: '2025-10-31T17:30:00Z',
      },
    ],
  },
  'task-2': {
    ...KANBAN_MOCK_DATA.tasks['task-2'],
    chatHistory: [
      {
        id: 'cw-msg-4',
        content: 'When can I expect the proposal?',
        senderType: 'contact',
        timestamp: '2025-10-30T09:45:00Z',
      },
      {
        id: 'cw-msg-5',
        content: 'We will send it by end of day today.',
        senderType: 'agent',
        timestamp: '2025-10-30T09:50:00Z',
      },
      {
        id: 'cw-msg-6',
        content: 'Great, looking forward to it!',
        senderType: 'contact',
        timestamp: '2025-10-30T10:00:00Z',
      },
    ],
  },
  'task-3': {
    ...KANBAN_MOCK_DATA.tasks['task-3'],
    chatHistory: [],
  },
};
