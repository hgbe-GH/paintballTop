import Link from "next/link";

import { AvailabilityWidget } from "@/components/shared/availability-widget";
import { ExperienceOverview } from "@/components/shared/experience-overview";
import { Hero } from "@/components/shared/hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

type PackageCard = {
  id: string;
  name: string;
  priceCents: number;
  includedBalls: number | null;
  durationMin: number;
  isPromo: boolean;
};

type AddonCard = {
  id: string;
  name: string;
  priceCents: number;
};

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatPrice(cents: number) {
  return currencyFormatter.format(cents / 100);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const parts = [] as string[];

  if (hours > 0) {
    parts.push(`${hours} h`);
  }

  if (remainingMinutes > 0) {
    parts.push(`${remainingMinutes} min`);
  }

  return parts.join(" ") || "1 h";
}

export default async function Home() {
  const [packages, addons] = await Promise.all<[
    PackageCard[],
    AddonCard[],
  ]>([
    prisma.package.findMany({
      where: { isPublic: true },
      select: {
        id: true,
        name: true,
        priceCents: true,
        includedBalls: true,
        durationMin: true,
        isPromo: true,
      },
      orderBy: { priceCents: "asc" },
    }),
    prisma.addon.findMany({
      select: {
        id: true,
        name: true,
        priceCents: true,
      },
      orderBy: { priceCents: "asc" },
    }),
  ]);

  const depositUrl = process.env.NEXT_PUBLIC_DEPOSIT_URL;

  return (
    <div className="space-y-16 pb-20">
      <Hero />

      <section
        id="forfaits"
        className="mx-auto max-w-6xl space-y-8 rounded-3xl border border-border/70 bg-card/70 px-4 py-12 shadow-xl backdrop-blur sm:px-6 lg:px-12"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <h2 className="font-heading text-2xl tracking-[0.35em] text-foreground">
              Nos forfaits (jusqu’à 2h)
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Choisissez l’expérience qui correspond à votre escouade. Chaque forfait inclut le briefing sécurité, l’équipement complet et un arbitre dédié.
            </p>
          </div>
          <Button asChild className="w-full rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90 lg:w-auto">
            <Link href="#tarifs">Réserver</Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {packages.length === 0 ? (
            <p className="col-span-full text-sm text-muted-foreground">
              Les forfaits publics seront dévoilés très bientôt.
            </p>
          ) : null}
          {packages.map((pkg) => (
            <article
              key={pkg.id}
              className="flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-background/80 p-6 shadow-md"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-xl text-foreground">{pkg.name}</h3>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                      {formatDuration(pkg.durationMin)}
                    </p>
                  </div>
                  {pkg.isPromo ? (
                    <Badge className="rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-accent-foreground">
                      Promo été
                    </Badge>
                  ) : null}
                </div>
                <p className="text-3xl font-semibold text-primary">
                  {formatPrice(pkg.priceCents)}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    {pkg.includedBalls
                      ? `${pkg.includedBalls.toLocaleString("fr-FR")} billes incluses`
                      : "Billes illimitées"}
                  </li>
                  <li>Accès libre aux 5 terrains scénarisés</li>
                  <li>Briefing tactique personnalisé</li>
                </ul>
              </div>
              <Button
                asChild
                variant="outline"
                className="mt-6 rounded-full border-primary/40 text-sm font-semibold uppercase tracking-[0.3em]"
              >
                <Link href="#tarifs">Réserver</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <div className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-8 shadow-inner sm:p-12">
          <h2 className="font-heading text-2xl tracking-[0.35em] text-foreground">
            Tout public — 18€/pers dès 8 ans
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Anniversaires, sorties scolaires, EVJF/EVG ou team-building : nous adaptons l’intensité des scénarios pour que chaque joueur vive un moment d’adrénaline mémorable. Choisissez entre Paintball classique ou Gellyball à faible impact.
          </p>
          <ul className="mt-6 grid gap-4 text-sm text-foreground sm:grid-cols-2">
            <li className="rounded-2xl border border-border/60 bg-background/80 p-4">
              Encadrement par des animateurs passionnés et diplômés.
            </li>
            <li className="rounded-2xl border border-border/60 bg-background/80 p-4">
              Combinaisons, plastrons et masques premium fournis pour tous.
            </li>
            <li className="rounded-2xl border border-border/60 bg-background/80 p-4">
              Modes de jeu évolutifs selon l’âge et le niveau du groupe.
            </li>
            <li className="rounded-2xl border border-border/60 bg-background/80 p-4">
              Aire de repos ombragée avec boissons fraîches à disposition.
            </li>
          </ul>
          <div className="mt-6 flex justify-center sm:justify-end">
            <Button asChild className="rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90">
              <Link href="#tarifs">Réserver</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6">
        <div className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-xl sm:p-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <h2 className="font-heading text-2xl tracking-[0.35em] text-foreground">Link Ranger</h2>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Deux parcours signature à enchaîner ou à choisir selon vos envies. Défendez le bunker, escorter le VIP et dominez la forêt méditerranéenne.
              </p>
            </div>
            <Button asChild className="w-full rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90 sm:w-auto">
              <Link href="#tarifs">Réserver</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-border/60 bg-background/80 p-6 shadow-md">
              <Badge variant="outline" className="w-fit rounded-full border-primary/60 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary">
                Paintball 120 billes (1h30)
              </Badge>
              <h3 className="font-heading text-xl text-foreground">Mission Punisher</h3>
              <p className="text-sm text-muted-foreground">
                Attaquez la forteresse, reprenez la zone d’impact et activez la fumigène finale. Briefing avancé et coaching tactique inclus.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-border/60 bg-background/80 p-6 shadow-md">
              <Badge variant="outline" className="w-fit rounded-full border-accent/60 bg-accent/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-accent-foreground">
                Orbeez 1600 billes (1h)
              </Badge>
              <h3 className="font-heading text-xl text-foreground">Opération Néon</h3>
              <p className="text-sm text-muted-foreground">
                Gellyball fluo, obstacles gonflables et scénarios rapides pour un maximum de fun sans impact. Idéal familles et jeunes escouades.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ExperienceOverview />

      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        <div className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-xl sm:p-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h2 className="font-heading text-2xl tracking-[0.35em] text-foreground">Options & équipements</h2>
              <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                Personnalisez votre session avec nos add-ons : munitions supplémentaires, fumigènes, combinaisons camo… Nous préparons tout avant votre arrivée.
              </p>
            </div>
            <Button asChild className="w-full rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90 sm:w-auto">
              <Link href="#tarifs">Réserver</Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {addons.length === 0 ? (
              <p className="col-span-full text-sm text-muted-foreground">
                Les options personnalisées reviennent vite.
              </p>
            ) : null}
            {addons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-foreground">{addon.name}</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Option à la carte</p>
                </div>
                <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                  {formatPrice(addon.priceCents)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <AvailabilityWidget />

      <section className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6">
        <div className="rounded-3xl border border-border/70 bg-card/70 p-8 shadow-xl sm:p-12">
          <div className="space-y-6">
            <h2 className="font-heading text-2xl tracking-[0.35em] text-foreground">Infos pratiques</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Téléphone :</span> +33 4 42 00 00 00
                </p>
                <p>
                  <span className="font-semibold text-foreground">Adresse :</span> Route des Pins — Domaine Chez Paulette
                </p>
                <p>
                  <span className="font-semibold text-foreground">Accès :</span> piste cyclable dédiée, parking à 100 m, arrivée conseillée 5 minutes avant 🤠, covoiturage encouragé 😇.
                </p>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Cadre :</span> espace boisé avec buvette, terrains de pétanque, fléchettes et mölkky pour prolonger la journée.
                </p>
                <p>
                  <span className="font-semibold text-foreground">Coordonnées GPS :</span> 43.3600° N, 5.3470° E
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {depositUrl ? (
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-full border-primary/40 px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] sm:w-auto"
                >
                  <a href={depositUrl} target="_blank" rel="noopener noreferrer">
                    Déposer un acompte
                  </a>
                </Button>
              ) : null}
              <Button asChild className="w-full rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90 sm:w-auto">
                <Link href="#tarifs">Réserver</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
