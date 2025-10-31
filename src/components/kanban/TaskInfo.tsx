import { TaskDetail } from "@/types/kanban";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatStatusIndicator } from "./ChatStatusIndicator";
import { Separator } from "@/components/ui/separator";

interface TaskInfoProps {
  task: TaskDetail;
}

export const TaskInfo = ({ task }: TaskInfoProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">{task.title}</h2>
        {task.description && (
          <p className="text-muted-foreground">{task.description}</p>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={task.client.avatarUrl} alt={task.client.name} />
            <AvatarFallback>{task.client.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{task.client.name}</p>
            <p className="text-sm text-muted-foreground">ID: {task.client.id}</p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Chat Status</h3>
        <ChatStatusIndicator chatwootInfo={task.chatwootInfo} />
      </div>
    </div>
  );
};
