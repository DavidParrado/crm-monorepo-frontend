import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ClientInfo } from "@/components/client/ClientInfo";
import { ClientNotes } from "@/components/client/ClientNotes";
import { CreateNoteForm } from "@/components/client/CreateNoteForm";
import { Client } from "@/types/client";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalling, setIsCalling] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
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
        console.log('Cliente cargado:', data);
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

  const handleProposeConversion = async () => {
    if (!client || !token) return;

    setIsProposing(true);
    try {
      const response = await fetch(`${API_URL}/clients/${client.id}/propose-conversion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al proponer conversión');
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      toast.success('Cliente propuesto para verificación');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al proponer conversión');
    } finally {
      setIsProposing(false);
    }
  };

  const handleConfirmConversion = async () => {
    if (!client || !token) return;

    setIsConfirming(true);
    try {
      const response = await fetch(`${API_URL}/clients/${client.id}/confirm-conversion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al confirmar conversión');
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      toast.success('Conversión confirmada exitosamente');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al confirmar conversión');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRejectConversion = async () => {
    if (!client || !token) return;

    setIsRejecting(true);
    try {
      const response = await fetch(`${API_URL}/clients/${client.id}/reject-conversion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al rechazar conversión');
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      toast.success('Conversión rechazada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al rechazar conversión');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCancelProposal = async () => {
    if (!client || !token) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`${API_URL}/clients/${client.id}/cancel-proposal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al cancelar propuesta');
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      toast.success('Propuesta cancelada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cancelar propuesta');
    } finally {
      setIsCancelling(false);
    }
  };

  // Lógica para determinar qué botones mostrar
  const isAdmin = user?.role?.name === 'Admin';
  const isTeamLeader = user?.role?.name === 'TeamLeader';
  const isAgent = user?.role?.name === 'Agent';
  const isAssignedToCurrentUser = client?.assignedToUserId === user?.id;
  const isAssignedToTeamMember = isTeamLeader && client?.assignedTo?.teamLeaderId === user?.id;

  console.log({ client, user, isAssignedToCurrentUser, isAssignedToTeamMember });
  const statusName = client?.status?.name;
  const canProposeConversion = statusName === 'Asignado' && (isAgent || isTeamLeader || isAdmin);
  const canConfirmConversion = statusName === 'Pendiente de Verificación' && isAdmin;
  const canRejectConversion = statusName === 'Pendiente de Verificación' && isAdmin;
  const canCancelProposal = statusName === 'Pendiente de Verificación' && (
    isAdmin ||
    (isAgent && isAssignedToCurrentUser) ||
    (isTeamLeader && isAssignedToTeamMember)
  );

  const showConversionActions = canProposeConversion || canConfirmConversion || canRejectConversion || canCancelProposal;

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
        <div className="flex gap-2">
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
      </div>

      {/* Acciones de Conversión */}
      {showConversionActions && (
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3">Acciones de Conversión</h3>
          <div className="flex flex-wrap gap-2">
            {canProposeConversion && (
              <Button
                onClick={handleProposeConversion}
                disabled={isProposing}
                variant="default"
                className="gap-2"
              >
                {isProposing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {isProposing ? 'Proponiendo...' : 'Proponer para Verificación'}
              </Button>
            )}

            {canConfirmConversion && (
              <Button
                onClick={handleConfirmConversion}
                disabled={isConfirming}
                variant="default"
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {isConfirming ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {isConfirming ? 'Confirmando...' : 'Confirmar Conversión'}
              </Button>
            )}

            {canRejectConversion && (
              <Button
                onClick={handleRejectConversion}
                disabled={isRejecting}
                variant="destructive"
                className="gap-2"
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {isRejecting ? 'Rechazando...' : 'Rechazar Conversión'}
              </Button>
            )}

            {canCancelProposal && (
              <Button
                onClick={handleCancelProposal}
                disabled={isCancelling}
                variant="outline"
                className="gap-2"
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {isCancelling ? 'Cancelando...' : 'Cancelar Propuesta'}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClientInfo client={client}>
            <CreateNoteForm clientId={client.id} onNoteCreated={handleNoteCreated} />
          </ClientInfo>
        </div>

        <div className="lg:col-span-3">

          <ClientNotes clientId={client.id} refresh={refreshNotes} />
        </div>
      </div>
    </div>
  );
}
