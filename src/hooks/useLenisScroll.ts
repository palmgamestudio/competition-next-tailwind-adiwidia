'use client'

import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export function useLenisScroll() {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            prevent: (node) =>
                node instanceof HTMLElement &&
                Boolean(node.closest('.chat-room, [data-lenis-prevent]')),
        });
        lenisRef.current = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    return lenisRef;
}