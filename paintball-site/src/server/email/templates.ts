import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { Prisma } from "@/generated/prisma/client";

const BUSINESS_NAME = "Paintball Méditerranée";
const VENUE_ADDRESS = "Route des Pins, 13000 Marseille";
const VENUE_PHONE = "+33 4 42 00 00 00";
const VENUE_EMAIL = "contact@paintball-med.com";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const tableStyle = "width:100%;border-collapse:collapse;margin:16px 0;";
const cellStyle = "border:1px solid #e5e7eb;padding:8px;text-align:left;";
const headerStyle = `${cellStyle}background-color:#f3f4f6;font-weight:600;`;

const ctaStyle = [
  "display:inline-block",
  "padding:12px 18px",
  "margin-right:12px",
  "border-radius:8px",
  "background-color:#2563eb",
  "color:#ffffff",
  "text-decoration:none",
  "font-weight:600",
].join(";");

const mutedStyle = "color:#6b7280;margin:4px 0;";

function formatCurrency(cents: number): string {
  return currencyFormatter.format((cents ?? 0) / 100);
}

function ensureDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

type BookingEmailPayload = Prisma.BookingGetPayload<{
  include: {
    package: true;
    resource: true;
    client: true;
    bookingAddons: {
      include: {
        addon: true;
      };
    };
  };
}> & {
  manageUrl?: string | null;
  modificationUrl?: string | null;
  cancellationUrl?: string | null;
};

type BookingTemplateParams = {
  booking: BookingEmailPayload;
  totalCents: number;
};

type BookingConfirmationParams = BookingTemplateParams & {
  mapUrl?: string | null;
  wazeUrl?: string | null;
};

type TemplateResult = {
  subject: string;
  html: string;
  text: string;
};

function getManageUrl(booking: BookingEmailPayload): string | null {
  const candidateKeys = ["manageUrl", "modificationUrl", "cancellationUrl"] as const;

  for (const key of candidateKeys) {
    const value = booking[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  if (typeof (booking as { manageLink?: string }).manageLink === "string") {
    const value = (booking as { manageLink?: string }).manageLink?.trim();
    if (value) {
      return value;
    }
  }

  return null;
}

function buildAddonRows(booking: BookingEmailPayload): Array<{
  label: string;
  price: string;
}> {
  if (!Array.isArray(booking.bookingAddons)) {
    return [];
  }

  return booking.bookingAddons.map((item) => {
    const name = item.addon?.name ?? "Option";
    const quantity = item.quantity ?? 1;
    const priceCents = item.addon?.priceCents ?? 0;
    const total = priceCents * quantity;
    const label = `${name} × ${quantity}`;
    return {
      label,
      price: formatCurrency(total),
    };
  });
}

function buildAddonText(addons: Array<{ label: string; price: string }>): string {
  if (addons.length === 0) {
    return "Aucune option ajoutée";
  }

  return addons
    .map((addon) => `- ${addon.label} : ${addon.price}`)
    .join("\n");
}

function renderAddonHtml(addons: Array<{ label: string; price: string }>): string {
  if (addons.length === 0) {
    return `<p style="${mutedStyle}">Aucune option ajoutée</p>`;
  }

  const rows = addons
    .map(
      (addon) =>
        `<tr><td style="${cellStyle}">${addon.label}</td><td style="${cellStyle}">${addon.price}</td></tr>`
    )
    .join("");

  return `
    <table style="${tableStyle}">
      <thead>
        <tr>
          <th style="${headerStyle}">Option</th>
          <th style="${headerStyle}">Montant</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
}

function buildBookingSummaryRows(
  booking: BookingEmailPayload,
  totalCents: number
): Array<{ label: string; value: string }> {
  const start = ensureDate(booking.dateTimeStart);
  const end = ensureDate(booking.dateTimeEnd);
  const durationMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (60 * 1000))
  );

  const rows: Array<{ label: string; value: string }> = [
    { label: "Forfait", value: booking.package?.name ?? "Forfait" },
    { label: "Nombre de joueurs", value: `${booking.groupSize}` },
    { label: "Session nocturne", value: booking.nocturne ? "Oui" : "Non" },
    {
      label: "Date",
      value: `${dateFormatter.format(start)}`,
    },
    {
      label: "Horaire",
      value: `${timeFormatter.format(start)} – ${timeFormatter.format(end)}`,
    },
  ];

  if (Number.isFinite(durationMinutes) && durationMinutes > 0) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationLabel = hours > 0 ? `${hours}h${minutes.toString().padStart(2, "0")}` : `${minutes} min`;
    rows.push({ label: "Durée estimée", value: durationLabel });
  }

  if (booking.resource?.name) {
    rows.push({ label: "Terrain", value: booking.resource.name });
  }

  rows.push({ label: "Total estimé", value: formatCurrency(totalCents) });

  return rows;
}

function renderSummaryTable(rows: Array<{ label: string; value: string }>): string {
  const bodyRows = rows
    .map(
      (row) =>
        `<tr><th style="${headerStyle}">${row.label}</th><td style="${cellStyle}">${row.value}</td></tr>`
    )
    .join("");

  return `<table style="${tableStyle}"><tbody>${bodyRows}</tbody></table>`;
}

function buildClientInfoHtml(booking: BookingEmailPayload): string {
  const items: Array<{ label: string; value: string }> = [
    { label: "Nom", value: booking.customerName },
  ];

  if (booking.customerEmail) {
    items.push({ label: "Email", value: booking.customerEmail });
  }

  if (booking.customerPhone) {
    items.push({ label: "Téléphone", value: booking.customerPhone });
  }

  if (booking.notes) {
    items.push({ label: "Notes", value: booking.notes });
  }

  if (booking.client?.name && booking.client?.name !== booking.customerName) {
    items.push({ label: "Client associé", value: booking.client.name });
  }

  const rows = items
    .map(
      (item) =>
        `<tr><th style="${headerStyle}">${item.label}</th><td style="${cellStyle}">${item.value}</td></tr>`
    )
    .join("");

  return `<table style="${tableStyle}"><tbody>${rows}</tbody></table>`;
}

export function bookingConfirmation({
  booking,
  totalCents,
  mapUrl,
  wazeUrl,
}: BookingConfirmationParams): TemplateResult {
  const start = ensureDate(booking.dateTimeStart);
  const summaryRows = buildBookingSummaryRows(booking, totalCents);
  const addons = buildAddonRows(booking);
  const manageUrl = getManageUrl(booking);

  const htmlParts = [
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">`,
    `<h1 style="font-size:24px;margin-bottom:16px;">Confirmation de réservation</h1>`,
    `<p>Bonjour ${booking.customerName},</p>`,
    `<p>Merci pour votre réservation au ${BUSINESS_NAME}. Voici le récapitulatif de votre session :</p>`,
    renderSummaryTable(summaryRows),
    `<h2 style="font-size:18px;margin-top:24px;">Options sélectionnées</h2>`,
    renderAddonHtml(addons),
    `<h2 style="font-size:18px;margin-top:24px;">Accès au site</h2>`,
    `<p>${VENUE_ADDRESS}</p>`,
  ];

  if (mapUrl) {
    htmlParts.push(`<a style="${ctaStyle}" href="${mapUrl}">Itinéraire Google Maps</a>`);
  }

  if (wazeUrl) {
    htmlParts.push(`<a style="${ctaStyle}" href="${wazeUrl}">Itinéraire Waze</a>`);
  }

  htmlParts.push(
    `<div style="margin-top:24px;">`,
    `<h2 style="font-size:18px;">Consignes</h2>`,
    `<ul style="padding-left:20px;">`,
    `<li>Merci d'arriver 5 minutes avant le début de la session (${timeFormatter.format(start)}).</li>`,
    `<li>Prévoyez une tenue confortable et des chaussures fermées.</li>`,
    `</ul>`,
    `<p style="${mutedStyle}">Lien pour verser l'acompte : disponible prochainement.</p>`
  );

  if (manageUrl) {
    htmlParts.push(
      `<p style="${mutedStyle}">Modifier ou annuler votre réservation : <a href="${manageUrl}">${manageUrl}</a></p>`
    );
  }

  htmlParts.push(
    `<p style="margin-top:16px;">Pour toute question, contactez-nous à <a href="mailto:${VENUE_EMAIL}">${VENUE_EMAIL}</a> ou au ${VENUE_PHONE}.</p>`,
    `<p style="margin-top:24px;">À très vite,<br />L'équipe ${BUSINESS_NAME}</p>`,
    `</div>`
  );

  const mapText = mapUrl ? `Google Maps : ${mapUrl}\n` : "";
  const wazeText = wazeUrl ? `Waze : ${wazeUrl}\n` : "";
  const manageText = manageUrl
    ? `Modification / annulation : ${manageUrl}`
    : "Modification / annulation : contactez-nous directement.";
  const addonText = buildAddonText(addons);

  const text = [
    `Bonjour ${booking.customerName},`,
    `Merci pour votre réservation au ${BUSINESS_NAME}.`,
    `Forfait : ${booking.package?.name ?? "Forfait"}`,
    `Nombre de joueurs : ${booking.groupSize}`,
    `Session nocturne : ${booking.nocturne ? "Oui" : "Non"}`,
    `Date : ${dateFormatter.format(start)}`,
    `Horaire : ${timeFormatter.format(start)} – ${timeFormatter.format(ensureDate(booking.dateTimeEnd))}`,
    `Total estimé : ${formatCurrency(totalCents)}`,
    `Options :`,
    addonText,
    `Adresse : ${VENUE_ADDRESS}`,
    mapText + wazeText + `Lien acompte : disponible prochainement.`,
    manageText,
    `Consignes :`,
    `- Arriver 5 minutes avant le début de la session.`,
    `- Porter une tenue confortable et des chaussures fermées.`,
    `Contact : ${VENUE_EMAIL} / ${VENUE_PHONE}`,
    `À très vite,`,
    `L'équipe ${BUSINESS_NAME}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject: `Confirmation de réservation - ${format(start, "d MMMM yyyy", { locale: fr })}`,
    html: htmlParts.join(""),
    text,
  };
}

export function adminNewBookingAlert({
  booking,
  totalCents,
}: BookingTemplateParams): TemplateResult {
  const summaryRows = buildBookingSummaryRows(booking, totalCents);
  const addons = buildAddonRows(booking);
  const clientInfoHtml = buildClientInfoHtml(booking);

  const html = [
    `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;">`,
    `<h1 style="font-size:24px;margin-bottom:16px;">Nouvelle réservation</h1>`,
    `<h2 style="font-size:18px;margin-bottom:8px;">Détails</h2>`,
    renderSummaryTable(summaryRows),
    `<h2 style="font-size:18px;margin-bottom:8px;">Options</h2>`,
    renderAddonHtml(addons),
    `<h2 style="font-size:18px;margin-bottom:8px;">Client</h2>`,
    clientInfoHtml,
    `</div>`,
  ].join("");

  const addonText = buildAddonText(addons);
  const text = [
    `Nouvelle réservation créée :`,
    `Forfait : ${booking.package?.name ?? "Forfait"}`,
    `Nombre de joueurs : ${booking.groupSize}`,
    `Session nocturne : ${booking.nocturne ? "Oui" : "Non"}`,
    `Date : ${dateFormatter.format(ensureDate(booking.dateTimeStart))}`,
    `Horaire : ${timeFormatter.format(ensureDate(booking.dateTimeStart))} – ${timeFormatter.format(
      ensureDate(booking.dateTimeEnd)
    )}`,
    `Terrain : ${booking.resource?.name ?? "Non précisé"}`,
    `Total estimé : ${formatCurrency(totalCents)}`,
    `Options :`,
    addonText,
    `Client : ${booking.customerName}`,
    booking.customerEmail ? `Email : ${booking.customerEmail}` : null,
    booking.customerPhone ? `Téléphone : ${booking.customerPhone}` : null,
    booking.notes ? `Notes : ${booking.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const start = ensureDate(booking.dateTimeStart);

  return {
    subject: `Nouvelle réservation - ${booking.customerName} (${format(start, "d MMM yyyy", { locale: fr })})`,
    html,
    text,
  };
}
