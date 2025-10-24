import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createResourceSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis"),
  capacity: z.number().int().min(1, "La capacité doit être positive").optional(),
});

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createResourceSchema.parse(body);

    const created = await prisma.resource.create({
      data: {
        name: parsed.name,
        capacity: parsed.capacity ?? 1,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error creating resource", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
