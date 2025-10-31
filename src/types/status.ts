export interface Status {
  id: number;
  name: string;
}

export enum StatusEnum {
  Asignado = 'Asignado',
  PendienteDeVerificacion = 'Pendiente de Verificación',
}