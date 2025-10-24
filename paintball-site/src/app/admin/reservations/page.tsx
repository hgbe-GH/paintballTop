"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, isAfter, isBefore } from "date-fns";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toast";

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
} as const;

type BookingStatus = keyof typeof STATUS_LABELS;

type Package = {
  id: string;
  name: string;
};

type Addon = {
  id: string;
  name: string;
};

type Resource = {
  id: string;
  name: string;
};

type BookingAddon = {
  addon: {
    id: string;
    name: string;
  };
  quantity: number;
};

type BookingApiResponse = {
  id: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  status: BookingStatus;
  packageId: string;
  package: Package & { durationMin?: number };
  groupSize: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  notes: string | null;
  nocturne: boolean;
  resourceId: string | null;
  resource: Resource | null;
  bookingAddons: BookingAddon[];
};

type Booking = {
  id: string;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  status: BookingStatus;
  packageId: string;
  package: Package & { durationMin?: number };
  groupSize: number;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  notes: string | null;
  nocturne: boolean;
  resourceId: string | null;
  resource: Resource | null;
  bookingAddons: BookingAddon[];
};

type EditDialogState = {
  open: boolean;
  booking: Booking | null;
  submitting: boolean;
  error: string | null;
  form: {
    date: string;
    time: string;
    packageId: string;
    resourceId: string;
    notes: string;
    addons: Record<string, number>;
  };
};

const STATUS_BADGE_VARIANT: Record<BookingStatus, "outline" | "secondary" | "destructive" | "default"> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  CANCELLED: "destructive",
  COMPLETED: "default",
};

const formatDateInput = (date: Date) => format(date, "yyyy-MM-dd");
const formatTimeInput = (date: Date) => format(date, "HH:mm");

const toISOStartOfDay = (date: string) => new Date(`${date}T00:00:00`).toISOString();
const toISOEndOfDay = (date: string) => new Date(`${date}T23:59:59.999`).toISOString();

const transformBooking = (booking: BookingApiResponse): Booking => ({
  ...booking,
  dateTimeStart: new Date(booking.dateTimeStart),
  dateTimeEnd: new Date(booking.dateTimeEnd),
});

const DEFAULT_EDIT_STATE: EditDialogState = {
  open: false,
  booking: null,
  submitting: false,
  error: null,
  form: {
    date: "",
    time: "",
    packageId: "",
    resourceId: "",
    notes: "",
    addons: {},
  },
};

export default function ReservationsPage() {
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() - 7);
    return formatDateInput(today);
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return formatDateInput(date);
  });
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [packageFilter, setPackageFilter] = useState<string>("ALL");
  const [nocturneFilter, setNocturneFilter] = useState<"ALL" | "YES" | "NO">("ALL");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [editDialog, setEditDialog] = useState<EditDialogState>(DEFAULT_EDIT_STATE);
  const [statusLoading, setStatusLoading] = useState<Record<string, boolean>>({});

  const fetchBookings = useCallback(async () => {
    if (!startDate || !endDate) {
      return;
    }

    const startISO = toISOStartOfDay(startDate);
    const endISO = toISOEndOfDay(endDate);

    if (isAfter(new Date(startISO), new Date(endISO))) {
      setBookingsError("La date de début doit être antérieure à la date de fin.");
      return;
    }

    setLoadingBookings(true);
    setBookingsError(null);

    try {
      const params = new URLSearchParams({
        from: startISO,
        to: endISO,
      });
      const response = await fetch(`/api/bookings?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        const message =
          payload?.error?.message ?? payload?.error ?? "Impossible de récupérer les réservations.";
        setBookings([]);
        setBookingsError(message);
        toast.error(message);
        return;
      }

      const parsed = (payload as BookingApiResponse[]).map(transformBooking);
      setBookings(parsed);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de récupérer les réservations.";
      setBookingsError(message);
      toast.error(message);
    } finally {
      setLoadingBookings(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/public/packages");
        if (!response.ok) {
          throw new Error("Impossible de récupérer les offres.");
        }
        const payload = (await response.json()) as Package[];
        setPackages(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur de récupération des offres.";
        toast.error(message);
      }
    };

    const fetchAddons = async () => {
      try {
        const response = await fetch("/api/public/addons");
        if (!response.ok) {
          throw new Error("Impossible de récupérer les options.");
        }
        const payload = (await response.json()) as Addon[];
        setAddons(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur de récupération des options.";
        toast.error(message);
      }
    };

    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources");
        if (!response.ok) {
          throw new Error("Impossible de récupérer les ressources.");
        }
        const payload = (await response.json()) as Resource[];
        setResources(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur de récupération des ressources.";
        toast.error(message);
      }
    };

    void fetchPackages();
    void fetchAddons();
    void fetchResources();
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (
        (statusFilter !== "ALL" && booking.status !== statusFilter) ||
        (packageFilter !== "ALL" && booking.packageId !== packageFilter)
      ) {
        return false;
      }

      if (nocturneFilter !== "ALL") {
        if (nocturneFilter === "YES" && !booking.nocturne) {
          return false;
        }
        if (nocturneFilter === "NO" && booking.nocturne) {
          return false;
        }
      }

      const startBound = startDate ? new Date(toISOStartOfDay(startDate)) : null;
      const endBound = endDate ? new Date(toISOEndOfDay(endDate)) : null;

      if (startBound && isBefore(booking.dateTimeEnd, startBound)) {
        return false;
      }

      if (endBound && isAfter(booking.dateTimeStart, endBound)) {
        return false;
      }

      return true;
    });
  }, [bookings, endDate, nocturneFilter, packageFilter, startDate, statusFilter]);

  const openEditDialog = useCallback(
    (booking: Booking) => {
      setEditDialog({
        open: true,
        booking,
        submitting: false,
        error: null,
        form: {
          date: formatDateInput(booking.dateTimeStart),
          time: formatTimeInput(booking.dateTimeStart),
          packageId: booking.packageId,
          resourceId: booking.resourceId ?? "",
          notes: booking.notes ?? "",
          addons: booking.bookingAddons.reduce<Record<string, number>>((acc, item) => {
            acc[item.addon.id] = item.quantity;
            return acc;
          }, {}),
        },
      });
    },
    []
  );

  const closeEditDialog = useCallback(() => {
    setEditDialog(DEFAULT_EDIT_STATE);
  }, []);

  const setEditFormValue = useCallback(
    <Key extends keyof EditDialogState["form"]>(key: Key, value: EditDialogState["form"][Key]) => {
      setEditDialog((previous) => ({
        ...previous,
        form: {
          ...previous.form,
          [key]: value,
        },
      }));
    },
    []
  );

  const toggleAddon = useCallback((addonId: string, checked: boolean) => {
    setEditDialog((previous) => {
      const nextAddons = { ...previous.form.addons };
      if (checked) {
        nextAddons[addonId] = nextAddons[addonId] ? nextAddons[addonId] : 1;
      } else {
        delete nextAddons[addonId];
      }
      return {
        ...previous,
        form: {
          ...previous.form,
          addons: nextAddons,
        },
      };
    });
  }, []);

  const updateAddonQuantity = useCallback((addonId: string, quantity: number) => {
    setEditDialog((previous) => {
      const nextAddons = { ...previous.form.addons };
      if (Number.isNaN(quantity) || quantity <= 0) {
        delete nextAddons[addonId];
      } else {
        nextAddons[addonId] = quantity;
      }
      return {
        ...previous,
        form: {
          ...previous.form,
          addons: nextAddons,
        },
      };
    });
  }, []);

  const handleSubmitEdit = useCallback(async () => {
    if (!editDialog.booking) {
      return;
    }

    const { date, time, packageId, resourceId, notes, addons: addonRecord } = editDialog.form;

    if (!date || !time) {
      setEditDialog((previous) => ({
        ...previous,
        error: "Merci de renseigner une date et une heure valides.",
      }));
      return;
    }

    const start = new Date(`${date}T${time}`);

    if (Number.isNaN(start.getTime())) {
      setEditDialog((previous) => ({
        ...previous,
        error: "La date ou l’heure est invalide.",
      }));
      return;
    }

    const payload: Record<string, unknown> = {
      startISO: start.toISOString(),
      packageId,
      notes: notes.trim() || null,
      resourceId: resourceId || null,
    };

    const formattedAddons = Object.entries(addonRecord)
      .filter(([, qty]) => qty > 0)
      .map(([addonId, qty]) => ({ addonId, qty }));

    if (formattedAddons.length > 0 || (addonRecord && Object.keys(addonRecord).length === 0)) {
      payload.addons = formattedAddons;
    }

    setEditDialog((previous) => ({
      ...previous,
      submitting: true,
      error: null,
    }));

    try {
      const response = await fetch(`/api/bookings/${editDialog.booking.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const message =
          result?.error?.message ?? result?.error ?? "Impossible de mettre à jour la réservation.";
        throw new Error(message);
      }

      const updatedBooking = transformBooking(result as BookingApiResponse);
      setBookings((previous) =>
        previous.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking))
      );
      toast.success("Réservation mise à jour.");
      closeEditDialog();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de mettre à jour la réservation.";
      setEditDialog((previous) => ({
        ...previous,
        submitting: false,
        error: message,
      }));
      toast.error(message);
    }
  }, [closeEditDialog, editDialog.booking, editDialog.form, setBookings]);

  const handleStatusAction = useCallback(
    async (booking: Booking, action: "CONFIRM" | "CANCEL" | "COMPLETE") => {
      setStatusLoading((previous) => ({ ...previous, [booking.id]: true }));
      try {
        const response = await fetch(`/api/bookings/${booking.id}/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        });

        const result = await response.json();

        if (!response.ok) {
          const message =
            result?.error?.message ?? result?.error ?? "Impossible de mettre à jour le statut.";
          throw new Error(message);
        }

        const updated = transformBooking(result as BookingApiResponse);
        setBookings((previous) =>
          previous.map((item) => (item.id === booking.id ? updated : item))
        );

        const successMessage =
          action === "CONFIRM"
            ? "Réservation confirmée."
            : action === "CANCEL"
            ? "Réservation annulée."
            : "Réservation terminée.";
        toast.success(successMessage);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Impossible de mettre à jour le statut.";
        toast.error(message);
      } finally {
        setStatusLoading((previous) => ({ ...previous, [booking.id]: false }));
      }
    },
    []
  );

  const canConfirm = (booking: Booking) => booking.status === "PENDING";
  const canCancel = (booking: Booking) => booking.status !== "CANCELLED";
  const canComplete = (booking: Booking) => booking.status === "CONFIRMED";

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold uppercase tracking-[0.35em] text-muted-foreground">
          Réservations
        </h1>
        <p className="text-sm text-muted-foreground">
          Filtrez, consultez et mettez à jour vos réservations en un clin d’œil.
        </p>
      </div>

      <div className="grid gap-4 rounded-xl border bg-card/80 p-4 shadow-sm md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Date de début
          </label>
          <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Date de fin
          </label>
          <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Statut
          </label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="PENDING">En attente</SelectItem>
              <SelectItem value="CONFIRMED">Confirmées</SelectItem>
              <SelectItem value="CANCELLED">Annulées</SelectItem>
              <SelectItem value="COMPLETED">Terminées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Offre
          </label>
          <Select value={packageFilter} onValueChange={(value) => setPackageFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les offres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes</SelectItem>
              {packages.map((pack) => (
                <SelectItem key={pack.id} value={pack.id}>
                  {pack.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 md:col-span-2 lg:col-span-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Nocturne
          </label>
          <Select value={nocturneFilter} onValueChange={(value) => setNocturneFilter(value as typeof nocturneFilter)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous</SelectItem>
              <SelectItem value="YES">Oui</SelectItem>
              <SelectItem value="NO">Non</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end justify-end md:col-span-2 lg:col-span-1">
          <Button variant="outline" onClick={() => void fetchBookings()} disabled={loadingBookings}>
            Rafraîchir
          </Button>
        </div>
      </div>

      {bookingsError && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {bookingsError}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card/80 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="min-w-[160px]">Date</TableHead>
              <TableHead className="min-w-[180px]">Client</TableHead>
              <TableHead>Offre</TableHead>
              <TableHead>Groupe</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Nocturne</TableHead>
              <TableHead className="min-w-[220px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingBookings ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  Chargement des réservations…
                </TableCell>
              </TableRow>
            ) : filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                  Aucune réservation ne correspond aux filtres sélectionnés.
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">
                      {format(booking.dateTimeStart, "EEEE d MMMM", { locale: fr })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(booking.dateTimeStart, "HH:mm", { locale: fr })} –
                      {" "}
                      {format(booking.dateTimeEnd, "HH:mm", { locale: fr })}
                    </div>
                    {booking.resource?.name ? (
                      <div className="mt-1 text-xs text-muted-foreground">
                        Ressource : {booking.resource.name}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{booking.customerName}</div>
                    {booking.customerEmail ? (
                      <div className="text-xs text-muted-foreground">{booking.customerEmail}</div>
                    ) : null}
                    {booking.customerPhone ? (
                      <div className="text-xs text-muted-foreground">{booking.customerPhone}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{booking.package.name}</div>
                    {booking.bookingAddons.length > 0 ? (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {booking.bookingAddons
                          .map((addon) => `${addon.quantity}× ${addon.addon.name}`)
                          .join(", ")}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>{booking.groupSize} joueurs</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[booking.status]}>
                      {STATUS_LABELS[booking.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={booking.nocturne ? "secondary" : "outline"}>
                      {booking.nocturne ? "Oui" : "Non"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(booking)}>
                        Voir / Éditer
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => void handleStatusAction(booking, "CONFIRM")}
                        disabled={!canConfirm(booking) || statusLoading[booking.id]}
                      >
                        Confirmer
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => void handleStatusAction(booking, "CANCEL")}
                        disabled={!canCancel(booking) || statusLoading[booking.id]}
                      >
                        Annuler
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => void handleStatusAction(booking, "COMPLETE")}
                        disabled={!canComplete(booking) || statusLoading[booking.id]}
                      >
                        Terminer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={editDialog.open} onOpenChange={(open) => (!open ? closeEditDialog() : undefined)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Réservation de {editDialog.booking?.customerName}</DialogTitle>
            <DialogDescription>
              Modifiez les informations de cette réservation. Les changements sont appliqués immédiatement.
            </DialogDescription>
          </DialogHeader>

          {editDialog.booking ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={editDialog.form.date}
                    onChange={(event) => setEditFormValue("date", event.target.value)}
                    disabled={editDialog.submitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Heure
                  </label>
                  <Input
                    type="time"
                    value={editDialog.form.time}
                    onChange={(event) => setEditFormValue("time", event.target.value)}
                    disabled={editDialog.submitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Offre
                  </label>
                  <Select
                    value={editDialog.form.packageId}
                    onValueChange={(value) => setEditFormValue("packageId", value)}
                    disabled={editDialog.submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une offre" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pack) => (
                        <SelectItem key={pack.id} value={pack.id}>
                          {pack.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Ressource
                  </label>
                  <Select
                    value={editDialog.form.resourceId}
                    onValueChange={(value) => setEditFormValue("resourceId", value)}
                    disabled={editDialog.submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une ressource" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucune</SelectItem>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Notes internes
                </label>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={editDialog.form.notes}
                  onChange={(event) => setEditFormValue("notes", event.target.value)}
                  disabled={editDialog.submitting}
                />
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Options
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {addons.map((addon) => {
                    const selected = editDialog.form.addons[addon.id] ?? 0;
                    return (
                      <label
                        key={addon.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-sm"
                      >
                        <div>
                          <span className="font-medium">{addon.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={selected > 0}
                            onChange={(event) => toggleAddon(addon.id, event.target.checked)}
                            disabled={editDialog.submitting}
                          />
                          {selected > 0 ? (
                            <Input
                              type="number"
                              min={1}
                              value={selected}
                              onChange={(event) =>
                                updateAddonQuantity(addon.id, Number.parseInt(event.target.value, 10))
                              }
                              className="w-20"
                              disabled={editDialog.submitting}
                            />
                          ) : null}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {editDialog.error ? (
                <p className="text-sm text-destructive">{editDialog.error}</p>
              ) : null}
            </div>
          ) : null}

          <DialogFooter className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={closeEditDialog} disabled={editDialog.submitting}>
              Fermer
            </Button>
            <Button onClick={() => void handleSubmitEdit()} disabled={editDialog.submitting}>
              {editDialog.submitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
