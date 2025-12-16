import React, { useState } from 'react';
import { DrillTask, TaskStatus, MeasureUnit } from '../types';
import { DRILL_CATEGORIES } from '../constants';
import { Button } from './Button';

interface TaskFormProps {
  initialTask?: DrillTask;
  onSubmit: (task: Omit<DrillTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ initialTask, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [category, setCategory] = useState(initialTask?.category || DRILL_CATEGORIES[0].name);
  const [quantity, setQuantity] = useState(initialTask?.quantity?.toString() || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  
  // Determine unit based on selected category
  const currentCategory = DRILL_CATEGORIES.find(c => c.name === category);
  const unit = currentCategory ? currentCategory.unit : MeasureUnit.METERS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      category,
      quantity: parseFloat(quantity) || 0,
      unit,
      description,
      status: initialTask?.status || TaskStatus.TODO,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Título de la Tarea</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Ej: Perforación Pozo DDH-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Actividad / Categoría</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          {DRILL_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name} ({cat.unit})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cantidad</label>
          <input
            type="number"
            step="0.01"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Unidad</label>
          <input
            type="text"
            disabled
            value={unit}
            className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notas / Observaciones</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          placeholder="Detalles adicionales..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialTask ? 'Guardar Cambios' : 'Crear Tarea'}
        </Button>
      </div>
    </form>
  );
};
