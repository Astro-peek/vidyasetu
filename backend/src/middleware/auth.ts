import type { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Middleware to extract and verify the Supabase JWT from the Authorization header
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;

  if (!token) {
    (req as any).user = null;
    next();
    return;
  }

  try {
    // ── Demo role simulation ──
    if (token.startsWith('demo-')) {
      const role = token.replace('demo-', '');
      (req as any).user = { 
        id: `demo-user-${role}`, 
        profile: { role, full_name: `Demo ${role.toUpperCase()}`, phone: '0000000000', state: 'Demo', preferred_language: 'en' }, 
        app_metadata: { role } 
      };
      next();
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      res.status(401).json({ success: false, message: 'Invalid or expired session', error: { code: 'UNAUTHORIZED' } });
      return;
    }
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name, phone, state, preferred_language')
      .eq('id', data.user.id)
      .maybeSingle();
    if (profileError || !profile) {
      res.status(403).json({ success: false, message: 'Account profile is not ready', error: { code: 'PROFILE_REQUIRED' } });
      return;
    }
    (req as any).user = { ...data.user, profile, app_metadata: { ...data.user.app_metadata, role: profile.role } };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session', error: { code: 'UNAUTHORIZED' } });
  }
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!(req as any).user) {
    res.status(401).json({ success: false, message: 'Authentication required', error: { code: 'UNAUTHORIZED' } });
    return;
  }
  next();
}

// Role-based access middleware
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    const userRole = user?.profile?.role;
    if (!user || !roles.includes(userRole)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions', error: { code: 'FORBIDDEN' } });
      return;
    }
    next();
  };
}

// Central error handler
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  console.error('[ERROR]', err.message, err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: { code: 'INTERNAL_ERROR' }
  });
}
