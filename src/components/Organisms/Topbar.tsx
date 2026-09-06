'use client';

import { supabase } from "@/utils/supabase";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useEffect, useState } from "react";

type Props = {
  onClickAction: () => void;
};

type CategoryRow = {
  id: string | number;
  slug: string;
  category_name: string;
};

export default function Topbar({ onClickAction }: Props) {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, category_name")
        .order("category_name", { ascending: true });

      if (cancelled || error) return;
      setCategories((data ?? []) as CategoryRow[]);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="topbar">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/culture/${category.slug}`}
          className="topbar-link group/link"
          onClick={onClickAction}
        >
          <div className="link-icon group-hover/link:bg-primary">
            <Icon icon="hugeicons:globe-02" className="size-4 icon" />
          </div>
          {category.category_name}
        </Link>
      ))}
      <Link
        href={`/culture/cerita-rakyat`}
        className="topbar-link group/link"
        onClick={onClickAction}
      >
        <div className="link-icon group-hover/link:bg-primary">
          <Icon icon="hugeicons:globe-02" className="size-4 icon" />
        </div>
        Cerita Rakyat
      </Link>
    </div>
  );
}
