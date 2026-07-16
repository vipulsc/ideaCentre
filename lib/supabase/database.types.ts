export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string;
          idea_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          idea_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          idea_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_idea_id_fkey";
            columns: ["idea_id"];
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
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
      comment_likes: {
        Row: {
          comment_id: string;
          created_at: string;
          user_id: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey";
            columns: ["comment_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          deleted_at: string | null;
          id: string;
          idea_id: string;
          like_count: number;
          parent_id: string | null;
          updated_at: string;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          idea_id: string;
          like_count?: number;
          parent_id?: string | null;
          updated_at?: string;
        };
        Update: {
          author_id?: string;
          body?: string;
          created_at?: string;
          deleted_at?: string | null;
          id?: string;
          idea_id?: string;
          like_count?: number;
          parent_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_idea_id_fkey";
            columns: ["idea_id"];
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
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
          insights: Json | null;
          like_count: number;
          music_track: string | null;
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
          insights?: Json | null;
          like_count?: number;
          music_track?: string | null;
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
          insights?: Json | null;
          like_count?: number;
          music_track?: string | null;
          status?: "published" | "removed";
          title?: string;
          updated_at?: string;
          view_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "ideas_author_id_fkey";
            columns: ["author_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ideas_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      likes: {
        Row: {
          created_at: string;
          idea_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          idea_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          idea_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "likes_idea_id_fkey";
            columns: ["idea_id"];
            referencedRelation: "ideas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          image: string | null;
          name: string | null;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          image?: string | null;
          name?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          image?: string | null;
          name?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      consume_rate_limit: {
        Args: {
          p_key: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
        }[];
      };
      toggle_idea_like: {
        Args: {
          p_user_id: string;
          p_idea_id: string;
        };
        Returns: {
          is_liked: boolean;
          like_count: number;
        }[];
      };
      toggle_idea_bookmark: {
        Args: {
          p_user_id: string;
          p_idea_id: string;
        };
        Returns: {
          is_bookmarked: boolean;
        }[];
      };
      toggle_comment_like: {
        Args: {
          p_user_id: string;
          p_comment_id: string;
        };
        Returns: {
          is_liked: boolean;
          like_count: number;
        }[];
      };
    };
    Enums: {
      idea_status: "published" | "removed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
