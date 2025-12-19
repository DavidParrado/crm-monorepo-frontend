import { cn } from '@/lib/utils';
import { useChat } from '../hooks/useChat';
import { ConversationList } from './ConversationList';
import { ChatWindow } from './ChatWindow';
import { ChatEmptyState } from './ChatEmptyState';
import { NewChatDialog } from './NewChatDialog';

export const ChatLayout = () => {
  const {
    activeConversation,
    searchQuery,
    contactSearchQuery,
    socketStatus,
    currentUserId,
    isAdmin,
    isNewChatDialogOpen,
    conversations,
    contacts,
    messages,
    isLoadingConversations,
    isLoadingContacts,
    isLoadingMessages,
    isCreatingGroup,
    setSearchQuery,
    setContactSearchQuery,
    setIsNewChatDialogOpen,
    handleSelectConversation,
    handleSelectContact,
    handleCreateGroup,
    handleDeleteGroup,
    handleSendMessage,
    handleBackToConversations,
    handleOpenNewChatDialog,
  } = useChat();

  const hasActiveChat = !!activeConversation;

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)] bg-background rounded-lg border overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div
          className={cn(
            'w-full md:w-80 md:min-w-80 border-r flex-shrink-0',
            hasActiveChat && 'hidden md:flex md:flex-col'
          )}
        >
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation?.id ?? null}
            searchQuery={searchQuery}
            isLoading={isLoadingConversations}
            onSearchChange={setSearchQuery}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleOpenNewChatDialog}
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
              conversation={activeConversation}
              messages={messages}
              currentUserId={currentUserId}
              socketStatus={socketStatus}
              isLoading={isLoadingMessages}
              isAdmin={isAdmin}
              onSendMessage={handleSendMessage}
              onDeleteGroup={handleDeleteGroup}
              onBack={handleBackToConversations}
            />
          ) : (
            <ChatEmptyState />
          )}
        </div>
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={isNewChatDialogOpen}
        onOpenChange={setIsNewChatDialogOpen}
        contacts={contacts}
        isLoadingContacts={isLoadingContacts}
        searchQuery={contactSearchQuery}
        onSearchChange={setContactSearchQuery}
        onSelectContact={handleSelectContact}
        onCreateGroup={handleCreateGroup}
        isCreatingGroup={isCreatingGroup}
        isAdmin={isAdmin}
      />
    </>
  );
};
