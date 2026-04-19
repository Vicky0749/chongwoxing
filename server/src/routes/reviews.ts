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

// Create review
router.post('/', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const { task_id, rating, comment } = req.body;
  if (!task_id || !rating) return res.status(400).json({ error: '缺少必填字段' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: '评分必须是1-5' });

  const task = queryOne('SELECT * FROM tasks WHERE id = ? AND status = ?', [task_id, 'completed']);
  if (!task) return res.status(404).json({ error: '只能评价已完成的订单' });

  const reviewee_id = task.owner_id === userId ? task.walker_id : task.owner_id;
  if (!reviewee_id) return res.status(400).json({ error: '被评价人不存在' });

  const existing = queryOne('SELECT * FROM reviews WHERE task_id = ? AND reviewer_id = ?', [task_id, userId]);
  if (existing) return res.status(409).json({ error: '您已评价过此订单' });

  const id = uuidv4();
  run('INSERT INTO reviews (id, task_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)', [id, task_id, userId, reviewee_id, rating, comment || '']);

  const stats = queryOne('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE reviewee_id = ?', [reviewee_id]);
  if (stats) {
    run('UPDATE users SET rating = ?, review_count = ? WHERE id = ?', [parseFloat(stats.avg).toFixed(1), stats.cnt, reviewee_id]);
  }

  const review = queryOne('SELECT r.*, u.nickname as reviewer_nickname FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.id = ?', [id]);
  res.json(review);
});

// Check if reviewed
router.get('/task/:taskId/check', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const review = queryOne('SELECT * FROM reviews WHERE task_id = ? AND reviewer_id = ?', [req.params.taskId, userId]);
  res.json({ reviewed: !!review });
});

export default router;
