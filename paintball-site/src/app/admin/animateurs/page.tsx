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

const STATUS_LABELS = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
} as const;

const STATUS_BADGE_VARIANT: Record<
  keyof typeof STATUS_LABELS,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "outline",
  CONFIRMED: "secondary",
  CANCELLED: "destructive",
  COMPLETED: "default",
};

const normalizeInputValue = (value: string) => value.trimStart();

type AnimatorListItem = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  assignmentsCount: number;
};

type AnimatorAssignment = {
  id: string;
  bookingId: string;
  dateTimeStart: string;
  dateTimeEnd: string;
  status: keyof typeof STATUS_LABELS;
  packageName: string | null;
  customerName: string;
  resourceName: string | null;
};

type AnimatorDetail = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  createdAt: string;
  assignments: AnimatorAssignment[];
};

type DetailState = {
  loading: boolean;
  error: string | null;
  data: AnimatorDetail | null;
};

export default function AnimatorsAdminPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [animators, setAnimators] = useState<AnimatorListItem[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedAnimatorId, setSelectedAnimatorId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailState>({ loading: false, error: null, data: null });
  const [detailRefreshKey, setDetailRefreshKey] = useState(0);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [createForm, setCreateForm] = useState({ name: "", phone: "", notes: "" });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", notes: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAnimators = async () => {
      try {
        setLoadingList(true);
        setListError(null);
        const params = new URLSearchParams();
        if (debouncedSearch) {
          params.set("search", debouncedSearch);
        }
        const response = await fetch(
          `/api/admin/animators${params.size ? `?${params.toString()}` : ""}`,
          { signal: controller.signal },
        );
        const payload = await response.json();

        if (!response.ok) {
          const message =
            payload?.error?.message ??
            payload?.error ??
            "Impossible de récupérer les animateurs.";
          setAnimators([]);
          setListError(message);
          toast.error(message);
          return;
        }

        const parsed = payload as AnimatorListItem[];
        setAnimators(parsed);
        setSelectedAnimatorId((previous) => {
          if (previous && parsed.some((animator) => animator.id === previous)) {
            return previous;
          }
          return parsed[0]?.id ?? null;
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Impossible de récupérer les animateurs.";
        setListError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoadingList(false);
        }
      }
    };

    void fetchAnimators();

    return () => controller.abort();
  }, [debouncedSearch, listRefreshKey]);

  useEffect(() => {
    if (!selectedAnimatorId) {
      setDetail({ loading: false, error: null, data: null });
      return;
    }

    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        setDetail({ loading: true, error: null, data: null });
        const response = await fetch(`/api/admin/animators/${selectedAnimatorId}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          const message =
            payload?.error?.message ??
            payload?.error ??
            "Impossible de récupérer l'animateur.";
          setDetail({ loading: false, error: message, data: null });
          toast.error(message);
          return;
        }

        const parsed = payload as AnimatorDetail;
        setDetail({ loading: false, error: null, data: parsed });
        setEditForm({
          name: parsed.name,
          phone: parsed.phone ?? "",
          notes: parsed.notes ?? "",
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        const message =
          error instanceof Error ? error.message : "Impossible de récupérer l'animateur.";
        setDetail({ loading: false, error: message, data: null });
        toast.error(message);
      }
    };

    void fetchDetail();

    return () => controller.abort();
  }, [selectedAnimatorId, detailRefreshKey]);

  const assignmentsWithDates = useMemo(() => {
    if (!detail.data) {
      return [] as (AnimatorAssignment & { start: Date; end: Date })[];
    }

    return detail.data.assignments
      .map((assignment) => ({
        ...assignment,
        start: new Date(assignment.dateTimeStart),
        end: new Date(assignment.dateTimeEnd),
      }))
      .sort((a, b) => b.start.getTime() - a.start.getTime());
  }, [detail.data]);

  const handleCreateAnimator = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = createForm.name.trim();
    const phone = createForm.phone.trim();
    const notes = createForm.notes.trim();

    if (!name) {
      toast.error("Le nom est requis");
      return;
    }

    setCreateSubmitting(true);

    try {
      const response = await fetch(`/api/admin/animators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: phone.length ? phone : undefined,
          notes: notes.length ? notes : undefined,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message =
          payload?.error?.message ?? payload?.error ?? "Impossible de créer l'animateur.";
        toast.error(message);
        return;
      }

      const created = payload as { id: string };
      toast.success("Animateur créé avec succès.");
      setCreateForm({ name: "", phone: "", notes: "" });
      setListRefreshKey((value) => value + 1);
      setSelectedAnimatorId(created.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de créer l'animateur.";
      toast.error(message);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleUpdateAnimator = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!detail.data) {
      return;
    }

    const name = editForm.name.trim();
    const phone = editForm.phone.trim();
    const notes = editForm.notes.trim();

    const payload: Record<string, string | null> = {};

    if (name !== detail.data.name) {
      if (!name) {
        toast.error("Le nom est requis");
        return;
      }
      payload.name = name;
    }

    if (phone !== (detail.data.phone ?? "")) {
      payload.phone = phone.length ? phone : null;
    }

    if (notes !== (detail.data.notes ?? "")) {
      payload.notes = notes.length ? notes : null;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Aucune modification à enregistrer.");
      return;
    }

    setEditSubmitting(true);

    try {
      const response = await fetch(`/api/admin/animators/${detail.data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();

      if (!response.ok) {
        const message =
          body?.error?.message ?? body?.error ?? "Impossible de mettre à jour l'animateur.";
        toast.error(message);
        return;
      }

      toast.success("Animateur mis à jour avec succès.");
      setDetailRefreshKey((value) => value + 1);
      setListRefreshKey((value) => value + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de mettre à jour l'animateur.";
      toast.error(message);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteAnimator = async () => {
    if (!detail.data) {
      return;
    }

    if (!window.confirm("Supprimer cet animateur ?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/animators/${detail.data.id}`, {
        method: "DELETE",
      });
      const body = await response.json();

      if (!response.ok) {
        const message =
          body?.error?.message ?? body?.error ?? "Impossible de supprimer l'animateur.";
        toast.error(message);
        return;
      }

      toast.success("Animateur supprimé avec succès.");
      setAnimators((previous) => {
        const updated = previous.filter((animator) => animator.id !== detail.data?.id);
        setSelectedAnimatorId((current) => {
          if (!current || current !== detail.data?.id) {
            return current;
          }
          return updated[0]?.id ?? null;
        });
        return updated;
      });
      setDetail({ loading: false, error: null, data: null });
      setListRefreshKey((value) => value + 1);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de supprimer l'animateur.";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Animateurs</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les animateurs, leurs coordonnées et consultez leurs affectations.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <section className="space-y-6 rounded-lg border border-border/60 bg-card p-4 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Liste des animateurs</h2>
            <p className="text-sm text-muted-foreground">
              {loadingList
                ? "Chargement..."
                : listError ?? `${animators.length} animateur${animators.length > 1 ? "s" : ""}`}
            </p>
            <Input
              placeholder="Rechercher par nom ou téléphone"
              value={search}
              onChange={(event) => setSearch(normalizeInputValue(event.target.value))}
            />
          </div>

          <div className="space-y-2">
            {animators.length === 0 && !loadingList ? (
              <p className="text-sm text-muted-foreground">Aucun animateur trouvé.</p>
            ) : (
              <ul className="space-y-1">
                {animators.map((animator) => (
                  <li key={animator.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedAnimatorId(animator.id)}
                      className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                        selectedAnimatorId === animator.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-transparent hover:border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{animator.name}</span>
                        <Badge variant="outline">{animator.assignmentsCount}</Badge>
                      </div>
                      {animator.phone ? (
                        <p className="text-xs text-muted-foreground">{animator.phone}</p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-3 border-t pt-4">
            <h2 className="text-lg font-semibold">Nouvel animateur</h2>
            <form className="space-y-3" onSubmit={(event) => void handleCreateAnimator(event)}>
              <div className="space-y-1">
                <label className="text-sm font-medium">Nom</label>
                <Input
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, name: normalizeInputValue(event.target.value) }))
                  }
                  placeholder="Nom de l'animateur"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={createForm.phone}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, phone: normalizeInputValue(event.target.value) }))
                  }
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createSubmitting}>
                {createSubmitting ? "Création..." : "Ajouter"}
              </Button>
            </form>
          </div>
        </section>

        <section className="space-y-4">
          {!selectedAnimatorId ? (
            <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
              Sélectionnez un animateur pour consulter les détails.
            </div>
          ) : detail.loading ? (
            <div className="rounded-lg border border-border/60 p-6 text-sm text-muted-foreground">
              Chargement des informations...
            </div>
          ) : detail.error ? (
            <div className="rounded-lg border border-destructive/60 bg-destructive/10 p-6 text-sm text-destructive">
              {detail.error}
            </div>
          ) : detail.data ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{detail.data.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      Créé le {format(new Date(detail.data.createdAt), "PPP", { locale: fr })}
                    </p>
                  </div>
                  <Button variant="destructive" onClick={() => void handleDeleteAnimator()} disabled={deleting}>
                    {deleting ? "Suppression..." : "Supprimer"}
                  </Button>
                </div>
                <form className="mt-4 space-y-3" onSubmit={(event) => void handleUpdateAnimator(event)}>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, name: normalizeInputValue(event.target.value) }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, phone: normalizeInputValue(event.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea
                      value={editForm.notes}
                      onChange={(event) =>
                        setEditForm((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <Button type="submit" disabled={editSubmitting}>
                    {editSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </form>
              </div>

              <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Affectations</h3>
                  <Badge variant="outline">{assignmentsWithDates.length}</Badge>
                </div>
                {assignmentsWithDates.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Aucun historique d’affectation pour le moment.
                  </p>
                ) : (
                  <div className="mt-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Créneau</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Offre</TableHead>
                          <TableHead>Terrain</TableHead>
                          <TableHead className="text-right">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignmentsWithDates.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(assignment.start, "PPP", { locale: fr })}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              {format(assignment.start, "HH:mm", { locale: fr })} –
                              {" "}
                              {format(assignment.end, "HH:mm", { locale: fr })}
                            </TableCell>
                            <TableCell className="text-sm">{assignment.customerName}</TableCell>
                            <TableCell className="text-sm">
                              {assignment.packageName ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {assignment.resourceName ?? "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant={STATUS_BADGE_VARIANT[assignment.status]}>
                                {STATUS_LABELS[assignment.status]}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
