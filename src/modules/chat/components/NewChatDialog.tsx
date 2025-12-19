import { useState, useMemo } from 'react';
import { Search, Loader2, Users, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { ChatUser } from '../types/chat.types';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: ChatUser[];
  isLoadingContacts: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectContact: (contact: ChatUser) => void;
  onCreateGroup: (name: string, participantIds: number[]) => void;
  isCreatingGroup: boolean;
  isAdmin: boolean;
}

export const NewChatDialog = ({
  open,
  onOpenChange,
  contacts,
  isLoadingContacts,
  searchQuery,
  onSearchChange,
  onSelectContact,
  onCreateGroup,
  isCreatingGroup,
  isAdmin,
}: NewChatDialogProps) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'group'>('contacts');
  const [groupName, setGroupName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSelectContact = (contact: ChatUser) => {
    onSelectContact(contact);
    onOpenChange(false);
  };

  const toggleParticipant = (userId: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedParticipants.length > 0) {
      onCreateGroup(groupName.trim(), selectedParticipants);
      // Reset state after creation
      setGroupName('');
      setSelectedParticipants([]);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setGroupName('');
    setSelectedParticipants([]);
    setActiveTab('contacts');
    onSearchChange('');
    onOpenChange(false);
  };

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.username.toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva conversación</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'contacts' | 'group')}
        >
          <TabsList className="w-full">
            <TabsTrigger value="contacts" className="flex-1">
              Personas
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="group" className="flex-1">
                Nuevo Grupo
              </TabsTrigger>
            )}
          </TabsList>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contactos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              <ScrollArea className="h-64">
                {isLoadingContacts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery
                        ? 'No se encontraron contactos'
                        : 'No hay contactos disponibles'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => handleSelectContact(contact)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                            {getInitials(contact.firstName, contact.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <Badge variant="outline" className="mt-0.5 text-xs">
                            {contact.role.name}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Group Tab (Admin Only) */}
          {isAdmin && (
            <TabsContent value="group" className="mt-4">
              <div className="space-y-4">
                {/* Group Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nombre del grupo
                  </label>
                  <Input
                    placeholder="Ej: Equipo de Ventas"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                {/* Participants Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Participantes ({selectedParticipants.length} seleccionados)
                  </label>
                  <ScrollArea className="h-48 border rounded-md p-2">
                    {isLoadingContacts ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : contacts.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground">
                          No hay contactos disponibles
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {contacts.map((contact) => {
                          const isSelected = selectedParticipants.includes(
                            contact.id
                          );
                          return (
                            <button
                              key={contact.id}
                              onClick={() => toggleParticipant(contact.id)}
                              className={cn(
                                'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                                isSelected
                                  ? 'bg-primary/10'
                                  : 'hover:bg-accent/50'
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() =>
                                  toggleParticipant(contact.id)
                                }
                              />
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                  {getInitials(
                                    contact.firstName,
                                    contact.lastName
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {contact.firstName} {contact.lastName}
                                </p>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreateGroup}
                  disabled={
                    !groupName.trim() ||
                    selectedParticipants.length === 0 ||
                    isCreatingGroup
                  }
                  className="w-full"
                >
                  {isCreatingGroup ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Crear grupo
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
