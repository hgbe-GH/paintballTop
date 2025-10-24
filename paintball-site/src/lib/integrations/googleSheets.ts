import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { format } from "date-fns";
import { google, sheets_v4 as sheetsV4 } from "googleapis";

import type { Prisma } from "@/generated/prisma/client";
import { getEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import {
  computeAddons,
  computeBase,
  computeNocturneExtra,
  computeTotal,
  computeUnderMinimumPenalty,
} from "@/lib/pricing";
import { getAppSettings } from "@/lib/settings";

type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    package: true;
    bookingAddons: {
      include: {
        addon: true;
      };
    };
    assignments: {
      include: {
        animator: true;
      };
    };
    client: true;
  };
}>;

type ServiceAccountCredentials = {
  clientEmail: string;
  privateKey: string;
};

type ClientRow = {
  key: string;
  keyType: "email" | "phone";
  values: (string | number)[];
  email: string;
  phone: string;
};

type ClientUpsertResult = {
  updated: number;
  appended: number;
};

const BOOKINGS_SHEET_RANGE = "Bookings!A:N";
const CLIENTS_SHEET_BASE_RANGE = "Clients!A";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

let sheetsClientPromise: Promise<sheetsV4.Sheets | null> | null = null;

function isSheetsConfigured(): boolean {
  const env = getEnv();
  return Boolean(env.GOOGLE_SHEETS_ID && env.GOOGLE_SERVICE_ACCOUNT_JSON);
}

function normalizePrivateKey(value: string): string {
  return value.replace(/\\n/g, "\n");
}

async function loadServiceAccountConfig(): Promise<ServiceAccountCredentials | null> {
  const env = getEnv();
  const raw = env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    console.warn("[Sheets] GOOGLE_SERVICE_ACCOUNT_JSON is not defined.");
    return null;
  }

  const trimmed = raw.trim();
  let jsonContent = trimmed;

  if (!trimmed.startsWith("{")) {
    if (existsSync(trimmed)) {
      jsonContent = await readFile(trimmed, "utf-8");
    } else {
      try {
        const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
        if (decoded.trim().startsWith("{")) {
          jsonContent = decoded;
        }
      } catch (error) {
        console.warn("[Sheets] Failed to decode service account JSON as base64.", error);
      }
    }
  }

  try {
    const parsed = JSON.parse(jsonContent) as {
      client_email?: string;
      private_key?: string;
    };

    if (!parsed.client_email || !parsed.private_key) {
      console.error("[Sheets] Service account JSON is missing required fields.");
      return null;
    }

    return {
      clientEmail: parsed.client_email,
      privateKey: normalizePrivateKey(parsed.private_key),
    };
  } catch (error) {
    console.error("[Sheets] Failed to parse service account JSON.", error);
    return null;
  }
}

async function getSheetsClient(): Promise<sheetsV4.Sheets | null> {
  if (!isSheetsConfigured()) {
    return null;
  }

  if (!sheetsClientPromise) {
    sheetsClientPromise = (async () => {
      const credentials = await loadServiceAccountConfig();

      if (!credentials) {
        return null;
      }

      const auth = new google.auth.JWT({
        email: credentials.clientEmail,
        key: credentials.privateKey,
        scopes: [SHEETS_SCOPE],
      });

      return google.sheets({ version: "v4", auth });
    })();
  }

  return sheetsClientPromise;
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 3, baseDelayMs = 500): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`[Sheets] Operation failed (attempt ${attempt}/${attempts}).`, error);

      if (attempt === attempts) {
        break;
      }

      const delay = baseDelayMs * 2 ** (attempt - 1) + Math.random() * 250;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Google Sheets operation failed");
}

function normalizePhone(value: string): string {
  return value.replace(/[^0-9+]/g, "");
}

function buildBookingRow(
  booking: BookingWithRelations,
  settings: Awaited<ReturnType<typeof getAppSettings>>
): (string | number)[] {
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const startDate = booking.dateTimeStart;

  const base = computeBase(booking.package.priceCents, booking.groupSize);
  const addons = computeAddons(
    booking.bookingAddons.map((item) => ({
      priceCents: item.addon.priceCents,
      qty: item.quantity,
    }))
  );
  const nocturneExtra = booking.nocturne
    ? computeNocturneExtra(
        booking.dateTimeStart.toISOString(),
        booking.groupSize,
        settings.nocturneThreshold
      )
    : 0;
  const underMinPenalty = computeUnderMinimumPenalty(
    booking.groupSize,
    settings.minPlayers,
    settings.penaltyUnderMinCents
  );

  const totalCents = computeTotal({
    base,
    addons,
    nocturneExtra,
    underMinPenalty,
  });

  const addonsPayload = booking.bookingAddons.map((item) => ({
    id: item.addonId,
    name: item.addon.name,
    quantity: item.quantity,
    priceCents: item.addon.priceCents,
  }));

  return [
    timestamp,
    booking.id,
    format(startDate, "yyyy-MM-dd"),
    format(startDate, "HH:mm"),
    booking.package.name,
    booking.groupSize,
    booking.nocturne ? "Oui" : "Non",
    JSON.stringify(addonsPayload),
    totalCents / 100,
    booking.customerName ?? booking.client?.name ?? "",
    booking.customerEmail ?? booking.client?.email ?? "",
    booking.customerPhone ?? booking.client?.phone ?? "",
    booking.status,
    booking.assignments
      .map((assignment) => assignment.animator?.name)
      .filter((name): name is string => Boolean(name))
      .join(", "),
  ];
}

function buildClientRow(booking: BookingWithRelations): ClientRow | null {
  const name = booking.customerName ?? booking.client?.name ?? "";
  const rawEmail = booking.customerEmail ?? booking.client?.email ?? "";
  const rawPhone = booking.customerPhone ?? booking.client?.phone ?? "";
  const email = rawEmail.trim().toLowerCase();
  const phone = normalizePhone(rawPhone);

  if (!email && !phone) {
    return null;
  }

  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const values: (string | number)[] = [
    timestamp,
    name,
    rawEmail,
    rawPhone,
    booking.id,
  ];

  if (email) {
    return {
      key: email,
      keyType: "email",
      values,
      email,
      phone,
    };
  }

  return {
    key: phone,
    keyType: "phone",
    values,
    email,
    phone,
  };
}

function matchesClientRow(row: string[], entry: ClientRow): boolean {
  const existingEmail = (row[2] ?? "").toString().trim().toLowerCase();
  const existingPhone = normalizePhone((row[3] ?? "").toString());

  if (entry.email && existingEmail === entry.email) {
    return true;
  }

  if (entry.phone && existingPhone === entry.phone) {
    return true;
  }

  if (entry.keyType === "email") {
    return existingEmail === entry.key;
  }

  return existingPhone === entry.key;
}

async function readClientSheetValues(
  sheets: sheetsV4.Sheets,
  spreadsheetId: string
): Promise<string[][]> {
  try {
    const response = await withRetry(() =>
      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${CLIENTS_SHEET_BASE_RANGE}2:E`,
      })
    );

    return (response.data.values as string[][] | undefined) ?? [];
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code === 400 || code === 404) {
      console.warn("[Sheets] Clients sheet appears empty or missing. Proceeding with append only.");
      return [];
    }
    throw error;
  }
}

async function appendBookingRows(bookings: BookingWithRelations[]): Promise<number> {
  if (bookings.length === 0) {
    return 0;
  }

  const sheets = await getSheetsClient();
  const env = getEnv();

  if (!sheets || !env.GOOGLE_SHEETS_ID) {
    console.warn("[Sheets] Google Sheets client not configured; skipping booking export.");
    return 0;
  }

  const settings = await getAppSettings();
  const rows = bookings.map((booking) => buildBookingRow(booking, settings));

  await withRetry(() =>
    sheets.spreadsheets.values.append({
      spreadsheetId: env.GOOGLE_SHEETS_ID!,
      range: BOOKINGS_SHEET_RANGE,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: rows,
      },
    })
  );

  return rows.length;
}

async function upsertClients(bookings: BookingWithRelations[]): Promise<ClientUpsertResult> {
  const sheets = await getSheetsClient();
  const env = getEnv();

  if (!sheets || !env.GOOGLE_SHEETS_ID) {
    console.warn("[Sheets] Google Sheets client not configured; skipping client export.");
    return { updated: 0, appended: 0 };
  }

  const entries = bookings
    .map((booking) => buildClientRow(booking))
    .filter((entry): entry is ClientRow => entry !== null);

  if (entries.length === 0) {
    return { updated: 0, appended: 0 };
  }

  const uniqueEntries = new Map<string, ClientRow>();
  for (const entry of entries) {
    const keyPrefix = entry.keyType === "email" ? "email" : "phone";
    uniqueEntries.set(`${keyPrefix}:${entry.key}`, entry);
  }

  const existingRows = await readClientSheetValues(sheets, env.GOOGLE_SHEETS_ID);

  let updated = 0;
  let appended = 0;

  for (const entry of uniqueEntries.values()) {
    const index = existingRows.findIndex((row) => matchesClientRow(row, entry));

    if (index >= 0) {
      const rowNumber = index + 2; // Account for header row.
      await withRetry(() =>
        sheets.spreadsheets.values.update({
          spreadsheetId: env.GOOGLE_SHEETS_ID!,
          range: `Clients!A${rowNumber}:E${rowNumber}`,
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [entry.values],
          },
        })
      );
      existingRows[index] = entry.values.map((value) => value.toString());
      updated += 1;
    } else {
      await withRetry(() =>
        sheets.spreadsheets.values.append({
          spreadsheetId: env.GOOGLE_SHEETS_ID!,
          range: `${CLIENTS_SHEET_BASE_RANGE}:E`,
          valueInputOption: "USER_ENTERED",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [entry.values],
          },
        })
      );
      appended += 1;
    }
  }

  return { updated, appended };
}

async function fetchBookingById(bookingId: string): Promise<BookingWithRelations | null> {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      package: true,
      bookingAddons: {
        include: {
          addon: true,
        },
      },
      assignments: {
        include: {
          animator: true,
        },
      },
      client: true,
    },
  });
}

async function fetchBookingsInRange(from: Date, to: Date): Promise<BookingWithRelations[]> {
  return prisma.booking.findMany({
    where: {
      dateTimeStart: {
        gte: from,
        lte: to,
      },
    },
    include: {
      package: true,
      bookingAddons: {
        include: {
          addon: true,
        },
      },
      assignments: {
        include: {
          animator: true,
        },
      },
      client: true,
    },
    orderBy: {
      dateTimeStart: "asc",
    },
  });
}

export async function syncBookingWithSheets(bookingId: string): Promise<void> {
  if (!isSheetsConfigured()) {
    return;
  }

  try {
    const booking = await fetchBookingById(bookingId);

    if (!booking) {
      console.warn(`[Sheets] Booking ${bookingId} not found for synchronization.`);
      return;
    }

    await appendBookingRows([booking]);
    await upsertClients([booking]);
  } catch (error) {
    console.error(`[Sheets] Failed to synchronize booking ${bookingId}.`, error);
  }
}

export async function exportBookingsToSheets(from: Date, to: Date): Promise<{
  bookingsAppended: number;
  clientsUpdated: ClientUpsertResult;
}> {
  if (!isSheetsConfigured()) {
    throw new Error("Google Sheets integration is not configured.");
  }

  const bookings = await fetchBookingsInRange(from, to);

  if (bookings.length === 0) {
    return { bookingsAppended: 0, clientsUpdated: { updated: 0, appended: 0 } };
  }

  const bookingsAppended = await appendBookingRows(bookings);
  const clientsUpdated = await upsertClients(bookings);

  return { bookingsAppended, clientsUpdated };
}

