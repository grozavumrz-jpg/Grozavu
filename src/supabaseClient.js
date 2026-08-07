import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://burbjohohiriiihpqokoc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cmJqb2hvaGlyaWlocHFva29jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwNTU0MzEsImV4cCI6MjEwMTYzMTQzMX0.jN7--MxLDN3g_FrckGkg1vUxaQWk4BbES5jrnKViPAE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
