import { supabase } from "@/utils/supabase";
import type { MuseumScene, MuseumSceneListItem } from "@/types/museum";

const LIST_SELECT =
  "id, name, slug, panorama_url, description, ai_context, sort_order";

export async function listPublishedMuseumScenes(): Promise<MuseumSceneListItem[]> {
  const { data, error } = await supabase
    .from("museum_scenes")
    .select(LIST_SELECT)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MuseumSceneListItem[];
}

export async function getPublishedMuseumSceneBySlug(
  slug: string
): Promise<MuseumScene | null> {
  const { data, error } = await supabase
    .from("museum_scenes")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw error;
  return (data as MuseumScene | null) ?? null;
}
