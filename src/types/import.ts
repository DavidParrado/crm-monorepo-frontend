export interface ImportPreview {
  headers: string[];
  previewRows: string[][];
}

export interface ImportMapping {
  [columnIndex: string]: string; // columnIndex -> fieldName or "ignore"
}

export interface ImportError {
  row: number;
  field: string;
  messages: string[];
}

export interface Import {
  id: number;
  fileName: string;
  totalRows?: number;
  successfulRecords: number;
  failedRecords: number;
  status: 'Processing' | 'Completed' | 'Completed with errors' | 'Failed';
  importedAt: string;
  userId: number;
  errors?: ImportError[];
  user?: {
    id: number;
    firstName: string;
    lastName: string;
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
