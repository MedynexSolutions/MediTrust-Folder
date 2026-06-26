import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'meditrust_secret', { expiresIn: '30d' });
};

const formatUser = (user) => ({
  id: user.id,
  _id: user.id,
  name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
  email: user.email,
  role: user.user_metadata?.role || 'patient',
  profileImage: user.user_metadata?.avatar_url || user.user_metadata?.profile_image || ''
});

const ALLOWED_ROLES = ['patient', 'doctor', 'pharmacy', 'admin'];

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, profileImage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userRole = (role || 'patient').toLowerCase();
    if (!ALLOWED_ROLES.includes(userRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    // Use Supabase Auth for registration
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          full_name: name,
          role: userRole,
          profile_image: profileImage || ''
        }
      }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ success: false, message: 'Registration failed' });
    }

    // Ensure profile exists in profiles table
    try {
      const profilePayload = {
        user_id: data.user.id,
        role: userRole,
        full_name: name,
        email: email.toLowerCase(),
        onboarding_completed: false
      };

      const { error: upsertErr } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'user_id' });
      if (upsertErr) console.error('Profile upsert error:', upsertErr);
    } catch (err) {
      console.error('Error creating profile:', err?.message || err);
    }

    res.status(201).json({ success: true, token: data.session?.access_token || generateToken(data.user.id), user: formatUser(data.user) });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Use Supabase Auth for login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!data.user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userRole = data.user.user_metadata?.role || 'patient';
    if (role && role.toLowerCase() !== userRole) {
      return res.status(403).json({ success: false, message: 'Role mismatch. Please use the correct role login.' });
    }

    res.json({ success: true, token: data.session?.access_token || generateToken(data.user.id), user: formatUser(data.user) });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// Google Login via Supabase
export const googleLogin = async (req, res) => {
  try {
    const { idToken, access_token, role } = req.body;
    const token = access_token || idToken;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Supabase access token is required' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Invalid Supabase token' });
    }

    // Update user metadata with role if provided
    if (role) {
      const userRole = role.toLowerCase();
      if (!ALLOWED_ROLES.includes(userRole)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }

      await supabase.auth.updateUser({ data: { role: userRole } });

      // upsert profile
      try {
        const profilePayload = {
          user_id: data.user.id,
          role: userRole,
          full_name: data.user.user_metadata?.full_name || data.user.email,
          email: data.user.email,
          onboarding_completed: false
        };
        const { error: upsertErr } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'user_id' });
        if (upsertErr) console.error('Profile upsert error:', upsertErr);
      } catch (err) {
        console.error('Error upserting profile for google user:', err?.message || err);
      }
    }

    res.json({ success: true, token: token, user: formatUser(data.user) });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during Google login' });
  }
};

// Current User
export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    res.json({ success: true, user: formatUser(data.user) });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
