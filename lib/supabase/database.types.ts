export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      ideas: {
        Row: {
          author_id: string;
          background_color: string | null;
          category_id: string | null;
          comment_count: number;
          created_at: string;
          description: string | null;
          id: string;
          idea: string;
          like_count: number;
          status: "published" | "removed";
          title: string;
          updated_at: string;
          view_count: number;
        };
        Insert: {
          author_id: string;
          background_color?: string | null;
          category_id?: string | null;
          comment_count?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          idea: string;
          like_count?: number;
          status?: "published" | "removed";
          title: string;
          updated_at?: string;
          view_count?: number;
        };
        Update: {
          author_id?: string;
          background_color?: string | null;
          category_id?: string | null;
          comment_count?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          idea?: string;
          like_count?: number;
          status?: "published" | "removed";
          title?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      idea_status: "published" | "removed";
    };
    CompositeTypes: Record<string, never>;
  };
};
