// This is the new ROOT layout, it does not handle lang parameter
// It simply passes children through. The [lang]/layout.tsx will handle lang-specific setup.

import './globals.css'; // Keep global styles here

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The <html> and <body> tags are now managed by [lang]/layout.tsx
    children
  );
}
