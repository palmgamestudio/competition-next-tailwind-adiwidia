'use client'

import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import Topbar from "@/components/Organisms/Topbar";
import {useState, useEffect} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {bounceTransition} from "@/utils/motion-variant";

export default function Navbar() {
    const pathname = usePathname();
    const [isPopupCategoryOpen, setIsPopupCategoryOpen] = useState<boolean>(false);
    const [isHidden, setIsHidden] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    const togglePopupCategory = () => {
        setIsPopupCategoryOpen(!isPopupCategoryOpen);
    }

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 80) {
                setIsHidden(true);
            } else {
                setIsHidden(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <>
            <motion.nav
                className="navbar"
                initial={{ y: 0 }}
                animate={{ y: isHidden ? -100 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="container">
                    <Link href="/" className="navbar-brand">
                        <Image src="/image/brand/brand-logo.svg" alt="Brand Logo" width={160} height={52}/>
                    </Link>
                    <div className="navbar-menu">
                        <Link href="/" className={`menu-item ${pathname === '/' ? 'active' : ''}`} onClick={() => setIsPopupCategoryOpen(false)}>Beranda</Link>
                        <Link href="/about" className={`menu-item ${pathname === '/about' ? 'active' : ''}`} onClick={() => setIsPopupCategoryOpen(false)}>Tentang</Link>
                        <button type="button" className={`menu-item ${pathname.startsWith('/culture') ? 'active' : ''}`} onClick={togglePopupCategory}>Kategori</button>
                        <Link href="/museum" className={`menu-item ${pathname.startsWith('/museum') ? 'active' : ''}`} onClick={() => setIsPopupCategoryOpen(false)}>Museum</Link>
                        <Link href="/collection" className={`menu-item ${pathname.startsWith('/collection') ? 'active' : ''}`} onClick={() => setIsPopupCategoryOpen(false)}>Koleksi 3D</Link>
                    </div>
                    {/*<a href="/chat" target="_blank" className="navbar-button w-fit">*/}
                    {/*    Tanya AI*/}
                    {/*    <Image src="/image/icon/chat/chat-light.svg" alt="Chat Icon" width={16} height={16}/>*/}
                    {/*</a>*/}
                </div>
            </motion.nav>

            <AnimatePresence>
                {isPopupCategoryOpen && (
                    <motion.div
                        className="topbar-container container"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 10, opacity: 0 }}
                        transition={bounceTransition}
                    >
                        <Topbar onClickAction={() => setIsPopupCategoryOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
