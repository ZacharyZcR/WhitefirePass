import type { Metadata } from 'next';
import { Cinzel, Cormorant_Garamond, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Roman capitals for engraved labels
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

// Edwardian italic for Latin mottos
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

// Chinese serif body text
const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '白烬山口 - Whitefire Pass',
  description: '1913年深冬，15名旅人被困于寂静山庄，山灵的契约已成，收割与羔羊的生死博弈正式开始',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <html
      lang="zh-CN"
      className={`dark ${cinzel.variable} ${cormorant.variable} ${notoSerifSC.variable}`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
