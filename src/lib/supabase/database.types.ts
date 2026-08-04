/**
 * Hand-written types matching supabase/migrations/*.sql until the project
 * is wired to `supabase gen types typescript` in CI (Database Playbook —
 * schema changes ship through reviewed migrations; types should track them).
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          preferred_language: "es" | "en";
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          preferred_language?: "es" | "en";
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          last_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          preferred_language?: "es" | "en";
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
