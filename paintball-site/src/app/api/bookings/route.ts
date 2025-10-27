import { BookingStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { syncBookingWithSheets } from "@/lib/integrations/googleSheets";
import { prisma } from "@/lib/prisma";
import { isNocturne } from "@/lib/slots";
import { buildBookingEmailContext, normalizeRecipient } from "@/server/email/bookings";
import { adminNewBookingAlert, bookingConfirmation } from "@/server/email/templates";
import { sendMail } from "@/server/email/transport";

const MINUTES_IN_MS = 60_000;

const addonSchema = z.object({
  addonId: z.string().min(1, "addonId is required"),
  qty: z.number().int().positive("qty must be a positive integer"),
});

const createBookingSchema = z.object({
  packageId: z.string().min(1, "packageId is required"),
  groupSize: z.number().int().positive("groupSize must be a positive integer"),
  startISO: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "startISO must be a valid ISO date"),
  notes: z.string().optional(),
  resourceId: z.string().min(1, "resourceId cannot be empty").optional(),
  customer: z.object({
    name: z.string().min(1, "customer.name is required"),
    email: z.string().email("customer.email must be a valid email").optional(),
    phone: z.string().optional(),
  }),
  addons: z.array(addonSchema).optional().default([]),
});

const DEFAULT_RESOURCE_NAME = "Terrain A";

const bookingsQuerySchema = z
  .object({
    from: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "from must be a valid ISO date"),
    to: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "to must be a valid ISO date"),
  })
  .refine(
    (values) => new Date(values.from).getTime() <= new Date(values.to).getTime(),
    "from must be before to"
  );

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = bookingsQuerySchema.parse({
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    const from = new Date(parsed.from);
    const to = new Date(parsed.to);

    const bookings = await prisma.booking.findMany({
      where: {
        dateTimeEnd: { gte: from },
        dateTimeStart: { lte: to },
      },
      include: {
        package: true,
        resource: true,
        assignments: {
          include: {
            animator: true,
          },
        },
        bookingAddons: {
          include: {
            addon: true,
          },
        },
      },
      orderBy: { dateTimeStart: "asc" },
    });

    void logger.info("[BOOKING]", "Fetched bookings", {
      from: from.toISOString(),
      to: to.toISOString(),
      count: bookings.length,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    await logger.error("[BOOKING]", "Error fetching bookings", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, groupSize, startISO, notes, resourceId, customer, addons } =
      createBookingSchema.parse(body);

    const packageData = await prisma.package.findUnique({
      where: { id: packageId },
      select: { durationMin: true },
    });

    if (!packageData) {
      await logger.warn("[BOOKING]", "Package not found for booking creation", {
        packageId,
      });

      return NextResponse.json(
        { error: "Offre introuvable." },
        { status: 404 }
      );
    }

    const startDate = new Date(startISO);
    const endDate = new Date(startDate.getTime() + packageData.durationMin * MINUTES_IN_MS);

    let resolvedResourceId: string;
    if (!resourceId) {
      const defaultResource = await prisma.resource.findFirst({
        where: { name: DEFAULT_RESOURCE_NAME },
        select: { id: true },
      });

      if (!defaultResource) {
        await logger.error(
          "[BOOKING]",
          "Default resource missing during booking creation",
          {
            defaultResourceName: DEFAULT_RESOURCE_NAME,
          }
        );

        return NextResponse.json(
          { error: "Ressource par défaut introuvable." },
          { status: 500 }
        );
      }

      resolvedResourceId = defaultResource.id;
    } else {
      const existingResource = await prisma.resource.findUnique({
        where: { id: resourceId },
        select: { id: true },
      });

      if (!existingResource) {
        await logger.warn("[BOOKING]", "Selected resource not found", {
          resourceId,
        });

        return NextResponse.json(
          { error: "Ressource sélectionnée introuvable." },
          { status: 404 }
        );
      }

      resolvedResourceId = resourceId;
    }

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        resourceId: resolvedResourceId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        dateTimeStart: { lt: endDate },
        dateTimeEnd: { gt: startDate },
      },
      select: {
        id: true,
        dateTimeStart: true,
        dateTimeEnd: true,
      },
    });

    if (conflictingBooking) {
      await logger.warn("[BOOKING]", "Conflicting booking detected", {
        bookingId: conflictingBooking.id,
        requestedStart: startDate.toISOString(),
        requestedEnd: endDate.toISOString(),
      });

      return NextResponse.json(
        {
          error: "Ressource indisponible sur ce créneau.",
          details: {
            conflictBookingId: conflictingBooking.id,
          },
        },
        { status: 409 }
      );
    }

    const clientSearchConditions: Prisma.ClientWhereInput[] = [];
    if (customer.email) {
      clientSearchConditions.push({ email: customer.email });
    }
    if (customer.phone) {
      clientSearchConditions.push({ phone: customer.phone });
    }

    type ClientEntity = Awaited<ReturnType<typeof prisma.client.findFirst>>;
    let client: ClientEntity = null;

    if (clientSearchConditions.length > 0) {
      client = await prisma.client.findFirst({
        where: { OR: clientSearchConditions },
      });
    }

    if (client) {
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: customer.name,
          email: customer.email ?? client.email,
          phone: customer.phone ?? client.phone,
        },
      });
    } else {
      client = await prisma.client.create({
        data: {
          name: customer.name,
          email: customer.email ?? null,
          phone: customer.phone ?? null,
        },
      });
    }

    const booking = await prisma.booking.create({
      data: {
        packageId,
        groupSize,
        customerName: customer.name,
        customerEmail: customer.email ?? null,
        customerPhone: customer.phone ?? null,
        notes: notes ?? null,
        status: BookingStatus.PENDING,
        clientId: client?.id ?? null,
        resourceId: resolvedResourceId,
        dateTimeStart: startDate,
        dateTimeEnd: endDate,
        nocturne: isNocturne(startISO),
        bookingAddons: addons.length
          ? {
              create: addons.map((addon) => ({ addonId: addon.addonId, quantity: addon.qty })),
            }
          : undefined,
      },
      include: {
        bookingAddons: {
          include: {
            addon: true,
          },
        },
        client: true,
        resource: true,
        package: true,
      },
    });

    void syncBookingWithSheets(booking.id);

    const customerRecipient = normalizeRecipient(booking.customerEmail);
    const adminRecipient =
      normalizeRecipient(process.env.MAIL_ADMIN) ?? normalizeRecipient(process.env.MAIL_FROM);

    if (customerRecipient || adminRecipient) {
      const emailContext = await buildBookingEmailContext(booking);

      if (customerRecipient) {
        try {
          const confirmation = bookingConfirmation({
            booking,
            totalCents: emailContext.totalCents,
            mapUrl: emailContext.mapUrl,
            wazeUrl: emailContext.wazeUrl,
          });

          await sendMail({
            to: customerRecipient,
            subject: confirmation.subject,
            html: confirmation.html,
            text: confirmation.text,
          });
          await logger.info("[EMAIL]", "Sent booking confirmation", {
            bookingId: booking.id,
            recipient: customerRecipient,
          });
        } catch (emailError) {
          await logger.error("[EMAIL]", "Failed to send booking confirmation", {
            bookingId: booking.id,
            recipient: customerRecipient,
            error: emailError instanceof Error ? emailError.message : "Unknown error",
          });
        }
      }

      if (adminRecipient) {
        try {
          const adminAlert = adminNewBookingAlert({
            booking,
            totalCents: emailContext.totalCents,
          });

          await sendMail({
            to: adminRecipient,
            subject: adminAlert.subject,
            html: adminAlert.html,
            text: adminAlert.text,
          });
          await logger.info("[EMAIL]", "Sent admin booking alert", {
            bookingId: booking.id,
            recipient: adminRecipient,
          });
        } catch (emailError) {
          await logger.error("[EMAIL]", "Failed to send admin booking alert", {
            bookingId: booking.id,
            recipient: adminRecipient,
            error: emailError instanceof Error ? emailError.message : "Unknown error",
          });
        }
      }
    }

    void logger.info("[BOOKING]", "Booking created", {
      bookingId: booking.id,
      packageId,
      resourceId: booking.resourceId,
      groupSize,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    await logger.error("[BOOKING]", "Error creating booking", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
