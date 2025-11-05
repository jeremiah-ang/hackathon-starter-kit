const pool = require('./pool');

const initDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🔧 Initializing database schema...');

    // Create questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        upvotes INTEGER DEFAULT 0,
        is_answered BOOLEAN DEFAULT FALSE
      );
    `);

    // Create answers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        upvotes INTEGER DEFAULT 0
      );
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_created_at 
      ON questions(created_at DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_questions_upvotes 
      ON questions(upvotes DESC);
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_answers_question_id 
      ON answers(question_id);
    `);

    console.log('✅ Database schema initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Database initialization complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
