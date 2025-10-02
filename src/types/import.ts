export interface Import {
  id: number;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalRows: number;
  processedRows: number;
  errorRows: number;
  errorDetails?: string;
  createdAt: string;
  completedAt?: string;
  userId: number;
}

export interface ColumnMapping {
  csvColumn: string;
  crmField: string;
}

export interface ImportUploadResponse {
  id: number;
  filename: string;
  headers: string[];
}
