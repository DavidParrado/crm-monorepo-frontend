import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getClientById,
  proposeConversion,
  confirmConversion,
  rejectConversion,
  cancelProposal,
} from "@/services/clientService";
import { Client } from "@/types/client";
import { toast } from "sonner";

export const useClientDetail = (id: string | undefined) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProposing, setIsProposing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();

  const fetchClient = useCallback(async () => {
    if (!id) {
      navigate("/");
      return;
    }

    setIsLoading(true);
    try {
      const data = await getClientById(id);
      setClient(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cargar el cliente");
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  const handleProposeConversion = async () => {
    if (!client) return;

    setIsProposing(true);
    try {
      const updatedClient = await proposeConversion(client.id);
      setClient(updatedClient);
      toast.success("Cliente propuesto para verificación");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al proponer conversión");
    } finally {
      setIsProposing(false);
    }
  };

  const handleConfirmConversion = async () => {
    if (!client) return;

    setIsConfirming(true);
    try {
      const updatedClient = await confirmConversion(client.id);
      setClient(updatedClient);
      toast.success("Conversión confirmada exitosamente");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al confirmar conversión");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRejectConversion = async () => {
    if (!client) return;

    setIsRejecting(true);
    try {
      const updatedClient = await rejectConversion(client.id);
      setClient(updatedClient);
      toast.success("Conversión rechazada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al rechazar conversión");
    } finally {
      setIsRejecting(false);
    }
  };

  const handleCancelProposal = async () => {
    if (!client) return;

    setIsCancelling(true);
    try {
      const updatedClient = await cancelProposal(client.id);
      setClient(updatedClient);
      toast.success("Propuesta cancelada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cancelar propuesta");
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    client,
    isLoading,
    refetchClient: fetchClient,
    handleProposeConversion,
    isProposing,
    handleConfirmConversion,
    isConfirming,
    handleRejectConversion,
    isRejecting,
    handleCancelProposal,
    isCancelling,
  };
};
