import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";

export default function Calendar() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus citas y recordatorios
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vista de Calendario</CardTitle>
        </CardHeader>
        <CardContent className="min-h-[500px] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-6 inline-block">
              <CalendarIcon className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Calendario en construcción</h3>
              <p className="text-muted-foreground max-w-md">
                El componente de calendario se implementará próximamente con funcionalidades
                de creación, edición y notificaciones de citas.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
