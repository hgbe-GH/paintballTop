import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { isNocturne } from "@/lib/slots";

const MINUTES_IN_MS = 60_000;

const addonSchema = z.object({
  addonId: z.string().min(1, "addonId is required"),
  qty: z.number().int().positive("qty must be a positive integer"),
});

const createBookingSchema = z.object({
  packageId: z.string().min(1, "packageId is required"),
  groupSize: z.number().int().positive("groupSize must be a positive integer"),
  customerName: z.string().min(1, "customerName is required"),
  customerEmail: z.string().email("customerEmail must be a valid email").optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  depositCents: z.number().int().nonnegative().optional().nullable(),
  status: z.nativeEnum(BookingStatus).optional(),
  clientId: z.string().min(1, "clientId cannot be empty").nullable().optional(),
  userId: z.string().min(1, "userId cannot be empty").nullable().optional(),
  resourceId: z.string().min(1, "resourceId cannot be empty").nullable().optional(),
  startISO: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "startISO must be a valid ISO date"),
  durationMin: z.number().int().positive("durationMin must be a positive integer"),
  addons: z.array(addonSchema).optional().default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      packageId,
      groupSize,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      depositCents,
      status,
      clientId,
      userId,
      resourceId,
      startISO,
      durationMin,
      addons,
    } = createBookingSchema.parse(body);

    const startDate = new Date(startISO);
    const endDate = new Date(startDate.getTime() + durationMin * MINUTES_IN_MS);

    if (resourceId) {
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          resourceId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          dateTimeStart: { lt: endDate },
          dateTimeEnd: { gt: startDate },
        },
        select: {
          id: true,
          dateTimeStart: true,
          dateTimeEnd: true,
        },
      });

      if (conflictingBooking) {
        return NextResponse.json(
          {
            error: "Ressource indisponible sur ce créneau.",
            details: {
              conflictBookingId: conflictingBooking.id,
            },
          },
          { status: 409 }
        );
      }
    }

    const booking = await prisma.booking.create({
      data: {
        packageId,
        groupSize,
        customerName,
        customerEmail: customerEmail ?? null,
        customerPhone: customerPhone ?? null,
        notes: notes ?? null,
        depositCents: depositCents ?? null,
        status: status ?? BookingStatus.PENDING,
        clientId: clientId ?? null,
        userId: userId ?? null,
        resourceId: resourceId ?? null,
        dateTimeStart: startDate,
        dateTimeEnd: endDate,
        nocturne: isNocturne(startISO),
        bookingAddons: addons.length
          ? {
              create: addons.map((addon) => ({ addonId: addon.addonId, quantity: addon.qty })),
            }
          : undefined,
      },
      include: {
        bookingAddons: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error creating booking", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
