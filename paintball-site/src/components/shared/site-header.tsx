"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "#experiences", label: "Expériences" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header role="banner" className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Retour à l'accueil Paintball Méditerranée"
          className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="relative h-9 w-9 overflow-hidden rounded-full border border-primary/40 bg-gradient-to-br from-primary/80 to-accent/80 shadow-lg">
            <Image
              src="/favicon.svg"
              alt="Logo de Paintball Méditerranée"
              fill
              priority
              sizes="36px"
              className="object-contain p-1"
            />
          </span>
          <span className="hidden font-heading text-xs sm:inline-block sm:text-sm">
            Paintball Méditerranée
          </span>
        </Link>
        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-8 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {item.label}
            </Link>
          ))}
          <Button
            asChild
            className="rounded-full bg-primary px-6 font-semibold uppercase tracking-[0.3em] text-primary-foreground shadow-lg transition hover:bg-primary/90"
          >
            <Link href="#tarifs">Réserver</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-3 md:gap-5">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Ouvrir le menu"
                aria-expanded={open}
                aria-controls="mobile-navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              id="mobile-navigation"
              side="right"
              className="bg-background/95 backdrop-blur"
              aria-label="Menu mobile"
            >
              <SheetHeader className="pt-10">
                <SheetTitle className="font-heading text-lg uppercase tracking-[0.4em]">
                  Navigation
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-2 py-2 transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-2 w-full rounded-full bg-primary py-6 text-primary-foreground shadow-lg hover:bg-primary/90"
                >
                  <Link href="#tarifs" onClick={() => setOpen(false)}>
                    Réserver
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
