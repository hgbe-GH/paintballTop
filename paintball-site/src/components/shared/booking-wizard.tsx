"use client";

import { useEffect, useMemo, useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { generateSlots, isNocturne } from "@/lib/slots";

const contactSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide").optional().or(z.literal("")),
    phone: z.string().min(6, "Téléphone invalide").optional().or(z.literal("")),
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indiquez au moins un email ou un téléphone",
        path: ["email"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Indiquez au moins un email ou un téléphone",
        path: ["phone"],
      });
    }
  });

const bookingWizardSchema = z.object({
  packageId: z.string({ required_error: "Choisissez un forfait" }).min(1, "Choisissez un forfait"),
  groupSize: z.coerce
    .number({ required_error: "Indiquez le nombre de joueurs" })
    .int("Le nombre de joueurs doit être un entier")
    .min(1, "Minimum 1 joueur"),
  date: z.date({ required_error: "Sélectionnez une date" }),
  slot: z
    .string({ required_error: "Choisissez un créneau" })
    .min(1, "Choisissez un créneau"),
  contact: contactSchema,
  addons: z
    .record(z.string(), z.coerce.number().int().min(0, "Quantité invalide"))
    .default({}),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Vous devez accepter la politique de confidentialité" }),
  }),
});

const STEP_FIELDS: string[][] = [
  ["packageId"],
  ["groupSize"],
  ["date", "slot"],
  ["contact.name", "contact.email", "contact.phone", "consent"],
];

type BookingWizardValues = z.infer<typeof bookingWizardSchema>;

type Package = {
  id: string;
  name: string;
  priceCents: number;
  includedBalls: number;
  durationMin: number;
  isPromo: boolean;
};

type Addon = {
  id: string;
  name: string;
  priceCents: number;
};

type QuoteResponse = {
  totalCents: number;
  nocturne: boolean;
  endISO: string;
  breakdown: {
    base: number;
    addons: number;
    nocturneExtra: number;
    underMinPenalty: number;
  };
};

function centsToEuros(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value / 100);
}

function mergeDateWithTime(date: Date, timeISO: string) {
  const base = new Date(timeISO);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    base.getHours(),
    base.getMinutes(),
    0,
    0
  );
}

export function BookingWizard() {
  const [step, setStep] = useState(0);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);
  const [lastSelectedSlot, setLastSelectedSlot] = useState<string | null>(null);

  const form = useForm<BookingWizardValues>({
    resolver: zodResolver(bookingWizardSchema),
    defaultValues: {
      packageId: "",
      groupSize: 8,
      date: undefined,
      slot: "",
      contact: {
        name: "",
        email: "",
        phone: "",
      },
      addons: {},
      consent: false,
    },
    mode: "onChange",
  });

  const selectedPackageId = useWatch({ control: form.control, name: "packageId" });
  const groupSize = useWatch({ control: form.control, name: "groupSize" });
  const selectedDate = useWatch({ control: form.control, name: "date" });
  const selectedSlot = useWatch({ control: form.control, name: "slot" });
  const addonsQuantities = useWatch({ control: form.control, name: "addons" });

  const selectedPackage = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackageId) ?? null,
    [packages, selectedPackageId]
  );

  const slots = useMemo(() => {
    if (!selectedPackage) {
      return [];
    }

    try {
      return generateSlots({ durationMin: selectedPackage.durationMin, stepMin: 30, open: "09:00", close: "22:00" });
    } catch (error) {
      console.error("Impossible de générer les créneaux", error);
      return [];
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (!selectedPackage) {
      form.setValue("slot", "");
      setLastSelectedSlot(null);
    }
  }, [selectedPackage, form]);

  const effectiveDate = selectedDate ?? lastSelectedDate;
  const effectiveSlot = selectedSlot ?? lastSelectedSlot;

  const startISO = useMemo(() => {
    if (!effectiveDate || !effectiveSlot) {
      return null;
    }

    const merged = mergeDateWithTime(effectiveDate, effectiveSlot);
    return merged.toISOString();
  }, [effectiveDate, effectiveSlot]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setIsLoadingData(true);
        const [packagesResponse, addonsResponse] = await Promise.all([
          fetch("/api/public/packages", { signal: controller.signal }),
          fetch("/api/public/addons", { signal: controller.signal }),
        ]);

        if (!packagesResponse.ok) {
          throw new Error("Erreur lors du chargement des forfaits");
        }
        if (!addonsResponse.ok) {
          throw new Error("Erreur lors du chargement des options");
        }

        const [packagesData, addonsData] = await Promise.all([
          packagesResponse.json(),
          addonsResponse.json(),
        ]);

        setPackages(packagesData ?? []);
        setAddons(addonsData ?? []);

        const initialAddons = (addonsData ?? []).reduce(
          (acc: Record<string, number>, addon: Addon) => {
            acc[addon.id] = acc[addon.id] ?? 0;
            return acc;
          },
          {}
        );
        form.setValue("addons", initialAddons);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        toast.error("Impossible de charger les données de réservation");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingData(false);
        }
      }
    }

    loadData();

    return () => {
      controller.abort();
    };
  }, [form]);

  const addonsPayload = useMemo(() => {
    if (!addonsQuantities) return [] as Array<{ addonId: string; qty: number }>;

    return Object.entries(addonsQuantities)
      .map(([addonId, qty]) => ({ addonId, qty: Number(qty) }))
      .filter((item) => Number.isFinite(item.qty) && item.qty > 0);
  }, [addonsQuantities]);

  useEffect(() => {
    if (!selectedPackage || !startISO || !groupSize) {
      setQuote(null);
      return;
    }

    const controller = new AbortController();

    async function loadQuote() {
      try {
        setQuoteLoading(true);
        setQuoteError(null);
        const response = await fetch("/api/bookings/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            packageId: selectedPackage.id,
            groupSize: Number(groupSize),
            startISO,
            addons: addonsPayload,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = errorData?.error ?? "Erreur lors du calcul du tarif";
          throw new Error(typeof message === "string" ? message : "Erreur lors du calcul du tarif");
        }

        const data: QuoteResponse = await response.json();
        setQuote(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setQuoteError(error instanceof Error ? error.message : "Erreur lors du calcul du tarif");
      } finally {
        if (!controller.signal.aborted) {
          setQuoteLoading(false);
        }
      }
    }

    loadQuote();

    return () => {
      controller.abort();
    };
  }, [addonsPayload, groupSize, selectedPackage, startISO]);

  const nocturneSelected = startISO ? isNocturne(startISO, "20:00") : false;

  const handlePrevious = () => {
    setSubmitSuccess(false);
    setStep((current) => Math.max(0, current - 1));
  };

  const handleNext = async () => {
    setSubmitSuccess(false);
    const fields = STEP_FIELDS[step];
    if (!fields) return;

    type TriggerField = Parameters<typeof form.trigger>[0];
    const isValid = await form.trigger(fields as TriggerField, { shouldFocus: true });
    if (isValid) {
      setStep((current) => Math.min(STEP_FIELDS.length - 1, current + 1));
    }
  };

  const onSubmit = async (values: BookingWizardValues) => {
    if (!startISO) {
      toast.error("Choisissez un créneau valide");
      return;
    }

    const payload = {
      packageId: values.packageId,
      groupSize: Number(values.groupSize),
      startISO,
      customer: {
        name: values.contact.name,
        email: values.contact.email?.trim() || undefined,
        phone: values.contact.phone?.trim() || undefined,
      },
      addons: addonsPayload,
    };

    try {
      setSubmitSuccess(false);
      setIsSubmitting(true);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message =
          typeof errorData?.error === "string"
            ? errorData.error
            : "Erreur lors de l'envoi de la réservation";
        throw new Error(message);
      }

      toast.success("Réservation enregistrée ! Nous revenons vers vous rapidement.");
      setSubmitSuccess(true);
      setQuote(null);
      setQuoteError(null);
      setStep(0);

      const resetAddons = addons.reduce<Record<string, number>>((acc, addon) => {
        acc[addon.id] = 0;
        return acc;
      }, {});

      form.reset({
        packageId: "",
        groupSize: 8,
        date: undefined,
        slot: "",
        contact: {
          name: "",
          email: "",
          phone: "",
        },
        addons: resetAddons,
        consent: false,
      });
      setLastSelectedDate(null);
      setLastSelectedSlot(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de l'envoi de la réservation";
      toast.error(message);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSubmit = () => {
    if (effectiveDate) {
      form.setValue("date", effectiveDate, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    }
    if (effectiveSlot) {
      form.setValue("slot", effectiveSlot, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
    }
    form.handleSubmit(onSubmit)();
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Choisissez votre forfait</h3>
            <p className="text-muted-foreground text-sm">
              Comparez les options pour trouver le forfait adapté à votre équipe.
            </p>
            <FormField
              control={form.control}
              name="packageId"
              render={({ field }) => (
                <FormItem>
                  <div className="grid gap-4 md:grid-cols-2">
                    {packages.map((pkg) => {
                      const isSelected = field.value === pkg.id;
                      return (
                        <label
                          key={pkg.id}
                          className={`relative flex cursor-pointer flex-col rounded-2xl border p-4 transition-shadow ${
                            isSelected ? "border-primary shadow-lg" : "border-border/60"
                          }`}
                        >
                          <input
                            type="radio"
                            value={pkg.id}
                            checked={isSelected}
                            onChange={() => field.onChange(pkg.id)}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-lg">{pkg.name}</span>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                              {centsToEuros(pkg.priceCents)}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {pkg.includedBalls} billes incluses · Session de {pkg.durationMin} min
                          </p>
                          {pkg.isPromo ? (
                            <span className="mt-3 inline-flex w-fit items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                              Offre spéciale
                            </span>
                          ) : null}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Taille du groupe</h3>
            <FormField
              control={form.control}
              name="groupSize"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Nombre de joueurs</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      value={field.value ?? 0}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Sessions à partir de 8 joueurs. En dessous de 8 =&gt; 25€ / pers manquante.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Choisissez votre créneau</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setLastSelectedDate(date ?? null);
                      }}
                      locale={fr}
                      disabled={(currentDate) =>
                        isBefore(startOfDay(currentDate), startOfDay(new Date()))
                      }
                      className="rounded-3xl border border-border/60 bg-background p-3"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Créneau horaire</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setLastSelectedSlot(value);
                      }}
                      disabled={!slots.length}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full rounded-xl border-border/60 bg-background/80">
                          <SelectValue placeholder="Sélectionnez un créneau" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border border-border/60 bg-background/95">
                        {slots.map((slot) => {
                          const slotDate = new Date(slot);
                          const label = format(slotDate, "HH:mm");
                          return (
                            <SelectItem key={slot} value={slot}>
                              {label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Les créneaux après 20h déclenchent automatiquement l’option nocturne.
                    </FormDescription>
                    {nocturneSelected ? (
                      <p className="mt-2 text-xs font-medium text-amber-600">
                        Ce créneau active automatiquement le supplément nocturne.
                      </p>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Coordonnées &amp; options</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom et prénom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du responsable" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="contact@exemple.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="06 12 34 56 78" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Add-ons</h4>
              {addons.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {addons.map((addon) => (
                    <FormField
                      key={addon.id}
                      control={form.control}
                      name={`addons.${addon.id}` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between text-sm font-medium">
                            <span>{addon.name}</span>
                            <span className="text-muted-foreground text-xs">
                              {centsToEuros(addon.priceCents)} / unité
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              value={field.value ?? 0}
                              onChange={(event) =>
                                field.onChange(event.target.value === "" ? 0 : Number(event.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucun add-on disponible pour le moment.</p>
              )}
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <h4 className="text-lg font-semibold">Récapitulatif tarifaire</h4>
              {quoteLoading ? (
                <p className="mt-2 text-sm text-muted-foreground">Calcul du tarif en cours…</p>
              ) : quote ? (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Forfait</span>
                    <span>{centsToEuros(quote.breakdown.base)}</span>
                  </div>
                  {quote.breakdown.addons > 0 ? (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Options</span>
                      <span>{centsToEuros(quote.breakdown.addons)}</span>
                    </div>
                  ) : null}
                  {quote.breakdown.nocturneExtra > 0 ? (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Nocturne</span>
                      <span>{centsToEuros(quote.breakdown.nocturneExtra)}</span>
                    </div>
                  ) : null}
                  {quote.breakdown.underMinPenalty > 0 ? (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Supplément moins de 8 joueurs</span>
                      <span>{centsToEuros(quote.breakdown.underMinPenalty)}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between border-t border-dashed border-border pt-3 text-base font-semibold">
                    <span>Total estimé</span>
                    <span>{centsToEuros(quote.totalCents)}</span>
                  </div>
                  {quote.nocturne ? (
                    <p className="text-xs text-amber-600">
                      La session est considérée comme nocturne : prévoir l’éclairage du terrain.
                    </p>
                  ) : null}
                </div>
              ) : quoteError ? (
                <p className="mt-2 text-sm text-destructive">{quoteError}</p>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Complétez les informations pour obtenir un tarif estimatif.
                </p>
              )}
            </div>

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border border-border/70"
                    />
                  </FormControl>
                  <div className="space-y-1 text-sm">
                    <FormLabel className="text-sm font-medium">Consentement</FormLabel>
                    <FormDescription>
                      J’accepte que Paintball Méditerranée me recontacte à propos de cette demande de réservation.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            triggerSubmit();
          }}
          className="space-y-8"
        >
        <div className="rounded-3xl border border-border/70 bg-card/70 p-6 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <h2 className="text-2xl font-semibold">Réserver votre session</h2>
              <p className="text-sm text-muted-foreground">
                4 étapes simples pour bloquer votre mission paintball.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
              {STEP_FIELDS.map((_, index) => (
                <div
                  key={index}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
                    index === step
                      ? "border-primary bg-primary text-primary-foreground"
                      : index < step
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {submitSuccess ? (
            <div
              className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-700"
              data-testid="booking-success"
            >
              <span className="sr-only">Réservation envoyée avec succès.</span>
              Votre demande a bien été envoyée ! Nous revenons vers vous rapidement.
            </div>
          ) : null}

          <div className="mt-6">
            {isLoadingData ? (
              <p className="text-sm text-muted-foreground">Chargement des options de réservation…</p>
            ) : (
              renderStep()
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" onClick={handlePrevious} disabled={step === 0}>
            Étape précédente
          </Button>
          {step < STEP_FIELDS.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Étape suivante
            </Button>
          ) : (
            <Button
              type="button"
              className="px-6 py-6 text-sm uppercase tracking-[0.25em]"
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                triggerSubmit();
              }}
            >
              {isSubmitting ? "Envoi en cours…" : "Confirmer la réservation"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
