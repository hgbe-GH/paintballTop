import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const statusActionSchema = z.object({
  action: z.enum(["CONFIRM", "CANCEL", "COMPLETE"]),
});

const STATUS_BY_ACTION: Record<"CONFIRM" | "CANCEL" | "COMPLETE", BookingStatus> = {
  CONFIRM: BookingStatus.CONFIRMED,
  CANCEL: BookingStatus.CANCELLED,
  COMPLETE: BookingStatus.COMPLETED,
};

const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  [BookingStatus.CONFIRMED]: [BookingStatus.CANCELLED, BookingStatus.COMPLETED],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.COMPLETED]: [],
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  let action: "CONFIRM" | "CANCEL" | "COMPLETE" | undefined;

  try {
    const body = await request.json();
    ({ action } = statusActionSchema.parse(body));

    const booking = await prisma.booking.findUnique({
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

    if (!booking) {
      await logger.warn("[BOOKING]", "Attempted to update missing booking status", {
        bookingId: params.id,
        action,
      });
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const targetStatus = STATUS_BY_ACTION[action];

    if (!VALID_TRANSITIONS[booking.status].includes(targetStatus)) {
      await logger.warn("[BOOKING]", "Invalid booking status transition", {
        bookingId: params.id,
        from: booking.status,
        attempted: targetStatus,
        action,
      });

      return NextResponse.json(
        { error: "Invalid status transition" },
        { status: 409 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: targetStatus,
      },
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

    void logger.info("[BOOKING]", "Booking status updated", {
      bookingId: params.id,
      status: targetStatus,
      action,
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    await logger.error("[BOOKING]", "Error updating booking status", {
      bookingId: params.id,
      action,
      method: request.method,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
