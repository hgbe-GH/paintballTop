import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET() {
  const packages = await prisma.package.findMany({
    where: {
      isPublic: true,
    },
    select: {
      id: true,
      name: true,
      priceCents: true,
      includedBalls: true,
      durationMin: true,
      isPromo: true,
    },
    orderBy: {
      priceCents: "asc",
    },
  });

  return NextResponse.json(packages);
}
