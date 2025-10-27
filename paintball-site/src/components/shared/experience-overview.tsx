import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const experiences = [
  {
    name: "Escouade Riviera",
    duration: "2 h",
    intensity: "Intermédiaire",
    bonus: "Briefing tactique + GoPro",
  },
  {
    name: "Nocturne UV",
    duration: "2 h 30",
    intensity: "Avancé",
    bonus: "Éclairage UV & fumigènes",
  },
  {
    name: "Recrues",
    duration: "1 h 30",
    intensity: "Découverte",
    bonus: "Coaching inclus",
  },
];

export function ExperienceOverview() {
  return (
    <section id="experiences" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl tracking-[0.35em] text-foreground">
            Missions signatures
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Des scénarios calibrés pour les équipes corporate, les anniversaires et les compétiteurs en quête d’adrénaline.
            Les missions incluent l’encadrement par notre staff et l’accès aux zones VIP.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="rounded-full border-primary/50 bg-primary/10 px-3 py-1 text-primary">
            Fumigènes biosourcés
          </Badge>
          <Badge variant="outline" className="rounded-full border-accent/60 bg-accent/10 px-3 py-1 text-accent-foreground">
            Abris ombragés
          </Badge>
        </div>
      </div>
      <div className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card/70 shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 bg-background/80 uppercase tracking-[0.3em] text-xs text-muted-foreground">
              <TableHead>Programme</TableHead>
              <TableHead>Durée</TableHead>
              <TableHead>Intensité</TableHead>
              <TableHead>Bonus inclus</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {experiences.map((item) => (
              <TableRow key={item.name} className="border-border/50 bg-background/70">
                <TableCell className="font-semibold text-foreground">{item.name}</TableCell>
                <TableCell className="text-muted-foreground">{item.duration}</TableCell>
                <TableCell className="text-muted-foreground">{item.intensity}</TableCell>
                <TableCell className="text-muted-foreground">{item.bonus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-8 flex justify-end">
        <Button asChild className="rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90">
          <Link href="#tarifs">Réserver</Link>
        </Button>
      </div>
    </section>
  );
}
