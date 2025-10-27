"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, MessageCircle, Phone, PiggyBank } from "lucide-react";

import { contactAria, contactDetails } from "@/lib/contact";
import { cn } from "@/lib/utils";

type ActionBase = {
  key: string;
  label: string;
  icon: React.ElementType;
  className?: string;
};

type ExternalAction = ActionBase & {
  type: "external";
  href: string;
  ariaLabel: string;
  rel?: string;
};

type InternalAction = ActionBase & {
  type: "internal";
  href: string;
  ariaLabel: string;
};

type Action = ExternalAction | InternalAction;

const HIDDEN_PATH_PREFIXES = ["/admin", "/login", "/logout"];

function buildActions(): Action[] {
  const actions: Action[] = [
    {
      key: "call",
      type: "external",
      href: `tel:${contactDetails.phoneNumber}`,
      label: "Appeler",
      ariaLabel: `${contactAria.call} au ${contactDetails.phoneDisplay}`,
      icon: Phone,
    },
  ];

  if (contactDetails.whatsappLink) {
    actions.push({
      key: "whatsapp",
      type: "external",
      href: contactDetails.whatsappLink,
      label: "WhatsApp",
      ariaLabel: contactAria.whatsapp,
      icon: MessageCircle,
      rel: "noopener noreferrer",
    });
  }

  actions.push({
    key: "booking",
    type: "internal",
    href: contactDetails.bookingAnchor,
    label: "Réserver",
    ariaLabel: contactAria.booking,
    icon: CalendarDays,
  });

  if (contactDetails.depositUrl) {
    actions.push({
      key: "deposit",
      type: "external",
      href: contactDetails.depositUrl,
      label: "Acompte",
      ariaLabel: contactAria.deposit,
      icon: PiggyBank,
      rel: "noopener noreferrer",
    });
  }

  return actions;
}

export function MobileActionDock() {
  const pathname = usePathname();

  if (pathname && HIDDEN_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  const actions = buildActions();

  if (actions.length === 0) {
    return null;
  }

  const actionClass =
    "flex flex-1 items-center justify-center gap-2 rounded-full border border-border/70 bg-card/90 px-3 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-foreground shadow-sm transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  return (
    <>
      <div aria-hidden className="h-[calc(env(safe-area-inset-bottom)+4.5rem)] md:hidden" />
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 shadow-[0_-12px_32px_rgba(0,0,0,0.18)] backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <nav
          aria-label="Actions rapides"
          className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3"
        >
          {actions.map((action) => {
            const Icon = action.icon;

            if (action.type === "internal") {
              return (
                <Link
                  key={action.key}
                  href={action.href}
                  className={cn(actionClass, action.className)}
                  aria-label={action.ariaLabel}
                >
                  <Icon className="size-4" aria-hidden />
                  <span>{action.label}</span>
                </Link>
              );
            }

            return (
              <a
                key={action.key}
                href={action.href}
                className={cn(actionClass, action.className)}
                aria-label={action.ariaLabel}
                target={action.href.startsWith("http") ? "_blank" : undefined}
                rel={action.rel}
              >
                <Icon className="size-4" aria-hidden />
                <span>{action.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}
