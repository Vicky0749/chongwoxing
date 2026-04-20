import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db, saveDB } from '../db.js';

const router = Router();

function queryOne(sql: string, params: any[] = []): any {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
  stmt.free();
  return null;
}

function queryAll(sql: string, params: any[] = []): any[] {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) results.push(stmt.getAsObject());
  stmt.free();
  return results;
}

function run(sql: string, params: any[] = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDB();
}

// Get tasks
router.get('/', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const { mode, status, lat, lng, radius } = req.query;

  if (mode === 'hall') {
    let sql = `
      SELECT t.*, u.nickname as owner_nickname, u.avatar as owner_avatar, u.rating as owner_rating,
             p.name as pet_name, p.species as pet_species, p.breed as pet_breed, p.photo as pet_photo
      FROM tasks t
      JOIN users u ON t.owner_id = u.id
      JOIN pets p ON t.pet_id = p.id
      WHERE t.status = 'pending'
    `;
    const params: any[] = [];
    if (radius && lat && lng) {
      // Haversine distance filter (simplified for sql.js - no radians function, use approx)
      sql += ` ORDER BY t.created_at DESC`;
    } else {
      sql += ' ORDER BY t.created_at DESC';
    }
    const tasks = queryAll(sql, params);
    return res.json(tasks);
  }

  // Own tasks
  let sql = `
    SELECT t.*, u.nickname as walker_nickname, u.avatar as walker_avatar,
           p.name as pet_name, p.species as pet_species, p.breed as pet_breed, p.photo as pet_photo
    FROM tasks t
    LEFT JOIN users u ON t.walker_id = u.id
    JOIN pets p ON t.pet_id = p.id
    WHERE t.owner_id = ? OR t.walker_id = ?
  `;
  const params: any[] = [userId, userId];
  if (status) { sql += ' AND t.status = ?'; params.push(status); }
  sql += ' ORDER BY t.created_at DESC';
  const tasks = queryAll(sql, params);
  res.json(tasks);
});

// Get single task
router.get('/:id', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const task = queryOne(`
    SELECT t.*, u.nickname as owner_nickname, u.avatar as owner_avatar, u.rating as owner_rating,
           w.nickname as walker_nickname, w.avatar as walker_avatar, w.rating as walker_rating,
           p.name as pet_name, p.species as pet_species, p.breed as pet_breed, p.photo as pet_photo, p.personality as pet_personality
    FROM tasks t
    JOIN users u ON t.owner_id = u.id
    LEFT JOIN users w ON t.walker_id = w.id
    JOIN pets p ON t.pet_id = p.id
    WHERE t.id = ?
  `, [req.params.id]);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  res.json(task);
});

// Create task
router.post('/', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const { pet_id, service_type, title, description, location_name, latitude, longitude, reward, task_date, task_time_start, task_time_end, photo } = req.body;
  if (!pet_id || !service_type || !title || !task_date || !task_time_start || !task_time_end) {
    return res.status(400).json({ error: '缺少必填字段' });
  }
  const pet = queryOne('SELECT * FROM pets WHERE id = ? AND owner_id = ?', [pet_id, userId]);
  if (!pet) return res.status(404).json({ error: '宠物不存在' });
  const id = uuidv4();
  run(
    'INSERT INTO tasks (id, owner_id, pet_id, service_type, title, description, location_name, latitude, longitude, reward, task_date, task_time_start, task_time_end, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, pet_id, service_type, title, description || '', location_name || '', latitude || 0, longitude || 0, reward || 0, task_date, task_time_start, task_time_end, photo || '']
  );
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [id]);
  res.json(task);
});

// Accept task
router.post('/:id/accept', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  if (user?.role !== 'walker') return res.status(403).json({ error: '只有代遛师可以接单' });
  const task = queryOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  if (task.status !== 'pending') return res.status(400).json({ error: '任务已被接取或已结束' });
  run("UPDATE tasks SET status = 'accepted', walker_id = ? WHERE id = ?", [userId, req.params.id]);
  res.json({ success: true });
});

// Start task
router.post('/:id/start', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const task = queryOne('SELECT * FROM tasks WHERE id = ? AND walker_id = ?', [req.params.id, userId]);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  if (task.status !== 'accepted') return res.status(400).json({ error: '任务状态不对' });
  run("UPDATE tasks SET status = 'in_progress' WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

// Complete task
router.post('/:id/complete', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const task = queryOne('SELECT * FROM tasks WHERE id = ? AND (walker_id = ? OR owner_id = ?)', [req.params.id, userId, userId]);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  if (!['accepted', 'in_progress'].includes(task.status)) return res.status(400).json({ error: '任务状态不对' });
  run("UPDATE tasks SET status = 'completed' WHERE id = ?", [req.params.id]);
  if (task.reward > 0 && task.walker_id) {
    run('UPDATE users SET balance = balance + ? WHERE id = ?', [task.reward, task.walker_id]);
    run('UPDATE users SET order_count = order_count + 1 WHERE id = ?', [task.walker_id]);
  }
  res.json({ success: true });
});

// Cancel task
router.post('/:id/cancel', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const task = queryOne('SELECT * FROM tasks WHERE id = ? AND owner_id = ?', [req.params.id, userId]);
  if (!task) return res.status(404).json({ error: '任务不存在' });
  if (task.status !== 'pending') return res.status(400).json({ error: '只能取消待接单的任务' });
  run("UPDATE tasks SET status = 'cancelled' WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

export default router;
