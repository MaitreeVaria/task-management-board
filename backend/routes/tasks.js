const express = require('express');
const pool = require('../models/database');

const router = express.Router();

// GET all tasks for current user
// 🚀 OPTIMIZED: GET tasks with pagination and filtering
router.get('/', async (req, res) => {
    try {
      const {
        page = 1,        // Which page (default: 1)
        limit = 25,      // Tasks per page (default: 25)
        status,          // Filter by status (optional)
        priority,        // Filter by priority (optional)
        search           // Search in title/description (optional)
      } = req.query;
  
      // 🚀 Validate inputs (prevent bad requests)
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 per page
      const offset = (pageNum - 1) * limitNum;
  
      // 🚀 Build dynamic WHERE clause
      let whereConditions = ['user_id = $1'];
      let queryParams = [req.user.id];
      let paramCount = 1;
  
      // Add status filter if provided
      if (status && status !== 'all') {
        paramCount++;
        whereConditions.push(`status = $${paramCount}`);
        queryParams.push(status);
      }
  
      // Add priority filter if provided
      if (priority && priority !== 'all') {
        paramCount++;
        whereConditions.push(`priority = $${paramCount}`);
        queryParams.push(priority);
      }
  
      // Add search filter if provided
      if (search && search.trim()) {
        paramCount++;
        whereConditions.push(`(title ILIKE $${paramCount} OR description ILIKE $${paramCount})`);
        queryParams.push(`%${search.trim()}%`);
      }
  
      const whereClause = whereConditions.join(' AND ');
  
      // 🚀 Get total count (for pagination info)
      const countQuery = `SELECT COUNT(*) as total FROM tasks WHERE ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const totalTasks = parseInt(countResult.rows[0].total);
  
      // 🚀 Get paginated data
      const dataQuery = `
        SELECT id, title, description, status, priority, created_at
        FROM tasks 
        WHERE ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `;
      
      queryParams.push(limitNum, offset);
      const result = await pool.query(dataQuery, queryParams);
  
      // 🚀 Calculate pagination info
      const totalPages = Math.ceil(totalTasks / limitNum);
  
      // 🚀 Send optimized response
      res.json({
        tasks: result.rows,           // Only 25 tasks (not 2000!)
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalTasks,
          tasksPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });
  
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: error.message });
    }
  });

// CREATE a new task for current user
router.post('/', async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, description, priority, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, priority || 'medium', req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a task (only if owned by current user)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4 WHERE id = $5 AND user_id = $6 RETURNING *',
      [title, description, status, priority, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a task (only if owned by current user)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;