import { useState } from 'react';
import { Check, Clock, Trash2, Edit2, ChevronDown, ChevronUp } from 'lucide-react';

const priorityDot = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const categoryColors = {
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  personal: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  health: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
};

export function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`group rounded-xl border transition-all ${
      task.completed
        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md'
    }`}>
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
          }`}
        >
          {task.completed && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority]}`} />
            <span className={`text-sm font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
              {task.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.time && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={10} />
                {task.time}
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${categoryColors[task.category]}`}>
              {task.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {task.notes && (
            <button onClick={() => setExpanded(e => !e)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button onClick={() => onEdit(task)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 size={16} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && task.notes && (
        <div className="px-4 pb-4 pt-0 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 mt-0 pt-3">
          {task.notes}
        </div>
      )}
    </div>
  );
}
