import { MeasureUnit } from './types';

export const DRILL_CATEGORIES = [
  { id: 'perf_pq', name: 'Perforación PQ', unit: MeasureUnit.METERS },
  { id: 'perf_hq', name: 'Perforación HQ', unit: MeasureUnit.METERS },
  { id: 'perf_nq', name: 'Perforación NQ', unit: MeasureUnit.METERS },
  { id: 'rec_core', name: 'Recuperación de Testigos', unit: MeasureUnit.PERCENTAGE },
  { id: 'mapeo_geo', name: 'Mapeo Geológico', unit: MeasureUnit.METERS },
  { id: 'log_geotech', name: 'Logueo Geotécnico', unit: MeasureUnit.METERS },
  { id: 'sampling', name: 'Muestreo', unit: MeasureUnit.UNITS },
  { id: 'install_piezo', name: 'Instalación Piezómetro', unit: MeasureUnit.UNITS },
  { id: 'rig_move', name: 'Movilización de Equipo', unit: MeasureUnit.HOURS },
  { id: 'maintenance', name: 'Mantenimiento Mecánico', unit: MeasureUnit.HOURS },
  { id: 'safety_mtg', name: 'Charla de Seguridad', unit: MeasureUnit.HOURS },
];
