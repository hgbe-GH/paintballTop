"use client";

import { Clock, ParkingCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

const ADDRESS = "Route des Pins — Domaine Chez Paulette";
const LATITUDE = 43.36;
const LONGITUDE = 5.347;

const GOOGLE_MAPS_EMBED_URL = `https://maps.google.com/maps?q=${LATITUDE},${LONGITUDE}&z=15&output=embed`;
const GOOGLE_MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LATITUDE},${LONGITUDE}`;
const WAZE_URL = `https://waze.com/ul?ll=${LATITUDE},${LONGITUDE}&navigate=yes`;

export function MapSection() {
  return (
    <section
      role="region"
      aria-labelledby="map-heading"
      className="mx-auto max-w-6xl space-y-8 px-4 sm:px-6"
    >
      <div className="grid gap-8 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-xl sm:p-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background/80">
          <iframe
            title={`Localisation de Paintball Méditerranée — ${ADDRESS}`}
            src={GOOGLE_MAPS_EMBED_URL}
            className="h-[320px] w-full border-0 sm:h-[420px]"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Nous trouver</p>
            <h2 id="map-heading" className="font-heading text-2xl tracking-[0.35em] text-foreground">
              Route des Pins
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Retrouvez-nous sur le Domaine Chez Paulette. Arrivez quelques minutes avant le briefing pour vous équiper et
              profitez d’un parking à proximité immédiate du terrain.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary"
                title="Arrivez 5 minutes avant le briefing pour ne rien manquer de l’expérience."
              >
                <Clock className="h-4 w-4" aria-hidden="true" />
                Arriver 5 min avant
              </span>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent-foreground"
                title="Le parking gratuit se situe à 100 mètres de l’entrée du terrain."
              >
                <ParkingCircle className="h-4 w-4" aria-hidden="true" />
                Parking à 100 m
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="w-full rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90"
            >
              <a
                href={GOOGLE_MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir l'itinéraire dans Google Maps dans un nouvel onglet"
              >
                Ouvrir Google Maps
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full rounded-full border-primary/40 px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary shadow-lg transition hover:bg-primary/10 sm:w-auto"
            >
              <a
                href={WAZE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir l'itinéraire dans Waze dans un nouvel onglet"
              >
                Ouvrir Waze
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
