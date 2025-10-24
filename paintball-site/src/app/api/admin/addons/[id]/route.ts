import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().min(1, "Identifiant requis"),
});

const updateAddonSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom est requis").optional(),
    priceCents: z.number().int().min(0, "Le prix doit être positif").optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Aucun champ à mettre à jour",
  });

export async function PATCH(request: Request, { params }: { params: unknown }) {
  try {
    const { id } = paramsSchema.parse(params);
    const body = await request.json();
    const parsed = updateAddonSchema.parse(body);

    const updated = await prisma.addon.update({
      where: { id },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.priceCents !== undefined ? { priceCents: parsed.priceCents } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error updating addon", error);
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json({ error: "Option introuvable" }, { status: 404 });
    }

    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: unknown }) {
  try {
    const { id } = paramsSchema.parse(params);

    await prisma.addon.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error deleting addon", error);
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json({ error: "Option introuvable" }, { status: 404 });
    }

    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
