export interface DashboardMetric {
  id?: number;
  name: string;
  key: string;
  icon: string | null;
  count?: number;
  filterCriteria: Record<string, number>;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateMetricDto {
  name: string;
  key: string;
  filterCriteria: Record<string, number>;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateMetricDto {
  name?: string;
  key?: string;
  filterCriteria?: Record<string, number>;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}
