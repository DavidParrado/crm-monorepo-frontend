import { useState, useMemo, useCallback } from "react";
import { KanbanTask, ChatwootInfo } from "@/types/kanban";

export interface KanbanFilters {
  clientId: string;
  chatStatus: ChatwootInfo['conversationStatus'] | 'all';
  showUnreadOnly: boolean;
  searchQuery: string;
}

const initialFilters: KanbanFilters = {
  clientId: 'all',
  chatStatus: 'all',
  showUnreadOnly: false,
  searchQuery: '',
};

export const useKanbanFilters = (allTasks: Record<string, KanbanTask>) => {
  const [filters, setFilters] = useState<KanbanFilters>(initialFilters);

  // Get unique clients for dropdown
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map<string, { id: string; name: string }>();
    Object.values(allTasks).forEach(task => {
      if (!clientsMap.has(task.client.id)) {
        clientsMap.set(task.client.id, {
          id: task.client.id,
          name: task.client.name,
        });
      }
    });
    return Array.from(clientsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allTasks]);

  // Filter tasks based on current filters
  const filterTasks = useCallback((taskIds: string[]): string[] => {
    return taskIds.filter(taskId => {
      const task = allTasks[taskId];
      if (!task) return false;

      // Filter by client
      if (filters.clientId !== 'all' && task.client.id !== filters.clientId) {
        return false;
      }

      // Filter by chat status
      if (filters.chatStatus !== 'all' && task.chatwootInfo.conversationStatus !== filters.chatStatus) {
        return false;
      }

      // Filter by unread messages
      if (filters.showUnreadOnly && task.chatwootInfo.unreadCount === 0) {
        return false;
      }

      // Filter by search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query) || false;
        const matchesClient = task.client.name.toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDescription && !matchesClient) {
          return false;
        }
      }

      return true;
    });
  }, [allTasks, filters]);

  // Update individual filter values
  const setClientFilter = useCallback((clientId: string) => {
    setFilters(prev => ({ ...prev, clientId }));
  }, []);

  const setChatStatusFilter = useCallback((status: ChatwootInfo['conversationStatus'] | 'all') => {
    setFilters(prev => ({ ...prev, chatStatus: status }));
  }, []);

  const setShowUnreadOnly = useCallback((showUnread: boolean) => {
    setFilters(prev => ({ ...prev, showUnreadOnly: showUnread }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.clientId !== 'all' ||
      filters.chatStatus !== 'all' ||
      filters.showUnreadOnly ||
      filters.searchQuery.trim() !== ''
    );
  }, [filters]);

  return {
    filters,
    uniqueClients,
    filterTasks,
    setClientFilter,
    setChatStatusFilter,
    setShowUnreadOnly,
    setSearchQuery,
    resetFilters,
    hasActiveFilters,
  };
};
