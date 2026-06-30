import { createClient } from "@supabase/supabase-js";

const SB_URL = "https://xftaqbjpkrveohvmsmvx.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmdGFxYmpwa3J2ZW9odm1zbXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTEwNzcsImV4cCI6MjA5Nzk4NzA3N30.sRw63kEMk7VrEIhhGkGQ-NqwAqh7QeJMSILZiF7DtM4";

export const db = createClient(SB_URL, SB_KEY);