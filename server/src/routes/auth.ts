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

function run(sql: string, params: any[] = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDB();
}

// Register
router.post('/register', (req, res) => {
  const { phone, password, nickname, role } = req.body;
  if (!phone || !password || !nickname || !role) return res.status(400).json({ error: '缺少必填字段' });
  if (!['owner', 'walker'].includes(role)) return res.status(400).json({ error: '角色必须是 owner 或 walker' });
  const existing = queryOne('SELECT id FROM users WHERE phone = ?', [phone]);
  if (existing) return res.status(409).json({ error: '该手机号已注册' });
  const id = uuidv4();
  const token = uuidv4();
  run('INSERT INTO users (id, phone, password, nickname, role) VALUES (?, ?, ?, ?, ?)', [id, phone, password, nickname, role]);
  res.json({ token, userId: id, role });
});

// Login
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) return res.status(400).json({ error: '请填写手机号和密码' });
  const user = queryOne('SELECT * FROM users WHERE phone = ? AND password = ?', [phone, password]);
  if (!user) return res.status(401).json({ error: '手机号或密码错误' });
  const token = uuidv4();
  res.json({ token, userId: user.id, role: user.role, nickname: user.nickname });
});

// Get current user
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const user = queryOne('SELECT id, phone, nickname, role, avatar, real_name, id_card, bio, rating, review_count, order_count, balance, service_radius, service_start_time, service_end_time FROM users WHERE id = ?', [userId]);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

export default router;
