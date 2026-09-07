"use client";

import SectionMuseumTour from "@/components/Organisms/Section/SectionMuseumTour";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useEffect } from "react";

export default function MuseumPage() {
  useLenisScroll();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <main className="main">
      <div className="container section-pb-gap">
        <SectionMuseumTour />
      </div>
    </main>
  );
}
