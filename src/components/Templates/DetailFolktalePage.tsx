'use client'

import SectionCTA from "@/components/Organisms/Section/SectionCTA";
import SectionDetailFolktale from "@/components/Organisms/Section/SectionDetailFolktale";
import SectionFolktale from "@/components/Organisms/Section/SectionFolktale";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useEffect } from "react";

export default function DetailFolktalePage() {
  useLenisScroll();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <main className="main">
      <div className="container section-pb-gap">
        <SectionDetailFolktale />
        <SectionFolktale />
        <SectionCTA />
      </div>
    </main>
  );
}
