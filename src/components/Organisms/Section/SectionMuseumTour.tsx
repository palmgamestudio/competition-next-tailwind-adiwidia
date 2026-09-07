"use client";

import Description from "@/components/Atoms/Text/Description";
import Title from "@/components/Atoms/Text/Title";
import CardChatAIMuseum from "@/components/Molecules/Card/CardChatAIMuseum";
import type { MuseumSceneListItem } from "@/types/museum";
import {
  getPublishedMuseumSceneBySlug,
  listPublishedMuseumScenes,
} from "@/utils/museum-queries";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const MuseumPanoramaViewer = dynamic(
  () => import("@/components/Organisms/Section/MuseumPanoramaViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full animate-pulse bg-gray-100" />
    ),
  }
);

type LoadState = "loading" | "ready" | "empty" | "not-found" | "error";

export default function SectionMuseumTour() {
  const { slug } = useParams<{ slug?: string }>();
  const [scenes, setScenes] = useState<MuseumSceneListItem[]>([]);
  const [active, setActive] = useState<MuseumSceneListItem | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    try {
      setState("loading");
      setErrorMsg("");

      const list = await listPublishedMuseumScenes();
      setScenes(list);

      if (list.length === 0) {
        setActive(null);
        setState("empty");
        return;
      }

      if (!slug) {
        setActive(list[0] ?? null);
        setState("ready");
        return;
      }

      const match = list.find((s) => s.slug === slug);
      if (match) {
        setActive(match);
        setState("ready");
        return;
      }

      // Try direct fetch in case list is stale; still treat unpublished as not-found
      const bySlug = await getPublishedMuseumSceneBySlug(slug);
      if (bySlug) {
        setActive(bySlug);
        setState("ready");
        return;
      }

      setActive(null);
      setState("not-found");
    } catch (err) {
      setActive(null);
      setState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal memuat museum virtual."
      );
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const descriptionHtml = useMemo(
    () => (active?.description || "").trim(),
    [active?.description]
  );

  if (state === "loading") {
    return (
      <section className="section-museum section-top-hero section-content-gap">
        <div className="museum-selector animate-pulse h-12 rounded-full bg-gray-100" />
        <div className="museum-viewer animate-pulse rounded-[32px] bg-gray-100 min-h-[420px]" />
        <div className="museum-bottom grid gap-6 lg:grid-cols-2">
          <div className="animate-pulse h-48 rounded-2xl bg-gray-100" />
          <div className="animate-pulse h-48 rounded-2xl bg-gray-100" />
        </div>
      </section>
    );
  }

  if (state === "empty") {
    return (
      <section className="section-museum section-top-hero section-content-gap">
        <div className="museum-empty">
          <Title label="Museum Virtual Tour 360" />
          <p className="text-dark/60 mt-3">
            Belum ada ruang museum yang dipublikasikan. Silakan kembali nanti
            atau jelajahi koleksi 3D.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="button-primary">
              Beranda
            </Link>
            <Link href="/collection" className="button-secondary">
              Koleksi 3D
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="section-museum section-top-hero section-content-gap">
        <div className="museum-empty">
          <Title label="Museum Virtual Tour 360" />
          <p className="text-red-600 mt-3 text-sm">{errorMsg}</p>
          <button type="button" className="button-primary mt-6" onClick={load}>
            Coba lagi
          </button>
        </div>
      </section>
    );
  }

  if (state === "not-found") {
    return (
      <section className="section-museum section-top-hero section-content-gap">
        <div className="museum-empty">
          <Title label="Scene tidak ditemukan" />
          <p className="text-dark/60 mt-3">
            Ruang museum yang kamu cari tidak tersedia atau belum dipublikasikan.
          </p>
          {scenes.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {scenes.map((scene) => (
                <Link
                  key={scene.id}
                  href={`/museum/${scene.slug}`}
                  className="button-small-primary"
                >
                  {scene.name}
                </Link>
              ))}
            </div>
          )}
          <Link href="/museum" className="button-secondary mt-4 inline-flex">
            Kembali ke Museum
          </Link>
        </div>
      </section>
    );
  }

  if (!active) return null;

  return (
    <section className="section-museum section-top-hero section-content-gap">
      {/* Hijau — selector */}
      <nav className="museum-selector" aria-label="Pilih ruang museum">
        <div className="museum-selector-track">
          {scenes.map((scene) => {
            const isActive = scene.slug === active.slug;
            return (
              <Link
                key={scene.id}
                href={`/museum/${scene.slug}`}
                className={`museum-selector-pill ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                {scene.name}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Merah — viewer 360 */}
      <div className="museum-viewer">
        <MuseumPanoramaViewer panoramaUrl={active.panorama_url} />
        <p className="museum-viewer-hint">
          Seret untuk melihat sekeliling · scroll untuk zoom
        </p>
      </div>

      {/* Pink + Biru */}
      <div className="museum-bottom">
        <div className="museum-description content-card">
          <div className="body-header">
            <div className="header-icon">
              <Image
                src="/image/icon/file/file-light.svg"
                alt=""
                width={14}
                height={14}
              />
            </div>
            <p className="header-title">{active.name}</p>
          </div>
          <div className="body-content">
            {descriptionHtml ? (
              <Description value={descriptionHtml} />
            ) : (
              <p className="text-sm text-dark/50">
                Deskripsi ruang belum tersedia.
              </p>
            )}
          </div>
        </div>

        <div className="museum-chat-wrap">
          <CardChatAIMuseum
            sceneName={active.name}
            sceneSlug={active.slug}
            aiContext={active.ai_context}
          />
        </div>
      </div>
    </section>
  );
}
