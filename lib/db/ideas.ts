import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type NewIdeaInput = {
  authorId: string;
  categoryId?: string | null;
  title: string;
  idea: string;
  description?: string | null;
  backgroundColor?: string | null;
};

export async function createIdea(input: NewIdeaInput) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ideas")
    .insert({
      author_id: input.authorId,
      category_id: input.categoryId ?? null,
      title: input.title,
      idea: input.idea,
      description: input.description ?? null,
      background_color: input.backgroundColor ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create idea: ${error.message}`);
  }

  return data;
}

export async function listPublishedIdeas() {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load ideas: ${error.message}`);
  }

  return data;
}
