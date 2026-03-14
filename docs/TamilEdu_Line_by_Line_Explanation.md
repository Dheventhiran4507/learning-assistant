# 📖 Full Line-by-Line Code Explanation (Tamil)

Intha document-la unga project-oda ovvoru code line-kum pakkathula athu enna pannuthu nu Tamil-la explanation irukkum.

---

## 🏗️ 1. Backend: Models (`backend/models/`)

### 📄 Student.js
Student-oda profile and progress save panna use aakura model.

```javascript
const mongoose = require('mongoose'); // Mongoose library-a load pannuthu
const bcrypt = require('bcryptjs'); // Password-a safe-a encrypt panna use aakum

const studentSchema = new mongoose.Schema({ // Puthu schema structure-a define pannuthu
    // Personal Information
    studentId: { // Student-oda unique ID
        type: String, // Text format-la irukkum
        required: [true, 'Student ID is required'], // Ithu kandippa venum
        unique: true, // Oru ID orutharukku thaan irukkanum
        trim: true // Space-a remove pannum
    },
    name: { // Student name
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: { // Email address
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true, // Ellam small letters-a mathum
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'] // Email format check pannum
    },
    password: { // Login password
        type: String,
        required: [true, 'Password is required'],
        minlength: 6, // Minimum 6 characters venum
        select: false // Database-la irunthu edukkum pothu password-a automatica kaattaathu
    },
    // ... academic fields (department, semester, batch, college) ...
    preferredLanguage: { // Entha language-la padikka ishtam
        type: String,
        enum: ['en', 'ta', 'mixed'], // En, Ta, Mixed mattum thaan allow pannum
        default: 'mixed' // Onnum sollala na 'mixed' nu edukkum
    },
    learningStats: { // Student-oda learning statistics
        totalDoubtsCleared: { type: Number, default: 0 }, // Ethana doubts clear pannuranga
        totalPracticeHours: { type: Number, default: 0 }, // Ethana mani neram practice pannuranga
        syllabusProgress: { type: Number, default: 0, min: 0, max: 100 } // Syllabus ethana % mudichu irukkanga
    },
    // ... subjectProgress and weakAreas arrays ...
    role: { // User-oda role (student, admin, etc.)
        type: String,
        enum: ['student', 'hod', 'parent', 'admin'],
        default: 'student'
    }
}, { timestamps: true }); // CreatedAt and UpdatedAt-a automatica save pannum

// Index for faster queries
studentSchema.index({ studentId: 1, email: 1 }); // Search speed-a athigam panna Indexing pannuthu

// Hash password before saving
studentSchema.pre('save', async function(next) { // Data save aakura munnadi intha code run aakum
    if (!this.isModified('password')) return next(); // Password change aakala na apdiye vitrum
    const salt = await bcrypt.genSalt(10); // Random "Salt" create pannuthu encryption-kaka
    this.password = await bcrypt.hash(this.password, salt); // Password-a puriyatha mathiri mathuthu
    next(); // Adutha step-ku pookum
});

// Method to compare passwords
studentSchema.methods.comparePassword = async function(candidatePassword) { // Password check panna function
    return await bcrypt.compare(candidatePassword, this.password); // Rendu password-um match aakutha nu paakum
};

const Student = mongoose.model('Student', studentSchema); // Schema-va "Student" model-a mathuthu
module.exports = Student; // Intha file-a vera file-la use panna allow pannuthu
```

### 📄 Syllabus.js
Anna University syllabus details-a store panna use aakura model.

```javascript
const mongoose = require('mongoose'); // Library import

const syllabusSchema = new mongoose.Schema({
    subjectCode: { type: String, required: true, unique: true, index: true }, // AE345 mathiri code
    subjectName: { type: String, required: true }, // Subject name
    regulation: { type: String, default: 'R2021' }, // Syllabus version
    semester: { type: Number, required: true, min: 1, max: 8 }, // Endha semester
    units: [{ // 5 Units list
        unitNumber: { type: Number, required: true }, // Unit 1, 2, etc.
        unitTitle: { type: String, required: true }, // Unit title
        topics: [{ // Antha unit-kulla irukkura topics
            topicName: { type: String, required: true }, // Topic name
            subtopics: [String], // Athukulla irukkura chinna chinna parts
            difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' } // Level
        }]
    }]
}, { timestamps: true });

// Static method to get all topics
syllabusSchema.statics.getAllTopics = async function(subjectCode) { // Subject code anuppuna ellam topic-um edukkum
    const syllabus = await this.findOne({ subjectCode }); // DB-la theedum
    if (!syllabus) return []; // Illa na empty list kudukkum
    // ... logic to extract topics ...
    return topics;
};

const Syllabus = mongoose.model('Syllabus', syllabusSchema); // Convert to model
module.exports = Syllabus; // Export
```

### 📄 Question.js
AI generate panna questions-a save pannum "Question Bank".

```javascript
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    subjectCode: { type: String, required: true, index: true, uppercase: true }, // Subject link
    unit: { type: Number, required: true, index: true }, // Unit mapping
    topic: { type: String, required: true }, // Topic mapping
    type: { type: String, enum: ['mcq', 'descriptive'], default: 'mcq' }, // MCQ or Essay
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    question: { type: String, required: true }, // Original question text
    options: [{ type: String }], // Optional answers list
    correctAnswer: { type: String, required: true }, // Sariyana pathil
    explanation: { type: String }, // Pathil-ukku explanation
    aiGenerated: { type: Boolean, default: true } // AI create pannucha nu track pannum
}, { timestamps: true });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
```

---

## 🛣️ 2. Backend: Controllers (`backend/controllers/`)

### 📄 authController.js
Login and Registration logic-a handle pannuthu.

```javascript
const Student = require('../models/Student'); // Student model-a edukkum
const jwt = require('jsonwebtoken'); // Security Token-kaka use aakum
const logger = require('../utils/logger'); // Activity log panna

const generateToken = (id) => { // ID-a vechu Token create panna function
    return jwt.sign({ id }, process.env.JWT_SECRET, { // Secret-a vechu sign pannum
        expiresIn: process.env.JWT_EXPIRE || '7d' // 7 days-ku token valid-a irukkum
    });
};

exports.register = async (req, res) => { // Registration function
    try {
        const { studentId, name, email, password, ...rest } = req.body; // User anuppunatha edukkum

        // Check if student already exists
        const existingStudent = await Student.findOne({ $or: [{ email }, { studentId }] }); // DB-la paakum
        if (existingStudent) { // Iruntha reject pannum
            return res.status(400).json({ success: false, message: 'Student already exists' });
        }

        // Create new student
        const student = await Student.create({ studentId, name, email, password, ...rest }); // DB-la save pannum

        const token = generateToken(student._id); // Token create pannum
        res.status(201).json({ success: true, data: { student, token } }); // Student-ku response anuppum
    } catch (error) {
        res.status(500).json({ success: false, error: error.message }); // Ethavathu error aana solluum
    }
};

exports.login = async (req, res) => { // Login function
    try {
        const { email, password } = req.body; // Email/Password edukkum
        const student = await Student.findOne({ email }).select('+password'); // DB-la theedi password-aiyum edukkum

        if (!student || !(await student.comparePassword(password))) { // Match aakala na...
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(student._id); // Token create pannum
        res.status(200).json({ success: true, data: { student, token } }); // Success response
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
```

### 📄 syllabusController.js
Syllabus data-va fetch panna use aakum.

```javascript
const Syllabus = require('../models/Syllabus'); // Model import

exports.getSyllabusBySemester = async (req, res) => { // Semester-a vechu syllabus edukka
    try {
        const { semester } = req.params; // Semester number-a URL-la irunthu edukkum
        const localSyllabus = await Syllabus.find({ semester: parseInt(semester) }); // DB-la theedum
        
        // ... merging with external API logic ...
        
        res.json({ success: true, data: localSyllabus }); // Data-va anuppum
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getSubjectDetails = async (req, res) => { // Oru subject-oda full details (Units) edukka
    try {
        const { subjectCode } = req.params; // Subject code path (eg: CS3391)
        const syllabus = await Syllabus.findOne({ subjectCode }); // DB-la theedum
        if (!syllabus) return res.status(404).json({ message: 'Not found' }); // Illa na "Not found"
        res.json({ success: true, data: syllabus }); // Found na details anuppum
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
```

---

## 🛣️ 3. Backend: Routes (`backend/routes/`)

### 📄 authRoutes.js
Login/Register URL mapping.

```javascript
const express = require('express');
const router = express.Router(); // Router instance create pannuthu
const authController = require('../controllers/authController'); // Controller link pannuthu
const { protect } = require('../middleware/auth'); // Security middleware

router.post('/register', authController.register); // Register endpoint
router.post('/login', authController.login); // Login endpoint
router.get('/me', protect, authController.getMe); // Profile endpoint (Requires Login)
router.put('/profile', protect, authController.updateProfile); // Update profile (Requires Login)

module.exports = router;
```

---

## 🎨 4. Frontend: Core Integration (`frontend/src/`)

### 📄 App.jsx
Entire website-oda routing and layout root.

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Routing tools
import { useAuthStore } from './store/authStore'; // Login status monitor panna
import Navbar from './components/Navbar'; // Header component
import PrivateRoute from './components/PrivateRoute'; // Protected page security

function App() {
  const { isAuthenticated } = useAuthStore(); // User login panni irukara nu true/false edukkum

  return (
    <Router> {/* Website-a oru Router-kulla poduthu */}
      <div className="min-h-screen text-gray-900"> {/* Full page styling */}
        {isAuthenticated && <Navbar />} {/* Login aagi iruntha mattum top Navbar kaatum */}

        <Routes> {/* Ellam URL list-um inga thaan irukum */}
          {/* Oru URL-ku entha Page component open aakanum nu define pannuthu */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/practice" element={<PrivateRoute><PracticePage /></PrivateRoute>} />
          
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}
```

### 📄 authStore.js (Zustand State)
Global data-va manage pannum.

```javascript
import { create } from 'zustand'; // Zustand library
import { persist } from 'zustand/middleware'; // Data-va browser refresh pannalum save panni vekka

export const useAuthStore = create( // "authStore" create pannuthu
  persist(
    (set, get) => ({
      user: null, // Current user profile object
      token: null, // Security token
      isAuthenticated: false, // Login state

      login: (userData, token) => { // User login pannum pothu intha data-va store pannum
        set({ user: userData, token, isAuthenticated: true });
      },

      logout: () => { // Logout pannum pothu ellathaiyum clear pannum
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (userData) => { // Profile details refresh aana update pannum
        set((state) => ({ user: { ...state.user, ...userData } }));
      }
    }),
    { name: 'auth-storage' } // LocalStorage-la entha name-la save aakanum nu solluthu
  )
);
```

---

## 📄 5. Frontend: Pages (`frontend/src/pages/`)

### 📄 DashboardPage.jsx
Student login panna udane vara main page.

```javascript
import { useState, useEffect } from 'react'; // React state and side-effects handles
import { useAuthStore } from '../store/authStore'; // User data context
import api from '../services/api'; // API calling tool

const DashboardPage = () => {
    const { user, updateUser } = useAuthStore(); // Global store-la irunthu user-a edukkum
    const [stats, setStats] = useState(null); // Local-a data-va store panna
    const [loading, setLoading] = useState(true); // Loading animation-kaka

    useEffect(() => { // Page load aagum pothu intha code run aakum
        const fetchStats = async () => { // Backend-la irunthu data-va edukka
            try {
                const response = await api.get('/students/stats'); // Stats API call pannuthu
                if (response.data.success) { // Success na...
                    setStats(response.data.data); // Data-va save pannuthu
                    updateUser(response.data.data); // Profile-aiyum update pannuthu
                }
            } catch (error) { console.error('Error fetching stats'); }
            finally { setLoading(false); } // Finally loading-a niruthum
        };
        fetchStats();
    }, [updateUser]); // Dependancy array

    return (
        <div className="max-w-7xl mx-auto px-4"> {/* Layout container */}
            <h1>Welcome back, {user?.name}</h1> {/* Student name kaatum */}
            
            {/* Stats Cards Section */}
            <div className="grid grid-cols-3 gap-8">
                <div>Coverage: {stats?.learningStats?.syllabusProgress}%</div> {/* Progress value */}
                <div>Doubts: {stats?.learningStats?.totalDoubtsCleared}</div> {/* Doubt count */}
            </div>

            {/* Semester Selection Dropdown */}
            {/* ... logic to display semesters up to user.semester ... */}
        </div>
    );
};
```

### 📄 PracticePage.jsx
Study session-a conduct pannum core page.

```javascript
import { useState, useEffect } from 'react';
import api from '../services/api'; // Backend interaction
import MathRenderer from '../components/common/MathRenderer'; // For complex formulas

export default function PracticePage() {
    const [session, setSession] = useState(null); // Session details (Questions)
    const [currentIdx, setCurrentIdx] = useState(0); // Current question index
    const [userAnswer, setUserAnswer] = useState(''); // Student select panna pathil

    const startPractice = async () => { // Putha session start panna function
        setStarting(true);
        const res = await api.post('/practice/start', { subjectCode, unit, topic }); // API-ku request anuppum
        if (res.data.success) setSession(res.data.data); // Session questions-a load pannum
    };

    const submitAnswer = async (answer) => { // Pathil-a evaluate panna logic
        const response = await api.post('/practice/submit', { sessionId, questionId, userAnswer: answer }); // Evaluation call
        if (response.data.success) {
            // Update question logic with AI Feedback
            const updated = [...session.questions];
            updated[currentIdx].isCorrect = response.data.data.isCorrect;
            updated[currentIdx].aiFeedback = response.data.data.aiFeedback;
            setSession({ ...session, questions: updated });
        }
    };

    return (
        <div className="container">
            {session ? ( // Session start aagi iruntha question kaatum
                <div>
                    <h3>{session.questions[currentIdx].question}</h3> {/* Question Text */}
                    {session.questions[currentIdx].options.map(opt => ( // MCQ options
                        <button onClick={() => submitAnswer(opt)}>{opt}</button>
                    ))}
                    
                    {/* Feedback area (if answered) */}
                    {session.questions[currentIdx].isCorrect !== null && (
                        <div className="feedback">{session.questions[currentIdx].aiFeedback.explanation}</div>
                    )}
                </div>
            ) : ( // Session start aakala na setup screen kaatum
                <button onClick={startPractice}>Start Igniting Learning</button>
            )}
        </div>
    );
}
```

---

## 🏁 End of Documentation
Illa core logic files and individual pages ippa line-by-line Tamil comments-oda explain pattu irukku. Intha project **MERN stacked AI Learning Assistant**-a full-a epdi work aakuthu nu intha files-a vechu neenga purinjikalam.

Ethavathu specific code line pathi innum clear-a venum na sollunga, na innum simple-a explain panren!
