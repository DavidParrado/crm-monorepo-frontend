import { useState, useEffect, useCallback } from "react";
import * as asteriskService from "@/services/asteriskService";
import { AsteriskSettings, AsteriskStatus, UpdateAsteriskSettingsDto } from "@/types/asterisk";
import { toast } from "sonner";

export const useVoIPManager = () => {
  const [settings, setSettings] = useState<AsteriskSettings | null>(null);
  const [status, setStatus] = useState<AsteriskStatus | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  
  const [formData, setFormData] = useState({
    host: "",
    port: 5038,
    username: "",
    password: "",
    context: "",
  });

  const fetchSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const data = await asteriskService.getSettings();
      setSettings(data);
      setFormData({
        host: data.host || "",
        port: data.port || 5038,
        username: data.username || "",
        password: "",
        context: data.context || "",
      });
    } catch (error) {
      if ((error as Error).message.includes("404")) {
        setSettings(null);
      } else {
        toast.error("Error al cargar la configuración");
      }
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setIsCheckingStatus(true);
    try {
      const data = await asteriskService.getStatus();
      setStatus(data);
    } catch (error) {
      setStatus({
        status: "Disconnected",
        message: "Error al verificar el estado de la conexión",
      });
    } finally {
      setIsLoadingStatus(false);
      setIsCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchStatus();
  }, [fetchSettings, fetchStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const body: UpdateAsteriskSettingsDto = {
        host: formData.host,
        port: Number(formData.port),
        username: formData.username,
        context: formData.context,
      };
      
      if (formData.password) {
        body.password = formData.password;
      }

      if (settings) {
        await asteriskService.updateSettings(body);
        toast.success("Configuración actualizada exitosamente");
      } else {
        if (!formData.password) {
          toast.error("La contraseña es requerida para crear la configuración");
          setIsSaving(false);
          return;
        }
        await asteriskService.createSettings(body as any);
        toast.success("Configuración creada exitosamente");
      }

      await fetchSettings();
      await fetchStatus();
      setFormData(prev => ({ ...prev, password: "" }));
    } catch (error: any) {
      toast.error(error.message || "Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    status,
    isLoadingSettings,
    isLoadingStatus,
    isSaving,
    isCheckingStatus,
    formData,
    setFormData,
    handleSubmit,
    handleRefreshStatus: fetchStatus,
  };
};
