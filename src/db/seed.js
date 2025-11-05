const pool = require('./pool');

const sampleQuestions = [
  {
    content: "What's the best way to learn JavaScript?",
    upvotes: 5
  },
  {
    content: "How do I get started with React?",
    upvotes: 3
  },
  {
    content: "What are the benefits of using TypeScript?",
    upvotes: 8
  },
  {
    content: "How does async/await work in JavaScript?",
    upvotes: 12
  },
  {
    content: "What's the difference between SQL and NoSQL?",
    upvotes: 6
  }
];

const sampleAnswers = [
  {
    question_id: 1,
    content: "Start with the basics on MDN Web Docs, then practice building small projects. FreeCodeCamp and JavaScript.info are also excellent resources.",
    upvotes: 3
  },
  {
    question_id: 1,
    content: "I'd recommend combining theoretical learning with practical projects. Try Eloquent JavaScript book and build something real!",
    upvotes: 2
  },
  {
    question_id: 2,
    content: "The official React tutorial is great! After that, try building a todo app or a simple blog to understand the concepts better.",
    upvotes: 4
  },
  {
    question_id: 4,
    content: "Async/await is syntactic sugar over Promises. It makes asynchronous code look and behave more like synchronous code, making it easier to read and maintain.",
    upvotes: 7
  }
];

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database with sample data...');

    // Clear existing data
    await client.query('TRUNCATE TABLE answers, questions RESTART IDENTITY CASCADE');
    console.log('  Cleared existing data');

    // Insert questions
    for (const question of sampleQuestions) {
      await client.query(
        'INSERT INTO questions (content, upvotes) VALUES ($1, $2)',
        [question.content, question.upvotes]
      );
    }
    console.log(`  Inserted ${sampleQuestions.length} sample questions`);

    // Insert answers
    for (const answer of sampleAnswers) {
      await client.query(
        'INSERT INTO answers (question_id, content, upvotes) VALUES ($1, $2, $3)',
        [answer.question_id, answer.content, answer.upvotes]
      );
    }
    console.log(`  Inserted ${sampleAnswers.length} sample answers`);

    // Update is_answered status
    await client.query(`
      UPDATE questions 
      SET is_answered = TRUE 
      WHERE id IN (SELECT DISTINCT question_id FROM answers)
    `);
    console.log('  Updated answered status');

    console.log('✅ Database seeded successfully');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    throw err;
  } finally {
    client.release();
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding complete');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
