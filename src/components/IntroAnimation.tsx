'use client';

import { useEffect, useRef, useState } from 'react';

const HOLD_MS = 1450;
const FADE_MS = 300;

export default function IntroAnimation() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startedRef.current) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      try {
        if (sessionStorage.getItem('introShown')) return;
        sessionStorage.setItem('introShown', '1');
      } catch {
        // Některé režimy ochrany soukromí mohou webové úložiště blokovat.
        // Animace musí i v takovém případě doběhnout a stránku odkrýt.
      }

      startedRef.current = true;
      setVisible(true);
    }

    // React Strict Mode efekt při vývoji zkušebně uklidí a spustí znovu.
    // Časovače proto zakládáme při každém spuštění již zahájeného intra.
    const fadeTimer = setTimeout(() => setFading(true), HOLD_MS);
    const removeTimer = setTimeout(() => setVisible(false), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-paper transition-opacity ${
        fading ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo/entrance-animation.svg" alt="" className="h-[300px] w-auto" />
    </div>
  );
}
