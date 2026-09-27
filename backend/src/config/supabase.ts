import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const rawUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const url = rawUrl.startsWith('http') ? rawUrl : 'http://localhost:54321';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. Operating with dummy values. DB connectivity will fail.');
}

// Service role client bypasses RLS and should only be used by backend admin functions
export const supabase = createClient(url, key);
