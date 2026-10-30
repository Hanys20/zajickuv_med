'use client';

import { useEffect, useState } from 'react';
import { INTRO_LOGO_LAYERS } from '@/lib/introLogo';

export default function IntroAnimation() {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'playing' | 'done'>('loading');

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) return;
    try {
      if (sessionStorage.getItem('introShown')) return;
    } catch {
      // Storage may be unavailable in private browsing; the intro can still run.
    }

    let cancelled = false;
    let frame = 0;
    let safetyTimer = 0;
    const stop = () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(loadTimer);
      window.clearTimeout(safetyTimer);
    };
    const dismiss = () => {
      stop();
      setPhase('done');
    };
    // A busy or slow device should show the page instead of waiting for an intro.
    const loadTimer = window.setTimeout(dismiss, 800);
    const onVisibilityChange = () => {
      if (document.hidden) dismiss();
    };
    const onMotionChange = () => {
      if (motion.matches) dismiss();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    motion.addEventListener('change', onMotionChange);

    Promise.all(INTRO_LOGO_LAYERS.map(({ src }) => {
      const image = new Image();
      image.src = src;
      return image.decode();
    }))
      .then(() => {
        if (cancelled || document.hidden) return;
        setPhase('ready');
        // Mount decoded images and prepare compositor layers before starting.
        frame = window.requestAnimationFrame(() => {
          frame = window.requestAnimationFrame(() => {
            if (cancelled) return;
            window.clearTimeout(loadTimer);
            try {
              sessionStorage.setItem('introShown', '1');
            } catch {}
            setPhase('playing');
            // CSS owns the timeline; this is only a missing-event failsafe.
            safetyTimer = window.setTimeout(dismiss, 2300);
          });
        });
      })
      .catch(() => {
        if (!cancelled) dismiss();
      });

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motion.removeEventListener('change', onMotionChange);
    };
  }, []);

  if (phase !== 'ready' && phase !== 'playing') return null;

  return (
    <div
      className={`intro-overlay${phase === 'playing' ? ' intro-playing' : ''}`}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'intro-exit') {
          setPhase('done');
        }
      }}
    >
      <div className="intro-logo">
        {INTRO_LOGO_LAYERS.map(({ name, src, style }) => (
          // Static SVG artwork; only the HTML image's transform/opacity animate.
          // eslint-disable-next-line @next/next/no-img-element
          <img key={name} src={src} alt="" draggable={false} className={`intro-part intro-${name}`} style={style} />
        ))}
      </div>
    </div>
  );
}
