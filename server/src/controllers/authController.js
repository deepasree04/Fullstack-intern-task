const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { getJwtSecret } = require('../config');

// Basic email regex for format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Helper to generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/auth/register
 * Register a new user
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();

    // Check if user already exists
    const existingUser = await db('users').where({ email: normalizedEmail }).first();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcryptjs
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert user into SQLite
    const [insertedId] = await db('users').insert({
      name: trimmedName,
      email: normalizedEmail,
      password_hash
    });

    // Fetch newly created user record (excluding password_hash)
    const newUser = await db('users')
      .where({ id: insertedId })
      .select('id', 'name', 'email', 'created_at')
      .first();

    // Generate JWT
    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Log in an existing user
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Retrieve user by normalized email
    const user = await db('users').where({ email: normalizedEmail }).first();
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT
    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Retrieve the currently authenticated user
 */
async function getMe(req, res, next) {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'name', 'email', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe
};
