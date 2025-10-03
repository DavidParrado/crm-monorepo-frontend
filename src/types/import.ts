export interface ImportPreview {
  headers: string[];
  previewRows: string[][];
}

export interface ImportMapping {
  [columnIndex: string]: string; // columnIndex -> fieldName or "ignore"
}

export interface Import {
  id: number;
  fileName: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  userId: number;
  user?: {
    id: number;
    username: string;
  };
}

export const AVAILABLE_FIELDS = [
  { value: 'firstName', label: 'Nombre' },
  { value: 'lastName', label: 'Apellido' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'country', label: 'País' },
  { value: 'tp', label: 'TP' },
  { value: 'campaign', label: 'Campaña' },
  { value: 'ignore', label: 'Ignorar' }
] as const;
