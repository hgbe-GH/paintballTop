import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const siteUrl = 'https://paintballtop.github.io/paintballTop/';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Paintball Méditerranée | Paintball & Gellyball à Montpellier',
    template: '%s | Paintball Méditerranée',
  },
  description:
    'Paintball Méditerranée vous accueille à Montpellier, 140 passage Charles Tillon : sessions paintball & gellyball, encadrement pro et cadre boisé en bord de rivière.',
  keywords: [
    'paintball montpellier',
    'paintball méditerranée',
    'gellyball montpellier',
    'team building paintball montpellier',
    'anniversaire paintball enfant montpellier',
    'loisirs outdoor hérault',
  ],
  authors: [{ name: 'Paintball Méditerranée' }],
  creator: 'Paintball Méditerranée',
  publisher: 'Paintball Méditerranée',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    title: 'Paintball Méditerranée | Paintball & Gellyball à Montpellier',
    description:
      'Réservez votre session paintball ou gellyball à Montpellier : équipements premium, staff certifié et scénarios immersifs en pleine nature.',
    siteName: 'Paintball Méditerranée',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Joueurs de Paintball Méditerranée en pleine action',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paintball Méditerranée | Paintball & Gellyball à Montpellier',
    description:
      'Contactez Paintball Méditerranée pour organiser un anniversaire, un EVJF/EVG ou un team building outdoor près de Montpellier.',
    images: ['https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <a className="skip-link" href="#contenu-principal">
          Passer au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
