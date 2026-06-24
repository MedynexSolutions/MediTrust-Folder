import { supabase } from '../config/supabase.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Validate Supabase token
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        console.error('Supabase token validation error:', error);
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
      }

      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'patient',
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
      };

      return next();
    } catch (error) {
      console.error('Token validation error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export default protect;
