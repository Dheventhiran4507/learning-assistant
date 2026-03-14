# 🚀 Quick Start Guide - Vidal
## Complete Setup in 10 Minutes!
This guide will help you get the complete Vidal platform running on your local machine.

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ **Node.js v18+** - [Download](https://nodejs.org/)
- ✅ **MongoDB v6+** - [Download](https://www.mongodb.com/try/download/community)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **Code Editor** (VS Code recommended)
- ✅ **Anthropic API Key** - [Get Free Key](https://console.anthropic.com/)

---

## 🎯 Option 1: Automated Setup (Recommended)

### Step 1: Navigate to Project
```bash
cd tamiledu-ai-fullstack
```

### Step 2: Run Setup Script
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Step 3: Configure Environment
```bash
cd backend
nano .env  # or use any text editor

# Add your keys:
ANTHROPIC_API_KEY=your-actual-api-key-here
MONGODB_URI=mongodb://localhost:27017/tamiledu-ai
JWT_SECRET=my-super-secret-key-12345
```

### Step 4: Start MongoDB
```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# On macOS
brew services start mongodb-community

# On Windows
net start MongoDB

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 5: Seed Database (Optional but Recommended)
```bash
cd backend
node ../scripts/seedDatabase.js
```

This creates sample data including:
- 3 Anna University subjects (CS3452, CS3491, CS3492)
- 2 test student accounts
- Syllabus with topics and units

### Step 6: Start Backend
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
📊 Environment: development
```

### Step 7: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Step 8: Access Application
Open browser and go to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Step 9: Access Application
Open browser and go to:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

### Step 10: Test Login
The system **automatically creates** a default admin on the first run:
- **Email:** `admin@tamiledu.com`
- **Password:** `AdminPassword123!`
- **Portal:** Staff Portal (`/staff-login`)

For sample student data, use:
- **Email:** `rajesh@annauniv.edu`
- **Password:** `password123`
- **Portal:** Student Portal (`/login`)

---

## 🛠️ Option 2: Manual Setup

### Backend Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Create environment file
cp .env.example .env

# 3. Edit .env file
# Add your API keys and configuration

# 4. Create logs directory
mkdir logs

# 5. Start server
npm run dev
```

### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Create required files (if not exist)
# index.html, src/main.jsx, src/index.css

# 3. Start development server
npm run dev
```

---

## 🧪 Verify Installation

### Test Backend

```bash
# Health check
curl http://localhost:5000/health

# Expected response:
{
  "status": "OK",
  "timestamp": "2025-02-01T...",
  "uptime": 123.456,
  "environment": "development"
}
```

### Test API Endpoints

```bash
# Register new student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "CS21999",
    "name": "Test Student",
    "email": "test@annauniv.edu",
    "password": "test123",
    "semester": 5,
    "batch": "2021-2025",
    "college": "Anna University"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh@annauniv.edu",
    "password": "password123"
  }'
```

---

## 📱 First-Time Usage

### 1. Register Account
- Go to http://localhost:3000/register
- Fill in details:
  - Student ID (e.g., CS21001)
  - Name
  - Email
  - Password
  - Semester (1-8)
  - Batch year
  - College name

### 2. Login
- Use registered credentials
- JWT token stored automatically

### 3. Explore Features

**Dashboard:**
- View learning statistics
- Check progress in each subject
- See predicted exam scores

**Chat:**
- Ask doubts in Tamil or English
- Voice input available (click mic button)
- Get instant AI responses

**Practice:**
- Generate practice questions
- Track performance
- Get AI feedback

**Analytics:**
- Detailed progress reports
- Weak area identification
- Time tracking

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

**Error:** "MongoNetworkError: connect ECONNREFUSED"

**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use

**Error:** "Port 5000 is already in use"

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Anthropic API Issues

**Error:** "Invalid API key"

**Solution:**
1. Get API key from https://console.anthropic.com/
2. Update `.env` file
3. Restart backend server

### Frontend Not Loading

**Solution:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

---

## 🎓 Testing the Application

### 1. Test Voice Input

- Click microphone button
- Allow browser microphone permissions
- Say: "Explain inheritance in Java"
- Check AI response

### 2. Test Chat

- Type: "MongoDB aggregation எப்படி செய்யலாம்?"
- Verify Tamil-English code-mixing works
- Check response accuracy

### 3. Test Practice

- Navigate to Practice page
- Select subject (CS3452)
- Start practice session
- Answer questions
- View results and feedback

---

## 📊 Sample Data Overview

After seeding, you'll have:

### Subjects
1. **CS3452** - Object Oriented Programming
   - 2 units with topics
   - Important topics marked
   
2. **CS3491** - Database Management Systems
   - ER Model, SQL, Normalization
   
3. **CS3492** - Operating Systems
   - Process Management, Scheduling

### Students
1. **Rajesh Kumar** (CS21001)
   - Email: rajesh@annauniv.edu
   - Password: password123
   
2. **Priya Devi** (CS21002)
   - Email: priya@annauniv.edu
   - Password: password123

---

## 🌐 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main UI |
| Backend API | http://localhost:5000 | REST API |
| Health Check | http://localhost:5000/health | Server status |
| MongoDB | mongodb://localhost:27017 | Database |

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/tamiledu-ai

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# AI Service
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
```

---

## 🚀 Next Steps

After successful setup:

1. **Customize**: Edit content, add more subjects
2. **Extend**: Add new features based on requirements
3. **Test**: Write unit tests for critical functions
4. **Deploy**: Follow deployment guide in README.md
5. **Present**: Prepare demo for HOD/viva

---

## 📞 Need Help?

- **Documentation:** Check main README.md
- **API Docs:** See `/docs/API.md`
- **Architecture:** See `/docs/ARCHITECTURE.md`
- **Issues:** Create issue on GitHub

---

## ✅ Success Checklist

- [ ] Node.js and MongoDB installed
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] MongoDB running
- [ ] Database seeded
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can login with test credentials
- [ ] Chat working with AI responses
- [ ] Voice input functional

---

**You're all set! 🎉**

Start building amazing features and ace your final year project presentation!

**Pro Tip:** Read the main README.md for detailed architecture explanations and HOD viva preparation guide.
