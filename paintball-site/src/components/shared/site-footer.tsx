import { contactDetails } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="border-t border-border/60 bg-gradient-to-br from-background to-muted/60"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-xs uppercase tracking-[0.3em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-2">
          <p className="font-heading text-sm text-foreground">
            {contactDetails.name}
          </p>
          <p>Route des Pins, 13000 Marseille</p>
        </div>
        <div className="space-y-2 text-right">
          <p className="text-muted-foreground">{contactDetails.email}</p>
          <p className="text-muted-foreground">{contactDetails.phoneDisplay}</p>
        </div>
      </div>
    </footer>
  );
}
