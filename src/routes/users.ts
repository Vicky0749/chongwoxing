import { Router } from 'express';
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

// Get user profile
router.get('/:id', (req, res) => {
  const user = queryOne(
    'SELECT id, phone, nickname, role, avatar, real_name, bio, rating, review_count, order_count, balance, service_radius, service_start_time, service_end_time, created_at FROM users WHERE id = ?',
    [req.params.id]
  );
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

// Update user profile
router.put('/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const { nickname, avatar, real_name, id_card, bio, service_radius, service_start_time, service_end_time } = req.body;
  run(
    'UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar), real_name = COALESCE(?, real_name), id_card = COALESCE(?, id_card), bio = COALESCE(?, bio), service_radius = COALESCE(?, service_radius), service_start_time = COALESCE(?, service_start_time), service_end_time = COALESCE(?, service_end_time) WHERE id = ?',
    [nickname, avatar, real_name, id_card, bio, service_radius, service_start_time, service_end_time, userId]
  );
  const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
  res.json(user);
});

// Get reviews for a user
router.get('/:id/reviews', (req, res) => {
  const reviews = queryAll(`
    SELECT r.*, u.nickname as reviewer_nickname, u.avatar as reviewer_avatar
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    WHERE r.reviewee_id = ?
    ORDER BY r.created_at DESC
  `, [req.params.id]);
  res.json(reviews);
});

export default router;
