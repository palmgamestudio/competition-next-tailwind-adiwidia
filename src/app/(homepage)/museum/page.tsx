import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Museum Virtual Tour 360 Adiwidia - Budaya Inovasi Digital",
  openGraph: {
    title: "Museum Virtual Tour 360 Adiwidia - Budaya Inovasi Digital",
  },
};

async function getFirstPublishedSlug(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("museum_scenes")
    .select("slug")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data?.slug) return null;
  return data.slug as string;
}

export default async function MuseumIndexPage() {
  const slug = await getFirstPublishedSlug();

  if (slug) {
    redirect(`/museum/${slug}`);
  }

  return (
    <main className="main">
      <div className="container section-pb-gap section-top-hero">
        <h1 className="text-2xl font-semibold mb-3">Museum Virtual Tour 360</h1>
        <p className="text-dark/60 mb-6">
          Belum ada ruang museum yang dipublikasikan. Silakan kembali nanti atau
          jelajahi koleksi 3D.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="button-primary">
            Beranda
          </Link>
          <Link href="/collection" className="button-secondary">
            Koleksi 3D
          </Link>
        </div>
      </div>
    </main>
  );
}
