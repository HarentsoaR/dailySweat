
// This layout no longer defines <html>, <body>, ThemeProvider, Toaster, global fonts, or imports global.css.
// These are now handled by the root src/app/layout.tsx.
import type { Metadata } from 'next';
import { getDictionary } from '@/lib/dictionaries';
import { SetLangAttribute } from './SetLangAttributeClient';

interface LangLayoutProps {
  children: React.ReactNode; // This is the page component
  params: { lang: 'en' | 'fr' | 'es' | 'it' | 'zh' };
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const dict = await getDictionary(params.lang);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

// Viewport is defined in the root layout (src/app/layout.tsx).
// If it needed to be language-specific, it could be defined here too.

export default function LangLayout({
  children,
  params,
}: LangLayoutProps) {
  return (
    <>
      <SetLangAttribute lang={params.lang} />
      {children} {/* This renders the page component */}
    </>
  );
}
