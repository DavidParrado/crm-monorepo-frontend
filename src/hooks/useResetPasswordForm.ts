import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "@/types/user";
import * as userService from "@/services/userService";
import { toast } from "sonner";

const schema = z.object({
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

interface UseResetPasswordFormProps {
  user: User;
  onSuccess: () => void;
}

export const useResetPasswordForm = ({ user, onSuccess }: UseResetPasswordFormProps) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      await userService.resetPassword(user.id, values.newPassword);
      toast.success("Contraseña restablecida exitosamente");
      onSuccess();
      form.reset();
    } catch (error: any) {
      toast.error(error.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    onSubmit: form.handleSubmit(onSubmit),
  };
};
