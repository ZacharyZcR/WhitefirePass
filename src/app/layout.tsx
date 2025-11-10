import type { Metadata } from 'next';
import { Cinzel, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Gothic-style font for titles and headings
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

// Chinese serif font for body text
const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '白烬山口 - Whitefire Pass',
  description: '1913年深冬，15名旅人被困于寂静山庄，山灵的契约已成，收割与羔羊的生死博弈正式开始',
};

/**
 * Root layout component for the application
 * @param props The component props
 * @param props.children Child components to render
 * @returns The root layout with providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html lang="zh-CN" className={`dark ${cinzel.variable} ${notoSerifSC.variable}`}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
