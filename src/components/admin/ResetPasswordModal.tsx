import { UseFormReturn } from "react-hook-form";
import { Tenant } from "@/types/tenant";
import { ResetPasswordFormData } from "@/hooks/useTenants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<ResetPasswordFormData>;
  onSubmit: (data: ResetPasswordFormData) => void;
  isSubmitting: boolean;
  tenant: Tenant | null;
}

export const ResetPasswordModal = ({
  isOpen,
  onClose,
  form,
  onSubmit,
  isSubmitting,
  tenant,
}: ResetPasswordModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800">
            Restablecer Contraseña
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Establece una nueva contraseña para el administrador de{" "}
            <span className="font-semibold text-slate-800">{tenant?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="bg-white border-slate-300 text-slate-800"
                      placeholder="••••••"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      className="bg-white border-slate-300 text-slate-800"
                      placeholder="••••••"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-800 hover:bg-purple-900 text-white"
              >
                {isSubmitting ? 'Guardando...' : 'Restablecer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
