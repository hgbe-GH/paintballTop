"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

const bookingSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L’email est requis" })
    .email("Veuillez saisir une adresse email valide"),
  teamSize: z
    .coerce.number()
    .min(4, "Minimum 4 joueurs")
    .max(24, "Maximum 24 joueurs"),
});

type BookingSchema = z.infer<typeof bookingSchema>;

export function Hero() {
  const bookingResolver = zodResolver(bookingSchema) as Resolver<BookingSchema, unknown, BookingSchema>;

  const form = useForm<BookingSchema>({
    resolver: bookingResolver,
    defaultValues: {
      email: "",
      teamSize: 8,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    toast.success(
      `Demande envoyée pour ${values.teamSize} joueurs. Nous revenons vers vous rapidement !`
    );
    form.reset();
  });

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-24">
        <div className="flex-1 space-y-6">
          <Badge variant="outline" className="rounded-full border-primary/60 bg-primary/10 px-4 py-1 text-primary">
            Sport & Outdoor
          </Badge>
          <h1 className="font-heading text-3xl tracking-[0.4em] text-foreground sm:text-4xl lg:text-5xl">
            Paintball Méditerranée
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Entre mer et garrigue, vivez des scénarios immersifs sur 5 hectares de terrains aménagés.
            Des équipements premium, des arbitres passionnés et une ambiance survoltée vous attendent.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-primary px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-xl hover:bg-primary/90">
                  Réserver
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-background/95 backdrop-blur">
                <DialogHeader>
                  <DialogTitle className="font-heading text-lg tracking-[0.35em]">
                    Démarrer une réservation
                  </DialogTitle>
                  <DialogDescription>
                    Laissez-nous vos coordonnées pour organiser votre prochain match.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="vous@exemple.fr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="teamSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de joueurs</FormLabel>
                          <FormControl>
                            <Input type="number" min={4} max={24} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" className="rounded-full bg-primary text-primary-foreground">
                        Valider la demande
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button
              variant="outline"
              className="rounded-full border-dashed border-primary/60 px-8 py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary shadow-sm hover:bg-primary/10"
            >
              Télécharger la brochure
            </Button>
          </div>
          <dl className="grid max-w-xl grid-cols-2 gap-6 text-sm uppercase tracking-[0.3em] text-muted-foreground sm:grid-cols-4">
            <div>
              <dt className="text-xs">Terrains thématiques</dt>
              <dd className="mt-1 font-heading text-2xl text-foreground">5</dd>
            </div>
            <div>
              <dt className="text-xs">Capacité par équipe</dt>
              <dd className="mt-1 font-heading text-2xl text-foreground">12</dd>
            </div>
            <div>
              <dt className="text-xs">Modes de jeu</dt>
              <dd className="mt-1 font-heading text-2xl text-foreground">8+</dd>
            </div>
            <div>
              <dt className="text-xs">Années d’expérience</dt>
              <dd className="mt-1 font-heading text-2xl text-foreground">15</dd>
            </div>
          </dl>
        </div>
        <div className="relative flex-1 rounded-3xl border border-border/70 bg-card/60 p-6 shadow-xl backdrop-blur">
          <div className="absolute inset-x-8 -top-8 h-16 rounded-full bg-gradient-to-r from-primary/50 via-accent/40 to-transparent blur-3xl" />
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Une immersion totale
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Équipements fournis, briefing sécurité personnalisé et scénarios adaptés à tous les niveaux.
            Avec l’option coaching pro, affûtez votre stratégie avant chaque mission.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-foreground">
            <li className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-heading text-xs text-primary">
                01
              </span>
              Briefing tactique personnalisé
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-heading text-xs text-primary">
                02
              </span>
              Zones ombragées & ravitaillement
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-heading text-xs text-primary">
                03
              </span>
              Staff d’arbitres certifiés
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
