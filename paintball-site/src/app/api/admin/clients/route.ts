import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const clientsQuerySchema = z.object({
  search: z.string().optional(),
});

const createClientSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis"),
  email: z.string().trim().email("Email invalide").optional(),
  phone: z.string().trim().min(3, "Téléphone invalide").optional(),
  notes: z.string().trim().optional(),
});

const normalizeNullable = (value: string | undefined): string | null => {
  if (value === undefined) {
    return null;
  }
  return value.length === 0 ? null : value;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = clientsQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
    });

    const searchValue = parsed.search?.trim();

    const where = searchValue
      ? {
          OR: [
            { email: { contains: searchValue, mode: "insensitive" } },
            { phone: { contains: searchValue, mode: "insensitive" } },
          ],
        }
      : {};

    const clients = await prisma.client.findMany({
      where,
      include: {
        _count: { select: { bookings: true } },
        bookings: {
          orderBy: { dateTimeStart: "desc" },
          take: 1,
          select: { dateTimeStart: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(
      clients.map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        createdAt: client.createdAt.toISOString(),
        bookingsCount: client._count.bookings,
        lastBookingAt: client.bookings[0]?.dateTimeStart?.toISOString() ?? null,
      })),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error fetching clients", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        name: parsed.name,
        email: normalizeNullable(parsed.email),
        phone: normalizeNullable(parsed.phone),
        notes: normalizeNullable(parsed.notes),
      },
    });

    return NextResponse.json(
      {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        notes: client.notes,
        createdAt: client.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error creating client", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
