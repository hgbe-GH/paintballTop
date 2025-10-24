import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

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
  try {
    const body = await request.json();
    const { action } = statusActionSchema.parse(body);

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
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const targetStatus = STATUS_BY_ACTION[action];

    if (!VALID_TRANSITIONS[booking.status].includes(targetStatus)) {
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

    return NextResponse.json(updatedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error(`Error updating booking status ${params.id}`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
