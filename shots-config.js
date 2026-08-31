/**
 * Brighton Shot Tracker — Supabase project settings.
 * Replace the URL and anon key after creating the project and running supabase/schema.sql.
 * PIN is access-gating only, not real security. Do not build per-coach attribution on it.
 */
window.SHOTS_CONFIG = {
  pitch: { width: 68, length: 105 },
  storageKey: "brighton-varsity-shot-tracker",
  supabaseUrl: "https://sczdnalqmymhdornhkbn.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjemRuYWxxbXltaGRvcm5oa2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MjQwMzcsImV4cCI6MjEwMzIwMDAzN30.g9k7wW3GUvmfqBsxVKinwXVbHD3mWYqGeHhENG0tyrw",
  pin: "KEPPA"
};
