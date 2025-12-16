import React, { useState, useEffect } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { ReportView } from './components/ReportView';
import { DrillTask, TaskStatus } from './types';
import { LayoutDashboard, ClipboardList, Pickaxe, Clock as ClockIcon } from 'lucide-react';

const STORAGE_KEY = 'diamond_drill_tasks_v1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'board' | 'report'>('board');
  const [tasks, setTasks] = useState<DrillTask[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load from Storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
  }, []);

  // Save to Storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<DrillTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: DrillTask = {
      ...taskData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (updatedTask: DrillTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (taskId: string) => {
    if(window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;

      const now = Date.now();
      const updates: Partial<DrillTask> = {
        status: newStatus,
        updatedAt: now,
      };

      // Logic for timestamps state transitions
      if (newStatus === TaskStatus.IN_PROGRESS && task.status === TaskStatus.TODO) {
        // Starting the task
        updates.startedAt = now;
      } else if (newStatus === TaskStatus.DONE) {
        // Finishing the task
        updates.completedAt = now;
        // If it skipped 'In Progress' (straight from Todo to Done), assume started now too
        if (!task.startedAt) {
          updates.startedAt = now;
        }
      } else if (newStatus === TaskStatus.TODO) {
        // Resetting to Todo
        updates.startedAt = undefined;
        updates.completedAt = undefined;
      } else if (newStatus === TaskStatus.IN_PROGRESS && task.status === TaskStatus.DONE) {
        // Moving back from Done to In Progress
        updates.completedAt = undefined;
      }

      return { ...task, ...updates };
    }));
  };

  const formatCurrentDate = (date: Date) => {
    return date.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  };
  
  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 p-1.5 rounded-lg shadow-sm">
              <Pickaxe size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden md:block">Task Tracker <span className="text-brand-600 font-light">Intelliearth</span></h1>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 md:hidden">TT <span className="text-brand-600 font-light">Intelliearth</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
             {/* Clock Display */}
             <div className="hidden sm:flex flex-col items-end text-right border-r border-gray-200 pr-4 mr-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{formatCurrentDate(currentTime)}</span>
                <div className="flex items-center text-slate-800 font-mono font-bold text-lg leading-none mt-0.5">
                   <ClockIcon size={16} className="mr-1.5 text-brand-500" />
                   {formatCurrentTime(currentTime)}
                </div>
             </div>

            <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
              <button
                onClick={() => setActiveTab('board')}
                className={`flex items-center px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'board' 
                    ? 'bg-white text-brand-700 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <LayoutDashboard size={16} className="md:mr-2" />
                <span className="hidden md:inline">Tablero</span>
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center px-3 md:px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'report' 
                    ? 'bg-white text-brand-700 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                <ClipboardList size={16} className="md:mr-2" />
                <span className="hidden md:inline">Reportes</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'board' ? (
          <KanbanBoard 
            tasks={tasks}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onMoveTask={moveTask}
          />
        ) : (
          <ReportView tasks={tasks} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Task Tracker Intelliearth</p>
          <p className="flex items-center mt-2 md:mt-0">
            By: <span className="font-semibold text-gray-700 ml-1">Jimmy Valderrama</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;