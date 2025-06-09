
'use client';

import { useEffect } from 'react';

interface SetLangAttributeProps {
  lang: string;
}

export function SetLangAttribute({ lang }: SetLangAttributeProps) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  return null; // This component does not render any visible UI
}
