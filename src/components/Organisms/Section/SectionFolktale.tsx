'use client';

import Title from '@/components/Atoms/Text/Title';
import Description from '@/components/Atoms/Text/Description';
import ButtonCustom from '@/components/Atoms/Button/ButtonCustom';
import InputSearch from '@/components/Atoms/Input/InputSearch';
import { useParams } from 'next/navigation';
import { convertSlug } from '@/utils/convert-slug';
import CardFolktale from '@/components/Molecules/Card/CardFolktale';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabase';

type FolktaleRow = {
  id?: number | string | null;
  slug: string;
  title?: string | null;
  content_text?: string | null;
  content_video_url?: string | null;
  created_at?: string | null;
  province_id?: number | null;
  province_name?: string | null;
  province_description?: string | null;
  province_slug?: string | null;
};

const PAGE_SIZE = 8;

export default function SectionFolktale() {
  // Hanya dipakai untuk judul & membentuk redirect path;
  // data list TIDAK difilter berdasarkan params lagi.
  const { category } = useParams<{ category: string }>();
  const categoryParam = convertSlug({ slug: category || '' });

  const [items, setItems] = useState<FolktaleRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const prevSearchRef = useRef<string>('');
  const hasMore = items.length < total;

  const getTitle = (row: FolktaleRow) => row.title || '';
  const getImage = (row: FolktaleRow) => row.content_video_url || ''; // jika CardFolktale butuh image, sediakan thumbnail di sini
  const getLocation = (row: FolktaleRow) => row.province_name || '';

  const escapeIlike = (kw: string) => kw.replace(/[%_]/g, '\\$&');

  const fetchData = useCallback(
    async (opts?: { reset?: boolean; keyword?: string }) => {
      try {
        setLoading(true);
        setErrorMsg('');

        const currentPage = opts?.reset ? 1 : page;
        const from = (currentPage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const rawKw = (opts?.keyword ?? search).trim();
        const escKw = escapeIlike(rawKw);

        // Ambil semua data dari view (tanpa by category/province)
        let base = supabase
          .from('view_stories_with_province')
          .select('*', { count: 'exact' });

        // Search di kolom yang ada di schema baru
        if (escKw) {
          base = base.or(
            `title.ilike.%${escKw}%,content_text.ilike.%${escKw}%,province_name.ilike.%${escKw}%`
          );
        }

        // Order by title (fallback created_at jika kolom tidak tersedia)
        let { data, error, count } = await base
          .order('title', { ascending: true, nullsFirst: false })
          .range(from, to);

        if (error && ((error as any).code === '42703' || /column .* does not exist/i.test(error.message))) {
          ({ data, error, count } = await base
            .order('created_at', { ascending: false, nullsFirst: true })
            .range(from, to));
        }
        if (error) throw error;

        setTotal(count ?? 0);
        if (opts?.reset) {
          setItems((data ?? []) as FolktaleRow[]);
          setPage(1);
        } else {
          setItems((prev) => [...prev, ...((data ?? []) as FolktaleRow[])]);
        }
      } catch (err: unknown) {
        if (opts?.reset) {
          setItems([]);
          setTotal(0);
        }
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat data cerita rakyat.');
      } finally {
        setLoading(false);
      }
    },
    [page, search]
  );

  // Initial load
  useEffect(() => {
    fetchData({ reset: true, keyword: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load next page
  useEffect(() => {
    if (page > 1) fetchData();
  }, [page, fetchData]);

  // Auto reset saat search dikosongkan (tanpa submit)
  useEffect(() => {
    const prev = prevSearchRef.current;
    if (prev !== '' && search === '' && !loading) {
      setItems([]);
      setTotal(0);
      setPage(1);
      fetchData({ reset: true, keyword: '' });
    }
    prevSearchRef.current = search;
  }, [search, loading, fetchData]);

  const onSubmitSearch = ({ searchValue }: { searchValue: string }) => {
    const kw = searchValue.trim();
    setSearch(kw);
    setItems([]);
    setTotal(0);
    setPage(1);
    fetchData({ reset: true, keyword: kw });
  };

  const onLoadMore = () => {
    if (!loading && hasMore) setPage((p) => p + 1);
  };

  return (
    <section className="section-culture section-content-gap section-mt-gap">
      <div className="section-header">
        <Title label={`Jelajahi ${categoryParam} Serupa yang Memperkaya Warisan Budaya Nusantara`} />
        <Description value="Telusuri berbagai pilihan budaya untuk memperluas wawasan dan pengalaman Anda dalam mengenal kekayaan warisan bangsa." />

        {/* Search (controlled) */}
        <div className="mt-4">
          <InputSearch
            placeholder="Cari cerita rakyat / provinsi"
            value={search}
            onChangeAction={setSearch}
            onSubmitAction={(v) => onSubmitSearch({ searchValue: v })}
            icon="search"
            inputSize="small"
          />
        </div>
      </div>

      <div className="section-content">
        {/* Skeleton saat loading pertama */}
        {loading && items.length === 0 &&
          [...Array(PAGE_SIZE)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-100 h-36" />
          ))}

        {/* Error */}
        {!loading && errorMsg && (
          <div className="text-red-600 text-sm">{errorMsg}</div>
        )}

        {/* Data */}
        {!loading && !errorMsg &&
          items.map((row) => (
            <CardFolktale
              key={row.id ?? row.slug}
              redirect={`/culture/${category}/detail/${row.slug}`}
              title={getTitle(row)}
              location={getLocation(row)}
            />
          ))}

        {/* Empty state */}
        {!loading && !errorMsg && items.length === 0 && (
          <div className="text-sm text-gray-500 flex justify-center w-full">
            Belum ada data {categoryParam.toLowerCase()} yang cocok{search ? ` untuk “${search}”` : ''}.
          </div>
        )}
      </div>

      <div className="button-group element-wrapper">
        <ButtonCustom
          style={hasMore ? 'button-primary' : 'button-blank'}
          onClick={onLoadMore}
          disabled={!hasMore || loading}
          label={loading && items.length > 0 ? 'Memuat...' : hasMore ? 'Lebih Banyak' : 'Semua sudah ditampilkan'}
        />
      </div>

      <p className="mt-3 text-center text-sm text-gray-500">
        Menampilkan {items.length} dari {total} cerita rakyat
        {search ? ` untuk “${search}”` : ''}.
      </p>
    </section>
  );
}
