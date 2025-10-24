"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import {
  DAY_LABELS,
  DEFAULT_OPENING_HOURS,
  type DayKey,
  type OpeningHours,
} from "@/lib/settings";

const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const euroFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function formatCents(value: number): string {
  return euroFormatter.format(value / 100);
}

function centsToEuroString(value: number | null | undefined): string {
  if (value == null) {
    return "";
  }
  return (value / 100).toFixed(2);
}

function parseEuroToCents(value: string, field: string): number {
  const normalized = value.replace(",", ".").trim();
  if (normalized.length === 0) {
    throw new Error(`${field} est requis.`);
  }
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} doit être un nombre positif.`);
  }
  return Math.round(parsed * 100);
}

function parseInteger(value: string, field: string, options?: { min?: number }): number {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${field} est requis.`);
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isInteger(parsed)) {
    throw new Error(`${field} doit être un nombre entier.`);
  }
  if (options?.min !== undefined && parsed < options.min) {
    throw new Error(`${field} doit être supérieur ou égal à ${options.min}.`);
  }
  return parsed;
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object") {
      if ("message" in error && typeof (error as { message?: unknown }).message === "string") {
        return (error as { message?: string }).message ?? fallback;
      }
      const formErrors = (error as { formErrors?: unknown }).formErrors;
      if (Array.isArray(formErrors) && formErrors.length > 0 && typeof formErrors[0] === "string") {
        return formErrors[0];
      }
      const fieldErrors = (error as { fieldErrors?: Record<string, unknown> }).fieldErrors;
      if (fieldErrors) {
        for (const value of Object.values(fieldErrors)) {
          if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
            return value[0];
          }
        }
      }
      if ("_errors" in (error as { _errors?: unknown })) {
        const rootErrors = (error as { _errors?: unknown })._errors;
        if (Array.isArray(rootErrors) && rootErrors.length > 0 && typeof rootErrors[0] === "string") {
          return rootErrors[0];
        }
      }
    }
  }
  return fallback;
}

function cloneOpeningHours(hours: OpeningHours): OpeningHours {
  return DAY_ORDER.reduce((acc, day) => {
    acc[day] = { ...hours[day] };
    return acc;
  }, {} as OpeningHours);
}

type PackageItem = {
  id: string;
  name: string;
  priceCents: number;
  durationMin: number;
  includedBalls: number | null;
  isPromo: boolean;
  isPublic: boolean;
};

type AddonItem = {
  id: string;
  name: string;
  priceCents: number;
};

type ResourceItem = {
  id: string;
  name: string;
  capacity: number;
};

type SettingsResponse = {
  id: string;
  nocturneThreshold: number;
  minPlayers: number;
  penaltyUnderMinCents: number;
  openingHours: OpeningHours;
  stripeEnabled: boolean;
  depositType: "NONE" | "FIXED" | "PERCENT";
  depositFixedCents: number | null;
  depositPercent: number | null;
  createdAt: string;
  updatedAt: string;
};

type PackageFormState = {
  name: string;
  price: string;
  durationMin: string;
  includedBalls: string;
  isPromo: boolean;
  isPublic: boolean;
};

type AddonFormState = {
  name: string;
  price: string;
};

type ResourceFormState = {
  name: string;
  capacity: string;
};

type RulesFormState = {
  nocturneThreshold: string;
  minPlayers: string;
  penaltyUnderMinEuros: string;
  openingHours: OpeningHours;
};

type DepositFormState = {
  stripeEnabled: boolean;
  depositType: "NONE" | "FIXED" | "PERCENT";
  depositFixedEuros: string;
  depositPercent: string;
};

const INITIAL_PACKAGE_FORM: PackageFormState = {
  name: "",
  price: "",
  durationMin: "",
  includedBalls: "",
  isPromo: false,
  isPublic: true,
};

const INITIAL_ADDON_FORM: AddonFormState = {
  name: "",
  price: "",
};

const INITIAL_RESOURCE_FORM: ResourceFormState = {
  name: "",
  capacity: "1",
};

const INITIAL_RULES_FORM: RulesFormState = {
  nocturneThreshold: "20:00",
  minPlayers: "8",
  penaltyUnderMinEuros: "25.00",
  openingHours: cloneOpeningHours(DEFAULT_OPENING_HOURS),
};

const INITIAL_DEPOSIT_FORM: DepositFormState = {
  stripeEnabled: false,
  depositType: "NONE",
  depositFixedEuros: "",
  depositPercent: "",
};

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);

  const [rulesForm, setRulesForm] = useState<RulesFormState>(INITIAL_RULES_FORM);
  const [depositForm, setDepositForm] = useState<DepositFormState>(INITIAL_DEPOSIT_FORM);
  const [settingsInfo, setSettingsInfo] = useState<SettingsResponse | null>(null);

  const [packageForm, setPackageForm] = useState<PackageFormState>(INITIAL_PACKAGE_FORM);
  const [addonForm, setAddonForm] = useState<AddonFormState>(INITIAL_ADDON_FORM);
  const [resourceForm, setResourceForm] = useState<ResourceFormState>(INITIAL_RESOURCE_FORM);

  const [packageSubmitting, setPackageSubmitting] = useState(false);
  const [packageSavingId, setPackageSavingId] = useState<string | null>(null);
  const [packageDeletingId, setPackageDeletingId] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editingPackageForm, setEditingPackageForm] = useState<PackageFormState | null>(null);

  const [addonSubmitting, setAddonSubmitting] = useState(false);
  const [addonSavingId, setAddonSavingId] = useState<string | null>(null);
  const [addonDeletingId, setAddonDeletingId] = useState<string | null>(null);
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [editingAddonForm, setEditingAddonForm] = useState<AddonFormState | null>(null);

  const [resourceSubmitting, setResourceSubmitting] = useState(false);
  const [resourceSavingId, setResourceSavingId] = useState<string | null>(null);
  const [resourceDeletingId, setResourceDeletingId] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editingResourceForm, setEditingResourceForm] = useState<ResourceFormState | null>(null);

  const [savingRules, setSavingRules] = useState(false);
  const [savingDeposit, setSavingDeposit] = useState(false);

  const settingsLoaded = useMemo(() => settingsInfo !== null, [settingsInfo]);

  const applySettingsResponse = useCallback((data: SettingsResponse) => {
    setSettingsInfo(data);
    setRulesForm({
      nocturneThreshold: `${String(data.nocturneThreshold).padStart(2, "0")}:00`,
      minPlayers: data.minPlayers.toString(),
      penaltyUnderMinEuros: centsToEuroString(data.penaltyUnderMinCents),
      openingHours: cloneOpeningHours(data.openingHours),
    });
    setDepositForm({
      stripeEnabled: data.stripeEnabled,
      depositType: data.depositType,
      depositFixedEuros: centsToEuroString(data.depositFixedCents),
      depositPercent: data.depositPercent != null ? data.depositPercent.toString() : "",
    });
  }, []);

  const loadPackages = useCallback(async () => {
    const response = await fetch("/api/admin/packages");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, "Impossible de récupérer les offres."));
    }
    const data = (payload as PackageItem[]).slice().sort((a, b) => a.priceCents - b.priceCents);
    setPackages(data);
  }, []);

  const loadAddons = useCallback(async () => {
    const response = await fetch("/api/admin/addons");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, "Impossible de récupérer les options."));
    }
    const data = (payload as AddonItem[]).slice().sort((a, b) => a.priceCents - b.priceCents);
    setAddons(data);
  }, []);

  const loadResources = useCallback(async () => {
    const response = await fetch("/api/admin/resources");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, "Impossible de récupérer les ressources."));
    }
    const data = (payload as ResourceItem[]).slice().sort((a, b) => a.name.localeCompare(b.name));
    setResources(data);
  }, []);

  const loadSettings = useCallback(async () => {
    const response = await fetch("/api/admin/settings");
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, "Impossible de récupérer les paramètres."));
    }
    applySettingsResponse(payload as SettingsResponse);
  }, [applySettingsResponse]);

  const reloadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadPackages(), loadAddons(), loadResources(), loadSettings()]);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de charger les paramètres.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [loadPackages, loadAddons, loadResources, loadSettings]);

  useEffect(() => {
    void reloadAll();
  }, [reloadAll]);

  const buildSettingsPayload = useCallback(() => {
    const [hourString] = rulesForm.nocturneThreshold.split(":");
    const nocturneThreshold = parseInteger(hourString ?? "", "Seuil nocturne", { min: 0 });
    if (nocturneThreshold > 23) {
      throw new Error("Le seuil nocturne doit être compris entre 0 et 23 heures.");
    }

    const minPlayers = parseInteger(rulesForm.minPlayers, "Nombre minimum de joueurs", { min: 1 });
    const penaltyUnderMinCents = parseEuroToCents(
      rulesForm.penaltyUnderMinEuros,
      "Pénalité par joueur manquant",
    );

    let depositFixedCents: number | null = null;
    let depositPercent: number | null = null;

    if (depositForm.depositType === "FIXED") {
      depositFixedCents = parseEuroToCents(
        depositForm.depositFixedEuros,
        "Montant du dépôt",
      );
    } else if (depositForm.depositType === "PERCENT") {
      const percent = parseInteger(depositForm.depositPercent, "Pourcentage du dépôt", { min: 0 });
      if (percent > 100) {
        throw new Error("Le pourcentage du dépôt ne peut pas dépasser 100%.");
      }
      depositPercent = percent;
    }

    return {
      nocturneThreshold,
      minPlayers,
      penaltyUnderMinCents,
      openingHours: rulesForm.openingHours,
      stripeEnabled: depositForm.stripeEnabled,
      depositType: depositForm.depositType,
      depositFixedCents,
      depositPercent,
    };
  }, [
    depositForm.depositPercent,
    depositForm.depositType,
    depositForm.depositFixedEuros,
    depositForm.stripeEnabled,
    rulesForm.minPlayers,
    rulesForm.nocturneThreshold,
    rulesForm.openingHours,
    rulesForm.penaltyUnderMinEuros,
  ]);

  const submitSettings = useCallback(
    async (successMessage: string) => {
      const payload = buildSettingsPayload();
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible d'enregistrer les paramètres."));
      }
      applySettingsResponse(body as SettingsResponse);
      toast.success(successMessage);
    },
    [applySettingsResponse, buildSettingsPayload],
  );

  const handleSaveRules = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSavingRules(true);
      await submitSettings("Règles mises à jour.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible d'enregistrer les règles.";
      toast.error(message);
    } finally {
      setSavingRules(false);
    }
  };

  const handleSaveDeposit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSavingDeposit(true);
      await submitSettings("Paramètres de dépôt mis à jour.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible d'enregistrer le dépôt.";
      toast.error(message);
    } finally {
      setSavingDeposit(false);
    }
  };

  const handleCreatePackage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setPackageSubmitting(true);
      const payload = {
        name: packageForm.name.trim(),
        priceCents: parseEuroToCents(packageForm.price, "Prix"),
        durationMin: parseInteger(packageForm.durationMin, "Durée", { min: 1 }),
        includedBalls:
          packageForm.includedBalls.trim().length > 0
            ? parseInteger(packageForm.includedBalls, "Billes incluses", { min: 0 })
            : null,
        isPromo: packageForm.isPromo,
        isPublic: packageForm.isPublic,
      };

      const response = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de créer l'offre."));
      }

      await loadPackages();
      setPackageForm(INITIAL_PACKAGE_FORM);
      toast.success("Offre créée avec succès.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de créer l'offre.";
      toast.error(message);
    } finally {
      setPackageSubmitting(false);
    }
  };

  const handleUpdatePackage = async (id: string) => {
    if (!editingPackageForm) {
      return;
    }
    try {
      setPackageSavingId(id);
      const payload = {
        name: editingPackageForm.name.trim(),
        priceCents: parseEuroToCents(editingPackageForm.price, "Prix"),
        durationMin: parseInteger(editingPackageForm.durationMin, "Durée", { min: 1 }),
        includedBalls:
          editingPackageForm.includedBalls.trim().length > 0
            ? parseInteger(editingPackageForm.includedBalls, "Billes incluses", { min: 0 })
            : null,
        isPromo: editingPackageForm.isPromo,
        isPublic: editingPackageForm.isPublic,
      };

      const response = await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de mettre à jour l'offre."));
      }

      await loadPackages();
      setEditingPackageId(null);
      setEditingPackageForm(null);
      toast.success("Offre mise à jour.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de mettre à jour l'offre.";
      toast.error(message);
    } finally {
      setPackageSavingId(null);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm("Supprimer cette offre ?")) {
      return;
    }
    try {
      setPackageDeletingId(id);
      const response = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de supprimer l'offre."));
      }
      await loadPackages();
      toast.success("Offre supprimée.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de supprimer l'offre.";
      toast.error(message);
    } finally {
      setPackageDeletingId(null);
    }
  };

  const handleCreateAddon = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setAddonSubmitting(true);
      const payload = {
        name: addonForm.name.trim(),
        priceCents: parseEuroToCents(addonForm.price, "Prix"),
      };

      const response = await fetch("/api/admin/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de créer l'option."));
      }

      await loadAddons();
      setAddonForm(INITIAL_ADDON_FORM);
      toast.success("Option créée avec succès.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de créer l'option.";
      toast.error(message);
    } finally {
      setAddonSubmitting(false);
    }
  };

  const handleUpdateAddon = async (id: string) => {
    if (!editingAddonForm) {
      return;
    }
    try {
      setAddonSavingId(id);
      const payload = {
        name: editingAddonForm.name.trim(),
        priceCents: parseEuroToCents(editingAddonForm.price, "Prix"),
      };

      const response = await fetch(`/api/admin/addons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de mettre à jour l'option."));
      }

      await loadAddons();
      setEditingAddonId(null);
      setEditingAddonForm(null);
      toast.success("Option mise à jour.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de mettre à jour l'option.";
      toast.error(message);
    } finally {
      setAddonSavingId(null);
    }
  };

  const handleDeleteAddon = async (id: string) => {
    if (!window.confirm("Supprimer cette option ?")) {
      return;
    }
    try {
      setAddonDeletingId(id);
      const response = await fetch(`/api/admin/addons/${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de supprimer l'option."));
      }
      await loadAddons();
      toast.success("Option supprimée.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de supprimer l'option.";
      toast.error(message);
    } finally {
      setAddonDeletingId(null);
    }
  };

  const handleCreateResource = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setResourceSubmitting(true);
      const payload = {
        name: resourceForm.name.trim(),
        capacity: parseInteger(resourceForm.capacity, "Capacité", { min: 1 }),
      };

      const response = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de créer la ressource."));
      }

      await loadResources();
      setResourceForm(INITIAL_RESOURCE_FORM);
      toast.success("Ressource créée avec succès.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de créer la ressource.";
      toast.error(message);
    } finally {
      setResourceSubmitting(false);
    }
  };

  const handleUpdateResource = async (id: string) => {
    if (!editingResourceForm) {
      return;
    }
    try {
      setResourceSavingId(id);
      const payload = {
        name: editingResourceForm.name.trim(),
        capacity: parseInteger(editingResourceForm.capacity, "Capacité", { min: 1 }),
      };

      const response = await fetch(`/api/admin/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de mettre à jour la ressource."));
      }

      await loadResources();
      setEditingResourceId(null);
      setEditingResourceForm(null);
      toast.success("Ressource mise à jour.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de mettre à jour la ressource.";
      toast.error(message);
    } finally {
      setResourceSavingId(null);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Supprimer cette ressource ?")) {
      return;
    }
    try {
      setResourceDeletingId(id);
      const response = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(extractErrorMessage(body, "Impossible de supprimer la ressource."));
      }
      await loadResources();
      toast.success("Ressource supprimée.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Impossible de supprimer la ressource.";
      toast.error(message);
    } finally {
      setResourceDeletingId(null);
    }
  };

  if (loading && !settingsLoaded && packages.length === 0 && addons.length === 0 && resources.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-heading text-3xl uppercase tracking-[0.3em]">Paramètres</h1>
        <p className="mt-6 text-muted-foreground">Chargement des paramètres…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl uppercase tracking-[0.3em]">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez les offres, options et règles de tarification de Paintball Méditerranée.
        </p>
        {settingsInfo && (
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Dernière mise à jour : {new Date(settingsInfo.updatedAt).toLocaleString("fr-FR")}
          </p>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">{error}</p>
            <Button variant="outline" className="mt-3" onClick={() => void reloadAll()}>
              Réessayer
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="rules" className="space-y-6">
        <TabsList>
          <TabsTrigger value="rules">Règles</TabsTrigger>
          <TabsTrigger value="deposit">Dépôt</TabsTrigger>
          <TabsTrigger value="packages">Offres</TabsTrigger>
          <TabsTrigger value="addons">Options</TabsTrigger>
          <TabsTrigger value="resources">Ressources</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <form onSubmit={handleSaveRules} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Seuil nocturne
                </label>
                <Input
                  type="time"
                  step={900}
                  value={rulesForm.nocturneThreshold}
                  onChange={(event) =>
                    setRulesForm((current) => ({
                      ...current,
                      nocturneThreshold: event.target.value,
                    }))
                  }
                  disabled={!settingsLoaded || savingRules}
                />
                <p className="text-xs text-muted-foreground">
                  Heure à partir de laquelle le supplément nocturne s'applique.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Joueurs minimum
                </label>
                <Input
                  type="number"
                  min={1}
                  value={rulesForm.minPlayers}
                  onChange={(event) =>
                    setRulesForm((current) => ({
                      ...current,
                      minPlayers: event.target.value,
                    }))
                  }
                  disabled={!settingsLoaded || savingRules}
                />
                <p className="text-xs text-muted-foreground">
                  Nombre de joueurs requis avant d'appliquer la pénalité.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Pénalité par joueur manquant (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={rulesForm.penaltyUnderMinEuros}
                  onChange={(event) =>
                    setRulesForm((current) => ({
                      ...current,
                      penaltyUnderMinEuros: event.target.value,
                    }))
                  }
                  disabled={!settingsLoaded || savingRules}
                />
                <p className="text-xs text-muted-foreground">
                  Montant facturé par joueur manquant si le minimum n'est pas atteint.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Horaires d'ouverture</h2>
              <div className="grid gap-3">
                {DAY_ORDER.map((day) => {
                  const schedule = rulesForm.openingHours[day];
                  return (
                    <div
                      key={day}
                      className="grid items-center gap-3 sm:grid-cols-[160px_120px_repeat(2,minmax(0,1fr))]"
                    >
                      <span className="text-sm font-medium text-muted-foreground">
                        {DAY_LABELS[day]}
                      </span>
                      <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        <input
                          type="checkbox"
                          className="size-4 rounded border border-input bg-background text-primary"
                          checked={schedule.closed}
                          onChange={(event) =>
                            setRulesForm((current) => ({
                              ...current,
                              openingHours: {
                                ...current.openingHours,
                                [day]: { ...schedule, closed: event.target.checked },
                              },
                            }))
                          }
                          disabled={!settingsLoaded || savingRules}
                        />
                        Fermé
                      </label>
                      <Input
                        type="time"
                        value={schedule.open}
                        disabled={!settingsLoaded || savingRules || schedule.closed}
                        onChange={(event) =>
                          setRulesForm((current) => ({
                            ...current,
                            openingHours: {
                              ...current.openingHours,
                              [day]: { ...schedule, open: event.target.value },
                            },
                          }))
                        }
                      />
                      <Input
                        type="time"
                        value={schedule.close}
                        disabled={!settingsLoaded || savingRules || schedule.closed}
                        onChange={(event) =>
                          setRulesForm((current) => ({
                            ...current,
                            openingHours: {
                              ...current.openingHours,
                              [day]: { ...schedule, close: event.target.value },
                            },
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <Button type="submit" disabled={!settingsLoaded || savingRules}>
              {savingRules ? "Enregistrement…" : "Enregistrer les règles"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="deposit">
          <form onSubmit={handleSaveDeposit} className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4 rounded border border-input bg-background text-primary"
                  checked={depositForm.stripeEnabled}
                  onChange={(event) =>
                    setDepositForm((current) => ({
                      ...current,
                      stripeEnabled: event.target.checked,
                      depositType:
                        !event.target.checked && current.depositType === "PERCENT"
                          ? "NONE"
                          : current.depositType,
                    }))
                  }
                  disabled={!settingsLoaded || savingDeposit}
                />
                Paiement en ligne (Stripe) activé
              </label>
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Type de dépôt
                </span>
                <Select
                  value={depositForm.depositType}
                  onValueChange={(value) =>
                    setDepositForm((current) => ({
                      ...current,
                      depositType: value as DepositFormState["depositType"],
                    }))
                  }
                  disabled={!settingsLoaded || savingDeposit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Aucun</SelectItem>
                    <SelectItem value="FIXED">Montant fixe</SelectItem>
                    <SelectItem value="PERCENT" disabled={!depositForm.stripeEnabled}>
                      Pourcentage
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {depositForm.depositType === "FIXED" && (
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Montant du dépôt (€)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={depositForm.depositFixedEuros}
                  onChange={(event) =>
                    setDepositForm((current) => ({
                      ...current,
                      depositFixedEuros: event.target.value,
                    }))
                  }
                  disabled={!settingsLoaded || savingDeposit}
                />
              </div>
            )}

            {depositForm.depositType === "PERCENT" && (
              <div className="space-y-2">
                <label className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Pourcentage du dépôt (%)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={depositForm.depositPercent}
                  onChange={(event) =>
                    setDepositForm((current) => ({
                      ...current,
                      depositPercent: event.target.value,
                    }))
                  }
                  disabled={!settingsLoaded || savingDeposit}
                />
                {!depositForm.stripeEnabled && (
                  <p className="text-xs text-destructive">
                    Activez Stripe pour appliquer un dépôt en pourcentage.
                  </p>
                )}
              </div>
            )}

            <Button type="submit" disabled={!settingsLoaded || savingDeposit}>
              {savingDeposit ? "Enregistrement…" : "Enregistrer le dépôt"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <form
            onSubmit={handleCreatePackage}
            className="grid gap-4 rounded-lg border border-border/60 p-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nom</label>
              <Input
                value={packageForm.name}
                onChange={(event) => setPackageForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Prix (€)</label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={packageForm.price}
                onChange={(event) => setPackageForm((current) => ({ ...current, price: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Durée (min)</label>
              <Input
                type="number"
                min={1}
                value={packageForm.durationMin}
                onChange={(event) =>
                  setPackageForm((current) => ({ ...current, durationMin: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Billes incluses</label>
              <Input
                type="number"
                min={0}
                value={packageForm.includedBalls}
                onChange={(event) =>
                  setPackageForm((current) => ({ ...current, includedBalls: event.target.value }))
                }
                placeholder="Optionnel"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 rounded border border-input bg-background text-primary"
                checked={packageForm.isPromo}
                onChange={(event) =>
                  setPackageForm((current) => ({ ...current, isPromo: event.target.checked }))
                }
              />
              <span className="text-sm">Offre promotionnelle</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="size-4 rounded border border-input bg-background text-primary"
                checked={packageForm.isPublic}
                onChange={(event) =>
                  setPackageForm((current) => ({ ...current, isPublic: event.target.checked }))
                }
              />
              <span className="text-sm">Visible sur le site</span>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={packageSubmitting}>
                {packageSubmitting ? "Création…" : "Ajouter l'offre"}
              </Button>
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Billes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pack) => {
                const isEditing = editingPackageId === pack.id;
                return (
                  <TableRow key={pack.id}>
                    <TableCell className="font-medium">
                      {isEditing && editingPackageForm ? (
                        <Input
                          value={editingPackageForm.name}
                          onChange={(event) =>
                            setEditingPackageForm((current) =>
                              current ? { ...current, name: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        pack.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && editingPackageForm ? (
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editingPackageForm.price}
                          onChange={(event) =>
                            setEditingPackageForm((current) =>
                              current ? { ...current, price: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        formatCents(pack.priceCents)
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && editingPackageForm ? (
                        <Input
                          type="number"
                          min={1}
                          value={editingPackageForm.durationMin}
                          onChange={(event) =>
                            setEditingPackageForm((current) =>
                              current ? { ...current, durationMin: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        `${pack.durationMin} min`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && editingPackageForm ? (
                        <Input
                          type="number"
                          min={0}
                          value={editingPackageForm.includedBalls}
                          onChange={(event) =>
                            setEditingPackageForm((current) =>
                              current ? { ...current, includedBalls: event.target.value } : current,
                            )
                          }
                        />
                      ) : pack.includedBalls != null ? (
                        pack.includedBalls
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && editingPackageForm ? (
                        <div className="flex flex-col gap-1">
                          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            <input
                              type="checkbox"
                              className="size-4 rounded border border-input bg-background text-primary"
                              checked={editingPackageForm.isPromo}
                              onChange={(event) =>
                                setEditingPackageForm((current) =>
                                  current ? { ...current, isPromo: event.target.checked } : current,
                                )
                              }
                            />
                            Promo
                          </label>
                          <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            <input
                              type="checkbox"
                              className="size-4 rounded border border-input bg-background text-primary"
                              checked={editingPackageForm.isPublic}
                              onChange={(event) =>
                                setEditingPackageForm((current) =>
                                  current ? { ...current, isPublic: event.target.checked } : current,
                                )
                              }
                            />
                            Public
                          </label>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          <span className={pack.isPromo ? "text-primary" : undefined}>
                            {pack.isPromo ? "Promo" : "Standard"}
                          </span>
                          <span>{pack.isPublic ? "Public" : "Privé"}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {isEditing && editingPackageForm ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingPackageId(null);
                              setEditingPackageForm(null);
                            }}
                            disabled={packageSavingId === pack.id}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={() => void handleUpdatePackage(pack.id)}
                            disabled={packageSavingId === pack.id}
                          >
                            {packageSavingId === pack.id ? "Sauvegarde…" : "Enregistrer"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingPackageId(pack.id);
                              setEditingPackageForm({
                                name: pack.name,
                                price: centsToEuroString(pack.priceCents),
                                durationMin: pack.durationMin.toString(),
                                includedBalls: pack.includedBalls?.toString() ?? "",
                                isPromo: pack.isPromo,
                                isPublic: pack.isPublic,
                              });
                            }}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => void handleDeletePackage(pack.id)}
                            disabled={packageDeletingId === pack.id}
                          >
                            {packageDeletingId === pack.id ? "Suppression…" : "Supprimer"}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {packages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Aucune offre configurée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="addons" className="space-y-6">
          <form
            onSubmit={handleCreateAddon}
            className="grid gap-4 rounded-lg border border-border/60 p-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nom</label>
              <Input
                value={addonForm.name}
                onChange={(event) => setAddonForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Prix (€)</label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={addonForm.price}
                onChange={(event) => setAddonForm((current) => ({ ...current, price: event.target.value }))}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={addonSubmitting}>
                {addonSubmitting ? "Création…" : "Ajouter l'option"}
              </Button>
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addons.map((addon) => {
                const isEditing = editingAddonId === addon.id;
                return (
                  <TableRow key={addon.id}>
                    <TableCell className="font-medium">
                      {isEditing && editingAddonForm ? (
                        <Input
                          value={editingAddonForm.name}
                          onChange={(event) =>
                            setEditingAddonForm((current) =>
                              current ? { ...current, name: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        addon.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && editingAddonForm ? (
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editingAddonForm.price}
                          onChange={(event) =>
                            setEditingAddonForm((current) =>
                              current ? { ...current, price: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        formatCents(addon.priceCents)
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {isEditing && editingAddonForm ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingAddonId(null);
                              setEditingAddonForm(null);
                            }}
                            disabled={addonSavingId === addon.id}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={() => void handleUpdateAddon(addon.id)}
                            disabled={addonSavingId === addon.id}
                          >
                            {addonSavingId === addon.id ? "Sauvegarde…" : "Enregistrer"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingAddonId(addon.id);
                              setEditingAddonForm({
                                name: addon.name,
                                price: centsToEuroString(addon.priceCents),
                              });
                            }}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => void handleDeleteAddon(addon.id)}
                            disabled={addonDeletingId === addon.id}
                          >
                            {addonDeletingId === addon.id ? "Suppression…" : "Supprimer"}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {addons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    Aucune option configurée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <form
            onSubmit={handleCreateResource}
            className="grid gap-4 rounded-lg border border-border/60 p-4 md:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Nom</label>
              <Input
                value={resourceForm.name}
                onChange={(event) =>
                  setResourceForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Capacité</label>
              <Input
                type="number"
                min={1}
                value={resourceForm.capacity}
                onChange={(event) =>
                  setResourceForm((current) => ({ ...current, capacity: event.target.value }))
                }
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={resourceSubmitting}>
                {resourceSubmitting ? "Création…" : "Ajouter la ressource"}
              </Button>
            </div>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Capacité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => {
                const isEditing = editingResourceId === resource.id;
                return (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">
                      {isEditing && editingResourceForm ? (
                        <Input
                          value={editingResourceForm.name}
                          onChange={(event) =>
                            setEditingResourceForm((current) =>
                              current ? { ...current, name: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        resource.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && editingResourceForm ? (
                        <Input
                          type="number"
                          min={1}
                          value={editingResourceForm.capacity}
                          onChange={(event) =>
                            setEditingResourceForm((current) =>
                              current ? { ...current, capacity: event.target.value } : current,
                            )
                          }
                        />
                      ) : (
                        resource.capacity
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {isEditing && editingResourceForm ? (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingResourceId(null);
                              setEditingResourceForm(null);
                            }}
                            disabled={resourceSavingId === resource.id}
                          >
                            Annuler
                          </Button>
                          <Button
                            onClick={() => void handleUpdateResource(resource.id)}
                            disabled={resourceSavingId === resource.id}
                          >
                            {resourceSavingId === resource.id ? "Sauvegarde…" : "Enregistrer"}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setEditingResourceId(resource.id);
                              setEditingResourceForm({
                                name: resource.name,
                                capacity: resource.capacity.toString(),
                              });
                            }}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => void handleDeleteResource(resource.id)}
                            disabled={resourceDeletingId === resource.id}
                          >
                            {resourceDeletingId === resource.id ? "Suppression…" : "Supprimer"}
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {resources.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    Aucune ressource configurée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
