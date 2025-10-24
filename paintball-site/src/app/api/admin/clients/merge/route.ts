import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const mergeSchema = z.object({
  sourceClientId: z.string().min(1, "Client source requis"),
  targetClientId: z.string().min(1, "Client cible requis"),
});

const mergeNotes = (targetNotes: string | null, sourceNotes: string | null): string | null => {
  if (!sourceNotes) {
    return targetNotes;
  }
  if (!targetNotes || targetNotes.length === 0) {
    return sourceNotes;
  }
  if (targetNotes.includes(sourceNotes)) {
    return targetNotes;
  }
  return `${targetNotes}\n\n${sourceNotes}`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceClientId, targetClientId } = mergeSchema.parse(body);

    if (sourceClientId === targetClientId) {
      return NextResponse.json(
        { error: "Impossible de fusionner le même client" },
        { status: 400 },
      );
    }

    const [source, target] = await Promise.all([
      prisma.client.findUnique({ where: { id: sourceClientId } }),
      prisma.client.findUnique({ where: { id: targetClientId } }),
    ]);

    if (!source || !target) {
      return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
    }

    const shareEmail = source.email && target.email && source.email === target.email;
    const sharePhone = source.phone && target.phone && source.phone === target.phone;

    if (!shareEmail && !sharePhone) {
      return NextResponse.json(
        { error: "Les clients ne partagent ni email ni téléphone" },
        { status: 400 },
      );
    }

    const updatedTarget = await prisma.$transaction(async (tx) => {
      await tx.booking.updateMany({
        where: { clientId: sourceClientId },
        data: { clientId: targetClientId },
      });

      const data: Partial<Record<"email" | "phone" | "notes", string | null>> = {};
      if (!target.email && source.email) {
        data.email = source.email;
      }
      if (!target.phone && source.phone) {
        data.phone = source.phone;
      }

      const mergedNotes = mergeNotes(target.notes ?? null, source.notes ?? null);
      if (mergedNotes !== target.notes) {
        data.notes = mergedNotes;
      }

      if (Object.keys(data).length > 0) {
        await tx.client.update({
          where: { id: targetClientId },
          data,
        });
      }

      await tx.client.delete({ where: { id: sourceClientId } });

      return tx.client.findUniqueOrThrow({ where: { id: targetClientId } });
    });

    return NextResponse.json({
      id: updatedTarget.id,
      name: updatedTarget.name,
      email: updatedTarget.email,
      phone: updatedTarget.phone,
      notes: updatedTarget.notes,
      createdAt: updatedTarget.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error merging clients", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
