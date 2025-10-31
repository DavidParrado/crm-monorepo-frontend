import { useKanban } from "@/hooks/useKanban";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { Loader2 } from "lucide-react";

const Kanban = () => {
  const { board, isLoading, error, handleDragEnd } = useKanban();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No board data available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground mt-1">
          Manage your client tasks with visual workflow
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <KanbanBoard board={board} onDragEnd={handleDragEnd} />
      </div>
    </div>
  );
};

export default Kanban;
