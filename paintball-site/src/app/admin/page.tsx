"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";

type TableRowData = {
  id: string;
  cells: ReactNode[];
};

type TableConfig = {
  caption: string;
  columns: string[];
  emptyMessage: string;
  rows: TableRowData[];
};

const ADMIN_TABS = [
  {
    value: "planning",
    label: "Planning",
    description: "Vue d'ensemble des sessions et créneaux à venir.",
  },
  {
    value: "reservations",
    label: "Réservations",
    description: "Suivi des demandes de réservation et de leur statut.",
  },
  {
    value: "clients",
    label: "Clients",
    description: "Gestion des clients et de leur historique de visites.",
  },
  {
    value: "animateurs",
    label: "Animateurs",
    description: "Affectation des animateurs et disponibilité des équipes.",
  },
  {
    value: "settings",
    label: "Paramètres",
    description: "Configuration générale de la plateforme.",
  },
] as const;

export default function AdminPage() {
  const [planningDialogOpen, setPlanningDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();
  const [selectedAnimator, setSelectedAnimator] = useState<string | undefined>();

  const tableContent: Record<(typeof ADMIN_TABS)[number]["value"], TableConfig> = useMemo(
    () => ({
      planning: {
        caption: "Prochaines sessions programmées.",
        columns: ["Date", "Créneau", "Animateur", "Capacité", "Statut"],
        emptyMessage:
          "Aucune session planifiée pour le moment. Connectez une API pour afficher vos données en temps réel.",
        rows: [
          {
            id: "planning-1",
            cells: [
              "Samedi 12 octobre",
              "09h00 - 11h00",
              "Camille R.",
              "18/20 joueurs",
              <Badge key="planning-1-status" variant="secondary">
                Confirmée
              </Badge>,
            ],
          },
          {
            id: "planning-2",
            cells: [
              "Dimanche 13 octobre",
              "14h00 - 16h00",
              "Léo M.",
              "12/16 joueurs",
              <Badge key="planning-2-status" variant="outline">
                À confirmer
              </Badge>,
            ],
          },
        ],
      },
      reservations: {
        caption: "Historique récent des réservations reçues.",
        columns: ["Client", "Date", "Créneau", "Participants", "Statut"],
        emptyMessage:
          "Aucune réservation trouvée. Branchez l'API de réservation pour alimenter la table automatiquement.",
        rows: [
          {
            id: "reservation-1",
            cells: [
              "Julie P.",
              "09/10/2024",
              "Matin",
              "8",
              <Badge key="reservation-1-status" variant="secondary">
                Confirmée
              </Badge>,
            ],
          },
          {
            id: "reservation-2",
            cells: [
              "Société Lumas",
              "15/10/2024",
              "Après-midi",
              "24",
              <Badge key="reservation-2-status" variant="outline">
                Option
              </Badge>,
            ],
          },
        ],
      },
      clients: {
        caption: "Derniers clients enregistrés.",
        columns: ["Nom", "Email", "Téléphone", "Dernière venue", "Statut"],
        emptyMessage:
          "Les clients apparaîtront ici dès que l'API CRM sera reliée.",
        rows: [
          {
            id: "client-1",
            cells: [
              "Nicolas D.",
              "nicolas.durant@example.com",
              "+33 6 12 34 56 78",
              "20/09/2024",
              <Badge key="client-1-status" variant="secondary">
                Fidèle
              </Badge>,
            ],
          },
          {
            id: "client-2",
            cells: [
              "Emma B.",
              "emma.bardot@example.com",
              "+33 7 98 76 54 32",
              "01/08/2024",
              <Badge key="client-2-status" variant="outline">
                Nouveau
              </Badge>,
            ],
          },
        ],
      },
      animateurs: {
        caption: "Affectations et disponibilité des animateurs.",
        columns: ["Nom", "Prochaine mission", "Compétence", "Statut"],
        emptyMessage:
          "Les animateurs seront listés ici une fois l'intégration RH réalisée.",
        rows: [
          {
            id: "animateur-1",
            cells: [
              "Camille R.",
              "12/10/2024 - Session matin",
              "Briefing & sécurité",
              <Badge key="animateur-1-status" variant="secondary">
                Disponible
              </Badge>,
            ],
          },
          {
            id: "animateur-2",
            cells: [
              "Léo M.",
              "13/10/2024 - Session après-midi",
              "Organisation de tournois",
              <Badge key="animateur-2-status" variant="outline">
                En repos
              </Badge>,
            ],
          },
        ],
      },
      settings: {
        caption: "Paramètres globaux du site.",
        columns: ["Clé", "Valeur", "Dernière mise à jour"],
        emptyMessage:
          "Connectez votre API de configuration pour manipuler ces paramètres depuis le back-office.",
        rows: [
          {
            id: "settings-1",
            cells: [
              "Fuseau horaire",
              "Europe/Paris",
              "02/09/2024",
            ],
          },
          {
            id: "settings-2",
            cells: [
              "Capacité maximale par session",
              "24 joueurs",
              "18/08/2024",
            ],
          },
        ],
      },
    }),
    []
  );

  const resetDialogState = useCallback(() => {
    setSelectedDate(new Date());
    setSelectedTimeSlot(undefined);
    setSelectedAnimator(undefined);
  }, []);

  const handleDialogStateChange = useCallback(
    (open: boolean) => {
      setPlanningDialogOpen(open);
      if (!open) {
        resetDialogState();
      }
    },
    [resetDialogState]
  );

  const handleCreateSession = useCallback(() => {
    if (!selectedDate || !selectedTimeSlot || !selectedAnimator) {
      toast.error("Complétez la date, le créneau et l'animateur pour créer une session.");
      return;
    }

    const formattedDate = format(selectedDate, "PPP", { locale: fr });

    toast.success(
      `Session planifiée le ${formattedDate} (${selectedTimeSlot}) avec ${selectedAnimator}.`
    );
    handleDialogStateChange(false);
  }, [handleDialogStateChange, selectedAnimator, selectedDate, selectedTimeSlot]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10">
      <Tabs defaultValue="planning">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord administrateur</h1>
            <p className="text-muted-foreground text-sm">
              Pilotez vos activités Paintball Méditerranée en centralisant les données clés.
            </p>
          </div>

          <Dialog open={planningDialogOpen} onOpenChange={handleDialogStateChange}>
            <DialogTrigger asChild>
              <Button>Planifier une session</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Planifier une nouvelle session</DialogTitle>
                <DialogDescription>
                  Renseignez les informations ci-dessous pour ajouter un créneau au planning.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="admin-time-slot">Créneau horaire</Label>
                  <Select
                    value={selectedTimeSlot}
                    onValueChange={setSelectedTimeSlot}
                  >
                    <SelectTrigger id="admin-time-slot" className="w-full justify-between">
                      <SelectValue placeholder="Sélectionnez un créneau" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="09h00 - 11h00">09h00 - 11h00</SelectItem>
                      <SelectItem value="11h30 - 13h30">11h30 - 13h30</SelectItem>
                      <SelectItem value="14h00 - 16h00">14h00 - 16h00</SelectItem>
                      <SelectItem value="16h30 - 18h30">16h30 - 18h30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label>Date</Label>
                  <div className="rounded-lg border p-3">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="admin-animator">Animateur référent</Label>
                  <Select
                    value={selectedAnimator}
                    onValueChange={setSelectedAnimator}
                  >
                    <SelectTrigger id="admin-animator" className="w-full justify-between">
                      <SelectValue placeholder="Assignez un animateur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Camille R.">Camille R.</SelectItem>
                      <SelectItem value="Léo M.">Léo M.</SelectItem>
                      <SelectItem value="Inès T.">Inès T.</SelectItem>
                      <SelectItem value="Mathieu G.">Mathieu G.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="sm:space-x-0">
                <Button
                  variant="outline"
                  onClick={() => handleDialogStateChange(false)}
                >
                  Annuler
                </Button>
                <Button onClick={handleCreateSession}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <TabsList className="border-b border-border pb-2">
          {ADMIN_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {ADMIN_TABS.map((tab) => {
          const config = tableContent[tab.value];

          return (
            <TabsContent key={tab.value} value={tab.value}>
              <section className="space-y-4">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <header className="space-y-1">
                    <h2 className="text-xl font-semibold">{tab.label}</h2>
                    <p className="text-sm text-muted-foreground">{tab.description}</p>
                  </header>

                  <div className="mt-6 space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {config.columns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {config.rows.length ? (
                          config.rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.cells.map((cell, index) => (
                                <TableCell key={`${row.id}-${index}`}>{cell}</TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={config.columns.length}
                              className="text-center text-muted-foreground"
                            >
                              {config.emptyMessage}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    <TableCaption>{config.caption}</TableCaption>
                  </div>
                </div>
              </section>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
