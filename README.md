# EduPrime Portal — Smart Student Portal Management System

EduPrime Portal is a complete, production-quality full-stack student management application. It provides an intuitive interface for students to check statistics (attendance, grades, timetable, fees, etc.), submit coursework assignments, apply for academic leaves, report administrative complaints, and chat with an intelligent contextual AI assistant (EduBot) populated with real database stats.

---

## Technical Stack Overview

- **Frontend**: React.js (bundled with Vite), Tailwind CSS for default dark styling theme, React Router Dom, Recharts (for charts), Lucide React (vector icons), Axios (HTTP Client).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB Atlas via Mongoose ODM.
- **Security**: JWT-based authorization header authentication, CORS configured origins, BCrypt password hashing.

---

## Directory Structure

```text
eduprime-portal/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── models.js        # Mongoose database schemas
│   ├── middleware.js    # JWT authorization and role checks
│   ├── routes.js        # Auth, Dashboard, and AI Assistant endpoints
│   ├── seed.js          # MongoDB seeding script
│   ├── server.js        # Server configurations, CORS & Preflights
│   └── package.json
├── frontend/
│   ├── .env
│   ├── .env.example
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── index.css
│       ├── App.jsx
│       ├── context/
│       │   └── AuthContext.jsx   # Auth provider, Light/Dark theme toggles
│       ├── services/
│       │   └── api.js           # Central axios configuration
│       ├── components/
│       │   ├── Sidebar.jsx      # Left sidebar navigation links
│       │   ├── Navbar.jsx       # Global Search, theme toggles, bell notices
│       │   └── Layout.jsx       # Route shell layout frame
│       └── pages/
│           ├── Login.jsx        # Login, validators
│           ├── Dashboard.jsx    # CGPA & stats charts, schedules lists
│           ├── Analytics.jsx    # Grade distribution, average bar compare
│           ├── Announcements.jsx# Cards, category filters
│           ├── Attendance.jsx   # Monthly calendar heatmap tracker
│           ├── Grades.jsx       # Card tab reports
│           ├── Timetable.jsx    # Grid block planner
│           ├── Assignments.jsx  # Submission upload panels
│           ├── CourseMaterials.5# Grouped resource downloads
│           ├── Placements.jsx   # Placement register toggles
│           ├── Events.jsx       # RSVPs, seat availability decrements
│           ├── Leave.jsx        # Applications form, logs table
│           ├── Helpdesk.jsx     # complaint tickets panels
│           ├── Fees.jsx         # Pay mock checkout modal, invoices download
│           ├── DigitalID.jsx    # QR badge mock visualizer
│           ├── AIChat.jsx       # Chat bot messages, quick trigger replies
│           └── Profile.jsx      # settings edit popups
└── README.md
```

---

## System Requirements

1. **Node.js** (v18 or higher recommended)
2. **MongoDB** (Local instance running at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

---

## Setting Up and Running the Application

### 1. Database Seeding

First, ensure your MongoDB service is running (or verify the `MONGO_URI` inside `backend/.env`).
Navigate to the `backend` directory and run:

```bash
cd backend
npm install
npm run seed
```

This clears the database collections and seeds realistic demo data:
- **Student User**: `arjun@eduprime.edu` (Password: `password123`)
- **Faculty User**: `sneha.roy@eduprime.edu` (Password: `password123`)
- **Admin User**: `admin@eduprime.edu` (Password: `password123`)

### 2. Run Backend API Server

Within the `backend` folder, execute:

```bash
# Start server in watch mode via nodemon
npm run dev

# Or start standard production server
npm start
```

The backend server will launch at `http://localhost:5000/api`.

### 3. Run Frontend Web App

Open a new terminal, navigate to the `frontend` directory, and run:

```bash
cd frontend
npm install
npm run dev
```

The Vite client server runs at `http://localhost:5173`. Open this URL in your web browser.

---

## Verification and Testing

1. **Theme Switcher**: Click the Sun/Moon icon in the top navbar to toggle colors. It instantly sets state variables and switches CSS classes.
2. **Dynamic Checkout**: Navigate to the **Fee Status** page and click "Pay Now" to clear outstanding dues. The list updates instantly.
3. **AI Chatbot (EduBot)**: Try typing "attendance" or "pending assignments", or click the suggestion chips at the bottom. The bot reads live database records of `Arjun Mehta` to respond contextually.
