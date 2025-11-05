# Hackathon Starter Kit

A complete starter kit for building a live anonymous Q&A platform with DevContainer support, PostgreSQL, MCP servers, and real-time WebSocket communication.

## Features

- 🐳 **DevContainer Setup**: Fully configured development environment with Docker
- 🗄️ **PostgreSQL Database**: Separate container for database management
- 🔌 **MCP Integration**: Pre-configured Model Context Protocol servers:
  - **postgres-mcp**: Local PostgreSQL MCP server
  - **playwright-mcp**: Browser automation and testing
  - **context7-mcp**: Context management
  - **sentry-mcp**: Error tracking and monitoring
- 🚀 **Express.js Backend**: RESTful API with WebSocket support
- 💬 **Real-time Q&A**: Anonymous question submission and answering with live updates
- 🎨 **Modern Frontend**: Clean, responsive UI with real-time updates
- ⚡ **Socket.IO**: Real-time bidirectional communication

## Architecture

```
.
├── .devcontainer/
│   ├── devcontainer.json       # Dev container configuration
│   ├── docker-compose.yml      # Multi-container setup
│   ├── Dockerfile              # App container definition
│   └── mcp-config.json         # MCP servers configuration
├── src/
│   ├── db/
│   │   ├── pool.js             # PostgreSQL connection pool
│   │   └── init.js             # Database initialization script
│   ├── routes/
│   │   └── questions.js        # Questions API endpoints
│   ├── index.js                # Main application entry point
│   └── websocket.js            # WebSocket handlers
├── public/
│   ├── index.html              # Frontend UI
│   ├── app.js                  # Frontend JavaScript
│   └── styles.css              # Styling
├── package.json                # Node.js dependencies
└── README.md                   # This file
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/jeremiah-ang/hackathon-starter-kit.git
   cd hackathon-starter-kit
   ```

2. **Open in DevContainer**
   - Open the folder in VS Code
   - Click "Reopen in Container" when prompted
   - Or use Command Palette (F1) → "Dev Containers: Reopen in Container"

3. **Initialize the database**
   ```bash
   npm run init-db
   ```

4. **Seed with sample data (optional)**
   ```bash
   npm run seed-db
   ```

5. **Start the application**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api/questions
   - Health: http://localhost:3000/health

### Manual Setup (Without DevContainer)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL**
   - Install PostgreSQL locally or use Docker
   - Create a database named `qanda`
   - Update `DATABASE_URL` in `.env`

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database**
   ```bash
   npm run init-db
   ```

5. **Seed sample data (optional)**
   ```bash
   npm run seed-db
   ```

6. **Start the application**
   ```bash
   npm run dev
   ```

## API Endpoints

### Questions

- `GET /api/questions` - Get all questions
  - Query params: `sort` (recent, popular, unanswered), `limit` (default: 50)
- `GET /api/questions/:id` - Get a specific question with answers
- `POST /api/questions` - Create a new question
  - Body: `{ "content": "Your question" }`
- `POST /api/questions/:id/upvote` - Upvote a question

### Answers

- `POST /api/questions/:id/answers` - Add an answer to a question
  - Body: `{ "content": "Your answer" }`
- `POST /api/questions/:questionId/answers/:answerId/upvote` - Upvote an answer

### WebSocket Events

#### Client → Server
- `new-question` - Submit a new question
- `new-answer` - Submit a new answer
- `upvote-question` - Upvote a question
- `upvote-answer` - Upvote an answer

#### Server → Client
- `connected` - Connection established
- `question-added` - New question was added
- `answer-added` - New answer was added
- `question-upvoted` - Question upvote count updated
- `answer-upvoted` - Answer upvote count updated
- `error` - Error occurred

## Database Schema

### Questions Table
```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  upvotes INTEGER DEFAULT 0,
  is_answered BOOLEAN DEFAULT FALSE
);
```

### Answers Table
```sql
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  upvotes INTEGER DEFAULT 0
);
```

## MCP Servers

This starter kit is pre-configured with several MCP servers:

### Local MCP Servers
- **postgres-mcp** (Port 3001): Direct database access via MCP protocol

### Remote MCP Servers
- **playwright-mcp**: Browser automation for testing
- **context7-mcp**: Context and state management
- **sentry-mcp**: Error tracking and monitoring

Configuration is located in `.devcontainer/mcp-config.json`.

## Development

### Available Scripts

- `npm start` - Start the application in production mode
- `npm run dev` - Start with nodemon for auto-reload
- `npm run init-db` - Initialize database schema
- `npm run seed-db` - Seed database with sample data
- `npm run reset-db` - Reset database (init + seed)
- `npm test` - Run tests (placeholder)

### Environment Variables

See `.env.example` for all available configuration options.

### Adding New Features

1. **API Endpoints**: Add routes in `src/routes/`
2. **WebSocket Events**: Update `src/websocket.js`
3. **Database Tables**: Modify `src/db/init.js`
4. **Frontend**: Update files in `public/`

## Docker Containers

The DevContainer setup includes three containers:

1. **app**: Node.js application container
2. **postgres**: PostgreSQL 16 database
3. **postgres-mcp**: MCP server for PostgreSQL access

All containers are networked together for seamless communication.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this starter kit for your hackathon projects!

## Support

For issues or questions, please open an issue on GitHub.

---

**Happy Hacking! 🚀**