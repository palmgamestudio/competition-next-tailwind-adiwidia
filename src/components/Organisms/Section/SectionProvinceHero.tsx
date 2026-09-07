'use client';

import 'swiper/css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';

import SectionHero from '@/components/Organisms/Section/SectionHero';
import ButtonCustom from '@/components/Atoms/Button/ButtonCustom';
import CardCulture from '@/components/Molecules/Card/CardCulture';
import { convertSlug } from '@/utils/convert-slug';
import { supabase } from '@/utils/supabase';
import {
  CULTURE_WITH_RELATIONS,
  getCategoryBySlug,
  getProvinceBySlug,
  type CultureWithRelations,
} from '@/utils/supabase-queries';

type CultureRow = CultureWithRelations;

export default function SectionProvinceHero() {
  const pathname = usePathname();
  const { category, province } = useParams<{ category: string; province: string }>();

  // Human-readable text untuk heading/subtitle
  const categoryParam = useMemo(() => convertSlug({ slug: category || '' }), [category]);
  const provinceParam = useMemo(() => convertSlug({ slug: province || '' }), [province]);

  // UI states
  const [search, setSearch] = useState<string>('');
  const [items, setItems] = useState<CultureRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const hasMore = items.length < total;

  const getTitle = (row: CultureRow) => row.name || '';
  const getImage = (row: CultureRow) => row.media_url || '/image/destination/destination-1.png';
  const getLocation = (row: CultureRow) => row.location || province;

  const fetchCultures = useCallback(
    async (opts?: { reset?: boolean; keyword?: string }) => {
      if (!category || !province) return;

      try {
        setLoading(true);
        setErrorMsg('');

        const currentPage = opts?.reset ? 1 : page;
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;
        const kw = (opts?.keyword ?? search).trim();

        const [cat, prov] = await Promise.all([
          getCategoryBySlug(category),
          getProvinceBySlug(province),
        ]);

        if (!cat || !prov) {
          setItems([]);
          setTotal(0);
          setErrorMsg(
            !cat
              ? `Kategori “${category}” tidak ditemukan.`
              : `Provinsi “${province}” tidak ditemukan.`
          );
          return;
        }

        let query = supabase
          .from('cultures')
          .select(CULTURE_WITH_RELATIONS, { count: 'exact' })
          .eq('category_id', cat.id)
          .eq('province_id', prov.id)
          .order('name', { ascending: true, nullsFirst: false })
          .range(from, to);

        if (kw) {
          query = query.or(`name.ilike.%${kw}%,location.ilike.%${kw}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        setTotal(count ?? 0);
        if (opts?.reset) {
          setItems((data ?? []) as CultureRow[]);
          setPage(1);
        } else {
          setItems((prev) => [...prev, ...((data ?? []) as CultureRow[])]);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Gagal memuat data.');
        }
      } finally {
        setLoading(false);
      }
    },
    [category, province, page, pageSize, search]
  );

  useEffect(() => {
    setItems([]);
    setTotal(0);
    setPage(1);
    fetchCultures({ reset: true });
  }, [category, province, fetchCultures]);

  useEffect(() => {
    if (page > 1) fetchCultures();
  }, [page, fetchCultures]);

  const onSubmitSearch = ({ searchValue }: { searchValue: string }) => {
    setSearch(searchValue);
    setItems([]);
    setTotal(0);
    setPage(1);
    fetchCultures({ reset: true, keyword: searchValue });
  };

  const onLoadMore = () => {
    if (!loading && hasMore) setPage(p => p + 1);
  };

  return (
    <SectionHero
      icon="/image/icon/map/map-primary.svg"
      subtitle={`Jelajahi ${categoryParam} Budaya di ${provinceParam}`}
      headline={`Menemukan Keunikan ${categoryParam} Indonesia dari ${provinceParam}`}
      description={`Adiwidia menghadirkan ${categoryParam} khas dari ${provinceParam} dalam sajian digital interaktif yang memudahkan Anda mengenal budaya setempat lebih dekat dan bermakna.`}
      search={search}
      placeholder={`Cari ${categoryParam}`}
      onSubmitAction={onSubmitSearch}
    >
      <>
        <section className="section-culture section-content-gap">
          {errorMsg && (
            <div className="text-red-600 text-sm mb-3">{errorMsg}</div>
          )}

          <div className="section-content">
            {items.map((row) => (
              <CardCulture
                key={row.id}
                redirect={`${pathname}/${row.slug}`}
                image={getImage(row)}
                title={getTitle(row)}
                location={getLocation(row)}
              />
            ))}

            {loading && items.length === 0 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-36" />
                ))}
              </>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <ButtonCustom
              style={hasMore ? 'button-primary' : 'button-blank'}
              label={
                loading && items.length > 0
                  ? `Memuat…`
                  : hasMore
                  ? `Lebih Banyak ${categoryParam}`
                  : `Semua ${categoryParam.toLowerCase()} sudah ditampilkan`
              }
              onClick={onLoadMore}
              disabled={!hasMore || loading}
            />
          </div>

          <p className="mt-3 text-center text-sm text-gray-500">
            Menampilkan {items.length} dari {total} entri
            {search ? ` untuk “${search}”` : ''}.
          </p>
        </section>
      </>
    </SectionHero>
  );
}
