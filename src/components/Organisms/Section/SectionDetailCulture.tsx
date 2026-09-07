'use client';

import Title from '@/components/Atoms/Text/Title';
import Description from '@/components/Atoms/Text/Description';
import { useParams } from 'next/navigation';
import { convertSlug } from '@/utils/convert-slug';
import ButtonCopy from '@/components/Atoms/Button/ButtonCopy';
import CardChatAI from '@/components/Molecules/Card/CardChatAI';
import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';

type CultureRow = {
  id?: string | number | null;
  slug: string;
  title?: string | null;
  name?: string | null;
  content?: string | null;
  media_url?: string | null;
};

export default function SectionDetailCulture() {
  const { category, province, culture_slug } = useParams<{
    category: string;
    province: string;
    culture_slug: string;
  }>();

  const categoryParam = convertSlug({ slug: category || '' });
  const provinceParam = convertSlug({ slug: province || '' });
  const slugParam = convertSlug({ slug: culture_slug || '' });

  const [data, setData] = useState<CultureRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
        .from('cultures')
        .select('id, slug, name, content, media_url')
        .eq('slug', culture_slug)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setErrorMsg('Budaya tidak ditemukan.');
        setData(null);
        return;
      }
      setData(data as CultureRow);
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Gagal memuat detail budaya.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [culture_slug]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const titleText = data?.title || data?.name || slugParam;
  const imageSrc = data?.media_url;
  const htmlContent = (data?.content) as string;

  return (
    <section className="section-detail-culture section-content-gap section-top-hero">
      <div className="detail-culture-header">
        <div className="header-data">
          <div className="element-wrapper mb-[8px]">
            <p className="breadcrumb">
              Beranda / {categoryParam} / {provinceParam} / <span>{slugParam}</span>
            </p>
          </div>
          <div className="element-wrapper">
            <Title className="data-title" label={titleText} />
          </div>
        </div>
        <ButtonCopy />
      </div>

      <div className="detail-culture-image">
        {loading ? (
          <div className="w-full h-[300px] md:h-[420px] rounded-xl bg-gray-100 animate-pulse" />
        ) : (
          <img src={imageSrc!} alt={titleText || 'Thumbnail Image'} className="image-full" />
        )}
      </div>

      <div className="detail-culture-content">
        <div className="content-card">
          <div className="card-body">
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
                <p className="header-title">Deskripsi Budaya</p>
              </div>

              {errorMsg && (
                <div className="text-sm text-red-600 mt-2">{errorMsg}</div>
              )}

              <div className="body-content">
                {loading ? (
                  <>
                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-2 animate-pulse" />
                  </>
                ) : (
                  <Description value={htmlContent} />
                )}
              </div>
            </div>
          </div>
        </div>

        <CardChatAI />
      </div>


    </section>
  );
}
