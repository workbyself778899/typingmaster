import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'TypingMaster Nepal - Improve Your Typing Speed',
    template: '%s | TypingMaster Nepal',
  },
  description:
    'Improve your typing speed and accuracy with personalized lessons and adaptive learning. Practice English, Nepali Unicode, Preeti, and Kantipur typing.',
  keywords: [
    'typing speed test',
    'typing practice',
    'typing tutor',
    'Nepali typing practice',
    'Nepali Unicode typing',
    'Preeti typing practice',
    'Nepali typing test',
    'English typing test',
    'touch typing',
    'typing lessons',
  ],
  authors: [{ name: 'TypingMaster Nepal' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'TypingMaster Nepal - Improve Your Typing Speed',
    description:
      'Improve your typing speed and accuracy with personalized lessons. Support for English and Nepali typing.',
    siteName: 'TypingMaster Nepal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TypingMaster Nepal - Improve Your Typing Speed',
    description:
      'Improve your typing speed and accuracy with personalized lessons and adaptive learning.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
