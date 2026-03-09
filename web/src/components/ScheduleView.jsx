import { format } from 'date-fns';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

const priorityBg = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

const categoryBg = {
  work: 'bg-blue-500/10 border-blue-400 text-blue-800 dark:text-blue-300',
  personal: 'bg-purple-500/10 border-purple-400 text-purple-800 dark:text-purple-300',
  health: 'bg-green-500/10 border-green-400 text-green-800 dark:text-green-300',
  other: 'bg-gray-500/10 border-gray-400 text-gray-700 dark:text-gray-300',
};

function formatHour(h) {
  if (h === 12) return '12 PM';
  if (h > 12) return `${h - 12} PM`;
  return `${h} AM`;
}

export function ScheduleView({ tasks, onToggle, onEdit }) {
  const timedTasks = tasks.filter(t => t.time);

  const getTasksForHour = (hour) => {
    return timedTasks.filter(t => {
      const [h] = t.time.split(':').map(Number);
      return h === hour;
    });
  };

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  return (
    <div className="pb-24">
      {timedTasks.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4 mb-2">
          Add a time to tasks to see them here
        </p>
      )}
      <div className="relative">
        {HOURS.map(hour => {
          const hourTasks = getTasksForHour(hour);
          const isCurrentHour = hour === currentHour;

          return (
            <div key={hour} className="flex gap-3 min-h-[64px]">
              <div className="w-14 flex-shrink-0 pt-3 text-right">
                <span className={`text-xs font-medium ${isCurrentHour ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`}>
                  {formatHour(hour)}
                </span>
              </div>
              <div className="flex-1 border-t border-gray-100 dark:border-gray-700/50 pt-2 pb-1 relative">
                {isCurrentHour && (
                  <div
                    className="absolute left-0 right-0 flex items-center z-10 pointer-events-none"
                    style={{ top: `${(currentMinutes / 60) * 100}%` }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 -ml-1.5 flex-shrink-0" />
                    <div className="flex-1 h-px bg-blue-500" />
                  </div>
                )}
                <div className="space-y-1.5">
                  {hourTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => onEdit(task)}
                      className={`w-full text-left px-3 py-2 rounded-lg border-l-2 text-sm transition-opacity ${categoryBg[task.category]} ${task.completed ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityBg[task.priority]}`} />
                        <span className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</span>
                        <span className="text-xs opacity-60 ml-auto flex-shrink-0">{task.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
