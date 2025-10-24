"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";

export default function LogoutPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Déconnexion</h1>
          <p className="text-sm text-muted-foreground">
            Êtes-vous sûr de vouloir vous déconnecter ?
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => signOut({ callbackUrl: "/" })}>Se déconnecter</Button>
          <Button variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}
