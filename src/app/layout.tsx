import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: '白烬山口 - Whitefire Pass',
  description: '15名旅人被困于寂静山庄，在山灵的契约下展开生死博弈',
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
    <html lang="en" className="dark">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
