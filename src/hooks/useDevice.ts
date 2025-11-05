'use client'

import { useState, useEffect } from 'react';

type tDevice = {
    w: number;
    h: number;
    // d: string;
}
export default function useDevice(): tDevice {
    const [w, setW] = useState<number>(0)
    const [h, setH] = useState<number>(0)
    // const [d, setD] = useState<string>('')
    useEffect(() => {
        const setResize = () => {
			setW(window.innerWidth)
			setH(window.innerHeight)
		}
        setResize()
        window.addEventListener('resize', setResize, { passive: true })
        return () => window.removeEventListener('resize', setResize);
    }, [])
    // let dim: string;
    // switch (true) {
    //     case w < 375: dim ='smob';
    //     case w < 768: dim ='mob';
    //     case w < 1024: dim ='tab';
    //     case w < 1440: dim ='dsk';
    //     case w < 2560: dim ='ldsk';
    //     default: dim ='xldsk';
    // }
    return { w, h }
}

// Helpers
export const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)