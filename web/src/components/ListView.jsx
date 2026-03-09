import { TaskCard } from './TaskCard';
import { CheckCircle2 } from 'lucide-react';

export function ListView({ tasks, onToggle, onEdit, onDelete }) {
  const pending = tasks.filter(t => !t.completed);
  const done = tasks.filter(t => t.completed);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 size={48} className="text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks yet</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Tap + to add your first task</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24">
      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
            Tasks · {pending.length}
          </p>
          {pending.map(task => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
      {done.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
            Completed · {done.length}
          </p>
          {done.map(task => (
            <TaskCard key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
