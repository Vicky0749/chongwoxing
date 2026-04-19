import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Import routes after DB is ready
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import petRoutes from './routes/pets.js';
import taskRoutes from './routes/tasks.js';
import messageRoutes from './routes/messages.js';
import reviewRoutes from './routes/reviews.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// Serve static files from client dist in production
const clientDistPath = join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🐾 宠我行服务器运行在 http://localhost:${PORT}`);
});
