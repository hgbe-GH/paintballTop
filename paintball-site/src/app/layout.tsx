import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import Script from "next/script";

import "./globals.css";
import { Providers } from "@/components/shared/providers";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader } from "@/components/shared/site-header";
import { MobileActionDock } from "@/components/shared/mobile-action-dock";

const metadataBase = new URL("https://www.paintball-mediterranee.fr");

const businessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${metadataBase.href}#business`,
  name: "Paintball Méditerranée",
  image: [`${metadataBase.href}og-paintball.svg`],
  url: metadataBase.href,
  telephone: "+33 4 91 00 00 00",
  priceRange: "€€",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Chemin du Vallon des Pins",
    addressLocality: "Marseille",
    postalCode: "13008",
    addressCountry: "FR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 43.2405,
    longitude: 5.3957,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "https://schema.org/Wednesday",
        "https://schema.org/Saturday",
        "https://schema.org/Sunday",
      ],
      opens: "09:00",
      closes: "19:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "https://schema.org/Thursday",
        "https://schema.org/Friday",
      ],
      opens: "14:00",
      closes: "19:00",
    },
  ],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

const defaultTitle = "Paintball Méditerranée | Parc de paintball près de Marseille";
const defaultDescription =
  "Vivez l'adrénaline du paintball sur des terrains boisés près de Marseille avec encadrement pro, formules anniversaire et team building.";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: defaultTitle,
    template: `%s | Paintball Méditerranée`,
  },
  description: defaultDescription,
  keywords: [
    "paintball marseille",
    "paintball méditerranée",
    "anniversaire paintball",
    "team building paintball",
    "loisir sportif bouches-du-rhône",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: metadataBase.href,
    title: defaultTitle,
    description: defaultDescription,
    siteName: "Paintball Méditerranée",
    images: [
      {
        url: "/og-paintball.svg",
        width: 1200,
        height: 630,
        alt: "Joueurs de Paintball Méditerranée prêts à démarrer une partie",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-paintball.svg"],
  },
  category: "sports",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsId = process.env.ANALYTICS_ID;

  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(businessJsonLd),
          }}
        />
      </head>
      <body className={`${inter.variable} ${rajdhani.variable} bg-background text-foreground antialiased`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>
          <MobileActionDock />
        </Providers>
        {analyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-setup" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${analyticsId}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
