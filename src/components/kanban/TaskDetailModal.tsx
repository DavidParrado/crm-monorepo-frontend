import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import { TaskInfo } from "./TaskInfo";
import { ChatHistoryPanel } from "./ChatHistoryPanel";
import { Separator } from "@/components/ui/separator";
import { Loader2, Zap } from "lucide-react";

interface TaskDetailModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal = ({ taskId, isOpen, onClose }: TaskDetailModalProps) => {
  const { taskDetail, isLoading, error, simulateNewMessage } = useTaskDetail(taskId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {taskDetail && (
          <>
            <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
              {/* Left Column: Task Details */}
              <div className="overflow-y-auto pr-3">
                <TaskInfo task={taskDetail} />
              </div>

              <Separator orientation="vertical" className="h-full" />

              {/* Right Column: Chat History */}
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Chat History</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={simulateNewMessage}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Simulate Message
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatHistoryPanel history={taskDetail.chatHistory} />
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
