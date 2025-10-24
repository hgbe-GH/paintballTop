"use client";

import { useMemo, useState } from "react";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";

const slots = [
  { value: "morning", label: "Matin - 09h30" },
  { value: "afternoon", label: "Après-midi - 14h00" },
  { value: "sunset", label: "Coucher de soleil - 18h30" },
];

export function AvailabilityWidget() {
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [slot, setSlot] = useState<string>(slots[0]?.value ?? "morning");

  const formattedDate = useMemo(
    () => (date ? format(date, "EEEE d MMMM", { locale: fr }) : ""),
    [date]
  );

  const handleBookingPreview = () => {
    if (!date) {
      toast.error("Choisissez une date pour continuer");
      return;
    }

    const label = slots.find((item) => item.value === slot)?.label ?? "créneau";
    toast.success(`Option bloquée le ${formattedDate} - ${label}`);
  };

  return (
    <section
      id="tarifs"
      className="mx-auto mt-8 max-w-6xl rounded-3xl border border-border/70 bg-card/70 px-4 py-12 shadow-lg backdrop-blur sm:px-6 lg:px-12"
    >
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div className="space-y-4">
          <h2 className="font-heading text-2xl tracking-[0.35em] text-foreground">
            Planifiez votre mission
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Choisissez une date et un créneau : notre équipe confirme en moins de 24 heures avec les détails tarifaires
            adaptés à votre groupe. Les sessions incluent 200 billes par joueur et l’accès aux équipements premium.
          </p>
          <div className="rounded-2xl border border-dashed border-primary/40 bg-background/80 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Disponibilité sélectionnée</p>
            <p className="mt-2 font-heading text-lg text-primary">
              {date ? formattedDate : "À définir"}
            </p>
            <p className="text-sm text-muted-foreground">
              Créneau : {slots.find((item) => item.value === slot)?.label ?? ""}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={fr}
            disabled={(currentDate) => isBefore(startOfDay(currentDate), startOfDay(new Date()))}
            className="mx-auto rounded-3xl border border-border/60 bg-background p-4"
          />
          <Select value={slot} onValueChange={setSlot}>
            <SelectTrigger className="w-full rounded-full border-border/60 bg-background/80">
              <SelectValue placeholder="Choisissez un créneau" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-border/60 bg-background/95">
              {slots.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleBookingPreview}
            className="w-full rounded-full bg-primary py-6 text-sm font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg hover:bg-primary/90"
          >
            Pré-réserver ce créneau
          </Button>
        </div>
      </div>
    </section>
  );
}
