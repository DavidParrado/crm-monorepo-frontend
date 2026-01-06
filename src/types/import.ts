export interface ImportPreview {
  headers: string[];
  previewRows: string[][];
}

export interface ImportMapping {
  [columnIndex: string]: string; // columnIndex -> fieldName or "ignore"
}

export interface ImportErrorDetail {
  row: number;
  field: string;
  messages: string[];
}

// Estado de importación (Enum alineado con backend)
export type ImportStatus = 
  | 'Pending' 
  | 'Processing' 
  | 'Completed' 
  | 'Completed with errors' 
  | 'Failed';

// Respuesta del POST /imports/upload (ahora es inmediata)
export interface ImportUploadResponse {
  message: string;
  importId: number;
  status: ImportStatus;
}

// Respuesta del GET /imports/status/:id (polling)
export interface ImportStatusResponse {
  id: number;
  status: ImportStatus;
  progress: number; // 0-100
  source: 'redis' | 'db';
  detail?: string;
  updatedAt?: string;
  successfulRecords?: number;
  failedRecords?: number;
}

// Payload de notificación WebSocket IMPORT_COMPLETED
export interface ImportCompletedPayload {
  importId: number;
  fileName: string;
  successfulCount: number;
  failedCount: number;
}

export interface Import {
  id: number;
  fileName: string;
  totalRows?: number;
  successfulRecords: number;
  failedRecords: number;
  status: ImportStatus;
  importedAt: string;
  userId: number;
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
