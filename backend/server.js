const express = require('express');
const session = require('express-session');
const passport = require('passport');
const PgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const compression = require('compression');
const pool = require('./models/database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Compression middleware
app.use(compression({
  level: 6,        // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses larger than 1KB
}));

// CORS configuration for production
const allowedOrigins = NODE_ENV === 'production' 
  ? [
      'http://ec2-3-129-45-165.us-east-2.compute.amazonaws.com',
      'https://ec2-3-129-45-165.us-east-2.compute.amazonaws.com'
    ]
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Session configuration for production
app.use(session({
  store: new PgSession({
    pool: pool,
    tableName: 'user_sessions'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true,
    sameSite: NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Your existing home route
app.get('/', (req, res) => {
  console.log('GET / request received');
  res.json({ message: 'Server is running!' });
});

// Auth routes (login/logout)
app.use('/auth', require('./routes/auth'));

// Middleware to protect API routes
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Protected task routes (your existing CRUD functions, now with auth)
app.use('/api/tasks', requireAuth, require('./routes/tasks'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});