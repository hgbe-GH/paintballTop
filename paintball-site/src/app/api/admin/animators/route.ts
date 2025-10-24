import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const animatorsQuerySchema = z.object({
  search: z.string().optional(),
});

const createAnimatorSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis"),
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
    const parsed = animatorsQuerySchema.parse({
      search: searchParams.get("search") ?? undefined,
    });

    const searchValue = parsed.search?.trim();

    const where = searchValue
      ? {
          OR: [
            { name: { contains: searchValue, mode: "insensitive" } },
            { phone: { contains: searchValue, mode: "insensitive" } },
          ],
        }
      : {};

    const animators = await prisma.animator.findMany({
      where,
      include: {
        _count: { select: { assignments: true } },
      },
      orderBy: { name: "asc" },
      take: 100,
    });

    return NextResponse.json(
      animators.map((animator) => ({
        id: animator.id,
        name: animator.name,
        phone: animator.phone,
        notes: animator.notes,
        createdAt: animator.createdAt.toISOString(),
        assignmentsCount: animator._count.assignments,
      })),
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error fetching animators", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAnimatorSchema.parse(body);

    const animator = await prisma.animator.create({
      data: {
        name: parsed.name,
        phone: normalizeNullable(parsed.phone),
        notes: normalizeNullable(parsed.notes),
      },
    });

    return NextResponse.json(
      {
        id: animator.id,
        name: animator.name,
        phone: animator.phone,
        notes: animator.notes,
        createdAt: animator.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error creating animator", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
