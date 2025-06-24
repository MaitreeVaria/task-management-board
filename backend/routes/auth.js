const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../models/database');

const router = express.Router();

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile:', profile);
    
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [profile.id]
    );

    if (existingUser.rows.length > 0) {
      // User exists, return them
      return done(null, existingUser.rows[0]);
    }

    // Create new user
    const newUser = await pool.query(
      'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *',
      [profile.id, profile.emails[0].value, profile.displayName]
    );

    return done(null, newUser.rows[0]);
  } catch (error) {
    console.error('Auth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, user.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// AUTH ROUTES
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('${process.env.CLIENT_URL}/dashboard');
  }
);

// Logout route
router.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) return next(err);
      // Send JSON response instead of redirect
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });

router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

module.exports = router;