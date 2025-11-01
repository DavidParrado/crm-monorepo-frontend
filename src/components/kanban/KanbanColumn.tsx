import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanColumn as KanbanColumnType, KanbanTask } from "@/types/kanban";
import { KanbanCard } from "./KanbanCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface KanbanColumnProps {
  column: KanbanColumnType;
  tasks: KanbanTask[];
  onTaskClick: (taskId: string) => void;
  onCreateTask: (columnId: string) => void;
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  onPageChange: (page: number) => void;
}

export const KanbanColumn = ({ 
  column, 
  tasks, 
  onTaskClick, 
  onCreateTask,
  currentPage,
  totalPages,
  totalTasks,
  onPageChange,
}: KanbanColumnProps) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Card className="flex flex-col h-full bg-muted/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{column.title}</CardTitle>
            <span className="text-sm text-muted-foreground bg-background px-2 py-1 rounded-full">
              {totalTasks}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onCreateTask(column.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-0 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    onClick={onTaskClick}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  No tasks on this page
                </div>
              )}
            </div>
          </SortableContext>
        </ScrollArea>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t mt-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
