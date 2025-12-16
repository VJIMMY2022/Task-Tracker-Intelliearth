
export enum TaskStatus {
  TODO = 'POR_HACER',
  IN_PROGRESS = 'EN_PROGRESO',
  DONE = 'COMPLETADO',
}

export enum MeasureUnit {
  METERS = 'm',
  HOURS = 'hrs',
  UNITS = 'und',
  PERCENTAGE = '%',
}

export interface DrillTask {
  id: string;
  title: string;
  category: string; // e.g., 'Perforación', 'Mapeo', 'Traslado'
  quantity: number;
  unit: MeasureUnit;
  description?: string;
  status: TaskStatus;
  createdAt: number; // Timestamp creation
  startedAt?: number; // Timestamp when moved to IN_PROGRESS
  updatedAt: number; // Timestamp last update
  completedAt?: number; // Timestamp when moved to DONE
}

export interface ConsolidatedReportItem {
  category: string;
  unit: MeasureUnit;
  totalQuantity: number;
  taskCount: number;
}
