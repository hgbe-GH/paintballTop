import type { Prisma } from "@/generated/prisma/client";

import {
  computeAddons,
  computeBase,
  computeNocturneExtra,
  computeTotal,
  computeUnderMinimumPenalty,
} from "@/lib/pricing";
import { getAppSettings, getPricingRules } from "@/lib/settings";

export type BookingEmailEntity = Prisma.BookingGetPayload<{
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
}>;

export type BookingEmailContext = {
  totalCents: number;
  mapUrl: string | null;
  wazeUrl: string | null;
};

export function normalizeRecipient(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function buildBookingEmailContext(
  booking: BookingEmailEntity
): Promise<BookingEmailContext> {
  const settings = await getAppSettings();
  const pricing = getPricingRules(settings);

  const base = computeBase(booking.package.priceCents, booking.groupSize);
  const addons = computeAddons(
    booking.bookingAddons.map((item) => ({
      priceCents: item.addon?.priceCents ?? 0,
      qty: item.quantity ?? 0,
    }))
  );
  const nocturneExtra = booking.nocturne
    ? computeNocturneExtra(
        booking.dateTimeStart instanceof Date
          ? booking.dateTimeStart.toISOString()
          : new Date(booking.dateTimeStart).toISOString(),
        booking.groupSize,
        pricing.nocturneThreshold
      )
    : 0;
  const underMinPenalty = computeUnderMinimumPenalty(
    booking.groupSize,
    pricing.minPlayers,
    pricing.penaltyUnderMinCents
  );

  const totalCents = computeTotal({
    base,
    addons,
    nocturneExtra,
    underMinPenalty,
  });

  return {
    totalCents,
    mapUrl: normalizeUrl(process.env.BOOKING_MAP_URL),
    wazeUrl: normalizeUrl(process.env.BOOKING_WAZE_URL),
  };
}
