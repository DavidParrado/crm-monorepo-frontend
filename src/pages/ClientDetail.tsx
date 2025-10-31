import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthRoles } from "@/hooks/useAuthRoles";
import { StatusEnum } from "@/types/status";
import { toast } from "sonner";
import { ClientInfo } from "@/components/client/ClientInfo";
import { ClientNotes } from "@/components/client/ClientNotes";
import { CreateNoteForm } from "@/components/client/CreateNoteForm";
import { useClientDetail } from "@/hooks/useClientDetail";
import { useClientNotes } from "@/hooks/useClientNotes";
import { initiateCall } from "@/services/asteriskService";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isTeamLeader, isAgent } = useAuthRoles();
  const [isCalling, setIsCalling] = useState(false);

  const {
    client,
    isLoading,
    handleProposeConversion,
    isProposing,
    handleConfirmConversion,
    isConfirming,
    handleRejectConversion,
    isRejecting,
    handleCancelProposal,
    isCancelling,
  } = useClientDetail(id);

  const { notes, isLoading: isLoadingNotes, page, totalPages, setPage, refetchNotes } = useClientNotes(client?.id);

  const handleCall = async () => {
    if (!client) return;

    setIsCalling(true);
    try {
      await initiateCall(client.phone);
      toast.success("Llamada iniciada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al realizar la llamada");
    } finally {
      setIsCalling(false);
    }
  };

  // Lógica para determinar qué botones mostrar
  const isAssignedToCurrentUser = client?.assignedToUserId === user?.id;
  const isAssignedToTeamMember = isTeamLeader && client?.assignedTo?.teamLeaderId === user?.id;

  const statusName = client?.status?.name;
  const canProposeConversion = statusName === StatusEnum.Asignado && (isAgent || isTeamLeader || isAdmin);
  const canConfirmConversion = statusName === StatusEnum.PendienteDeVerificacion && isAdmin;
  const canRejectConversion = statusName === StatusEnum.PendienteDeVerificacion && isAdmin;
  const canCancelProposal = statusName === StatusEnum.PendienteDeVerificacion && (
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
            <CreateNoteForm clientId={client.id} onNoteCreated={refetchNotes} />
          </ClientInfo>
        </div>

        <div className="lg:col-span-3">
          <ClientNotes
            notes={notes}
            isLoading={isLoadingNotes}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
