import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { syncBookingWithSheets } from "@/lib/integrations/googleSheets";
import { prisma } from "@/lib/prisma";
import { isNocturne } from "@/lib/slots";
import { buildBookingEmailContext, normalizeRecipient } from "@/server/email/bookings";
import { bookingConfirmation } from "@/server/email/templates";
import { sendMail } from "@/server/email/transport";

const MINUTES_IN_MS = 60_000;
const NOTIFIABLE_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.ANNULLED,
  BookingStatus.COMPLETED,
];

const updateBookingSchema = z
  .object({
    packageId: z.string().min(1, "packageId is required").optional(),
    groupSize: z.number().int().positive("groupSize must be a positive integer").optional(),
    customerName: z.string().min(1, "customerName is required").optional(),
    customerEmail: z.string().email("customerEmail must be a valid email").optional().nullable(),
    customerPhone: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    depositCents: z.number().int().nonnegative().optional().nullable(),
    status: z.nativeEnum(BookingStatus).optional(),
    clientId: z.string().min(1, "clientId cannot be empty").nullable().optional(),
    userId: z.string().min(1, "userId cannot be empty").nullable().optional(),
    resourceId: z.string().min(1, "resourceId cannot be empty").nullable().optional(),
    startISO: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "startISO must be a valid ISO date")
      .optional(),
    durationMin: z.number().int().positive("durationMin must be a positive integer").optional(),
    addons: z
      .array(
        z.object({
          addonId: z.string().min(1, "addonId is required"),
          qty: z.number().int().positive("qty must be a positive integer"),
        })
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updates = updateBookingSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        bookingAddons: true,
      },
    });

    if (!booking) {
      await logger.warn("[BOOKING]", "Attempted to update missing booking", {
        bookingId: params.id,
      });
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const startDate = updates.startISO ? new Date(updates.startISO) : booking.dateTimeStart;
    const existingDurationMin = Math.max(
      1,
      Math.round((booking.dateTimeEnd.getTime() - booking.dateTimeStart.getTime()) / MINUTES_IN_MS)
    );
    const packageIdForDuration = updates.packageId ?? booking.packageId;
    let resolvedDuration = updates.durationMin ?? existingDurationMin;

    if (updates.durationMin === undefined && updates.packageId) {
      const packageData = await prisma.package.findUnique({
        where: { id: packageIdForDuration },
        select: { durationMin: true },
      });

      if (!packageData) {
        await logger.warn("[BOOKING]", "Package not found during booking update", {
          bookingId: params.id,
          packageId: packageIdForDuration,
        });
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
      }

      resolvedDuration = packageData.durationMin;
    }

    const endDate = new Date(startDate.getTime() + resolvedDuration * MINUTES_IN_MS);
    const resourceId =
      updates.resourceId === undefined ? booking.resourceId : updates.resourceId ?? null;

    if (resourceId) {
      const conflictingBooking = await prisma.booking.findFirst({
        where: {
          id: { not: booking.id },
          resourceId,
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          dateTimeStart: { lt: endDate },
          dateTimeEnd: { gt: startDate },
        },
        select: { id: true },
      });

      if (conflictingBooking) {
        await logger.warn("[BOOKING]", "Conflict detected while updating booking", {
          bookingId: params.id,
          conflictingBookingId: conflictingBooking.id,
          resourceId,
        });
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

    const data: Record<string, unknown> = {
      dateTimeStart: startDate,
      dateTimeEnd: endDate,
      nocturne: isNocturne(startDate.toISOString()),
    };

    if (updates.packageId !== undefined) {
      data.packageId = updates.packageId;
    }

    if (updates.groupSize !== undefined) {
      data.groupSize = updates.groupSize;
    }

    if (updates.customerName !== undefined) {
      data.customerName = updates.customerName;
    }

    if (updates.customerEmail !== undefined) {
      data.customerEmail = updates.customerEmail ?? null;
    }

    if (updates.customerPhone !== undefined) {
      data.customerPhone = updates.customerPhone ?? null;
    }

    if (updates.notes !== undefined) {
      data.notes = updates.notes ?? null;
    }

    if (updates.depositCents !== undefined) {
      data.depositCents = updates.depositCents ?? null;
    }

    if (updates.status !== undefined) {
      data.status = updates.status;
    }

    if (updates.clientId !== undefined) {
      data.clientId = updates.clientId ?? null;
    }

    if (updates.userId !== undefined) {
      data.userId = updates.userId ?? null;
    }

    if (updates.resourceId !== undefined) {
      data.resourceId = resourceId;
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const bookingResult = await tx.booking.update({
        where: { id: params.id },
        data,
        include: {
          package: true,
          resource: true,
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
        },
      });

      if (updates.addons !== undefined) {
        await tx.bookingAddon.deleteMany({ where: { bookingId: params.id } });

        if (updates.addons.length > 0) {
          await tx.bookingAddon.createMany({
            data: updates.addons.map((addon) => ({
              bookingId: params.id,
              addonId: addon.addonId,
              quantity: addon.qty,
            })),
          });
        }

        const refreshedBooking = await tx.booking.findUnique({
          where: { id: params.id },
          include: {
            package: true,
            resource: true,
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
          },
        });

        if (refreshedBooking) {
          return refreshedBooking;
        }
      }

      return bookingResult;
    });

    void syncBookingWithSheets(updatedBooking.id);

    const statusChangedToNotifiable =
      updates.status !== undefined &&
      updates.status !== booking.status &&
      NOTIFIABLE_STATUSES.includes(updates.status);

    const customerRecipient = normalizeRecipient(updatedBooking.customerEmail);

    if (statusChangedToNotifiable && customerRecipient) {
      try {
        const emailContext = await buildBookingEmailContext(updatedBooking);
        const confirmation = bookingConfirmation({
          booking: updatedBooking,
          totalCents: emailContext.totalCents,
          mapUrl: emailContext.mapUrl,
          wazeUrl: emailContext.wazeUrl,
        });

        const subjectParts = confirmation.subject.split(" - ");
        const suffix = subjectParts.length > 1 ? subjectParts.slice(1).join(" - ") : "";
        const updateSubject = suffix
          ? `Mise à jour de votre réservation - ${suffix}`
          : "Mise à jour de votre réservation";

        await sendMail({
          to: customerRecipient,
          subject: updateSubject,
          html: confirmation.html,
          text: confirmation.text,
        });
        await logger.info("[EMAIL]", "Sent booking status update", {
          bookingId: updatedBooking.id,
          recipient: customerRecipient,
          status: updates.status,
        });
      } catch (emailError) {
        await logger.error("[EMAIL]", "Failed to send booking status update", {
          bookingId: updatedBooking.id,
          recipient: customerRecipient,
          status: updates.status,
          error: emailError instanceof Error ? emailError.message : "Unknown error",
        });
      }
    }

    void logger.info("[BOOKING]", "Booking updated", {
      bookingId: params.id,
      changes: Object.keys(updates),
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    await logger.error("[BOOKING]", "Error updating booking", {
      bookingId: params.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
