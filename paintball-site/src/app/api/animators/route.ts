import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const animators = await prisma.animator.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(animators);
  } catch (error) {
    console.error("Error fetching animators", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
