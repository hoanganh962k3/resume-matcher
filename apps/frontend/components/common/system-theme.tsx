'use client';

import { useEffect } from 'react';

export function SystemTheme() {
  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
  }, []);

  return null;
}
