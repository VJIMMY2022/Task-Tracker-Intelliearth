import React, { useState, useEffect } from 'react';
import { DrillTask, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';
import { Modal } from './Modal';
import { TaskForm } from './TaskForm';
import { Plus, AlertTriangle, Clock, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface KanbanBoardProps {
  tasks: DrillTask[];
  onAddTask: (task: Omit<DrillTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTask: (task: DrillTask) => void;
  onDeleteTask: (taskId: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onMoveTask,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<DrillTask | undefined>(undefined);
  const [now, setNow] = useState(Date.now());

  // Update timer for calculating relative times in the dashboard
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleEditClick = (task: DrillTask) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  const handleFormSubmit = (taskData: any) => {
    if (editingTask) {
      onUpdateTask({ ...editingTask, ...taskData, updatedAt: Date.now() });
    } else {
      onAddTask(taskData);
    }
    handleCloseModal();
  };

  // Logic to identify critical tasks (Longest waiting time)
  const criticalTasks = tasks
    .filter(t => t.status !== TaskStatus.DONE)
    .map(t => {
      // For TODO: Time since creation. For IN_PROGRESS: Time since start (or creation if not tracked)
      const startTime = t.status === TaskStatus.TODO ? t.createdAt : (t.startedAt || t.createdAt);
      const duration = now - startTime;
      return { ...t, currentDuration: duration };
    })
    .sort((a, b) => b.currentDuration - a.currentDuration) // Descending order
    .slice(0, 3); // Top 3

  const getDurationLabel = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} días y ${hours % 24} hrs`;
    return `${hours} hrs y ${Math.floor((ms / (1000 * 60)) % 60)} min`;
  };

  const columns = [
    { id: TaskStatus.TODO, title: 'Por Hacer', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    { id: TaskStatus.IN_PROGRESS, title: 'En Progreso', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: TaskStatus.DONE, title: 'Completado', bg: 'bg-green-50', border: 'border-green-200' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tablero de Control</h2>
          <p className="text-sm text-gray-500">Gestione el flujo de trabajo de perforación.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Critical Alerts Dashboard */}
      {criticalTasks.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
            <AlertTriangle size={16} className="text-red-500 mr-2" />
            Atención Requerida (Top demoras)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {criticalTasks.map((task, index) => {
              // Color intensity based on ranking
              const alertStyle = index === 0 
                ? 'bg-red-50 border-red-200 text-red-900' 
                : index === 1 
                  ? 'bg-orange-50 border-orange-200 text-orange-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900';
              
              const iconColor = index === 0 ? 'text-red-500' : 'text-orange-500';

              return (
                <div 
                  key={task.id} 
                  onClick={() => handleEditClick(task)}
                  className={`border rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow ${alertStyle}`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-full bg-white/60 ${iconColor}`}>
                    <Clock size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold uppercase opacity-70 mb-0.5">
                        {task.status === TaskStatus.TODO ? 'En Espera' : 'En Ejecución'}
                      </p>
                      <span className="text-xs font-mono font-bold bg-white/50 px-1.5 py-0.5 rounded">
                        #{index + 1}
                      </span>
                    </div>
                    <h4 className="font-semibold text-sm truncate pr-2" title={task.title}>
                      {task.title}
                    </h4>
                    <p className="text-xs mt-1.5 flex items-center font-medium">
                      <AlertCircle size={12} className="mr-1" />
                      Tiempo: {getDurationLabel(task.currentDuration)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[1000px] gap-6">
          {columns.map((col) => {
            const columnTasks = tasks.filter(t => t.status === col.id).sort((a, b) => b.updatedAt - a.updatedAt);
            
            return (
              <div key={col.id} className={`flex-1 flex flex-col rounded-xl ${col.bg} border ${col.border} min-w-[300px]`}>
                <div className="p-4 border-b border-black/5 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-700">{col.title}</h3>
                  <span className="bg-white/50 text-gray-600 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                    {columnTasks.length}
                  </span>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No hay tareas
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onMove={onMoveTask}
                        onEdit={handleEditClick}
                        onDelete={onDeleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Editar Tarea' : 'Nueva Tarea de Perforación'}
      >
        <TaskForm
          initialTask={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};