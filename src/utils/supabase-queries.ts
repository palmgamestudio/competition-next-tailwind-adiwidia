import { supabase } from "@/utils/supabase";

export type CategoryRow = {
  id: string | number;
  slug: string;
  category_name: string;
};

export type ProvinceRow = {
  id: string | number;
  slug: string;
  name: string;
  description: string | null;
};

/** Culture row + nested FK embeds matching current Supabase schema */
export type CultureWithRelations = {
  id: string | number;
  slug: string;
  name: string | null;
  content: string | null;
  media_url: string | null;
  location: string | null;
  maps_url: string | null;
  category_id: string | number | null;
  province_id: string | number | null;
  categories?: CategoryRow | CategoryRow[] | null;
  provinces?: ProvinceRow | ProvinceRow[] | null;
};

export const CULTURE_WITH_RELATIONS =
  "id, slug, name, content, media_url, location, maps_url, category_id, province_id, categories(id, slug, category_name), provinces(id, slug, name, description)";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export function cultureCategory(
  row: CultureWithRelations | null | undefined
): CategoryRow | null {
  if (!row) return null;
  return one(row.categories);
}

export function cultureProvince(
  row: CultureWithRelations | null | undefined
): ProvinceRow | null {
  if (!row) return null;
  return one(row.provinces);
}

export async function getCategoryBySlug(slug: string): Promise<CategoryRow> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, category_name")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as CategoryRow;
}

export async function getProvinceBySlug(slug: string): Promise<ProvinceRow> {
  const { data, error } = await supabase
    .from("provinces")
    .select("id, slug, name, description")
    .eq("slug", slug)
    .single();

  if (error) throw error;
  return data as ProvinceRow;
}

export type ProvinceCultureCount = {
  id: string | number;
  province_slug: string;
  province_name: string;
  province_description: string | null;
  total_cultures: number;
};

/** Aggregate provinces that have cultures in a category (replaces missing view). */
export async function listProvincesWithCultureCounts(opts: {
  categorySlug: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: ProvinceCultureCount[]; total: number }> {
  const category = await getCategoryBySlug(opts.categorySlug);

  const { data, error } = await supabase
    .from("cultures")
    .select("id, province_id, provinces(id, slug, name, description)")
    .eq("category_id", category.id);

  if (error) throw error;

  const map = new Map<string, ProvinceCultureCount>();

  for (const row of data ?? []) {
    const province = one(
      (row as { provinces?: ProvinceRow | ProvinceRow[] | null }).provinces
    );
    if (!province?.slug) continue;

    const existing = map.get(province.slug);
    if (existing) {
      existing.total_cultures += 1;
    } else {
      map.set(province.slug, {
        id: province.id,
        province_slug: province.slug,
        province_name: province.name,
        province_description: province.description,
        total_cultures: 1,
      });
    }
  }

  let items = Array.from(map.values()).sort((a, b) =>
    a.province_name.localeCompare(b.province_name, "id")
  );

  const kw = opts.keyword?.trim().toLowerCase();
  if (kw) {
    items = items.filter((item) =>
      item.province_name.toLowerCase().includes(kw)
    );
  }

  const total = items.length;
  const page = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 12;
  const from = (page - 1) * pageSize;

  return { items: items.slice(from, from + pageSize), total };
}
