# MCP (Model Context Protocol) Integration Guide

This starter kit comes pre-configured with MCP (Model Context Protocol) servers to enhance your development experience and application capabilities.

## What is MCP?

Model Context Protocol (MCP) is a standardized protocol for connecting AI models with external tools, data sources, and services. It enables AI assistants to interact with databases, APIs, and other resources in a structured way.

## Configured MCP Servers

### 1. PostgreSQL MCP Server (Local)

**Container**: `postgres-mcp`  
**Port**: 3001  
**URL**: `http://localhost:3001`

The local PostgreSQL MCP server provides structured access to your database through the MCP protocol. This allows AI assistants and tools to:
- Query database schema
- Execute safe queries
- Manage data through a standardized interface

**Configuration**:
- Connection string: `postgresql://postgres:postgres@localhost:5432/qanda`
- Running in a separate Docker container
- Automatically starts with the devcontainer

**Usage Example**:
```javascript
// In your code, you can use the MCP client to interact with the database
const mcpClient = require('@modelcontextprotocol/client');
const client = new mcpClient.MCPClient({
  url: process.env.MCP_POSTGRES_URL
});

// Example query through MCP
const result = await client.query({
  type: 'sql',
  query: 'SELECT * FROM questions LIMIT 10'
});
```

### 2. Playwright MCP Server (Remote)

**URL**: `https://playwright-mcp.modelcontextprotocol.io`  
**Environment Variable**: `MCP_PLAYWRIGHT_URL`

Provides browser automation capabilities through the Playwright framework:
- Automated testing
- Web scraping
- UI interaction testing
- Screenshot capture
- Page navigation

**Use Cases**:
- Automated end-to-end testing
- Generating screenshots for documentation
- Testing the Q&A platform's frontend
- Crawling web content for Q&A submissions

### 3. Context7 MCP Server (Remote)

**URL**: `https://context7-mcp.modelcontextprotocol.io`  
**Environment Variable**: `MCP_CONTEXT7_URL`

Provides context and state management capabilities:
- Session management
- Context persistence
- State synchronization
- User preference storage

**Use Cases**:
- Managing user sessions in the Q&A platform
- Storing anonymous user preferences
- Maintaining conversation context
- Tracking question/answer relationships

### 4. Sentry MCP Server (Remote)

**URL**: `https://sentry-mcp.modelcontextprotocol.io`  
**Environment Variable**: `MCP_SENTRY_URL`

Provides error tracking and monitoring capabilities:
- Error logging
- Performance monitoring
- Issue tracking
- Alert management

**Use Cases**:
- Tracking application errors
- Monitoring API performance
- Setting up alerts for critical issues
- Analyzing error patterns

## Configuration

### DevContainer Configuration

The MCP servers are configured in `.devcontainer/docker-compose.yml`:

```yaml
environment:
  - MCP_POSTGRES_URL=http://localhost:3001
  - MCP_PLAYWRIGHT_URL=https://playwright-mcp.modelcontextprotocol.io
  - MCP_CONTEXT7_URL=https://context7-mcp.modelcontextprotocol.io
  - MCP_SENTRY_URL=https://sentry-mcp.modelcontextprotocol.io
```

### MCP Configuration File

See `.devcontainer/mcp-config.json` for the complete MCP server configuration.

## Using MCP Servers in Your Application

### 1. Install MCP Client (if needed)

```bash
npm install @modelcontextprotocol/client
```

### 2. Initialize MCP Client

```javascript
const { MCPClient } = require('@modelcontextprotocol/client');

const mcpServers = {
  postgres: new MCPClient({ url: process.env.MCP_POSTGRES_URL }),
  playwright: new MCPClient({ url: process.env.MCP_PLAYWRIGHT_URL }),
  context7: new MCPClient({ url: process.env.MCP_CONTEXT7_URL }),
  sentry: new MCPClient({ url: process.env.MCP_SENTRY_URL })
};
```

### 3. Make Requests

```javascript
// Example: Using Playwright MCP for testing
const testResult = await mcpServers.playwright.execute({
  action: 'navigate',
  url: 'http://localhost:3000',
  screenshot: true
});

// Example: Using Sentry MCP for error logging
await mcpServers.sentry.logError({
  error: new Error('Something went wrong'),
  context: {
    route: '/api/questions',
    method: 'POST'
  }
});
```

## Advanced MCP Usage

### Creating Custom MCP Tools

You can create custom MCP tools specific to your Q&A platform:

```javascript
// src/mcp/question-analyzer.js
const { MCPTool } = require('@modelcontextprotocol/sdk');

class QuestionAnalyzer extends MCPTool {
  async analyzeQuestion(questionText) {
    // Use MCP to analyze question sentiment, detect duplicates, etc.
    const sentiment = await this.client.analyze({
      text: questionText,
      type: 'sentiment'
    });
    
    return {
      sentiment: sentiment.score,
      duplicateCheck: await this.checkDuplicates(questionText),
      suggestedTags: await this.generateTags(questionText)
    };
  }
}
```

### MCP Middleware for Express

```javascript
// src/middleware/mcp.js
const mcpMiddleware = (mcpClient) => {
  return async (req, res, next) => {
    req.mcp = mcpClient;
    next();
  };
};

// In src/index.js
app.use(mcpMiddleware(mcpServers));

// Now you can use req.mcp in your routes
app.post('/api/questions', async (req, res) => {
  const analysis = await req.mcp.postgres.query({
    type: 'insert',
    table: 'questions',
    data: req.body
  });
  res.json(analysis);
});
```

## Troubleshooting

### MCP Server Not Responding

1. Check if the server is running:
   ```bash
   docker-compose ps
   curl http://localhost:3001/health
   ```

2. Check logs:
   ```bash
   docker-compose logs postgres-mcp
   ```

3. Restart the service:
   ```bash
   docker-compose restart postgres-mcp
   ```

### Authentication Issues

If remote MCP servers require authentication:

1. Add credentials to `.env`:
   ```
   MCP_PLAYWRIGHT_API_KEY=your-api-key
   MCP_CONTEXT7_TOKEN=your-token
   MCP_SENTRY_DSN=your-dsn
   ```

2. Update the MCP client initialization to include credentials.

### Network Issues

If you can't reach remote MCP servers:

1. Check your internet connection
2. Verify firewall settings
3. Try using a proxy if behind corporate firewall

## Security Best Practices

1. **Never commit API keys** to the repository
2. **Use environment variables** for sensitive configuration
3. **Implement rate limiting** for MCP API calls
4. **Monitor usage** to prevent abuse
5. **Validate all data** before sending to MCP servers

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [PostgreSQL MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/postgres)
- [Playwright MCP Documentation](https://playwright.dev/mcp)

## Future Enhancements

Consider adding these MCP integrations:

- **Translation MCP**: Multi-language support for questions
- **Moderation MCP**: Content filtering and spam detection
- **Analytics MCP**: Advanced usage analytics
- **Search MCP**: Enhanced search capabilities

---

For more information about using this starter kit, see the main [README.md](README.md).
