import { useState } from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Sun, Moon, List, CalendarDays, Compass, LogOut, User } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTasks } from './hooks/useTasks';
import { useAuth } from './hooks/useAuth';
import { TaskModal } from './components/TaskModal';
import { ListView } from './components/ListView';
import { ScheduleView } from './components/ScheduleView';
import { AuthScreen } from './components/AuthScreen';

export default function App() {
  const { user, loading: authLoading, login, register, logout } = useAuth();
  const [guestMode, setGuestMode] = useState(false);
  const [date, setDate] = useState(new Date());
  const [darkMode, setDarkMode] = useLocalStorage('planner-dark', false);
  const [view, setView] = useLocalStorage('planner-view', 'list');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const showApp = user || guestMode;
  const { tasks, addTask, updateTask, deleteTask, toggleComplete } = useTasks(date, user);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const handleSave = async (formData) => {
    if (editingTask) {
      await updateTask(editingTask.id, formData);
    } else {
      await addTask(formData);
    }
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setGuestMode(false);
    setShowUserMenu(false);
  };

  if (authLoading) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Compass size={32} className="text-blue-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        {!showApp ? (
          <AuthScreen onLogin={login} onRegister={register} onGuest={() => setGuestMode(true)} />
        ) : (
          <>
            <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="max-w-2xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Compass size={22} className="text-blue-500" />
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">My Voyage</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
                      <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white dark:bg-gray-600 shadow text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        <List size={16} />
                      </button>
                      <button onClick={() => setView('schedule')} className={`p-1.5 rounded-md transition-colors ${view === 'schedule' ? 'bg-white dark:bg-gray-600 shadow text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}>
                        <CalendarDays size={16} />
                      </button>
                    </div>
                    <button onClick={() => setDarkMode(d => !d)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-yellow-400 transition-colors">
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <div className="relative">
                      <button onClick={() => setShowUserMenu(m => !m)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300">
                        <User size={18} />
                      </button>
                      {showUserMenu && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 p-2">
                            {user ? (
                              <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                                <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                              </div>
                            ) : (
                              <p className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 mb-1">Guest mode</p>
                            )}
                            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                              <LogOut size={14} /> Sign out
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setDate(d => subDays(d, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 dark:text-white">{isToday(date) ? 'Today' : format(date, 'EEEE')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{format(date, 'MMMM d, yyyy')}</p>
                  </div>
                  <button onClick={() => setDate(d => addDays(d, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <ChevronRight size={18} />
                  </button>
                </div>

                {tasks.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>{completedCount}/{tasks.length} tasks</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {!isToday(date) && (
                  <button onClick={() => setDate(new Date())} className="mt-2 w-full text-xs text-blue-500 hover:text-blue-600 font-medium py-1">
                    Back to Today
                  </button>
                )}
              </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 pt-4">
              {view === 'list' ? (
                <ListView tasks={tasks} onToggle={toggleComplete} onEdit={handleEdit} onDelete={deleteTask} />
              ) : (
                <ScheduleView tasks={tasks} onToggle={toggleComplete} onEdit={handleEdit} />
              )}
            </main>

            <button
              onClick={() => { setEditingTask(null); setModalOpen(true); }}
              className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95 z-40"
            >
              <Plus size={24} />
            </button>

            {modalOpen && (
              <TaskModal task={editingTask} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingTask(null); }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
