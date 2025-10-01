import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ClientInfo } from "@/components/client/ClientInfo";
import { ClientNotes } from "@/components/client/ClientNotes";
import { CreateNoteForm } from "@/components/client/CreateNoteForm";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: { id: number; name: string; };
  group?: { id: number; name: string; };
  assignedTo?: { id: string; firstName: string; lastName: string; };
  createdAt: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [refreshNotes, setRefreshNotes] = useState(0);

  useEffect(() => {
    if (!id || !token) return;

    const fetchClient = async () => {
      try {
        const response = await fetch(`${API_URL}/clients/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar el cliente');
        }

        const data = await response.json();
        setClient(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar el cliente');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClient();
  }, [id, token, navigate]);

  const handleCall = async () => {
    if (!client || !token) return;

    setIsCalling(true);
    try {
      const response = await fetch(`${API_URL}/asterisk/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: client.phone }),
      });

      if (!response.ok) {
        throw new Error('Error al realizar la llamada');
      }

      toast.success('Llamada iniciada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al realizar la llamada');
    } finally {
      setIsCalling(false);
    }
  };

  const handleNoteCreated = () => {
    setRefreshNotes(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {client.firstName} {client.lastName}
            </h1>
            <p className="text-muted-foreground">{client.email}</p>
          </div>
        </div>
        <Button
          onClick={handleCall}
          disabled={isCalling}
          className="gap-2"
        >
          {isCalling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
          {isCalling ? 'Llamando...' : 'Llamar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ClientInfo client={client} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nueva Nota</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateNoteForm clientId={client.id} onNoteCreated={handleNoteCreated} />
            </CardContent>
          </Card>

          <ClientNotes clientId={client.id} refresh={refreshNotes} />
        </div>
      </div>
    </div>
  );
}
