'use client';

import 'swiper/css';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';

import SectionHero from '@/components/Organisms/Section/SectionHero';
import CardProvince from '@/components/Molecules/Card/CardProvince';
import ButtonCustom from '@/components/Atoms/Button/ButtonCustom';
import { convertSlug } from '@/utils/convert-slug';
import {
  listProvincesWithCultureCounts,
  type ProvinceCultureCount,
} from '@/utils/supabase-queries';

export default function SectionCategoryHero() {
  const pathname = usePathname();
  const { category } = useParams<{ category: string }>();
  const categoryParam = useMemo(
    () => convertSlug({ slug: category || '' }),
    [category]
  );

  const [search, setSearch] = useState<string>('');
  const [items, setItems] = useState<ProvinceCultureCount[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(12);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const hasMore = items.length < total;
  const prevSearchRef = useRef<string>('');

  const fetchProvinces = useCallback(
    async (opts?: { reset?: boolean; keyword?: string }) => {
      if (!category) return;

      try {
        setLoading(true);
        setErrorMsg('');

        const currentPage = opts?.reset ? 1 : page;
        const keyword = opts?.keyword ?? search;

        const { items: rows, total: count } =
          await listProvincesWithCultureCounts({
            categorySlug: category,
            keyword,
            page: currentPage,
            pageSize,
          });

        setTotal(count);
        if (opts?.reset) {
          setItems(rows);
          setPage(1);
        } else {
          setItems((prev) => [...prev, ...rows]);
        }
      } catch (err: unknown) {
        setErrorMsg(
          err instanceof Error ? err.message : 'Failed to load provinces.'
        );
      } finally {
        setLoading(false);
      }
    },
    [category, page, pageSize, search]
  );

  useEffect(() => {
    setSearch('');
    setItems([]);
    setTotal(0);
    setPage(1);
    fetchProvinces({ reset: true, keyword: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    if (page > 1) fetchProvinces();
  }, [page, fetchProvinces]);

  useEffect(() => {
    const prev = prevSearchRef.current;
    if (prev !== '' && search === '' && !loading) {
      setItems([]);
      setTotal(0);
      setPage(1);
      fetchProvinces({ reset: true, keyword: '' });
    }
    prevSearchRef.current = search;
  }, [search, loading, fetchProvinces]);

  const onSubmitSearch = ({ searchValue }: { searchValue: string }) => {
    const kw = searchValue.trim();
    setSearch(kw);
    setItems([]);
    setTotal(0);
    setPage(1);
    fetchProvinces({ reset: true, keyword: kw });
  };

  const onLoadMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1);
  };

  return (
    <SectionHero
      icon="/image/icon/open-book/open-book-primary.svg"
      subtitle="Jelajahi Kekayaan Budaya Nusantara"
      headline={`Menemukan Pesona ${categoryParam} Indonesia Dalam Satu Tempat`}
      description={`Adiwidia menghadirkan ragam ${categoryParam} Indonesia yang dikemas secara digital, interaktif, dan mudah diakses, agar budaya tetap hidup dan dikenal oleh generasi sekarang.`}
      search={search}
      onChangeSearch={setSearch}
      onSubmitAction={onSubmitSearch}
      placeholder="Cari provinsi"
      searchIcon="search"
      searchDisabled={loading}
    >
      <>
        <section className="section-province section-content-gap">
          {errorMsg && (
            <div className="text-red-600 text-sm mb-3">{errorMsg}</div>
          )}

          <div className="section-content">
            {items.map((row) => (
              <CardProvince
                key={row.id ?? row.province_slug}
                redirect={`${pathname}/${row.province_slug}`}
                title={row.province_name}
                description={row.province_description || ''}
                totalData={row.total_cultures}
              />
            ))}

            {loading && items.length === 0 && (
              <>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-gray-100 h-28"
                  />
                ))}
              </>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <ButtonCustom
              style={hasMore ? 'button-primary' : 'button-blank'}
              label={
                loading && items.length > 0
                  ? 'Memuat...'
                  : hasMore
                  ? 'Lebih Banyak Provinsi'
                  : 'Semua provinsi sudah ditampilkan'
              }
              onClick={onLoadMore}
              disabled={!hasMore || loading}
            />
          </div>

          <p className="mt-3 text-center text-sm text-gray-500">
            Menampilkan {items.length} dari {total} provinsi
            {search ? ` untuk pencarian “${search}”` : ''}.
          </p>
        </section>
      </>
    </SectionHero>
  );
}
