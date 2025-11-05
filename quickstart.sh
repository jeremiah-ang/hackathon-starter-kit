#!/bin/bash

# Hackathon Starter Kit - Quick Start Script
# This script helps you get started quickly with the development environment

set -e

echo "🚀 Hackathon Starter Kit - Quick Start"
echo "======================================"
echo ""

# Check if we're in a devcontainer
if [ -f "/.dockerenv" ]; then
    echo "✅ Running inside DevContainer"
    IN_CONTAINER=true
else
    echo "⚠️  Not running in DevContainer"
    echo "   For best experience, open in VS Code and select 'Reopen in Container'"
    IN_CONTAINER=false
fi

echo ""
echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Checking database connection..."
if [ "$IN_CONTAINER" = true ]; then
    # Wait for PostgreSQL to be ready
    until pg_isready -h postgres -U postgres > /dev/null 2>&1; do
        echo "Waiting for PostgreSQL..."
        sleep 2
    done
    echo "✅ PostgreSQL is ready"
    
    echo ""
    echo "Step 3: Initializing database..."
    npm run init-db
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Run 'npm run dev' to start the development server"
    echo "  2. Open http://localhost:3000 in your browser"
    echo "  3. Check out TESTING.md for testing instructions"
    echo ""
else
    echo ""
    echo "⚠️  Skipping database initialization (not in container)"
    echo ""
    echo "To complete setup:"
    echo "  1. Make sure PostgreSQL is running"
    echo "  2. Update DATABASE_URL in .env"
    echo "  3. Run 'npm run init-db' to initialize the database"
    echo "  4. Run 'npm run dev' to start the server"
    echo ""
fi

echo "📚 Documentation:"
echo "  - README.md: Full documentation"
echo "  - TESTING.md: Testing guide"
echo "  - .env.example: Configuration options"
echo ""
echo "Happy hacking! 🎉"
