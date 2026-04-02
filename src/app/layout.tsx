import React from 'react';
import type { Metadata, Viewport } from 'next';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C41E3A',
};

export const metadata: Metadata = {
  title: 'Sri Saraswathi Vidhya Mandir — Excellence Since 1997',
  description: 'Premier matriculation school in Ayanambakkam, Chennai offering KG to XII education with English medium, holistic development, and 20:1 student-teacher ratio.',
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/images/ssvm_final_logo-1774922153874.png',
    shortcut: '/assets/images/ssvm_final_logo-1774922153874.png',
    apple: '/assets/images/ssvm_final_logo-1774922153874.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/assets/images/ssvm_final_logo-1774922153874.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SSVM School" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }`,
          }}
        />
</head>
      <body>
        {children}
</body>
    </html>
  );
}