import React, { useState, useMemo } from 'react';
import { DrillTask, TaskStatus, ConsolidatedReportItem, MeasureUnit } from '../types';
import { Button } from './Button';
import { generateExecutiveSummary } from '../services/geminiService';
import { FileBarChart, Sparkles, Filter, TrendingUp, CheckSquare, Clock, Pickaxe, FileSearch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReportViewProps {
  tasks: DrillTask[];
}

export const ReportView: React.FC<ReportViewProps> = ({ tasks }) => {
  // Default to current month
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Consolidated Logic
  const reportData = useMemo(() => {
    // 1. Filter by range (using completedAt for DONE tasks)
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    const filtered = tasks.filter(task => {
      if (task.status !== TaskStatus.DONE || !task.completedAt) return false;
      return task.completedAt >= start && task.completedAt <= end;
    });

    // 2. Aggregate
    const aggregation: Record<string, ConsolidatedReportItem> = {};

    filtered.forEach(task => {
      const key = `${task.category}-${task.unit}`; // Key by category AND unit to avoid mixing incompatible units
      if (!aggregation[key]) {
        aggregation[key] = {
          category: task.category,
          unit: task.unit,
          totalQuantity: 0,
          taskCount: 0
        };
      }
      aggregation[key].totalQuantity += task.quantity;
      aggregation[key].taskCount += 1;
    });

    return Object.values(aggregation).sort((a, b) => b.totalQuantity - a.totalQuantity);
  }, [tasks, startDate, endDate]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(23, 59, 59, 999);

    // Tasks completed in range
    const completedInRange = tasks.filter(t => 
      t.status === TaskStatus.DONE && 
      t.completedAt && 
      t.completedAt >= start && 
      t.completedAt <= end
    );

    // Helper logic to categorize categories based on string content
    const isDrilling = (cat: string) => cat.toLowerCase().includes('perforación');
    const isLogging = (cat: string) => cat.toLowerCase().includes('logueo') || cat.toLowerCase().includes('mapeo');

    // Total Drilling Meters
    const drillingMeters = completedInRange
      .filter(t => t.unit === MeasureUnit.METERS && isDrilling(t.category))
      .reduce((acc, curr) => acc + curr.quantity, 0);

    // Total Logging/Mapping Meters
    const loggingMeters = completedInRange
      .filter(t => t.unit === MeasureUnit.METERS && isLogging(t.category))
      .reduce((acc, curr) => acc + curr.quantity, 0);

    // Average Duration (Completed At - Created At)
    let totalDurationMs = 0;
    let countWithDuration = 0;
    completedInRange.forEach(t => {
      if (t.completedAt && t.createdAt) {
        totalDurationMs += (t.completedAt - t.createdAt);
        countWithDuration++;
      }
    });
    const avgHours = countWithDuration > 0 
      ? (totalDurationMs / countWithDuration / (1000 * 60 * 60)).toFixed(1) 
      : '0';

    // Tasks Created in Range
    const createdInRange = tasks.filter(t => t.createdAt >= start && t.createdAt <= end).length;
    
    return {
      drillingMeters: drillingMeters.toFixed(2),
      loggingMeters: loggingMeters.toFixed(2),
      completedCount: completedInRange.length,
      avgHours,
      createdCount: createdInRange
    };
  }, [tasks, startDate, endDate]);

  const handleGenerateAiReport = async () => {
    if (reportData.length === 0) return;
    setIsGenerating(true);
    setAiSummary(null);
    const summary = await generateExecutiveSummary(reportData, startDate, endDate);
    setAiSummary(summary);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Date Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FileBarChart className="mr-2 text-brand-600" />
              Reporte de Tareas
            </h2>
            <p className="text-sm text-gray-500">Métricas clave y consolidado de producción.</p>
          </div>
          
          <div className="flex items-end gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
             <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500 uppercase">Desde</label>
               <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full text-sm bg-white border-gray-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500"
                />
             </div>
             <div className="space-y-1">
               <label className="text-xs font-semibold text-gray-500 uppercase">Hasta</label>
               <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full text-sm bg-white border-gray-300 rounded-md shadow-sm focus:border-brand-500 focus:ring-brand-500"
                />
             </div>
             <div className="pb-1 px-2 text-gray-400">
                <Filter size={20} />
             </div>
          </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Drilling Meters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-brand-600 border-y border-r border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Perforado</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpiStats.drillingMeters} m</h3>
            </div>
            <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
              <Pickaxe size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Metros PQ/HQ/NQ acumulados</p>
        </div>

        {/* KPI 2: Logging Meters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-teal-500 border-y border-r border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Logueo / Mapeo</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpiStats.loggingMeters} m</h3>
            </div>
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <FileSearch size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Geología y Geotecnia</p>
        </div>

        {/* KPI 3: Completed Tasks */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-green-500 border-y border-r border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tareas Totales</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpiStats.completedCount}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <CheckSquare size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Completadas en el periodo</p>
        </div>

        {/* KPI 4: Avg Time */}
        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-l-orange-400 border-y border-r border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiempo Promedio</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{kpiStats.avgHours} hrs</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Duración media de ejecución</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-800">Detalle Consolidado</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Und</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Eventos</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.length > 0 ? (
                  reportData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-bold">{item.totalQuantity.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.taskCount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                      No hay datos para mostrar en este rango.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Summary Section - Now in a side column on large screens */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={120} />
          </div>
          
          <div className="relative z-10 flex-1">
            <div className="flex flex-col gap-3 mb-4">
               <div>
                  <h3 className="text-lg font-bold text-indigo-900 flex items-center">
                      <Sparkles className="mr-2 text-indigo-600" size={20} />
                      Asistente IA
                  </h3>
                  <p className="text-sm text-indigo-700/80 mt-1">
                      Análisis cualitativo de la productividad.
                  </p>
               </div>
               <Button 
                  onClick={handleGenerateAiReport} 
                  disabled={reportData.length === 0} 
                  isLoading={isGenerating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-md"
               >
                  {aiSummary ? 'Regenerar' : 'Analizar Datos'}
               </Button>
            </div>

            {aiSummary ? (
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-indigo-100 text-gray-800 text-sm leading-relaxed shadow-sm max-h-[400px] overflow-y-auto">
                  <ReactMarkdown className="prose prose-sm max-w-none text-gray-800">
                      {aiSummary}
                  </ReactMarkdown>
              </div>
            ) : (
               <div className="text-center py-10 text-indigo-400 text-sm border-2 border-dashed border-indigo-200 rounded-lg bg-white/30">
                  Esperando solicitud de análisis...
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};