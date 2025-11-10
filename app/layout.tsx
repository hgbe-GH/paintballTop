import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const siteUrl = 'https://paintballtop.github.io/paintballTop/';
const siteUrl = 'https://paintballtop.github.io/paintballTop';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Paintball Méditerranée | Terrain de paintball près de Marseille',
    template: '%s | Paintball Méditerranée',
  },
  description:
    'Paintball Méditerranée accueille particuliers et entreprises route des Pins à Marseille : 5 terrains scénarisés, encadrement professionnel et options sur-mesure.',
  keywords: [
    'paintball marseille',
    'paintball méditerranée',
    'gellyball marseille',
    'team building paintball',
    'anniversaire paintball enfant',
    'loisirs outdoor provence',
  ],
  authors: [{ name: 'Paintball Méditerranée' }],
  creator: 'Paintball Méditerranée',
  publisher: 'Paintball Méditerranée',
    default: 'PaintballTop | Terrain de paintball & événements sur mesure',
    template: '%s | PaintballTop',
  },
  description:
    'Vivez une aventure paintball immersive à PaintballTop : scénarios tactiques, formules adaptées aux groupes et réservations rapides pour les particuliers et entreprises.',
  keywords: [
    'paintball',
    'paintball méditerranée',
    'terrain paintball',
    'anniversaire paintball',
    'team building paintball',
    'loisirs outdoor',
    'paintball herault',
  ],
  authors: [{ name: 'PaintballTop' }],
  creator: 'PaintballTop',
  publisher: 'PaintballTop',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    title: 'Paintball Méditerranée | Terrain de paintball près de Marseille',
    description:
      'Réservez votre session paintball ou gellyball : équipements premium, staff certifié et scénarios immersifs sur 5 hectares.',
    siteName: 'Paintball Méditerranée',
    title: 'PaintballTop | Terrain de paintball & événements sur mesure',
    description:
      'Réservez votre session paintball en Méditerranée : packages clé en main, encadrement professionnel et animations personnalisées.',
    siteName: 'PaintballTop',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'Joueurs de Paintball Méditerranée en pleine action',
        alt: 'Équipe de paintball en pleine action sur le terrain PaintballTop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paintball Méditerranée | Expériences paintball immersives',
    description:
      'Contactez Paintball Méditerranée pour organiser un anniversaire, un EVJF/EVG ou un team building outdoor près de Marseille.',
    site: '@paintballtop',
    creator: '@paintballtop',
    title: 'PaintballTop | Expériences paintball immersives',
    description:
      'Préparez votre session paintball : disponibilité en ligne, forfaits adaptés et conseils d’experts pour un événement inoubliable.',
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
