import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/lib/constants";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ImportTable } from "@/components/imports/ImportTable";
import { ImportUploadModal } from "@/components/imports/ImportUploadModal";
import type { Import } from "@/types/import";

export default function Imports() {
  const { token } = useAuthStore();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['imports', page],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/imports?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Error al cargar importaciones');
      return response.json() as Promise<{ data: Import[]; total: number }>;
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Importaciones</CardTitle>
              <CardDescription>
                Gestiona las importaciones de clientes desde archivos CSV
              </CardDescription>
            </div>
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Cargar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            imports={data?.data || []}
            isLoading={isLoading}
            onRefresh={refetch}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>

      <ImportUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
