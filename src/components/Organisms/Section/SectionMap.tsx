'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

type CultureMapRow = {
  maps_url: string | null;
};

/**
 * Mengubah URL Google Maps biasa menjadi URL yang aman untuk iframe.
 *
 * Contoh input dari seeder:
 * https://www.google.com/maps/search/?api=1&query=Lawar%20Bali
 *
 * Hasil:
 * https://www.google.com/maps?q=Lawar%20Bali&output=embed
 */
function toGoogleMapsEmbedUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase();

    const isGoogleMapsHost =
      hostname === 'google.com' ||
      hostname.endsWith('.google.com') ||
      hostname === 'maps.google.com';

    if (!isGoogleMapsHost || !url.pathname.startsWith('/maps')) {
      return null;
    }

    // URL-nya sudah berbentuk embed.
    if (
      url.pathname.startsWith('/maps/embed') ||
      url.searchParams.get('output') === 'embed'
    ) {
      return url.toString();
    }

    // Format yang digunakan oleh data seeder:
    // /maps/search/?api=1&query=...
    const query = url.searchParams.get('query') ?? url.searchParams.get('q');

    if (query?.trim()) {
      const embedUrl = new URL('https://www.google.com/maps');
      embedUrl.searchParams.set('q', query.trim());
      embedUrl.searchParams.set('output', 'embed');

      return embedUrl.toString();
    }

    // Mendukung URL Google Maps berbentuk /maps/place/Nama+Tempat/...
    const placeMatch = url.pathname.match(/^\/maps\/place\/([^/]+)/);

    if (placeMatch?.[1]) {
      const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      const embedUrl = new URL('https://www.google.com/maps');
      embedUrl.searchParams.set('q', place);
      embedUrl.searchParams.set('output', 'embed');

      return embedUrl.toString();
    }

    return null;
  } catch {
    return null;
  }
}

export default function SectionMap() {
  const params = useParams<{
    category: string;
    province: string;
    culture_slug: string;
  }>();

  const category = params?.category;
  const cultureSlug = params?.culture_slug;
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchMap() {
      if (category !== 'kuliner' || !cultureSlug) {
        if (isMounted) {
          setEmbedSrc(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      const { data, error } = await supabase
        .from('cultures')
        .select('maps_url')
        .eq('slug', cultureSlug)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        console.error('Gagal mengambil lokasi budaya:', error.message);
        setEmbedSrc(null);
        setIsLoading(false);
        return;
      }

      const row = data as CultureMapRow | null;

      setEmbedSrc(toGoogleMapsEmbedUrl(row?.maps_url ?? null));
      setIsLoading(false);
    }

    void fetchMap();

    return () => {
      isMounted = false;
    };
  }, [category, cultureSlug]);

  if (category !== 'kuliner' || isLoading || !embedSrc) return null;

  return (
    <section className="section-map section-mt-gap" aria-label="Peta lokasi budaya">
      <iframe
        className="map-content"
        src={embedSrc}
        title="Lokasi budaya di Google Maps"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </section>
  );
}
