import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { KanbanTask } from "@/types/kanban";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatStatusIndicator } from "./ChatStatusIndicator";
import { GripVertical } from "lucide-react";

interface KanbanCardProps {
  task: KanbanTask;
  onClick: (taskId: string) => void;
}

export const KanbanCard = ({ task, onClick }: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onClick(task.id)}
      >
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={task.client.avatarUrl} alt={task.client.name} />
                <AvatarFallback>{task.client.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {task.client.name}
                </p>
                <h4 className="text-sm font-medium leading-tight line-clamp-2">
                  {task.title}
                </h4>
              </div>
            </div>
            <button
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex-shrink-0"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ChatStatusIndicator chatwootInfo={task.chatwootInfo} />
        </CardContent>
      </Card>
    </div>
  );
};
