import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const noteSchema = z.object({
  content: z.string().min(1, "El contenido es requerido").max(1000, "Máximo 1000 caracteres"),
  managementId: z.string().min(1, "Debes seleccionar una gestión"),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface Management {
  id: number;
  name: string;
}

interface CreateNoteFormProps {
  clientId: string;
  onNoteCreated: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

export function CreateNoteForm({ clientId, onNoteCreated }: CreateNoteFormProps) {
  const { token } = useAuthStore();
  const [managements, setManagements] = useState<Management[]>([]);
  const [isLoadingManagements, setIsLoadingManagements] = useState(true);

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
      managementId: "",
    },
  });

  useEffect(() => {
    if (!token) return;

    const fetchManagements = async () => {
      try {
        const response = await fetch(`${API_URL}/managements`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar las gestiones');
        }

        const data = await response.json();
        setManagements(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar las gestiones');
      } finally {
        setIsLoadingManagements(false);
      }
    };

    fetchManagements();
  }, [token]);

  const onSubmit = async (data: NoteFormData) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId,
          content: data.content,
          managementId: parseInt(data.managementId),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la nota');
      }

      toast.success('Nota creada exitosamente');
      form.reset();
      onNoteCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la nota');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nota</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Escribe tu nota aquí..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="managementId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gestión</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingManagements}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una gestión" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {managements.map((management) => (
                    <SelectItem key={management.id} value={management.id.toString()}>
                      {management.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar Nota'
          )}
        </Button>
      </form>
    </Form>
  );
}
