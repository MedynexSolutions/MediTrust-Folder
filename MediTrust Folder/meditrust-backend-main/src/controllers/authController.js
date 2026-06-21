import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'meditrust_secret',
    { expiresIn: '30d' }
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage || ''
});

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const userExists = await User.findOne({
      email: email.toLowerCase()
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'patient',
      profileImage: profileImage || ''
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Google Login via Supabase
export const googleLogin = async (req, res) => {
  try {
    const { idToken, access_token, role } = req.body;
    const token = access_token || idToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Supabase access token is required'
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Supabase token'
      });
    }

    const email = data.user.email?.toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Supabase user has no email'
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          email.split('@')[0],
        email,
        password: Math.random().toString(36).substring(2, 15),
        role: role || 'patient',
        profileImage: data.user.user_metadata?.avatar_url || ''
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: formatUser(user)
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login'
    });
  }
};

// Current User
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
