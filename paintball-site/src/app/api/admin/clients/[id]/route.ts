import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().min(1, "Identifiant client requis"),
});

const updateClientSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom est requis").optional(),
    email: z.union([z.string().trim().email("Email invalide"), z.literal(null)]).optional(),
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

export async function GET(
  _request: Request,
  { params }: { params: unknown },
) {
  try {
    const { id } = paramsSchema.parse(params);

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { dateTimeStart: "desc" },
          include: {
            package: { select: { name: true } },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const duplicateConditions = [] as { email?: string; phone?: string }[];
    if (client.email) {
      duplicateConditions.push({ email: client.email });
    }
    if (client.phone) {
      duplicateConditions.push({ phone: client.phone });
    }

    const duplicates = duplicateConditions.length
      ? await prisma.client.findMany({
          where: {
            id: { not: client.id },
            OR: duplicateConditions,
          },
          orderBy: { createdAt: "desc" },
        })
      : [];

    return NextResponse.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
      bookings: client.bookings.map((booking) => ({
        id: booking.id,
        dateTimeStart: booking.dateTimeStart.toISOString(),
        dateTimeEnd: booking.dateTimeEnd.toISOString(),
        status: booking.status,
        packageName: booking.package?.name ?? null,
        groupSize: booking.groupSize,
        notes: booking.notes,
      })),
      duplicates: duplicates.map((duplicate) => ({
        id: duplicate.id,
        name: duplicate.name,
        email: duplicate.email,
        phone: duplicate.phone,
        createdAt: duplicate.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error fetching client", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: unknown },
) {
  try {
    const { id } = paramsSchema.parse(params);
    const body = await request.json();
    const parsed = updateClientSchema.parse(body);

    const email = normalizeValue(parsed.email);
    const phone = normalizeValue(parsed.phone);
    const notes = normalizeValue(parsed.notes);

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      notes: client.notes,
      createdAt: client.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error updating client", error);
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
