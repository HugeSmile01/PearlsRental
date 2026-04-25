'use client';
import { useEffect } from 'react';

export function LeafletCSS() {
  useEffect(() => {
    import('leaflet/dist/leaflet.css' as any);
  }, []);
  return null;
}
