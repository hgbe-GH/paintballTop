import { NextResponse } from "next/server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: {
        name: "asc",
      },
    });

    void logger.info("[BOOKING]", "Fetched resources", {
      count: resources.length,
    });

    return NextResponse.json(resources);
  } catch (error) {
    await logger.error("[BOOKING]", "Error fetching resources", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
