'use client';

import { useEffect } from 'react';

export default function LegacyPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/legacy/app.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <iframe
      src="/legacy/index.html"
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="IUTFAM Legacy"
    />
  );
}
