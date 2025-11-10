/**
 * Filter criteria for dashboard metrics
 */
export interface DashboardFilterCriteria {
  field: string;
  value: string | number | boolean;
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
}

/**
 * Type for dashboard filter object used in API calls
 */
export type DashboardFilter = Record<string, string | number | boolean>;
