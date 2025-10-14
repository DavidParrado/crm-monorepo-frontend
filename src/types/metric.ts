export interface DashboardMetric {
  id?: number;
  name: string;
  key: string;
  icon: string | null;
  count?: number;
  filter: Record<string, any>;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateMetricDto {
  name: string;
  key: string;
  filterCriteria: Record<string, any>;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateMetricDto {
  name?: string;
  key?: string;
  filterCriteria?: Record<string, any>;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}
