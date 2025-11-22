const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper: Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, loginId, role } = req.body;

    // 1. STRICT VALIDATION (As per Wireframe)
    // Check Login ID Length (6-12 chars)
    if (loginId.length < 6 || loginId.length > 12) {
      return res.status(400).json({ message: 'Login ID must be between 6-12 characters' });
    }

    // Check Password Complexity (>8 chars, 1 Upper, 1 Lower, 1 Special)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be >8 chars, contain 1 Uppercase, 1 Lowercase, and 1 Special Character' 
      });
    }

    // 2. CHECK DUPLICATES
    const userExists = await User.findOne({ $or: [{ email }, { loginId }] });
    if (userExists) {
      return res.status(400).json({ message: 'User with this Email or Login ID already exists' });
    }

    // 3. HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. CREATE USER
    const user = await User.create({
      name,
      email,
      loginId,
      password: hashedPassword,
      role: role || 'STAFF'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    // 1. CHECK USER
    const user = await User.findOne({ loginId });

    // 2. CHECK PASSWORD & RETURN TOKEN
    // The wireframe specifically says "Invalid Login Id or Password" on error
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid Login Id or Password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};