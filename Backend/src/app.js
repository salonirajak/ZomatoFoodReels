// create server

const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food-partner.routes');
const cors = require('cors');
const path = require('path');

// Initialize in-memory storage mode
const db = require('./db/db');
setTimeout(() => {
    // This will be set after the database connection attempt
    console.log('In-memory storage mode:', db.getUseInMemory() ? 'ENABLED' : 'DISABLED');
}, 5000);

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  next();
});

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log body after parsing
app.use((req, res, next) => {
  console.log('Parsed body:', req.body);
  next();
});

// Configure CORS with more specific options
const corsOptions = {
    origin: ['http://localhost:5173' ],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
};

// Apply CORS middleware before any routes
app.use(cors(corsOptions));

// The cors middleware already handles preflight requests

// Configure cookie parser with secret if available
const cookieParserSecret = process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'default-secret';
app.use(cookieParser(cookieParserSecret));

// Additional debug middleware after cookie parser
app.use((req, res, next) => {
  console.log('Cookies after cookieParser:', req.cookies);
  next();
});

// Serve uploads directory statically with proper configuration
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

app.get("/", (req,res)=>{
    res.send("Hello from Zomato backend server");
});

app.use('/api/auth',authRoutes);
app.use('/api/food',foodRoutes);
app.use('/api/food-partner', foodPartnerRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

module.exports = app