import MuseumPage from "@/components/Templates/MuseumPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Museum Virtual Tour 360 Adiwidia - Budaya Inovasi Digital",
  openGraph: {
    title: "Museum Virtual Tour 360 Adiwidia - Budaya Inovasi Digital",
  },
};

export default function MuseumSlugPage() {
  return <MuseumPage />;
}
