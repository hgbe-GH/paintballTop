import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const animators = await prisma.animator.findMany({
      orderBy: { name: "asc" },
    });

    void logger.info("[BOOKING]", "Fetched animators", {
      count: animators.length,
    });

    return NextResponse.json(animators);
  } catch (error) {
    await logger.error("[BOOKING]", "Error fetching animators", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
