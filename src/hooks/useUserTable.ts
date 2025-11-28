import { useState, useEffect, useCallback } from "react";
import { User } from "@/types/user";
import * as userService from "@/services/userService";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export const useUserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const data = await userService.getUsers(params);
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
    } catch (error: any) {
      toast.error(error.message || "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(deletingUser.id);
      toast.success("Usuario eliminado exitosamente");
      setDeletingUser(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  const refetchUsers = () => {
    fetchUsers();
  };

  return {
    users,
    total,
    currentPage,
    totalPages,
    search,
    loading,
    editingUser,
    setEditingUser,
    resetPasswordUser,
    setResetPasswordUser,
    deletingUser,
    setDeletingUser,
    isDeleting,
    handleSearchChange,
    handlePageChange,
    handleDelete,
    refetchUsers,
  };
};
