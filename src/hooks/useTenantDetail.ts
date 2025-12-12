import { useQuery } from '@tanstack/react-query';
import * as tenancyService from '@/services/tenancyService';

export const useTenantDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['tenant', id],
    queryFn: () => tenancyService.getById(id!),
    enabled: !!id,
  });
};
