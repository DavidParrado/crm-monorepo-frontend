import { deslugifyInstanceName } from '@/hooks/useIntegrations';

interface InstanceNameDisplayProps {
  instanceName: string;
  showSlug?: boolean;
}

export const InstanceNameDisplay = ({ instanceName, showSlug = false }: InstanceNameDisplayProps) => {
  const displayName = deslugifyInstanceName(instanceName);

  return (
    <div className="flex flex-col">
      <span className="font-medium">{displayName}</span>
      {showSlug && (
        <span className="text-xs text-muted-foreground font-mono">{instanceName}</span>
      )}
    </div>
  );
};
