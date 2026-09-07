'use client';

import Title from '@/components/Atoms/Text/Title';
import Description from '@/components/Atoms/Text/Description';
import { useParams } from 'next/navigation';
import { convertSlug } from '@/utils/convert-slug';
import ButtonCopy from '@/components/Atoms/Button/ButtonCopy';
import CardChatAI from '@/components/Molecules/Card/CardChatAI';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { SketchfabEmbed } from './3dViewer';
import CardChatAICollection from '@/components/Molecules/Card/CardChatAICollection';

type ItemRow = {
  id?: string | number | null;
  slug: string;
  name?: string | null;

  // HTML text
  content?: string | null;

  // Sketchfab sources
  media_3d_url?: string | null;
};


export default function SectionDetailCollection() {
  const { collection_slug } = useParams<{ collection_slug: string }>();
  const slugParam = convertSlug({ slug: collection_slug || '' });

  const [data, setData] = useState<ItemRow | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const { data, error } = await supabase
          .from('virtual_museum_items')
          .select('*')
          .eq('slug', collection_slug)
          .maybeSingle();

      if (error) throw error;
      if (!data) {
        setErrorMsg('Koleksi tidak ditemukan.');
        setData(null);
        return;
      }
      setData(data as ItemRow);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal memuat koleksi.');
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [collection_slug]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const titleText = data?.name || slugParam;
  const descriptionHTML = (data?.content || '') as string;

  const modelId =
    data?.media_3d_url?.trim() ||
    null;

  console.log(descriptionHTML)

  return (
    <section className="section-detail-collection section-content-gap section-top-hero">
      <div className="detail-collection-header">
        <div className="header-data">
          <div className="element-wrapper mb-[6px] lg:mb-[8px]">
            <Title className="data-title" label={titleText} />
          </div>
          <div className="element-wrapper">
            <Description value="Putar objek 360° dengan mouse atau sentuhan" />
          </div>
        </div>
        <ButtonCopy />
      </div>

      <div className="detail-collection-frame">
        {loading ? (
          <div className="w-full h-full rounded-xl bg-gray-100 animate-pulse" />
        ) : modelId ? (
          <SketchfabEmbed modelId={modelId} className="h-full md:full"/>
        ) : (
          <p className="frame-caption text-gray-500">Asset 3D belum tersedia</p>
        )}
      </div>

      <div className="detail-collection-content">
        <div className="content-card">
          <div className="card-body !pt-0">
            <div className="body-group" id="description">
              <div className="body-header">
                <div className="header-icon">
                  <Image
                    src="/image/icon/file/file-light.svg"
                    alt="Definition Icon"
                    width={14}
                    height={14}
                  />
                </div>
                <p className="header-title">Deskripsi</p>
              </div>

              {/* Error */}
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
                ) : descriptionHTML ? (
                  // <Description /> kamu sudah support HTML string
                  <Description value={descriptionHTML} />
                  // Jika tidak, gunakan:
                  // <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: descriptionHTML }} />
                ) : (
                  <p className="text-sm text-gray-500">Deskripsi belum tersedia.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tetap tampilkan Chat AI di sisi kanan */}
        <CardChatAICollection />
      </div>
    </section>
  );
}
