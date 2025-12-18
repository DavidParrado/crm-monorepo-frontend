import { cn } from '@/lib/utils';
import { useChat } from '../hooks/useChat';
import { ContactList } from './ContactList';
import { ChatWindow } from './ChatWindow';
import { ChatEmptyState } from './ChatEmptyState';

export const ChatLayout = () => {
  const {
    activeConversationId,
    activeContact,
    searchQuery,
    socketStatus,
    currentUserId,
    contacts,
    messages,
    isLoadingContacts,
    isLoadingMessages,
    setSearchQuery,
    handleSelectContact,
    handleSendMessage,
    handleBackToContacts,
  } = useChat();

  const hasActiveChat = activeConversationId && activeContact;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background rounded-lg border overflow-hidden">
      {/* Sidebar - Contact List */}
      <div
        className={cn(
          'w-full md:w-80 md:min-w-80 border-r flex-shrink-0',
          hasActiveChat && 'hidden md:flex md:flex-col'
        )}
      >
        <ContactList
          contacts={contacts}
          activeContactId={activeContact?.id ?? null}
          searchQuery={searchQuery}
          isLoading={isLoadingContacts}
          onSearchChange={setSearchQuery}
          onSelectContact={handleSelectContact}
        />
      </div>

      {/* Main - Chat Window */}
      <div
        className={cn(
          'flex-1 flex flex-col',
          !hasActiveChat && 'hidden md:flex'
        )}
      >
        {hasActiveChat ? (
          <ChatWindow
            contact={activeContact}
            messages={messages}
            currentUserId={currentUserId}
            socketStatus={socketStatus}
            isLoading={isLoadingMessages}
            onSendMessage={handleSendMessage}
            onBack={handleBackToContacts}
          />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  );
};
