const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for credentials & explicit frontend URL origins
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Explicit allowed frontend URL range
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploads Directory Statically
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Database Connection Setup
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eduprime';
mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB database.'))
  .catch((err) => {
    console.error('MongoDB database connection error:', err.message);
    console.log('Ensure MongoDB service is running locally or check MONGO_URI in .env');
  });

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Import and use routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Global Error Handler Captured:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`EduPrime backend server is running on port ${PORT}`);
  console.log(`CORS allows frontend requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
