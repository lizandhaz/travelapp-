import { useEffect, useState } from 'react';

import { tripPhotoUrl } from './trips';

/** A private link to one of your trip photos (or null while loading / if there's none). */
export function useTripPhoto(path: string | null | undefined): string | null {
  const [loaded, setLoaded] = useState<{ path: string; url: string | null } | null>(null);
  useEffect(() => {
    if (!path) return;
    let active = true;
    tripPhotoUrl(path).then((url) => active && setLoaded({ path, url }));
    return () => {
      active = false;
    };
  }, [path]);
  return path && loaded?.path === path ? loaded.url : null;
}
