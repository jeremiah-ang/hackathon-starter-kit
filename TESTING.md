# Testing Guide

## Testing the Devcontainer Setup

### 1. Testing with VS Code DevContainer

1. Open this repository in VS Code
2. Install the "Dev Containers" extension
3. Press F1 and select "Dev Containers: Reopen in Container"
4. Wait for the containers to build and start
5. Once inside the container, run:
   ```bash
   npm run init-db
   npm run dev
   ```
6. Open http://localhost:3000 in your browser

### 2. Testing with Docker Compose (Manual)

```bash
# Start the services
cd .devcontainer
docker-compose up -d

# Check services are running
docker-compose ps

# Access the app container
docker-compose exec app bash

# Inside the container:
npm install
npm run init-db
npm run dev

# Stop services
docker-compose down
```

### 3. Testing the API Endpoints

#### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-11-05T05:44:18.401Z"
}
```

#### Create a Question
```bash
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{"content": "What is the best programming language?"}'
```

Expected response:
```json
{
  "id": 1,
  "content": "What is the best programming language?",
  "created_at": "2024-11-05T05:44:18.401Z",
  "upvotes": 0,
  "is_answered": false
}
```

#### Get All Questions
```bash
curl http://localhost:3000/api/questions
```

#### Get a Specific Question
```bash
curl http://localhost:3000/api/questions/1
```

#### Upvote a Question
```bash
curl -X POST http://localhost:3000/api/questions/1/upvote
```

#### Add an Answer
```bash
curl -X POST http://localhost:3000/api/questions/1/answers \
  -H "Content-Type: application/json" \
  -d '{"content": "JavaScript is versatile and widely used!"}'
```

#### Upvote an Answer
```bash
curl -X POST http://localhost:3000/api/questions/1/answers/1/upvote
```

### 4. Testing WebSocket Connection

Open the browser console at http://localhost:3000 and run:

```javascript
// Check socket connection
socket.connected // Should return true

// Submit a question via WebSocket
socket.emit('new-question', { content: 'How do WebSockets work?' });

// Listen for new questions
socket.on('question-added', (data) => {
  console.log('New question:', data);
});
```

### 5. Testing MCP Servers

The devcontainer includes configurations for the following MCP servers:

#### Local MCP Server (postgres-mcp)
```bash
# Check if postgres-mcp is running
curl http://localhost:3001/health || echo "MCP server endpoint"
```

#### Remote MCP Servers
The following URLs are configured in environment variables:
- Playwright MCP: https://playwright-mcp.modelcontextprotocol.io
- Context7 MCP: https://context7-mcp.modelcontextprotocol.io
- Sentry MCP: https://sentry-mcp.modelcontextprotocol.io

### 6. Database Testing

```bash
# Connect to PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/qanda

# Run queries
SELECT * FROM questions;
SELECT * FROM answers;

# Check schema
\dt
\d questions
\d answers
```

### 7. Frontend Testing

1. Navigate to http://localhost:3000
2. Test the following:
   - [ ] Submit a new question
   - [ ] View the list of questions
   - [ ] Click on a question to view details
   - [ ] Submit an answer to a question
   - [ ] Upvote a question
   - [ ] Upvote an answer
   - [ ] Check real-time updates (open in two browser windows)
   - [ ] Verify connection status indicator shows "Connected"

### 8. Load Testing

```bash
# Install Apache Bench (if not already installed)
apt-get update && apt-get install -y apache2-utils

# Test API endpoint performance
ab -n 1000 -c 10 http://localhost:3000/api/questions
```

## Common Issues

### Issue: Containers won't start
**Solution**: Check Docker is running and you have enough resources allocated

### Issue: Database connection fails
**Solution**: Wait for PostgreSQL to be fully initialized (check with `docker-compose logs postgres`)

### Issue: Port already in use
**Solution**: Change the port in `.env` or stop the conflicting service

### Issue: MCP servers not accessible
**Solution**: Check network connectivity and verify MCP server configurations

## Continuous Testing

For development, keep the application running with:
```bash
npm run dev
```

This uses nodemon for automatic restart on file changes.
