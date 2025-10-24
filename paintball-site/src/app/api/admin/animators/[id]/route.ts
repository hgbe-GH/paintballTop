import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().min(1, "Identifiant animateur requis"),
});

const updateAnimatorSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom est requis").optional(),
    phone: z.union([z.string().trim().min(3, "Téléphone invalide"), z.literal(null)]).optional(),
    notes: z.union([z.string().trim(), z.literal(null)]).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Aucun champ à mettre à jour",
  });

const normalizeValue = (value: string | null | undefined): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return value.length === 0 ? null : value;
};

export async function GET(_request: Request, { params }: { params: unknown }) {
  try {
    const { id } = paramsSchema.parse(params);

    const animator = await prisma.animator.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            booking: {
              select: {
                id: true,
                dateTimeStart: true,
                dateTimeEnd: true,
                status: true,
                package: { select: { name: true } },
                customerName: true,
                resource: { select: { name: true } },
              },
            },
          },
          orderBy: { booking: { dateTimeStart: "desc" } },
        },
      },
    });

    if (!animator) {
      return NextResponse.json({ error: "Animateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      id: animator.id,
      name: animator.name,
      phone: animator.phone,
      notes: animator.notes,
      createdAt: animator.createdAt.toISOString(),
      assignments: animator.assignments.map((assignment) => ({
        id: assignment.id,
        bookingId: assignment.bookingId,
        dateTimeStart: assignment.booking.dateTimeStart.toISOString(),
        dateTimeEnd: assignment.booking.dateTimeEnd.toISOString(),
        status: assignment.booking.status,
        packageName: assignment.booking.package?.name ?? null,
        customerName: assignment.booking.customerName,
        resourceName: assignment.booking.resource?.name ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error fetching animator", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: unknown }) {
  try {
    const { id } = paramsSchema.parse(params);
    const body = await request.json();
    const parsed = updateAnimatorSchema.parse(body);

    const name = parsed.name?.trim();
    const phone = normalizeValue(parsed.phone);
    const notes = normalizeValue(parsed.notes);

    const animator = await prisma.animator.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({
      id: animator.id,
      name: animator.name,
      phone: animator.phone,
      notes: animator.notes,
      createdAt: animator.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error updating animator", error);
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json({ error: "Animateur introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: unknown }) {
  try {
    const { id } = paramsSchema.parse(params);

    await prisma.$transaction([
      prisma.assignment.deleteMany({ where: { animatorId: id } }),
      prisma.animator.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error deleting animator", error);
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json({ error: "Animateur introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
