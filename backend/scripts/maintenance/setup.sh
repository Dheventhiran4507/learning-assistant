#!/bin/bash

# TamilEdu AI - Quick Setup Script
# This script sets up both backend and frontend

echo "🚀 TamilEdu AI - Complete Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js v18+${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}⚠️  MongoDB not found. Please install MongoDB${NC}"
    echo "   Installation guide: https://docs.mongodb.com/manual/installation/"
else
    echo -e "${GREEN}✅ MongoDB installed${NC}"
fi

echo ""
echo -e "${BLUE}Setting up Backend...${NC}"
cd backend

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${RED}⚠️  Please edit backend/.env and add your API keys!${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✅ Created logs directory${NC}"

cd ..

echo ""
echo -e "${BLUE}Setting up Frontend...${NC}"
cd frontend

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Create index.html if needed
if [ ! -f index.html ]; then
    echo '<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TamilEdu AI - Learning Assistant</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>' > index.html
    echo -e "${GREEN}✅ Created index.html${NC}"
fi

# Create main.jsx if needed
if [ ! -f src/main.jsx ]; then
    mkdir -p src
    echo "import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)" > src/main.jsx
    echo -e "${GREEN}✅ Created main.jsx${NC}"
fi

# Create index.css if needed
if [ ! -f src/index.css ]; then
    echo '@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Outfit", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}' > src/index.css
    echo -e "${GREEN}✅ Created index.css${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "   1. Edit backend/.env and add your API keys:"
echo "      - ANTHROPIC_API_KEY=your_key_here"
echo "      - MONGODB_URI=mongodb://localhost:27017/tamiledu-ai"
echo "      - JWT_SECRET=your_secret_key"
echo ""
echo "   2. Start MongoDB:"
echo "      $ sudo systemctl start mongod"
echo ""
echo "   3. Start Backend (in one terminal):"
echo "      $ cd backend && npm run dev"
echo ""
echo "   4. Start Frontend (in another terminal):"
echo "      $ cd frontend && npm run dev"
echo ""
echo "   5. Open browser:"
echo "      Frontend: http://localhost:3000"
echo "      Backend:  http://localhost:5000"
echo ""
echo -e "${BLUE}Happy Coding! 🎓${NC}"
