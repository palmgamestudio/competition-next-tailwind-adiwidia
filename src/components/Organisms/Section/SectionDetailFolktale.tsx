'use client';

import Title from '@/components/Atoms/Text/Title';
import Description from '@/components/Atoms/Text/Description';
import { useParams } from 'next/navigation';
import { convertSlug } from '@/utils/convert-slug';
import ButtonCopy from '@/components/Atoms/Button/ButtonCopy';
import Image from 'next/image';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import CardChatAIStory, { ChatStoryContext } from '@/components/Molecules/Card/CardChatAIStories';

type StoryRow = {
  id?: string | number | null;
  slug: string;
  title?: string | null;
  content_text?: string | null;      // HTML
  content_video_url?: string | null; // youtube / mp4 / dll
  province_slug?: string | null;
  province_name?: string | null;
  province_description?: string | null;
};

/** Convert various YouTube URLs to embeddable URL, supporting ?t= / ?start= */
function toYouTubeEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    let id = '';
    if (host === 'youtu.be') {
      id = u.pathname.split('/').filter(Boolean)[0] ?? '';
    } else if (host.endsWith('youtube.com')) {
      const path = u.pathname;
      if (path === '/watch') id = u.searchParams.get('v') ?? '';
      else if (path.startsWith('/embed/')) id = path.split('/')[2] ?? '';
      else if (path.startsWith('/shorts/')) id = path.split('/')[2] ?? '';
      else if (path.startsWith('/live/')) id = path.split('/')[2] ?? '';
    }
    if (!id) return null;

    const tParam = u.searchParams.get('t') || u.searchParams.get('start');
    let start = 0;
    if (tParam) {
      const m = tParam.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
      if (m) {
        const h = parseInt(m[1] || '0', 10);
        const mnt = parseInt(m[2] || '0', 10);
        const s = parseInt(m[3] || '0', 10);
        start = h * 3600 + mnt * 60 + s;
      } else {
        const n = parseInt(tParam, 10);
        if (!Number.isNaN(n)) start = n;
      }
    }

    const qs = new URLSearchParams({ rel: '0', modestbranding: '1', iv_load_policy: '3' });
    if (start > 0) qs.set('start', String(start));

    return `https://www.youtube.com/embed/${id}?${qs.toString()}`;
  } catch {
    return null;
  }
}

export default function SectionDetailFolktale() {
  const { category, folktale_slug } = useParams<{
    category: string;
    folktale_slug: string;
  }>();

  const categoryParam = convertSlug({ slug: category || '' });
  const slugParam = convertSlug({ slug: folktale_slug || '' });

  const [data, setData] = useState<StoryRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
        .from('stories')
        .select(
          'id, slug, title, content_text, content_video_url, province_id, provinces(name, slug, description)'
        )
        .eq('slug', folktale_slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setData(null);
        setErrorMsg('Cerita rakyat tidak ditemukan.');
        return;
      }

      const row = data as StoryRow & {
        provinces?:
          | { name?: string | null; slug?: string | null; description?: string | null }
          | { name?: string | null; slug?: string | null; description?: string | null }[]
          | null;
      };
      const province = Array.isArray(row.provinces)
        ? row.provinces[0]
        : row.provinces;

      setData({
        ...row,
        province_name: province?.name ?? null,
        province_slug: province?.slug ?? null,
        province_description: province?.description ?? null,
      });
    } catch (err: unknown) {
      setData(null);
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat detail cerita rakyat.');
    } finally {
      setLoading(false);
    }
  }, [folktale_slug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const titleText = data?.title || slugParam;
  const htmlContent = (data?.content_text ?? '') as string;
  const videoUrl = data?.content_video_url ?? '';

  const embedUrl = useMemo(() => (videoUrl ? toYouTubeEmbed(videoUrl) : null), [videoUrl]);
  const isFileVideo = useMemo(
    () => (videoUrl ? /\.(mp4|webm|ogv)(\?.*)?$/i.test(videoUrl) : false),
    [videoUrl]
  );
  const chatContext: ChatStoryContext | null = data
  ? {
      title: data.title || slugParam,
      category: 'Cerita Rakyat',
      region: data.province_name ?? '',
      descriptionHtml: data.content_text ?? '',
    }
  : null;
  return (
    <section className="section-detail-culture section-content-gap section-top-hero">
      <div className="detail-culture-header">
        <div className="header-data">
          <div className="element-wrapper mb-[8px]">
            <p className="breadcrumb">
              Beranda / {categoryParam} / <span>{slugParam}</span>
            </p>
          </div>
          <div className="element-wrapper">
            <Title className="data-title" label={titleText} />
          </div>
        </div>
        <ButtonCopy />
      </div>

      {/* Media */}
      <div className="w-full">
        {loading ? (
          <div className="w-full h-[300px] md:h-[420px] rounded-[60px] bg-gray-100 animate-pulse overflow-hidden" />
        ) : videoUrl ? (
          embedUrl ? (
            // YouTube embed
            <div className="relative w-full overflow-hidden rounded-[0px] lg:rounded-[60px] lg:p-[40px]">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  title={titleText}
                  className="absolute inset-0 w-full h-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          ) : isFileVideo ? (
            // Direct video file
            <div className="w-full lg:p-[40px] lg:rounded-[60px] overflow-hidden">
              <video src={videoUrl} controls className="w-full max-h-[620px] rounded-xl" />
            </div>
          ) : (
            <div className="w-full h-[300px] md:h-[420px] rounded-[60px] bg-gray-50 flex items-center justify-center text-gray-500">
              Media tidak dapat ditampilkan
            </div>
          )
        ) : (
          <div className="w-full h-[300px] md:h-[420px] rounded-[60px] bg-gray-50 flex items-center justify-center text-gray-400">
            Tidak ada media
          </div>
        )}
      </div>

      {/* Content */}
      <div className="detail-culture-content">
        <div className="content-card">
          <div className="card-body !pt-0">
            <div className="body-group">
              <div className="body-header">
                <div className="header-icon">
                  <Image
                    src="/image/icon/file/file-light.svg"
                    alt="Definition Icon"
                    width={14}
                    height={14}
                  />
                </div>
                <p className="header-title">Deskripsi Cerita</p>
              </div>

              {errorMsg && <div className="text-sm text-red-600 mt-2">{errorMsg}</div>}

              <div className="body-content">
                {loading ? (
                  <>
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-2 animate-pulse" />
                  </>
                ) : htmlContent ? (
                  <Description value={htmlContent} />
                ) : (
                  <p className="text-sm text-gray-500">Deskripsi belum tersedia.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {chatContext && <CardChatAIStory context={chatContext} />}
      </div>
    </section>
  );
}
