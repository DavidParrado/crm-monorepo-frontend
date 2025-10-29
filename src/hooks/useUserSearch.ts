import { useState, useEffect, useCallback } from "react";
import { getUsers } from "@/services/userService";
import { User } from "@/types/user";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";

export const useUserSearch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchUsers = useCallback(
    async (pageNum: number, search: string, append = false) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "20",
        });

        if (search) {
          params.append("search", search);
        }

        const data = await getUsers(params);

        setUsers((prev) => (append ? [...prev, ...data.data] : data.data));
        setTotal(data.total);
        setHasMore(data.data.length === 20 && users.length + data.data.length < data.total);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Error al cargar los usuarios");
      } finally {
        setIsLoading(false);
      }
    },
    [users.length]
  );

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsers(nextPage, debouncedSearch, true);
  };

  const resetAndFetch = () => {
    setPage(1);
    setUsers([]);
    fetchUsers(1, debouncedSearch, false);
  };

  return {
    users,
    isLoading,
    searchQuery,
    setSearchQuery,
    loadMore,
    hasMore,
    total,
    resetAndFetch,
  };
};
