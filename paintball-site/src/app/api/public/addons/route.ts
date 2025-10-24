import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const addons = await prisma.addon.findMany({
    select: {
      id: true,
      name: true,
      priceCents: true,
    },
    orderBy: {
      priceCents: "asc",
    },
  });

  return NextResponse.json(addons);
}
