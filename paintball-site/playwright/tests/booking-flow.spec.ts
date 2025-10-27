import { expect, test } from "@playwright/test";

test.describe("Booking wizard", () => {
  test("completes the reservation flow with mocked APIs", async ({ page }) => {
    const packages = [
      {
        id: "pkg_decouverte",
        name: "Découverte",
        priceCents: 2000,
        includedBalls: 120,
        durationMin: 120,
        isPromo: false,
      },
    ];

    const addons = [
      {
        id: "addon_recharge",
        name: "Recharge +100 billes",
        priceCents: 600,
      },
    ];

    let quoteRequested = false;
    let bookingPayload: Record<string, unknown> | null = null;

    await page.route("**/api/public/packages", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packages),
      });
    });

    await page.route("**/api/public/addons", async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addons),
      });
    });

    await page.route("**/api/bookings/quote", async (route) => {
      quoteRequested = true;
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalCents: 29000,
          nocturne: false,
          endISO: "2024-08-01T21:30:00.000Z",
          breakdown: {
            base: 24000,
            addons: 5000,
            nocturneExtra: 0,
            underMinPenalty: 0,
          },
        }),
      });
    });

    await page.route("**/api/bookings", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }

      bookingPayload = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;

      await route.fulfill({
        status: 201,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "booking_mock",
          customerName: "Jean Testeur",
          dateTimeStart: "2024-08-01T19:30:00.000Z",
        }),
      });
    });

    await page.goto("/booking");

    await expect(
      page.getByRole("heading", { level: 1, name: "Réserver votre session" })
    ).toBeVisible();

    await page.locator("label", { hasText: "Découverte" }).first().click();
    await page.getByRole("button", { name: "Étape suivante" }).click();

    const groupInput = page.getByLabel("Nombre de joueurs");
    await groupInput.fill("");
    await groupInput.type("6");
    await page.getByRole("button", { name: "Étape suivante" }).click();

    await page
      .locator('[data-slot="calendar"] button[data-day]:not([disabled])')
      .first()
      .click();

    const slotTrigger = page.getByRole("combobox", { name: "Créneau horaire" });
    await slotTrigger.click();
    const quoteResponsePromise = page.waitForResponse((response) =>
      response.url().endsWith("/api/bookings/quote") && response.request().method() === "POST"
    );
    await page.getByRole("option", { name: "09:00" }).click();

    await page.getByRole("button", { name: "Étape suivante" }).click();

    await quoteResponsePromise;

    await page.getByLabel("Nom et prénom").fill("Jean Testeur");
    await page.getByLabel("Email").fill("jean.testeur@example.com");
    await page.getByLabel("Téléphone").fill("0612345678");

    const addonInput = page.getByLabel("Recharge +100 billes");
    await addonInput.fill("");
    await addonInput.type("2");

    await expect(page.getByText("Récapitulatif tarifaire")).toBeVisible();
    await expect.poll(() => quoteRequested).toBe(true);
    await expect(
      page.getByText(/Total estimé|Calcul du tarif en cours…/)
    ).toBeVisible();

    await page.getByRole("checkbox", { name: "Consentement" }).check();

    await page.getByRole("button", { name: "Confirmer la réservation" }).click();

    await expect(page.getByTestId("booking-success")).toBeVisible();

    expect(bookingPayload).not.toBeNull();
    expect(bookingPayload).toMatchObject({
      packageId: "pkg_decouverte",
      groupSize: 6,
      customer: {
        name: "Jean Testeur",
        email: "jean.testeur@example.com",
        phone: "0612345678",
      },
      addons: [{ addonId: "addon_recharge", qty: 2 }],
    });
  });
});

