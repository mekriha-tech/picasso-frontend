"use client";

import { usePathname, useRouter } from "next/navigation";
import { initSession } from "@/lib/auth-api";
import { loginPath } from "@/lib/redirect";

// Wraps actions (bid, buy, wishlist, VR) that need an account. Logged out -> send to login and
// return here afterwards; logged in -> run onAllowed (a placeholder until the feature ships).
export default function GatedAction({ children, onAllowed, className = "" }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (!(await initSession())) router.push(loginPath(pathname));
        else onAllowed?.();
      }}
    >
      {children}
    </button>
  );
}
