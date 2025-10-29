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
import { Loader2 } from "lucide-react";
import { useCreateNoteForm } from "@/hooks/useCreateNoteForm";

interface CreateNoteFormProps {
  clientId: number;
  onNoteCreated: () => void;
}

export function CreateNoteForm({ clientId, onNoteCreated }: CreateNoteFormProps) {
  const { form, managements, isLoadingManagements, onSubmit } = useCreateNoteForm({
    clientId,
    onNoteCreated,
  });

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
