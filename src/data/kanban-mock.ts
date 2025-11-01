import { KanbanBoard, TaskDetail } from "@/types/kanban";

export const KANBAN_MOCK_DATA: KanbanBoard = {
  columnOrder: ['col-1-todo', 'col-2-progress', 'col-3-done'],
  columns: {
    'col-1-todo': {
      id: 'col-1-todo',
      title: 'To Do',
      taskIds: ['task-1', 'task-2', 'task-4', 'task-5', 'task-6', 'task-7', 'task-8', 'task-9', 'task-10'],
    },
    'col-2-progress': {
      id: 'col-2-progress',
      title: 'In Progress',
      taskIds: ['task-3', 'task-11', 'task-12'],
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
    'task-4': {
      id: 'task-4',
      title: 'Review contract terms',
      description: 'Go through the updated contract with legal team.',
      columnId: 'col-1-todo',
      client: {
        id: 'client-def',
        name: 'Partner Corp',
        avatarUrl: 'https://ui-avatars.com/api/?name=Partner+Corp',
      },
      chatwootInfo: {
        conversationStatus: 'pending',
        unreadCount: 1,
        lastMessageTimestamp: '2025-10-31T14:00:00Z',
      },
    },
    'task-5': {
      id: 'task-5',
      title: 'Schedule demo call',
      columnId: 'col-1-todo',
      client: {
        id: 'client-ghi',
        name: 'StartupZ',
        avatarUrl: 'https://ui-avatars.com/api/?name=StartupZ',
      },
      chatwootInfo: {
        conversationStatus: 'open',
        unreadCount: 2,
        lastMessageTimestamp: '2025-10-31T16:00:00Z',
      },
    },
    'task-6': {
      id: 'task-6',
      title: 'Update pricing documentation',
      columnId: 'col-1-todo',
      client: {
        id: 'client-jkl',
        name: 'Enterprise Ltd',
        avatarUrl: 'https://ui-avatars.com/api/?name=Enterprise+Ltd',
      },
      chatwootInfo: {
        conversationStatus: 'none',
        unreadCount: 0,
        lastMessageTimestamp: null,
      },
    },
    'task-7': {
      id: 'task-7',
      title: 'Prepare quarterly report',
      columnId: 'col-1-todo',
      client: {
        id: 'client-mno',
        name: 'Global Inc',
        avatarUrl: 'https://ui-avatars.com/api/?name=Global+Inc',
      },
      chatwootInfo: {
        conversationStatus: 'resolved',
        unreadCount: 0,
        lastMessageTimestamp: '2025-10-30T08:00:00Z',
      },
    },
    'task-8': {
      id: 'task-8',
      title: 'Follow up on technical questions',
      columnId: 'col-1-todo',
      client: {
        id: 'client-pqr',
        name: 'TechCo',
        avatarUrl: 'https://ui-avatars.com/api/?name=TechCo',
      },
      chatwootInfo: {
        conversationStatus: 'open',
        unreadCount: 5,
        lastMessageTimestamp: '2025-10-31T18:00:00Z',
      },
    },
    'task-9': {
      id: 'task-9',
      title: 'Send NDA for signature',
      columnId: 'col-1-todo',
      client: {
        id: 'client-stu',
        name: 'Innovations LLC',
        avatarUrl: 'https://ui-avatars.com/api/?name=Innovations+LLC',
      },
      chatwootInfo: {
        conversationStatus: 'pending',
        unreadCount: 0,
        lastMessageTimestamp: '2025-10-31T12:00:00Z',
      },
    },
    'task-10': {
      id: 'task-10',
      title: 'Discuss integration requirements',
      columnId: 'col-1-todo',
      client: {
        id: 'client-vwx',
        name: 'SystemsHub',
        avatarUrl: 'https://ui-avatars.com/api/?name=SystemsHub',
      },
      chatwootInfo: {
        conversationStatus: 'open',
        unreadCount: 1,
        lastMessageTimestamp: '2025-10-31T15:30:00Z',
      },
    },
    'task-11': {
      id: 'task-11',
      title: 'Finalize migration plan',
      columnId: 'col-2-progress',
      client: {
        id: 'client-yza',
        name: 'DataFlow',
        avatarUrl: 'https://ui-avatars.com/api/?name=DataFlow',
      },
      chatwootInfo: {
        conversationStatus: 'open',
        unreadCount: 3,
        lastMessageTimestamp: '2025-10-31T17:00:00Z',
      },
    },
    'task-12': {
      id: 'task-12',
      title: 'Complete onboarding checklist',
      columnId: 'col-2-progress',
      client: {
        id: 'client-bcd',
        name: 'NewClient Co',
        avatarUrl: 'https://ui-avatars.com/api/?name=NewClient+Co',
      },
      chatwootInfo: {
        conversationStatus: 'pending',
        unreadCount: 2,
        lastMessageTimestamp: '2025-10-31T13:00:00Z',
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
