import { useState, useEffect } from "react";
import { User } from "@/types/user";
import { getUsers } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

export function useUsers(shouldFetch: boolean = true) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (shouldFetch) {
      fetchUsers();
    }
  }, [shouldFetch]);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const params = new URLSearchParams({ limit: "1000" });
      const data = await getUsers(params);
      setUsers(data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  return {
    users,
    isLoadingUsers,
  };
}
