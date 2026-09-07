"use client";

import "swiper/css";

import Title from "@/components/Atoms/Text/Title";
import Description from "@/components/Atoms/Text/Description";
import ButtonCustom from "@/components/Atoms/Button/ButtonCustom";
import ButtonArrow from "@/components/Atoms/Button/ButtonArrow";
import { Swiper, SwiperSlide } from "swiper/react";
import CardCategory from "@/components/Molecules/Card/CardCategory";
import { Navigation } from "swiper/modules";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

type CategoryRow = {
  id: string | number;
  slug: string;
  category_name: string;
};

const CATEGORY_IMAGES = [
  "/image/category/performing-art.png",
  "/image/category/cultural-destination.png",
  "/image/category/fine-art-craft.png",
  "/image/category/food-cuisine.png",
  "/image/category/custom-tradition.png",
  "/image/category/architecture-building.png",
  "/image/category/fashion-accessories.png",
  "/image/category/language-literature.png",
];

function imageForIndex(index: number) {
  return CATEGORY_IMAGES[index % CATEGORY_IMAGES.length];
}

export default function SectionCategory() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, slug, category_name")
        .order("id", { ascending: true });
      if (!cancelled) setCategories((data ?? []) as CategoryRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="section-category section-mt-gap">
      <div className="section-content">
        <div className="element-wrapper mb-[16px] md:mb-[20px]">
          <Title label="Menyusuri Jejak Budaya Indonesia Dari Masa Ke Masa" />
        </div>
        <div className="content-description mb-[28px] lg:mb-[32px]">
          <div className="element-wrapper">
            <Description value="Indonesia memiliki kekayaan budaya yang lahir dari ribuan pulau dengan beragam tradisi, bahasa, dan kesenian. Setiap unsur budaya menyimpan makna mendalam yang mencerminkan kearifan lokal serta nilai kehidupan masyarakat." />
          </div>
          <div className="element-wrapper">
            <Description value="Melalui Adiwidia, warisan ini dihadirkan kembali dalam bentuk digital agar mudah dijangkau dan terus lestari." />
          </div>
        </div>
        <div className="content-button button-group element-wrapper">
          <ButtonCustom
            style="button-primary"
            redirect="/collection"
            label="Jelajahi Koleksi 3D"
          />
        </div>
      </div>
      <div className="section-list">
        <Swiper
          className="category-swipper"
          breakpoints={{
            0: {
              slidesPerView: 1.2,
              spaceBetween: 12,
            },
            768: {
              slidesPerView: 2.2,
              spaceBetween: 16,
            },
            1024: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
          }}
          loop={categories.length > 2}
          navigation={{
            prevEl: ".navigation-button#navigation-button-prev",
            nextEl: ".navigation-button#navigation-button-next",
          }}
          modules={[Navigation]}
        >
          {categories.map((category, index) => (
            <SwiperSlide key={category.id}>
              <CardCategory
                image={imageForIndex(index)}
                redirect={`/culture/${category.slug}`}
                title={category.category_name}
              />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="category-navigation button-group element-wrapper">
          <div className="navigation-button" id="navigation-button-prev">
            <ButtonArrow isReversed={true} />
          </div>
          <div className="navigation-button" id="navigation-button-next">
            <ButtonArrow />
          </div>
        </div>
      </div>
    </section>
  );
}
