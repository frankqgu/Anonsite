import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://jsidasxyybtcziztzehm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzaWRhc3h5eWJ0Y3ppenR6ZWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzIyMjIsImV4cCI6MjA3NTM0ODIyMn0.8dDibyEWi1hvd-2qEWVAejpTsul16Wx87QXmQA1EEO0"


export const supabase = createClient(supabaseUrl, supabaseAnonKey);
