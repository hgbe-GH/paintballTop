const CONTACT_PHONE_DISPLAY = "+33 4 42 00 00 00";
const CONTACT_PHONE_SANITIZED = CONTACT_PHONE_DISPLAY.replace(/\s+/g, "");

const rawWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const whatsappDigits = rawWhatsapp
  .replace(/[^0-9+]/g, "")
  .replace(/^\+/, "")
  .replace(/^00/, "");

export const contactDetails = {
  name: "Paintball Méditerranée",
  email: "contact@paintball-med.com",
  phoneDisplay: CONTACT_PHONE_DISPLAY,
  phoneNumber: CONTACT_PHONE_SANITIZED,
  whatsappDisplay: rawWhatsapp.trim() || null,
  whatsappLink:
    whatsappDigits.length > 0 ? `https://wa.me/${whatsappDigits}` : null,
  depositUrl: process.env.NEXT_PUBLIC_DEPOSIT_URL ?? null,
  bookingAnchor: "#tarifs",
} as const;

export const contactAria = {
  call: `Appeler ${contactDetails.name}`,
  whatsapp: `Discuter sur WhatsApp avec ${contactDetails.name}`,
  booking: `Ouvrir la section réservation`,
  deposit: `Déposer un acompte pour ${contactDetails.name}`,
} as const;
