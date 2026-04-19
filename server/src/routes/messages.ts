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

// Get messages for a task
router.get('/task/:taskId', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const task = queryOne('SELECT * FROM tasks WHERE id = ? AND (owner_id = ? OR walker_id = ?)', [req.params.taskId, userId, userId]);
  if (!task) return res.status(403).json({ error: '无权访问此任务' });
  const messages = queryAll(
    'SELECT m.*, u.nickname as sender_nickname, u.avatar as sender_avatar FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.task_id = ? ORDER BY m.created_at ASC',
    [req.params.taskId]
  );
  res.json(messages);
});

// Send message
router.post('/', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const { task_id, content } = req.body;
  if (!task_id || !content) return res.status(400).json({ error: '缺少必填字段' });
  const task = queryOne('SELECT * FROM tasks WHERE id = ? AND (owner_id = ? OR walker_id = ?)', [task_id, userId, userId]);
  if (!task) return res.status(403).json({ error: '无权访问此任务' });
  const receiver_id = task.owner_id === userId ? task.walker_id : task.owner_id;
  if (!receiver_id) return res.status(400).json({ error: '对方还未接单' });
  const id = uuidv4();
  run('INSERT INTO messages (id, task_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?, ?)', [id, task_id, userId, receiver_id, content]);
  const msg = queryOne('SELECT m.*, u.nickname as sender_nickname, u.avatar as sender_avatar FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?', [id]);
  res.json(msg);
});

// Get conversations
router.get('/conversations', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const conversations = queryAll(`
    SELECT DISTINCT t.id as task_id, t.title, t.status as task_status,
           CASE WHEN t.owner_id = ? THEN t.walker_id ELSE t.owner_id END as other_id,
           u.nickname as other_nickname, u.avatar as other_avatar, u.role as other_role,
           (SELECT content FROM messages WHERE task_id = t.id ORDER BY created_at DESC LIMIT 1) as last_message,
           (SELECT created_at FROM messages WHERE task_id = t.id ORDER BY created_at DESC LIMIT 1) as last_time
    FROM tasks t
    LEFT JOIN users u ON CASE WHEN t.owner_id = ? THEN t.walker_id ELSE t.owner_id END = u.id
    WHERE (t.owner_id = ? OR t.walker_id = ?) AND t.status != 'cancelled'
    ORDER BY last_time DESC
  `, [userId, userId, userId, userId]);
  res.json(conversations);
});

export default router;
