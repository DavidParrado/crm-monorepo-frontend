import { UseFormReturn } from "react-hook-form";
import { SuperAdminUser } from "@/types/tenant";
import { CreateMemberFormData, UpdateMemberFormData } from "@/hooks/useTeam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CREATE' | 'EDIT';
  createForm: UseFormReturn<CreateMemberFormData>;
  updateForm: UseFormReturn<UpdateMemberFormData>;
  onCreateSubmit: (data: CreateMemberFormData) => void;
  onUpdateSubmit: (data: UpdateMemberFormData) => void;
  isSubmitting: boolean;
  initialData: SuperAdminUser | null;
}

export const TeamMemberModal = ({
  isOpen,
  onClose,
  mode,
  createForm,
  updateForm,
  onCreateSubmit,
  onUpdateSubmit,
  isSubmitting,
}: TeamMemberModalProps) => {
  const isCreate = mode === 'CREATE';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white border-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-800">
            {isCreate ? 'Agregar Miembro' : 'Editar Miembro'}
          </DialogTitle>
        </DialogHeader>

        {isCreate ? (
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Nombre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white border-slate-300 text-slate-800"
                          placeholder="John"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Apellido</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white border-slate-300 text-slate-800"
                          placeholder="Doe"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="bg-white border-slate-300 text-slate-800"
                        placeholder="john@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Contraseña</FormLabel>
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
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="SUPPORT">Soporte</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="ROOT">Root</SelectItem>
                      </SelectContent>
                    </Select>
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
                  {isSubmitting ? 'Guardando...' : 'Agregar'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={updateForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Nombre</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white border-slate-300 text-slate-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">Apellido</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-white border-slate-300 text-slate-800"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={updateForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="SUPPORT">Soporte</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="ROOT">Root</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-slate-300 text-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-slate-200">
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="INACTIVE">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
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
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
