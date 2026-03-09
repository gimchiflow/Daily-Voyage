import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { api } from '../api';

export function useTasks(date, user) {
  const dateKey = format(date, 'yyyy-MM-dd');
  const [tasks, setTasks] = useState([]);
  const localKey = `mv-tasks-${dateKey}`;

  const loadTasks = useCallback(async () => {
    if (user) {
      try {
        const data = await api.tasks.list(dateKey);
        setTasks(data.tasks);
        localStorage.setItem(localKey, JSON.stringify(data.tasks));
      } catch {
        const cached = localStorage.getItem(localKey);
        setTasks(cached ? JSON.parse(cached) : []);
      }
    } else {
      const cached = localStorage.getItem(localKey);
      setTasks(cached ? JSON.parse(cached) : []);
    }
  }, [dateKey, user, localKey]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = async (taskData) => {
    const payload = { ...taskData, date: dateKey };
    if (user) {
      try {
        const data = await api.tasks.create(payload);
        setTasks(prev => {
          const updated = [...prev, data.task];
          localStorage.setItem(localKey, JSON.stringify(updated));
          return updated;
        });
        return data.task;
      } catch { /* fall through to local */ }
    }
    const newTask = {
      id: Date.now().toString(),
      ...payload,
      completed: false,
      created_at: new Date().toISOString(),
    };
    setTasks(prev => {
      const updated = [...prev, newTask];
      localStorage.setItem(localKey, JSON.stringify(updated));
      return updated;
    });
    return newTask;
  };

  const updateTask = async (id, updates) => {
    if (user) {
      try {
        const data = await api.tasks.update(id, updates);
        setTasks(prev => {
          const updated = prev.map(t => t.id === id ? data.task : t);
          localStorage.setItem(localKey, JSON.stringify(updated));
          return updated;
        });
        return;
      } catch { /* fall through */ }
    }
    setTasks(prev => {
      const updated = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      localStorage.setItem(localKey, JSON.stringify(updated));
      return updated;
    });
  };

  const deleteTask = async (id) => {
    if (user) {
      try { await api.tasks.delete(id); } catch { /* fall through */ }
    }
    setTasks(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem(localKey, JSON.stringify(updated));
      return updated;
    });
  };

  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) updateTask(id, { completed: !task.completed });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (a.priority !== b.priority) return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });

  return { tasks: sortedTasks, addTask, updateTask, deleteTask, toggleComplete };
}
