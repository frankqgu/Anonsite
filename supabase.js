import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://uvqfjikflmxvccdgbkjk.supabase.co"
const supabaseAnonKey = "sb_publishable_cC4jJE8I7st2JUwlKdOHTg_AK7EbIwv"


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
