const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { randomUUID } = require('crypto');

router.use(auth);

// GET /api/tasks?date=2024-01-15
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });
  const tasks = db.prepare(
    'SELECT * FROM tasks WHERE user_id = ? AND date = ? ORDER BY time ASC, created_at ASC'
  ).all(req.user.id, date);
  res.json({ tasks: tasks.map(t => ({ ...t, completed: t.completed === 1 })) });
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { date, title, priority, category, time, notes } = req.body;
  if (!date || !title) return res.status(400).json({ error: 'date and title are required' });
  const id = randomUUID();
  db.prepare(`
    INSERT INTO tasks (id, user_id, date, title, priority, category, time, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.user.id, date, title, priority || 'medium', category || 'personal', time || null, notes || '');
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  res.status(201).json({ task: { ...task, completed: task.completed === 1 } });
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const { title, priority, category, time, notes, completed } = req.body;
  db.prepare(`
    UPDATE tasks SET
      title = COALESCE(?, title),
      priority = COALESCE(?, priority),
      category = COALESCE(?, category),
      time = ?,
      notes = COALESCE(?, notes),
      completed = COALESCE(?, completed),
      updated_at = datetime('now')
    WHERE id = ? AND user_id = ?
  `).run(
    title ?? null, priority ?? null, category ?? null,
    time !== undefined ? time : task.time,
    notes ?? null,
    completed !== undefined ? (completed ? 1 : 0) : null,
    req.params.id, req.user.id
  );
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  res.json({ task: { ...updated, completed: updated.completed === 1 } });
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
});

module.exports = router;
