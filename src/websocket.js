const pool = require('./db/pool');

const setupWebSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    // Send initial connection confirmation
    socket.emit('connected', { 
      message: 'Connected to Q&A platform',
      socketId: socket.id 
    });

    // Handle new question event
    socket.on('new-question', async (data) => {
      try {
        const { content } = data;
        
        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Question content is required' });
          return;
        }

        const result = await pool.query(
          'INSERT INTO questions (content) VALUES ($1) RETURNING *',
          [content.trim()]
        );

        // Broadcast to all connected clients
        io.emit('question-added', result.rows[0]);
      } catch (err) {
        console.error('Error creating question via WebSocket:', err);
        socket.emit('error', { message: 'Failed to create question' });
      }
    });

    // Handle new answer event
    socket.on('new-answer', async (data) => {
      try {
        const { questionId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Answer content is required' });
          return;
        }

        const result = await pool.query(
          'INSERT INTO answers (question_id, content) VALUES ($1, $2) RETURNING *',
          [questionId, content.trim()]
        );

        // Mark question as answered
        await pool.query(
          'UPDATE questions SET is_answered = TRUE WHERE id = $1',
          [questionId]
        );

        // Broadcast to all connected clients
        io.emit('answer-added', {
          ...result.rows[0],
          question_id: questionId
        });
      } catch (err) {
        console.error('Error creating answer via WebSocket:', err);
        socket.emit('error', { message: 'Failed to create answer' });
      }
    });

    // Handle upvote events
    socket.on('upvote-question', async (data) => {
      try {
        const { questionId } = data;

        const result = await pool.query(
          'UPDATE questions SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
          [questionId]
        );

        if (result.rows.length > 0) {
          io.emit('question-upvoted', result.rows[0]);
        }
      } catch (err) {
        console.error('Error upvoting question via WebSocket:', err);
        socket.emit('error', { message: 'Failed to upvote question' });
      }
    });

    socket.on('upvote-answer', async (data) => {
      try {
        const { answerId } = data;

        const result = await pool.query(
          'UPDATE answers SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
          [answerId]
        );

        if (result.rows.length > 0) {
          io.emit('answer-upvoted', result.rows[0]);
        }
      } catch (err) {
        console.error('Error upvoting answer via WebSocket:', err);
        socket.emit('error', { message: 'Failed to upvote answer' });
      }
    });

    socket.on('disconnect', () => {
      console.log('👤 User disconnected:', socket.id);
    });
  });
};

module.exports = { setupWebSocket };
