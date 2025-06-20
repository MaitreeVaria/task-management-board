const express = require('express');
const cors = require('cors');
const pool = require('./models/database');

const app = express();
const PORT = 3001;

app.use(cors({  origin: ['http://3.129.45.165', 'http://localhost:3000', 'http://localhost:5173'],  credentials: true}));
app.use(express.json());

app.get('/', (req, res) => {
  console.log('GET / request received');
  res.json({ message: 'Server is running!' });
});

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // CREATE a new task
  app.post('/api/tasks', async (req, res) => {
    try {
      const { title, description, priority } = req.body;
      const result = await pool.query(
        'INSERT INTO tasks (title, description, priority) VALUES ($1, $2, $3) RETURNING *',
        [title, description, priority || 'medium']
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // UPDATE a task
  app.put('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, priority } = req.body;
      const result = await pool.query(
        'UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4 WHERE id = $5 RETURNING *',
        [title, description, status, priority, id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // DELETE a task
  app.delete('/api/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      res.json({ message: 'Task deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
