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
      businesses: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          slug: string;
          logo_url: string | null;
          default_language: "es" | "en";
          currency: string;
          timezone: string;
          country: string | null;
          subscription_plan: string;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name?: string | null;
          slug: string;
          logo_url?: string | null;
          default_language?: "es" | "en";
          currency?: string;
          timezone?: string;
          country?: string | null;
          subscription_plan?: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          legal_name?: string | null;
          slug?: string;
          logo_url?: string | null;
          default_language?: "es" | "en";
          currency?: string;
          timezone?: string;
          country?: string | null;
          subscription_plan?: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          business_id: string | null;
          name: string;
          description: string | null;
          is_system_role: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          name: string;
          description?: string | null;
          is_system_role?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          name?: string;
          description?: string | null;
          is_system_role?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          key: string;
          category: string;
          description: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          category: string;
          description?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          category?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: { role_id: string; permission_id: string };
        Insert: { role_id: string; permission_id: string };
        Update: { role_id?: string; permission_id?: string };
        Relationships: [];
      };
      business_members: {
        Row: {
          id: string;
          business_id: string;
          profile_id: string;
          role_id: string;
          is_owner: boolean;
          is_active: boolean;
          joined_at: string;
          invited_by: string | null;
        };
        Insert: {
          id?: string;
          business_id: string;
          profile_id: string;
          role_id: string;
          is_owner?: boolean;
          is_active?: boolean;
          joined_at?: string;
          invited_by?: string | null;
        };
        Update: {
          id?: string;
          business_id?: string;
          profile_id?: string;
          role_id?: string;
          is_owner?: boolean;
          is_active?: boolean;
          joined_at?: string;
          invited_by?: string | null;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          phone: string | null;
          email: string | null;
          avatar_url: string | null;
          tags: string[];
          is_vip: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          tags?: string[];
          is_vip?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          tags?: string[];
          is_vip?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          channel: string;
          status: string;
          priority: string;
          assigned_to_name: string | null;
          tags: string[];
          unread_count: number;
          ai_summary: string | null;
          sentiment: string | null;
          last_message_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          channel?: string;
          status?: string;
          priority?: string;
          assigned_to_name?: string | null;
          tags?: string[];
          unread_count?: number;
          ai_summary?: string | null;
          sentiment?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          channel?: string;
          status?: string;
          priority?: string;
          assigned_to_name?: string | null;
          tags?: string[];
          unread_count?: number;
          ai_summary?: string | null;
          sentiment?: string | null;
          last_message_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_type: string;
          sender_name: string | null;
          body: string;
          media_url: string | null;
          media_type: string | null;
          is_internal_note: boolean;
          ai_confidence: number | null;
          ai_status: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_type: string;
          sender_name?: string | null;
          body: string;
          media_url?: string | null;
          media_type?: string | null;
          is_internal_note?: boolean;
          ai_confidence?: number | null;
          ai_status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_type?: string;
          sender_name?: string | null;
          body?: string;
          media_url?: string | null;
          media_type?: string | null;
          is_internal_note?: boolean;
          ai_confidence?: number | null;
          ai_status?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_business_with_owner: {
        Args: {
          business_name: string;
          business_slug: string;
          business_default_language?: string;
        };
        Returns: {
          id: string;
          name: string;
          legal_name: string | null;
          slug: string;
          logo_url: string | null;
          default_language: "es" | "en";
          currency: string;
          timezone: string;
          country: string | null;
          subscription_plan: string;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
}
