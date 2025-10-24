"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
} as const;

type BookingStatus = keyof typeof STATUS_LABELS;

const STATUS_BADGE_VARIANT: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  CANCELLED: "destructive",
  COMPLETED: "default",
};

type ClientListItem = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  bookingsCount: number;
  lastBookingAt: string | null;
};

type ClientBooking = {
  id: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  status: BookingStatus;
  packageName: string | null;
  groupSize: number;
  notes: string | null;
};

type ClientDuplicate = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
};

type ClientDetail = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  bookings: ClientBooking[];
  duplicates: ClientDuplicate[];
};

type DetailState = {
  loading: boolean;
  error: string | null;
  data: ClientDetail | null;
};

const formatDateTime = (value: string) =>
  format(new Date(value), "PPPp", { locale: fr });

const formatDate = (value: string) => format(new Date(value), "PPP", { locale: fr });

const normalizeInputValue = (value: string) => value.trimStart();

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailState>({ loading: false, error: null, data: null });
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [merging, setMerging] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        setClientsError(null);
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }
        const response = await fetch(
          `/api/admin/clients${params.size ? `?${params.toString()}` : ""}`,
          { signal: controller.signal },
        );
        const payload = await response.json();

        if (!response.ok) {
          const message =
            payload?.error?.message ??
            payload?.error ??
            "Impossible de récupérer les clients.";
          setClients([]);
          setClientsError(message);
          toast.error(message);
          return;
        }

        const parsed = payload as ClientListItem[];
        setClients(parsed);
        setSelectedClientId((previous) => {
          if (previous && parsed.some((client) => client.id === previous)) {
            return previous;
          }
          return parsed[0]?.id ?? null;
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Impossible de récupérer les clients.";
        setClientsError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingClients(false);
        }
      }
    };

    void fetchClients();

    return () => {
      controller.abort();
    };
  }, [debouncedSearch, listRefreshKey]);

  useEffect(() => {
    if (!selectedClientId) {
      setDetail({ loading: false, error: null, data: null });
      return;
    }

    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setDetail((previous) => ({ ...previous, loading: true, error: null }));
        const response = await fetch(`/api/admin/clients/${selectedClientId}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          const message =
            payload?.error?.message ?? payload?.error ?? "Impossible de récupérer le client.";
          setDetail({ loading: false, error: message, data: null });
          toast.error(message);
          return;
        }

        const parsed = payload as ClientDetail;
        setDetail({ loading: false, error: null, data: parsed });
        setForm({
          name: parsed.name,
          email: parsed.email ?? "",
          phone: parsed.phone ?? "",
          notes: parsed.notes ?? "",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Impossible de récupérer le client.";
        setDetail({ loading: false, error: message, data: null });
        toast.error(message);
      }
    };

    void fetchDetail();

    return () => {
      controller.abort();
    };
  }, [selectedClientId, detailRefreshKey]);

  const hasChanges = useMemo(() => {
    if (!detail.data) {
      return false;
    }
    const nameChanged = form.name.trim() !== detail.data.name;
    const emailChanged = form.email.trim() !== (detail.data.email ?? "");
    const phoneChanged = form.phone.trim() !== (detail.data.phone ?? "");
    const notesChanged = form.notes.trim() !== (detail.data.notes ?? "");
    return nameChanged || emailChanged || phoneChanged || notesChanged;
  }, [detail.data, form.email, form.name, form.notes, form.phone]);

  const handleSave = async () => {
    if (!detail.data || !selectedClientId) {
      return;
    }

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      toast.error("Le nom du client est requis.");
      return;
    }

    const payload: Record<string, string | null> = {};
    if (trimmedName !== detail.data.name) {
      payload.name = trimmedName;
    }

    const trimmedEmail = form.email.trim();
    if (trimmedEmail !== (detail.data.email ?? "")) {
      payload.email = trimmedEmail.length > 0 ? trimmedEmail : null;
    }

    const trimmedPhone = form.phone.trim();
    if (trimmedPhone !== (detail.data.phone ?? "")) {
      payload.phone = trimmedPhone.length > 0 ? trimmedPhone : null;
    }

    const trimmedNotes = form.notes.trim();
    if (trimmedNotes !== (detail.data.notes ?? "")) {
      payload.notes = trimmedNotes.length > 0 ? trimmedNotes : null;
    }

    if (Object.keys(payload).length === 0) {
      toast("Aucune modification à enregistrer.");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/clients/${selectedClientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.error?.message ?? data?.error ?? "Impossible de mettre à jour le client.";
        toast.error(message);
        return;
      }

      toast.success("Client mis à jour avec succès.");
      setDetailRefreshKey((value) => value + 1);
      setListRefreshKey((value) => value + 1);
      setDetail((previous) =>
        previous.data
          ? {
              ...previous,
              data: {
                ...previous.data,
                name: data.name,
                email: data.email,
                phone: data.phone,
                notes: data.notes,
              },
            }
          : previous,
      );
      setForm({
        name: data.name,
        email: data.email ?? "",
        phone: data.phone ?? "",
        notes: data.notes ?? "",
      });
      setClients((previous) =>
        previous.map((client) =>
          client.id === selectedClientId
            ? {
                ...client,
                name: data.name,
                email: data.email,
                phone: data.phone,
                notes: data.notes,
              }
            : client,
        ),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de mettre à jour le client.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleMerge = async (duplicateId: string) => {
    if (!selectedClientId) {
      return;
    }

    try {
      setMerging((previous) => ({ ...previous, [duplicateId]: true }));
      const response = await fetch("/api/admin/clients/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceClientId: duplicateId,
          targetClientId: selectedClientId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        const message = data?.error?.message ?? data?.error ?? "Fusion impossible.";
        toast.error(message);
        return;
      }

      toast.success("Clients fusionnés avec succès.");
      setDetailRefreshKey((value) => value + 1);
      setListRefreshKey((value) => value + 1);
      setClients((previous) =>
        previous
          .filter((client) => client.id !== duplicateId)
          .map((client) =>
            client.id === selectedClientId
              ? {
                  ...client,
                  email: data.email,
                  phone: data.phone,
                  notes: data.notes,
                }
              : client,
          ),
      );
      setDetail((previous) =>
        previous.data
          ? {
              ...previous,
              data: {
                ...previous.data,
                email: data.email,
                phone: data.phone,
                notes: data.notes,
              },
            }
          : previous,
      );
      setForm((previous) => ({
        ...previous,
        email: data.email ?? "",
        phone: data.phone ?? "",
        notes: data.notes ?? "",
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Fusion impossible.";
      toast.error(message);
    } finally {
      setMerging((previous) => ({ ...previous, [duplicateId]: false }));
    }
  };

  const resetForm = () => {
    if (!detail.data) {
      return;
    }
    setForm({
      name: detail.data.name,
      email: detail.data.email ?? "",
      phone: detail.data.phone ?? "",
      notes: detail.data.notes ?? "",
    });
  };

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold uppercase tracking-[0.35em] text-muted-foreground">
          Clients
        </h1>
        <p className="text-sm text-muted-foreground">
          Recherchez les clients, consultez leur historique et fusionnez les doublons.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-4 rounded-xl border bg-card/80 p-4 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Recherche (email ou téléphone)
            </label>
            <Input
              placeholder="ex : client@exemple.fr"
              value={search}
              onChange={(event) => setSearch(normalizeInputValue(event.target.value))}
            />
          </div>

          <div className="overflow-hidden rounded-lg border bg-background/60">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Dernière résa</TableHead>
                  <TableHead className="text-right">Réservations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingClients ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      Chargement des clients...
                    </TableCell>
                  </TableRow>
                ) : clients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      Aucun client trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                    const isSelected = client.id === selectedClientId;
                    return (
                      <TableRow
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-muted/60",
                        )}
                      >
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Créé le {formatDate(client.createdAt)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {client.email ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {client.phone ?? "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {client.lastBookingAt ? formatDate(client.lastBookingAt) : "-"}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">
                          {client.bookingsCount}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {clientsError ? (
            <p className="text-sm text-destructive">{clientsError}</p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-xl border bg-card/80 p-4 shadow-sm">
          {detail.loading && !detail.data ? (
            <p className="text-sm text-muted-foreground">Chargement de la fiche client...</p>
          ) : null}

          {detail.error ? (
            <p className="text-sm text-destructive">{detail.error}</p>
          ) : null}

          {detail.data ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{detail.data.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Fiche créée le {formatDate(detail.data.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Nom
                  </label>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, name: event.target.value }))
                    }
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, email: event.target.value }))
                    }
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Téléphone
                  </label>
                  <Input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, phone: event.target.value }))
                    }
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Notes internes
                  </label>
                  <textarea
                    className="min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={form.notes}
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, notes: event.target.value }))
                    }
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button variant="outline" disabled={saving || !hasChanges} onClick={resetForm}>
                  Réinitialiser
                </Button>
                <Button onClick={handleSave} disabled={saving || !hasChanges}>
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Historique des réservations</h3>
                  <p className="text-sm text-muted-foreground">
                    Dernières réservations associées à ce client.
                  </p>
                </div>
                <div className="overflow-hidden rounded-lg border bg-background/60">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Offre</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Participants</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.data.bookings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-sm text-muted-foreground"
                          >
                            Aucune réservation associée.
                          </TableCell>
                        </TableRow>
                      ) : (
                        detail.data.bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="text-sm text-muted-foreground">
                              <div className="flex flex-col">
                                <span>{formatDateTime(booking.dateTimeStart)}</span>
                                <span className="text-xs text-muted-foreground">
                                  Fin : {formatDateTime(booking.dateTimeEnd)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {booking.packageName ?? "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={STATUS_BADGE_VARIANT[booking.status]}>
                                {STATUS_LABELS[booking.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold">
                              {booking.groupSize}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">Doublons potentiels</h3>
                  <p className="text-sm text-muted-foreground">
                    Fusionnez les fiches partageant le même email ou téléphone.
                  </p>
                </div>
                {detail.data.duplicates.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun doublon détecté pour ce client.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {detail.data.duplicates.map((duplicate) => {
                      const isMerging = merging[duplicate.id] ?? false;
                      return (
                        <div
                          key={duplicate.id}
                          className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/40 p-3 text-sm md:flex-row md:items-center md:justify-between"
                        >
                          <div>
                            <p className="font-semibold">{duplicate.name}</p>
                            <p className="text-muted-foreground">
                              Créé le {formatDate(duplicate.createdAt)}
                            </p>
                            <p className="text-muted-foreground">
                              {duplicate.email ?? "Aucun email"} · {duplicate.phone ?? "Aucun téléphone"}
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            onClick={() => handleMerge(duplicate.id)}
                            disabled={isMerging}
                          >
                            {isMerging ? "Fusion en cours..." : "Fusionner vers ce client"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
