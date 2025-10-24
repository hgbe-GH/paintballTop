import { NextResponse } from "next/server";
import { z } from "zod";

import { exportBookingsToSheets } from "@/lib/integrations/googleSheets";

const syncSchema = z
  .object({
    from: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "from must be a valid ISO date"),
    to: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "to must be a valid ISO date"),
  })
  .refine((data) => new Date(data.from).getTime() <= new Date(data.to).getTime(), {
    message: "from must be before or equal to to",
    path: ["from"],
  });

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = syncSchema.parse(payload);

    const from = new Date(parsed.from);
    const to = new Date(parsed.to);

    const result = await exportBookingsToSheets(from, to);

    return NextResponse.json({
      success: true,
      bookingsAppended: result.bookingsAppended,
      clients: result.clientsUpdated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes("not configured")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    console.error("[Sheets] Failed to export bookings", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
