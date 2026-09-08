import CardFeatured from "@/components/Molecules/Card/CardFeatured";
import Image from "next/image";
import BadgeBanner from "@/components/Atoms/Badge/BadgeBanner";
import SectionHero from "@/components/Organisms/Section/SectionHero";

export default function SectionMainHero() {
    return (
        <>
            <SectionHero
                icon="/image/icon/globe/globe-primary.svg"
                subtitle="Melestarikan Budaya, Menginspirasi Generasi"
                headline="Menghubungkan Warisan Budaya Indonesia dengan Inovasi Digital"
                description="Platform digital yang menghubungkan warisan budaya Indonesia dengan teknologi modern. Melalui inovasi digital, kami berkomitmen menjaga, memperkenalkan, dan menghidupkan kembali kekayaan budaya di era global."
                buttons={[
                    {style: 'button-primary', redirect: '/about#category', label: 'Eksplorasi Budaya'},
                    {style: 'button-secondary', redirect: '/about', label: 'Pelajari Lebih Lanjut'},
                ]}
            >
                <>
                    <div className="section-banner wrapper-image">
                        {/*<Image src="/image/banner/banner-hero-gif.gif" alt="Banner Hero" fill className="banner-image image-full"/>*/}
                        <Image src="/image/banner/banner-hero.png" alt="Banner Hero" fill className="banner-image image-full"/>
                        <BadgeBanner
                            title="Gunung Bromo"
                            location="Jawa Timur, Indonesia"
                        />
                    </div>
                    <section className="section-featured">
                        <div className="section-content">
                            <CardFeatured
                                icon="/image/icon/earth/earth-primary.svg"
                                title="Peta Interaktif Budaya Nusantara"
                                description="Menjelajahi persebaran budaya Indonesia melalui peta digital interaktif, mulai dari tradisi, tarian, musik, hingga kuliner khas di setiap daerah Nusantara."
                            />
                            <CardFeatured
                                icon="/image/icon/headphone/headphone-primary.svg"
                                title="Cerita Budaya Multimedia"
                                description="Menghadirkan kisah budaya melalui audio, video, dan animasi yang menarik. Setiap cerita dikemas ringan agar warisan Nusantara mudah dipahami generasi muda."
                            />
                            <CardFeatured
                                icon="/image/icon/statue/statue-primary.svg"
                                title="3D Showcase Benda Kebudayaan"
                                description="Mengamati artefak budaya seperti batik, keris, dan wayang dalam model 3D yang dapat diputar 360°, lengkap dengan penjelasan sejarah serta nilai filosofinya."
                            />
                            <CardFeatured
                                icon="/image/icon/palette/palette-primary.svg"
                                title="Galeri Visual Budaya"
                                description="Menampilkan koleksi foto, ilustrasi, dan video budaya dari berbagai daerah Indonesia. Setiap visual dilengkapi konteks agar warisan Nusantara mudah dipahami."
                            />
                        </div>
                    </section>
                </>
            </SectionHero>
        </>
    )
}