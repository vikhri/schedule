import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Session = {
  id: string;
  title: string;
  type: 'theory' | 'practical';
  date_start: string;
  date_end: string | null;
  teachers: string;
  folder_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Link = {
  id: string;
  title: string;
  url: string;
  category: 'important' | 'materials';
  order_index: number;
  created_at: string;
  updated_at: string;
};
