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

// Get all pets for current user
router.get('/', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const pets = queryAll('SELECT * FROM pets WHERE owner_id = ? ORDER BY created_at DESC', [userId]);
  res.json(pets.map((p: any) => ({ ...p, vaccines: JSON.parse(p.vaccines || '[]') })));
});

// Add pet
router.post('/', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const { name, species, breed, age, weight, vaccines, personality, photo } = req.body;
  if (!name || !species) return res.status(400).json({ error: '名字和种类必填' });
  const id = uuidv4();
  run(
    'INSERT INTO pets (id, owner_id, name, species, breed, age, weight, vaccines, personality, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, name, species, breed || '', age || 0, weight || 0, JSON.stringify(vaccines || []), personality || '', photo || '']
  );
  const pet = queryOne('SELECT * FROM pets WHERE id = ?', [id]);
  res.json({ ...pet, vaccines: JSON.parse(pet.vaccines) });
});

// Update pet
router.put('/:id', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const pet = queryOne('SELECT * FROM pets WHERE id = ? AND owner_id = ?', [req.params.id, userId]);
  if (!pet) return res.status(404).json({ error: '宠物不存在' });
  const { name, species, breed, age, weight, vaccines, personality, photo } = req.body;
  run(
    'UPDATE pets SET name = COALESCE(?, name), species = COALESCE(?, species), breed = COALESCE(?, breed), age = COALESCE(?, age), weight = COALESCE(?, weight), vaccines = COALESCE(?, vaccines), personality = COALESCE(?, personality), photo = COALESCE(?, photo) WHERE id = ?',
    [name, species, breed, age, weight, vaccines ? JSON.stringify(vaccines) : null, personality, photo, req.params.id]
  );
  const updated = queryOne('SELECT * FROM pets WHERE id = ?', [req.params.id]);
  res.json({ ...updated, vaccines: JSON.parse(updated.vaccines) });
});

// Delete pet
router.delete('/:id', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: '未登录' });
  const userId = auth.replace('Bearer ', '');
  const pet = queryOne('SELECT * FROM pets WHERE id = ? AND owner_id = ?', [req.params.id, userId]);
  if (!pet) return res.status(404).json({ error: '宠物不存在' });
  run('DELETE FROM pets WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

export default router;
