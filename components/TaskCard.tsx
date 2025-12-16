import React, { useEffect, useState } from 'react';
import { DrillTask, TaskStatus } from '../types';
import { ArrowRight, ArrowLeft, CheckCircle2, Clock, Pencil, Hourglass, Timer } from 'lucide-react';

interface TaskCardProps {
  task: DrillTask;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: DrillTask) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onMove, onEdit, onDelete }) => {
  const [now, setNow] = useState(Date.now());

  // Update "now" every minute to refresh relative times if the task is active
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'border-l-4 border-l-yellow-400';
      case TaskStatus.IN_PROGRESS: return 'border-l-4 border-l-orange-500';
      case TaskStatus.DONE: return 'border-l-4 border-l-green-500 bg-green-50/30';
      default: return '';
    }
  };

  // Helper to calculate duration string
  const getDurationString = (start: number, end: number) => {
    const diff = Math.max(0, end - start);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative group ${getStatusColor(task.status)}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="cursor-pointer" onClick={() => onEdit(task)}>
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mb-1">
            {task.category}
          </span>
          <h4 className="font-semibold text-gray-800 leading-tight hover:text-brand-600">{task.title}</h4>
        </div>
        <button onClick={() => onDelete(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
          ×
        </button>
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-2">
        {task.quantity} <span className="text-sm font-normal text-gray-500">{task.unit}</span>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Time Tracking Section */}
      <div className="border-t pt-2 mt-2 space-y-1.5 bg-gray-50/50 p-2 rounded text-xs">
        
        {/* Creation Date */}
        <div className="flex items-center text-gray-400" title="Fecha de Creación">
           <Clock size={12} className="mr-1.5" />
           <span>Creado: {formatDate(task.createdAt)}</span>
        </div>

        {/* Wait Time: Created -> Started (or Now) */}
        {task.status !== TaskStatus.TODO && (
          <div className="flex items-center text-yellow-600 font-medium" title="Tiempo de espera hasta iniciar">
             <Hourglass size={12} className="mr-1.5" />
             <span>Espera: {getDurationString(task.createdAt, task.startedAt || now)}</span>
          </div>
        )}
        {task.status === TaskStatus.TODO && (
           <div className="flex items-center text-gray-400" title="Tiempo transcurrido en espera">
              <Hourglass size={12} className="mr-1.5" />
              <span>En espera: {getDurationString(task.createdAt, now)}</span>
           </div>
        )}

        {/* Execution Time: Started -> Completed (or Now) */}
        {task.startedAt && (
          <div className={`flex items-center font-medium ${task.completedAt ? 'text-green-600' : 'text-blue-600'}`} title="Tiempo de ejecución">
             <Timer size={12} className="mr-1.5" />
             <span>Ejecución: {getDurationString(task.startedAt, task.completedAt || now)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
        <div className="flex-1 flex justify-start">
          {task.status !== TaskStatus.TODO ? (
            <button 
              onClick={() => onMove(task.id, task.status === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.TODO)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition-colors"
              title="Mover atrás"
            >
              <ArrowLeft size={16} />
            </button>
          ) : <div className="w-6" />}
        </div>

        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-md hover:bg-brand-50 text-gray-400 hover:text-brand-600 transition-colors"
          title="Editar detalles"
        >
          <Pencil size={16} />
        </button>
        
        <div className="flex-1 flex justify-end">
          {task.status !== TaskStatus.DONE ? (
            <button 
              onClick={() => onMove(task.id, task.status === TaskStatus.TODO ? TaskStatus.IN_PROGRESS : TaskStatus.DONE)}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-brand-600 transition-colors"
              title="Avanzar"
            >
              <ArrowRight size={16} />
            </button>
          ) : <div className="w-6" />}
        </div>
      </div>
    </div>
  );
};