'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

type CultureRow = {
  slug: string;
  maps_url?: string | null;
};

export default function SectionMap() {
  const { category, culture_slug } = useParams<{
    category: string;
    province: string;
    culture_slug: string;
  }>();

  const [embedSrc, setEmbedSrc] = useState<string | null>(null);

  const fetchMap = useCallback(async () => {
    const { data, error } = await supabase
      .from('cultures')
      .select('maps_url')
      .eq('slug', culture_slug)
      .single();

    if (error || !data) {
      setEmbedSrc(null);
      return;
    }

    const row = data as CultureRow;
    setEmbedSrc(row.maps_url || null);
  }, [culture_slug]);

  useEffect(() => {
    fetchMap();
  }, [fetchMap]);

  if (category !== 'destinasi-budaya' || !embedSrc) return null;

  return (
      <section className="section-map section-mt-gap">
        <iframe
            className="map-content"
            src={embedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
  );
}