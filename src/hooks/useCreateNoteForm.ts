import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getManagements, createNote } from "@/services/noteService";
import { Management } from "@/types/management";
import { toast } from "sonner";

const noteSchema = z.object({
  content: z.string().min(5, "Mínimo 5 caracteres").max(1000, "Máximo 1000 caracteres"),
  managementId: z.string().min(1, "Debes seleccionar una gestión"),
});

type NoteFormData = z.infer<typeof noteSchema>;

interface UseCreateNoteFormProps {
  clientId: number;
  onNoteCreated: () => void;
}

export const useCreateNoteForm = ({ clientId, onNoteCreated }: UseCreateNoteFormProps) => {
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
    const fetchManagements = async () => {
      try {
        const data = await getManagements();
        setManagements(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Error al cargar las gestiones");
      } finally {
        setIsLoadingManagements(false);
      }
    };

    fetchManagements();
  }, []);

  const onSubmit = async (data: NoteFormData) => {
    try {
      await createNote({
        clientId,
        content: data.content,
        managementId: parseInt(data.managementId),
      });
      toast.success("Nota creada exitosamente");
      form.reset();
      onNoteCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la nota");
    }
  };

  return {
    form,
    managements,
    isLoadingManagements,
    onSubmit,
  };
};
