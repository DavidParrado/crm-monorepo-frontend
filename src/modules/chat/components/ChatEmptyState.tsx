import { MessageSquare } from 'lucide-react';

export const ChatEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="rounded-full bg-muted p-6 mb-4">
        <MessageSquare className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        Selecciona un contacto
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Elige un contacto de la lista para comenzar una conversación
      </p>
    </div>
  );
};
