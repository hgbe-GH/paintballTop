import { BookingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createAssignmentSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required"),
  animatorId: z.string().min(1, "animatorId is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, animatorId } = createAssignmentSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        dateTimeStart: true,
        dateTimeEnd: true,
        status: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const animator = await prisma.animator.findUnique({
      where: { id: animatorId },
    });

    if (!animator) {
      return NextResponse.json({ error: "Animator not found" }, { status: 404 });
    }

    const existingAssignment = await prisma.assignment.findFirst({
      where: { bookingId, animatorId },
      include: { animator: true },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Animator already assigned to this booking" },
        { status: 409 }
      );
    }

    const overlappingAssignment = await prisma.assignment.findFirst({
      where: {
        animatorId,
        booking: {
          id: { not: bookingId },
          status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          dateTimeStart: { lt: booking.dateTimeEnd },
          dateTimeEnd: { gt: booking.dateTimeStart },
        },
      },
      select: {
        bookingId: true,
      },
    });

    if (overlappingAssignment) {
      return NextResponse.json(
        {
          error: "Animator already assigned on overlapping booking",
          details: { conflictingBookingId: overlappingAssignment.bookingId },
        },
        { status: 409 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        bookingId,
        animatorId,
      },
      include: {
        animator: true,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error creating assignment", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
