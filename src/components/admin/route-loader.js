'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteLoader() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [show, setShow] = useState(false);
  const firstRender = useRef(true);
  const hideTimer = useRef(null);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setShow(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShow(false), 700);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [pathname, params]);

  if (!show) return null;
  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[9999] overflow-hidden pointer-events-none">
      <div className="h-full bg-indigo-500 animate-pulse w-full" style={{ animation: 'route-loader-progress 700ms ease-out forwards' }} />
      <style jsx>{`
        @keyframes route-loader-progress {
          0% { width: 0%; opacity: 1; }
          70% { width: 80%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}