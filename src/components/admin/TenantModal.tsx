import { UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Tenant } from "@/types/tenant";
import { CreateTenantFormData, UpdateTenantFormData } from "@/hooks/useTenants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'CREATE' | 'EDIT';
  createForm: UseFormReturn<CreateTenantFormData>;
  updateForm: UseFormReturn<UpdateTenantFormData>;
  onCreateSubmit: (data: CreateTenantFormData) => void;
  onUpdateSubmit: (data: UpdateTenantFormData) => void;
  isSubmitting: boolean;
  initialData: Tenant | null;
}

export const TenantModal = ({
  isOpen,
  onClose,
  mode,
  createForm,
  updateForm,
  onCreateSubmit,
  onUpdateSubmit,
  isSubmitting,
  initialData,
}: TenantModalProps) => {
  const isCreateMode = mode === 'CREATE';
  const form = isCreateMode ? createForm : updateForm;
  const handleSubmit = isCreateMode 
    ? createForm.handleSubmit(onCreateSubmit)
    : updateForm.handleSubmit(onUpdateSubmit);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreateMode ? "Crear Tenant" : "Editar Tenant"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {isCreateMode
              ? "Registra un nuevo cliente en la plataforma"
              : "Modifica los datos del tenant"}
          </DialogDescription>
        </DialogHeader>

        {isCreateMode ? (
          <Form {...createForm}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mi Empresa S.A."
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="subdomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Subdominio</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          placeholder="mi-empresa"
                          className="bg-slate-800 border-slate-700 text-slate-100 rounded-r-none"
                          {...field}
                        />
                        <span className="px-3 py-2 bg-slate-700 border border-l-0 border-slate-700 rounded-r-md text-slate-400 text-sm">
                          .app.com
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className="text-slate-500">
                      Solo letras minúsculas, números y guiones
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t border-slate-800">
                <p className="text-sm font-medium text-slate-300 mb-3">
                  Administrador inicial
                </p>
                
                <div className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Usuario</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin"
                            className="bg-slate-800 border-slate-700 text-slate-100"
                            {...field}
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
                        <FormLabel className="text-slate-200">Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="bg-slate-800 border-slate-700 text-slate-100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear Tenant"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...updateForm}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mi Empresa S.A."
                        className="bg-slate-800 border-slate-700 text-slate-100"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {initialData && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-200">Subdominio</p>
                  <p className="text-sm text-slate-400 bg-slate-800 px-3 py-2 rounded-md font-mono">
                    {initialData.subdomain}.app.com
                  </p>
                  <p className="text-xs text-slate-500">
                    El subdominio no puede ser modificado
                  </p>
                </div>
              )}

              <FormField
                control={updateForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200">Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-slate-800">
                        <SelectItem 
                          value="ACTIVE"
                          className="text-slate-300 focus:text-slate-100 focus:bg-slate-800"
                        >
                          Activo
                        </SelectItem>
                        <SelectItem 
                          value="SUSPENDED"
                          className="text-slate-300 focus:text-slate-100 focus:bg-slate-800"
                        >
                          Suspendido
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
