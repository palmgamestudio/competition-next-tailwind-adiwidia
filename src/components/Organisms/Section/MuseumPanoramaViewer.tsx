"use client";

import { useEffect, useRef, useState } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

type Props = {
  panoramaUrl: string;
  className?: string;
};

/**
 * Load panorama as blob first, then hand a same-origin object URL to PSV.
 * Avoids Three.js Range-request + CORS quirks against Supabase/Cloudflare
 * that often surface as "Failed to fetch" in the browser.
 */
export default function MuseumPanoramaViewer({
  panoramaUrl,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function mount() {
      if (!containerRef.current || !panoramaUrl) return;

      setLoading(true);
      setErrorMsg("");

      try {
        const res = await fetch(panoramaUrl, {
          mode: "cors",
          credentials: "omit",
          cache: "force-cache",
        });

        if (!res.ok) {
          throw new Error(`Gagal unduh panorama (HTTP ${res.status})`);
        }

        const blob = await res.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);

        viewerRef.current?.destroy();
        viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: objectUrl,
          navbar: ["zoom", "move", "fullscreen"],
          defaultZoomLvl: 50,
          touchmoveTwoFingers: true,
          mousewheelCtrlKey: false,
        });
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Gagal memuat panorama 360.";
        setErrorMsg(message);
        console.error("MuseumPanoramaViewer:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    mount();

    return () => {
      cancelled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [panoramaUrl]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={containerRef}
        className="museum-panorama w-full h-full"
        role="img"
        aria-label="Panorama museum 360 derajat"
      />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark/[0.04] text-sm text-dark/50">
          Memuat panorama…
        </div>
      )}

      {errorMsg && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-light/90 px-4 text-center">
          <p className="text-sm text-red-600">{errorMsg}</p>
          <p className="text-xs text-dark/50 break-all max-w-md">{panoramaUrl}</p>
        </div>
      )}
    </div>
  );
}
