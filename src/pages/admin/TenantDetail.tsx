import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Building2, Globe, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantDetail } from '@/hooks/useTenantDetail';
import { TenantIntegrations } from '@/components/integrations/TenantIntegrations';

const TenantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenant, isLoading, error } = useTenantDetail(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error al cargar el tenant</p>
        <Button variant="outline" onClick={() => navigate('/admin/tenants')} className="mt-4">
          Volver a Tenants
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/tenants')}
            className="text-slate-600 hover:text-slate-100 hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
              <p className="text-muted-foreground">{tenant.subdomain}</p>
            </div>
          </div>
        </div>
        <Badge
          variant={tenant.status === 'ACTIVE' ? 'default' : 'destructive'}
          className={
            tenant.status === 'ACTIVE'
              ? 'bg-success/10 text-success border-success/20'
              : 'bg-destructive/10 text-destructive border-destructive/20'
          }
        >
          {tenant.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <Settings className="h-5 w-5" />
            Información General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Building2 className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Nombre</p>
                <p className="font-medium text-slate-800">{tenant.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Globe className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Subdominio</p>
                <p className="font-medium text-slate-800 font-mono">{tenant.subdomain}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100">
                <Calendar className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Creado</p>
                <p className="font-medium text-slate-800">
                  {format(new Date(tenant.createdAt), 'PPP', { locale: es })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Section */}
      <TenantIntegrations tenantId={tenant.id} tenantName={tenant.name} />
    </div>
  );
};

export default TenantDetail;
