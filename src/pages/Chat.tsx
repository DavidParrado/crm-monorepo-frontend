import { ChatLayout } from '@/modules/chat/components/ChatLayout';

const Chat = () => {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        <p className="text-muted-foreground text-sm">
          Comunicación interna del equipo
        </p>
      </div>
      <ChatLayout />
    </div>
  );
};

export default Chat;
