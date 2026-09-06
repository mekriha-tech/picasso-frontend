"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  clearAccessToken,
  getAccessToken,
  getMe,
  logout
} from "@/lib/auth-api";

export default function DashboardPage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getAccessToken()) {
      router.push("/");
      return;
    }
    let active = true;
    getMe()
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        clearAccessToken();
        router.push("/login");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch {
      // ignore network failure; clear locally either way
    }
    clearAccessToken();
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
      <div className="w-full max-w-2xl rounded-2xl bg-card p-10 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-14">
        <h1 className="text-[2rem] font-medium leading-tight tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {loading
            ? "Loading your account…"
            : user
              ? `You're signed in as ${user.full_name || user.email}.`
              : "You're signed in."}
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-10 h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </main>
  );
}
