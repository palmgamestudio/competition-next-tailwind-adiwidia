export interface MuseumScene {
  id: number;
  name: string;
  slug: string;
  panorama_url: string;
  description?: string | null;
  ai_context?: string | null;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
}

export type MuseumSceneListItem = Pick<
  MuseumScene,
  | "id"
  | "name"
  | "slug"
  | "panorama_url"
  | "description"
  | "ai_context"
  | "sort_order"
>;
