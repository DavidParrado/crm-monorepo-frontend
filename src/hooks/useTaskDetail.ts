import { useState, useEffect } from "react";
import { TaskDetail, ChatMessage } from "@/types/kanban";
import * as kanbanService from "@/services/kanbanService";

export const useTaskDetail = (taskId: string | null) => {
  const [taskDetail, setTaskDetail] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!taskId) {
      setTaskDetail(null);
      return;
    }

    const loadTaskDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await kanbanService.getTaskDetail(taskId);
        setTaskDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task details');
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskDetail();
  }, [taskId]);

  // Simulate receiving a new message (for testing)
  const simulateNewMessage = () => {
    if (!taskDetail) return;

    const newMessage: ChatMessage = {
      id: `temp-msg-${Date.now()}`,
      content: 'I am a simulated message!',
      senderType: 'contact',
      timestamp: new Date().toISOString(),
    };

    setTaskDetail(prev => {
      if (!prev) return null;
      return {
        ...prev,
        chatHistory: [...prev.chatHistory, newMessage],
        chatwootInfo: {
          ...prev.chatwootInfo,
          unreadCount: prev.chatwootInfo.unreadCount + 1,
          lastMessageTimestamp: newMessage.timestamp,
        },
      };
    });
  };

  return {
    taskDetail,
    isLoading,
    error,
    simulateNewMessage,
  };
};
