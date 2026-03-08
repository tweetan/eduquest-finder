import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://gbtjordwuluyohegbobe.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdidGpvcmR3dWx1eW9oZWdib2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDIwMzUsImV4cCI6MjA4ODU3ODAzNX0.Fq9WkgjANcStNaal7YjtMINoHh-yQ9Aqzmd7jAuV3PI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
