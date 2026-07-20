import { createClient } from '@supabase/supabase-js'
import { Database } from '../database.types'

const DEFAULT_SUPABASE_URL = 'https://mnqswhagbovvffvuccrg.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucXN3aGFnYm92dmZmdnVjY3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MDY4MjUsImV4cCI6MjA4MjA4MjgyNX0.nU2DaoXaVJIVv4JQKJhWXA5asFFeo5FnPHwLe595lyg';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('Utilizando credenciales de respaldo de Supabase en supabase.ts');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
