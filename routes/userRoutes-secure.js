// server/routes/userRoutes-secure.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware-secure');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, university, branch, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      university: university || '',
      branch: branch || '',
      role: role || 'student'
    });

    const savedUser = await newUser.save();

    // Create session (no token needed)
    req.session.userId = savedUser._id;
    req.session.userRole = savedUser.role;

    // Return user data (no password)
    const userData = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      university: savedUser.university,
      branch: savedUser.branch,
      role: savedUser.role,
      createdAt: savedUser.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userData
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session
    req.session.userId = user._id;
    req.session.userRole = user.role;

    // Return user data (no password, no token)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      university: user.university,
      branch: user.branch,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    
    res.clearCookie('engineerConnect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user (check session)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // User is already attached by authMiddleware
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      university: req.user.university,
      branch: req.user.branch,
      role: req.user.role,
      createdAt: req.user.createdAt
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, university, branch } = req.body;
    const userId = req.user._id;

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, university, branch },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      university: updatedUser.university,
      branch: updatedUser.branch,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    };

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

// Check session status
router.get('/session-status', (req, res) => {
  const isAuthenticated = !!(req.session && req.session.userId);
  res.json({ 
    authenticated: isAuthenticated,
    sessionId: req.session?.id || null
  });
});

module.exports = router;
