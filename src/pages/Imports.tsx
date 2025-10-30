import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportUploader } from "@/components/imports/ImportUploader";
import { ImportsHistory } from "@/components/imports/ImportsHistory";
import { useImportsHistory } from "@/hooks/useImportsHistory";

const Imports = () => {
  const { imports, isLoading, handleDelete, refetchHistory } = useImportsHistory();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importaciones</h1>
        <p className="text-muted-foreground">Importa clientes desde archivos CSV</p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="upload">Nueva Importación</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subir Archivo CSV</CardTitle>
              <CardDescription>
                Sube un archivo CSV y mapea las columnas a los campos del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImportUploader onSuccess={refetchHistory} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <ImportsHistory imports={imports} isLoading={isLoading} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Imports;
