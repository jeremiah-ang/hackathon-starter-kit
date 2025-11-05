const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Get all questions (with optional sorting)
router.get('/', async (req, res) => {
  try {
    const { sort = 'recent', limit = 50 } = req.query;
    
    let orderBy = 'created_at DESC';
    if (sort === 'popular') {
      orderBy = 'upvotes DESC, created_at DESC';
    } else if (sort === 'unanswered') {
      orderBy = 'is_answered ASC, created_at DESC';
    }

    const result = await pool.query(
      `SELECT q.*, 
              COUNT(a.id) as answer_count
       FROM questions q
       LEFT JOIN answers a ON q.id = a.question_id
       GROUP BY q.id
       ORDER BY ${orderBy}
       LIMIT $1`,
      [limit]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get a single question with answers
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const questionResult = await pool.query(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answersResult = await pool.query(
      'SELECT * FROM answers WHERE question_id = $1 ORDER BY upvotes DESC, created_at ASC',
      [id]
    );

    res.json({
      ...questionResult.rows[0],
      answers: answersResult.rows
    });
  } catch (err) {
    console.error('Error fetching question:', err);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Create a new question
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Question content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ error: 'Question content too long (max 1000 characters)' });
    }

    const result = await pool.query(
      'INSERT INTO questions (content) VALUES ($1) RETURNING *',
      [content.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Upvote a question
router.post('/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE questions SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error upvoting question:', err);
    res.status(500).json({ error: 'Failed to upvote question' });
  }
});

// Add an answer to a question
router.post('/:id/answers', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Answer content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ error: 'Answer content too long (max 2000 characters)' });
    }

    // Check if question exists
    const questionCheck = await pool.query(
      'SELECT id FROM questions WHERE id = $1',
      [id]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Insert answer
    const result = await pool.query(
      'INSERT INTO answers (question_id, content) VALUES ($1, $2) RETURNING *',
      [id, content.trim()]
    );

    // Mark question as answered
    await pool.query(
      'UPDATE questions SET is_answered = TRUE WHERE id = $1',
      [id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating answer:', err);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

// Upvote an answer
router.post('/:questionId/answers/:answerId/upvote', async (req, res) => {
  try {
    const { answerId } = req.params;

    const result = await pool.query(
      'UPDATE answers SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
      [answerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error upvoting answer:', err);
    res.status(500).json({ error: 'Failed to upvote answer' });
  }
});

module.exports = router;
