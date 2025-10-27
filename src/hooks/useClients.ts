import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { Client } from "@/types/client";
import { getClients } from "@/services/clientService";
import { useDebounce } from "./useDebounce";
import { toast } from "sonner";

interface UseClientsParams {
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export function useClients(params: UseClientsParams = {}) {
  const { token } = useAuthStore();
  const { sortBy = "createdAt", sortOrder = "DESC" } = params;

  // Client data
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // Search and pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedManagement, setSelectedManagement] = useState<string>("all");

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Build URL params helper
  const buildParams = useCallback(() => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (debouncedSearch) params.append("search", debouncedSearch);
    if (selectedCountry && selectedCountry !== "all") params.append("country", selectedCountry);
    if (selectedCampaign && selectedCampaign !== "all") params.append("campaign", selectedCampaign);
    if (selectedStatus && selectedStatus !== "all") params.append("statusId", selectedStatus);
    if (selectedUser && selectedUser !== "all") params.append("assignedUserId", selectedUser);
    if (selectedGroup && selectedGroup !== "all") params.append("groupId", selectedGroup);
    if (selectedManagement && selectedManagement !== "all")
      params.append("lastManagementId", selectedManagement);

    return params;
  }, [
    currentPage,
    limit,
    sortBy,
    sortOrder,
    debouncedSearch,
    selectedCountry,
    selectedCampaign,
    selectedStatus,
    selectedUser,
    selectedGroup,
    selectedManagement,
  ]);

  // Fetch clients function
  const fetchClients = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const params = buildParams();
      const data = await getClients(params);
      setClients(data.data);
      setTotal(data.total);
      setSelectedRows([]);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Error al cargar los clientes");
      setClients([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [token, buildParams]);

  // Auto-fetch when dependencies change
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Utility functions
  const clearFilters = useCallback(() => {
    setSelectedCountry("all");
    setSelectedCampaign("all");
    setSelectedStatus("all");
    setSelectedUser("all");
    setSelectedGroup("all");
    setSelectedManagement("all");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters = !!(
    (selectedCountry && selectedCountry !== "all") ||
    (selectedCampaign && selectedCampaign !== "all") ||
    (selectedStatus && selectedStatus !== "all") ||
    (selectedUser && selectedUser !== "all") ||
    (selectedGroup && selectedGroup !== "all") ||
    (selectedManagement && selectedManagement !== "all")
  );

  const totalPages = Math.ceil(total / limit);

  return {
    // Data
    clients,
    total,
    totalPages,
    isLoading,
    selectedRows,
    setSelectedRows,

    // Search and pagination
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    limit,
    setLimit,
    debouncedSearch,

    // Filters
    selectedCountry,
    setSelectedCountry,
    selectedCampaign,
    setSelectedCampaign,
    selectedStatus,
    setSelectedStatus,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    selectedManagement,
    setSelectedManagement,

    // Utilities
    clearFilters,
    hasActiveFilters,
    refetchClients: fetchClients,
  };
}
