
import './globals.css';
import { Inter, Manrope } from 'next/font/google';
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from 'next';

// Load fonts at module scope
const inter = Inter({ subsets: ['latin'], display: 'swap', weight: ['400','500'], variable: '--font-body' });
const manrope = Manrope({ subsets: ['latin'], display: 'swap', weight: ['600','700'], variable: '--font-headline' });

// Default metadata for the root layout
export const metadata: Metadata = {
  title: 'Daily Sweat', // This can be overridden by [lang]/layout.tsx
  description: 'Your Personal AI Workout Planner', // Also overridable
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Default lang to "en", will be updated client-side by SetLangAttributeClient
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`font-body antialiased min-h-screen flex flex-col ${inter.className} ${inter.variable} ${manrope.variable}`}>
        {/* Accessible skip link for keyboard users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 z-[100] bg-card text-foreground px-3 py-2 rounded-md shadow"
        >
          Skip to content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children} {/* Children from [lang]/layout.tsx will be rendered here */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
