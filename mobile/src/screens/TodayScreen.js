import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl, Modal, TextInput, Alert, SafeAreaView, StatusBar
} from 'react-native';
import { format, isToday, addDays, subDays } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const PRIORITIES = ['high', 'medium', 'low'];
const CATEGORIES = ['work', 'personal', 'health', 'other'];
const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };
const categoryColors = {
  work: { bg: '#dbeafe', text: '#1d4ed8' },
  personal: { bg: '#ede9fe', text: '#6d28d9' },
  health: { bg: '#dcfce7', text: '#15803d' },
  other: { bg: '#f3f4f6', text: '#374151' },
};

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <View style={[styles.taskCard, task.completed && styles.taskCardDone]}>
      <TouchableOpacity onPress={() => onToggle(task.id)} style={[styles.checkbox, task.completed && styles.checkboxDone]}>
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.taskContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[styles.priorityDot, { backgroundColor: priorityColors[task.priority] }]} />
          <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]} numberOfLines={2}>{task.title}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, alignItems: 'center' }}>
          {task.time && <Text style={styles.taskMeta}>⏰ {task.time}</Text>}
          <View style={[styles.categoryBadge, { backgroundColor: categoryColors[task.category]?.bg }]}>
            <Text style={[styles.categoryText, { color: categoryColors[task.category]?.text }]}>{task.category}</Text>
          </View>
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <TouchableOpacity onPress={() => onEdit(task)} style={styles.iconBtn}>
          <Text style={{ fontSize: 16 }}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.iconBtn}>
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TaskFormModal({ visible, task, date, onSave, onClose }) {
  const [form, setForm] = useState({ title: '', priority: 'medium', category: 'personal', time: '', notes: '' });

  useEffect(() => {
    if (task) {
      setForm({ title: task.title, priority: task.priority, category: task.category, time: task.time || '', notes: task.notes || '' });
    } else {
      setForm({ title: '', priority: 'medium', category: 'personal', time: '', notes: '' });
    }
  }, [task, visible]);

  const handleSave = () => {
    if (!form.title.trim()) { Alert.alert('Error', 'Task title is required'); return; }
    onSave({ ...form, time: form.time || null });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalCancel}>Cancel</Text></TouchableOpacity>
          <Text style={styles.modalTitle}>{task ? 'Edit Task' : 'New Task'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.modalSave}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView style={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>Task *</Text>
          <TextInput
            style={styles.textInput}
            value={form.title}
            onChangeText={v => setForm(f => ({ ...f, title: v }))}
            placeholder="What needs to be done?"
            autoFocus
          />

          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {PRIORITIES.map(p => (
              <TouchableOpacity key={p} onPress={() => setForm(f => ({ ...f, priority: p }))} style={[styles.pill, form.priority === p && styles.pillActive]}>
                <Text style={[styles.pillText, form.priority === p && styles.pillTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} onPress={() => setForm(f => ({ ...f, category: c }))} style={[styles.pill, form.category === c && styles.pillActive]}>
                <Text style={[styles.pillText, form.category === c && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Time (optional, HH:MM)</Text>
          <TextInput
            style={styles.textInput}
            value={form.time}
            onChangeText={v => setForm(f => ({ ...f, time: v }))}
            placeholder="09:00"
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.fieldLabel}>Notes</Text>
          <TextInput
            style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
            value={form.notes}
            onChangeText={v => setForm(f => ({ ...f, notes: v }))}
            placeholder="Optional notes..."
            multiline
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

export default function TodayScreen() {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const dateKey = format(date, 'yyyy-MM-dd');
  const localKey = `mv-tasks-${dateKey}`;

  const loadTasks = useCallback(async () => {
    if (user) {
      try {
        const data = await api.tasks.list(dateKey);
        setTasks(data.tasks);
        await AsyncStorage.setItem(localKey, JSON.stringify(data.tasks));
      } catch {
        const cached = await AsyncStorage.getItem(localKey);
        setTasks(cached ? JSON.parse(cached) : []);
      }
    } else {
      const cached = await AsyncStorage.getItem(localKey);
      setTasks(cached ? JSON.parse(cached) : []);
    }
  }, [dateKey, user]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const onRefresh = async () => { setRefreshing(true); await loadTasks(); setRefreshing(false); };

  const handleSave = async (formData) => {
    const payload = { ...formData, date: dateKey };
    if (editingTask) {
      const updated = { ...editingTask, ...formData };
      setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
      if (user) { try { await api.tasks.update(editingTask.id, formData); } catch {} }
    } else {
      if (user) {
        try {
          const data = await api.tasks.create(payload);
          setTasks(prev => [...prev, data.task]);
        } catch {
          setTasks(prev => [...prev, { id: Date.now().toString(), ...payload, completed: false }]);
        }
      } else {
        setTasks(prev => [...prev, { id: Date.now().toString(), ...payload, completed: false }]);
      }
    }
    setModalVisible(false);
    setEditingTask(null);
  };

  const handleToggle = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    if (user) { try { await api.tasks.update(id, { completed: !task.completed }); } catch {} }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setTasks(prev => prev.filter(t => t.id !== id));
        if (user) { try { await api.tasks.delete(id); } catch {} }
      }},
    ]);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const po = { high: 0, medium: 1, low: 2 };
    return (po[a.priority] || 1) - (po[b.priority] || 1);
  });

  const pending = sortedTasks.filter(t => !t.completed);
  const done = sortedTasks.filter(t => t.completed);
  const progress = tasks.length > 0 ? (done.length / tasks.length) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.appTitle}>🧭 My Voyage</Text>
      </View>

      {/* Date nav */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => setDate(d => subDays(d, 1))} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDate(new Date())}>
          <Text style={styles.dateText}>{isToday(date) ? 'Today' : format(date, 'EEEE')}</Text>
          <Text style={styles.dateSubText}>{format(date, 'MMMM d, yyyy')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setDate(d => addDays(d, 1))} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Progress */}
      {tasks.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={styles.progressLabel}>{done.length}/{tasks.length} tasks</Text>
            <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
      )}

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />} style={{ flex: 1 }}>
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>✅</Text>
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>Tap + to add your first task</Text>
          </View>
        ) : (
          <View style={{ padding: 16, gap: 8 }}>
            {pending.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>TASKS · {pending.length}</Text>
                {pending.map(t => (
                  <TaskItem key={t.id} task={t} onToggle={handleToggle}
                    onEdit={task => { setEditingTask(task); setModalVisible(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
            {done.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: '#9ca3af' }]}>COMPLETED · {done.length}</Text>
                {done.map(t => (
                  <TaskItem key={t.id} task={t} onToggle={handleToggle}
                    onEdit={task => { setEditingTask(task); setModalVisible(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => { setEditingTask(null); setModalVisible(true); }}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <TaskFormModal
        visible={modalVisible}
        task={editingTask}
        date={dateKey}
        onSave={handleSave}
        onClose={() => { setModalVisible(false); setEditingTask(null); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  headerBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  appTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, color: '#374151', lineHeight: 32 },
  dateText: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  dateSubText: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
  progressContainer: { backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  progressLabel: { fontSize: 12, color: '#6b7280' },
  progressBar: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#3b82f6', borderRadius: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', letterSpacing: 0.8, marginTop: 8, marginBottom: 4 },
  taskCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 8 },
  taskCardDone: { opacity: 0.6 },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  checkboxDone: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1 },
  taskTitleDone: { textDecorationLine: 'line-through', color: '#9ca3af' },
  priorityDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  taskMeta: { fontSize: 12, color: '#6b7280' },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  categoryText: { fontSize: 11, fontWeight: '600' },
  iconBtn: { padding: 4 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#374151' },
  emptySubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  modalCancel: { fontSize: 16, color: '#6b7280' },
  modalSave: { fontSize: 16, color: '#3b82f6', fontWeight: '700' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  textInput: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', backgroundColor: '#fff' },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  pillActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  pillText: { fontSize: 14, color: '#374151', fontWeight: '500', textTransform: 'capitalize' },
  pillTextActive: { color: '#fff' },
});
