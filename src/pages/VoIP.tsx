import { Phone } from "lucide-react";
import { useVoIPManager } from "@/hooks/useVoIPManager";
import { AsteriskStatusCard } from "@/components/voip/AsteriskStatusCard";
import { AsteriskSettingsForm } from "@/components/voip/AsteriskSettingsForm";

export default function VoIP() {
  const {
    settings,
    status,
    isLoadingSettings,
    isLoadingStatus,
    isSaving,
    isCheckingStatus,
    formData,
    setFormData,
    handleSubmit,
    handleRefreshStatus,
  } = useVoIPManager();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Phone className="h-8 w-8" />
          VoIP / Asterisk
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona la configuración y verifica el estado de la conexión
        </p>
      </div>

      <AsteriskStatusCard
        status={status}
        isLoading={isLoadingStatus}
        isChecking={isCheckingStatus}
        onRefresh={handleRefreshStatus}
      />

      <AsteriskSettingsForm
        settings={settings}
        isLoading={isLoadingSettings}
        isSaving={isSaving}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
