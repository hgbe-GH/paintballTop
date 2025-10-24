"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  isSameDay,
  set as setTime,
  startOfDay,
  startOfWeek,
} from "date-fns";
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
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type ViewMode = "week" | "day";

type Animator = {
  id: string;
  name: string;
};

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

type BookingAssignment = {
  id: string;
  bookingId: string;
  animatorId: string;
  animator: Animator;
};

type BookingAddon = {
  addon: {
    id: string;
    name: string;
  };
  quantity: number;
};

type BookingResource = {
  id: string;
  name: string;
} | null;

type BookingPackage = {
  id: string;
  name: string;
  durationMin: number;
};

type BookingResponse = {
  id: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  groupSize: number;
  customerName: string;
  status: BookingStatus;
  nocturne: boolean;
  package: BookingPackage;
  assignments: BookingAssignment[];
  resource: BookingResource;
  bookingAddons: BookingAddon[];
};

type BookingWithDates = Omit<BookingResponse, "dateTimeStart" | "dateTimeEnd"> & {
  dateTimeStart: Date;
  dateTimeEnd: Date;
};

type AssignmentResponse = {
  id: string;
  bookingId: string;
  animatorId: string;
  animator: Animator;
};

type AssignmentDialogState = {
  open: boolean;
  booking: BookingWithDates | null;
  selected: string[];
  existing: string[];
  submitting: boolean;
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
};

const STATUS_BADGE_VARIANT: Record<
  BookingStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  CANCELLED: "destructive",
  COMPLETED: "default",
};

export default function AdminPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [bookings, setBookings] = useState<BookingWithDates[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [animators, setAnimators] = useState<Animator[]>([]);
  const [assignmentDialog, setAssignmentDialog] = useState<AssignmentDialogState>({
    open: false,
    booking: null,
    selected: [],
    existing: [],
    submitting: false,
  });
  const [draggedBookingId, setDraggedBookingId] = useState<string | null>(null);

  const range = useMemo(() => {
    const start =
      viewMode === "week"
        ? startOfWeek(currentDate, { weekStartsOn: 1 })
        : startOfDay(currentDate);
    const end =
      viewMode === "week"
        ? endOfWeek(currentDate, { weekStartsOn: 1 })
        : endOfDay(currentDate);

    return {
      start,
      end,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
    };
  }, [viewMode, currentDate]);

  useEffect(() => {
    const controller = new AbortController();
    setLoadingBookings(true);
    setBookingsError(null);

    const fetchBookings = async () => {
      try {
        const params = new URLSearchParams({
          from: range.startISO,
          to: range.endISO,
        });
        const response = await fetch(`/api/bookings?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          const message =
            payload?.error?.message ??
            payload?.error ??
            "Impossible de récupérer les réservations.";
          setBookings([]);
          setBookingsError(message);
          toast.error(message);
          return;
        }

        const parsed: BookingWithDates[] = (payload as BookingResponse[]).map(
          (booking) => ({
            ...booking,
            dateTimeStart: new Date(booking.dateTimeStart),
            dateTimeEnd: new Date(booking.dateTimeEnd),
          })
        );

        setBookings(parsed);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les réservations.";
        setBookingsError(message);
        toast.error(message);
      } finally {
        setLoadingBookings(false);
      }
    };

    void fetchBookings();

    return () => controller.abort();
  }, [range.startISO, range.endISO]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAnimators = async () => {
      try {
        const response = await fetch("/api/animators", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Impossible de récupérer les animateurs.");
        }
        const payload = (await response.json()) as Animator[];
        setAnimators(payload);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de récupérer les animateurs.";
        toast.error(message);
      }
    };

    void fetchAnimators();

    return () => controller.abort();
  }, []);

  const days = useMemo(() => {
    if (viewMode === "week") {
      return Array.from({ length: 7 }, (_, index) => addDays(range.start, index));
    }

    return [range.start];
  }, [viewMode, range.start]);

  const rangeLabel = useMemo(() => {
    if (viewMode === "week") {
      return `${format(range.start, "d MMM", { locale: fr })} – ${format(
        range.end,
        "d MMM yyyy",
        { locale: fr }
      )}`;
    }

    return format(range.start, "EEEE d MMMM yyyy", { locale: fr });
  }, [range.start, range.end, viewMode]);

  const resetAssignmentDialog = useCallback(() => {
    setAssignmentDialog({
      open: false,
      booking: null,
      selected: [],
      existing: [],
      submitting: false,
    });
  }, []);

  const openAssignmentDialog = useCallback((booking: BookingWithDates) => {
    setAssignmentDialog({
      open: true,
      booking,
      selected: [],
      existing: booking.assignments.map((assignment) => assignment.animatorId),
      submitting: false,
    });
  }, []);

  const toggleAnimatorSelection = useCallback((animatorId: string) => {
    setAssignmentDialog((prev) => {
      if (!prev.booking || prev.existing.includes(animatorId)) {
        return prev;
      }

      const selected = prev.selected.includes(animatorId)
        ? prev.selected.filter((id) => id !== animatorId)
        : [...prev.selected, animatorId];

      return { ...prev, selected };
    });
  }, []);

  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, bookingId: string) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("bookingId", bookingId);
      setDraggedBookingId(bookingId);
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDraggedBookingId(null);
  }, []);

  const handleDayDrop = useCallback(
    async (day: Date, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const bookingId = event.dataTransfer.getData("bookingId");

      if (!bookingId) {
        return;
      }

      const booking = bookings.find((item) => item.id === bookingId);

      if (!booking) {
        return;
      }

      const newStart = setTime(day, {
        hours: booking.dateTimeStart.getHours(),
        minutes: booking.dateTimeStart.getMinutes(),
        seconds: booking.dateTimeStart.getSeconds(),
        milliseconds: booking.dateTimeStart.getMilliseconds(),
      });

      if (booking.dateTimeStart.getTime() === newStart.getTime()) {
        setDraggedBookingId(null);
        return;
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ startISO: newStart.toISOString() }),
        });
        const payload = await response.json();

        if (!response.ok) {
          const message =
            payload?.error?.message ??
            payload?.error ??
            "Impossible de déplacer la réservation.";
          toast.error(message);
          return;
        }

        setBookings((prev) =>
          prev.map((item) =>
            item.id === bookingId
              ? {
                  ...item,
                  dateTimeStart: new Date(payload.dateTimeStart),
                  dateTimeEnd: new Date(payload.dateTimeEnd),
                  nocturne: payload.nocturne ?? item.nocturne,
                }
              : item
          )
        );
        toast.success("Réservation déplacée avec succès.");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Impossible de déplacer la réservation.";
        toast.error(message);
      } finally {
        setDraggedBookingId(null);
      }
    },
    [bookings]
  );

  const handleSubmitAssignments = useCallback(async () => {
    if (!assignmentDialog.booking) {
      return;
    }

    if (assignmentDialog.selected.length === 0) {
      toast.info("Sélectionnez au moins un nouvel animateur.");
      return;
    }

    setAssignmentDialog((prev) => ({ ...prev, submitting: true }));

    try {
      const bookingId = assignmentDialog.booking.id;
      const createdAssignments = await Promise.all(
        assignmentDialog.selected.map(async (animatorId) => {
          const response = await fetch("/api/assignments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ bookingId, animatorId }),
          });
          const payload = await response.json();

          if (!response.ok) {
            throw new Error(
              payload?.error?.message ??
                payload?.error ??
                "Impossible d'assigner l'animateur."
            );
          }

          return payload as AssignmentResponse;
        })
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                assignments: [
                  ...booking.assignments,
                  ...createdAssignments.map((assignment) => ({
                    id: assignment.id,
                    bookingId: assignment.bookingId,
                    animatorId: assignment.animatorId,
                    animator: assignment.animator,
                  })),
                ],
              }
            : booking
        )
      );

      toast.success(
        createdAssignments.length > 1
          ? "Animateurs assignés avec succès."
          : "Animateur assigné avec succès."
      );

      resetAssignmentDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d'assigner l'animateur.";
      toast.error(message);
      setAssignmentDialog((prev) => ({ ...prev, submitting: false }));
    }
  }, [assignmentDialog, resetAssignmentDialog]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate((previous) =>
      addDays(previous, viewMode === "week" ? -7 : -1)
    );
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate((previous) =>
      addDays(previous, viewMode === "week" ? 7 : 1)
    );
  }, [viewMode]);

  return (
    <div className="space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold uppercase tracking-[0.35em] text-muted-foreground">
          Planning
        </h1>
        <p className="text-sm text-muted-foreground">
          Visualisez vos sessions confirmées et à venir, réorganisez-les par glisser-déposer et
          assignez vos animateurs en quelques clics.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 justify-between rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "day" ? "default" : "outline"}
            onClick={() => setViewMode("day")}
          >
            Jour
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
          >
            Semaine
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Button variant="outline" size="icon" onClick={goToPrevious} aria-label="Période précédente">
            ‹
          </Button>
          <span className="min-w-[160px] text-center font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {rangeLabel}
          </span>
          <Button variant="outline" size="icon" onClick={goToNext} aria-label="Période suivante">
            ›
          </Button>
          <Button variant="ghost" onClick={goToToday}>
            Aujourd’hui
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loadingBookings && (
          <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            Chargement du planning…
          </div>
        )}
        {bookingsError && !loadingBookings && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
            {bookingsError}
          </div>
        )}

        <div
          className={cn(
            "grid gap-4",
            viewMode === "week"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7"
              : "grid-cols-1"
          )}
        >
          {days.map((day) => {
            const dailyBookings = bookings.filter((booking) =>
              isSameDay(booking.dateTimeStart, day)
            );

            return (
              <div
                key={day.toISOString()}
                className="flex h-full flex-col rounded-xl border bg-card/80 p-4 shadow-sm"
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => void handleDayDrop(day, event)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                      {format(day, "EEEE", { locale: fr })}
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {format(day, "d MMM", { locale: fr })}
                    </p>
                  </div>
                  <Badge variant="outline" className="px-2">
                    {dailyBookings.length}
                  </Badge>
                </div>

                <div className="mt-4 flex-1 space-y-3">
                  {dailyBookings.length === 0 && (
                    <div className="rounded-lg border border-dashed border-muted/60 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                      Aucun créneau.
                    </div>
                  )}

                  {dailyBookings.map((booking) => (
                    <div
                      key={booking.id}
                      draggable
                      onDragStart={(event) => handleDragStart(event, booking.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "group rounded-xl border bg-background/80 p-4 text-sm shadow-sm transition-all hover:shadow-md",
                        draggedBookingId === booking.id &&
                          "border-primary ring-2 ring-primary/40 opacity-70"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-foreground">
                          {format(booking.dateTimeStart, "HH:mm", { locale: fr })} –
                          {" "}
                          {format(booking.dateTimeEnd, "HH:mm", { locale: fr })}
                        </div>
                        <Badge variant={STATUS_BADGE_VARIANT[booking.status]}>
                          {STATUS_LABELS[booking.status]}
                        </Badge>
                      </div>

                      <div className="mt-2 space-y-1">
                        <p className="text-base font-semibold text-foreground">
                          {booking.customerName}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          {booking.package.name} • {booking.groupSize} personnes
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {booking.nocturne && (
                            <Badge variant="outline" className="uppercase tracking-[0.2em]">
                              Nocturne
                            </Badge>
                          )}
                          {booking.assignments.length > 0 ? (
                            booking.assignments.map((assignment) => (
                              <Badge key={assignment.id} variant="secondary">
                                {assignment.animator.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Aucun animateur assigné
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAssignmentDialog(booking)}
                        >
                          Assigner des animateurs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog
        open={assignmentDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            resetAssignmentDialog();
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assigner des animateurs</DialogTitle>
            <DialogDescription>
              Sélectionnez un ou plusieurs animateurs à ajouter sur ce créneau. Les animateurs
              déjà associés sont indiqués et ne peuvent pas être retirés depuis cette fenêtre.
            </DialogDescription>
          </DialogHeader>

          {assignmentDialog.booking && (
            <div className="space-y-1 rounded-lg border bg-muted/20 p-4 text-sm">
              <p className="font-semibold text-foreground">
                {assignmentDialog.booking.customerName}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {format(assignmentDialog.booking.dateTimeStart, "EEEE d MMMM", { locale: fr })}
                {" • "}
                {format(assignmentDialog.booking.dateTimeStart, "HH:mm", { locale: fr })} –
                {" "}
                {format(assignmentDialog.booking.dateTimeEnd, "HH:mm", { locale: fr })}
              </p>
            </div>
          )}

          <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
            {animators.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucun animateur disponible. Ajoutez des animateurs dans la base de données pour
                pouvoir les assigner.
              </p>
            )}

            {animators.map((animator) => {
              const isExisting = assignmentDialog.existing.includes(animator.id);
              const isSelected =
                isExisting || assignmentDialog.selected.includes(animator.id);

              return (
                <button
                  key={animator.id}
                  type="button"
                  onClick={() => toggleAnimatorSelection(animator.id)}
                  disabled={isExisting || assignmentDialog.submitting}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition",
                    isExisting
                      ? "border-secondary bg-secondary/20 text-secondary-foreground"
                      : isSelected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "hover:border-primary/50 hover:bg-muted/40",
                    assignmentDialog.submitting && "opacity-60"
                  )}
                >
                  <span className="font-medium">{animator.name}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="size-4 rounded border border-input bg-background text-primary"
                  />
                </button>
              );
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={resetAssignmentDialog} disabled={assignmentDialog.submitting}>
              Annuler
            </Button>
            <Button onClick={() => void handleSubmitAssignments()} disabled={assignmentDialog.submitting}>
              {assignmentDialog.submitting ? "Assignation…" : "Assigner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
