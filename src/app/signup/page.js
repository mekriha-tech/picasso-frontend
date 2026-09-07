"use client"

import { useRouter, useSearchParams  } from "next/navigation";
import { useId, useState, Suspense } from "react";
import glassImage from "@/assets/auth-glass.jpg";
import { register, setAccessToken } from "@/lib/auth-api";
import Image from "next/image";
import Link from "next/link";

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.4 10.4 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 4.06-4.94M9.9 4.24A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.16 3.19" />
      <path d="M9.9 9.9a3 3 0 0 0 4.24 4.24" />
      <path d="M1 1l22 22" />
    </svg>
  );
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function SignupPage() {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const [name, setName] = useState("");
  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    if (!name.trim() || !trimmedEmail) {
      setError("Please enter your name and email.");
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setError("Password does not meet the requirements below.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await register(trimmedEmail, password, name.trim());
      setAccessToken(result.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Suspense fallback={null}>
      <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
        <div className="w-full max-w-5xl rounded-2xl bg-card p-10 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-14">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Image
              loading="eager"
              src={glassImage}
              alt="Textured frosted glass in warm gold and teal tones"
              width={880}
              height={880}
              className="hidden aspect-square w-full object-cover md:block"
            />

            <div>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="relative">
                  <label
                    htmlFor={nameId}
                    className="absolute -top-2 left-3 bg-card px-1 text-xs text-muted-foreground"
                  >
                    Name
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 w-full rounded-md border border-ring/40 bg-accent px-4 text-base text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor={emailId}
                    className="absolute -top-2 left-3 bg-card px-1 text-xs text-muted-foreground"
                  >
                    Email
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 w-full rounded-md border border-ring/40 bg-accent px-4 text-base text-foreground outline-none transition-colors focus:border-foreground"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor={passwordId}
                    className="absolute -top-2 left-3 bg-card px-1 text-xs text-muted-foreground"
                  >
                    Password
                  </label>
                  <input
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-md border border-ring/40 bg-accent px-4 pr-12 text-base text-foreground outline-none transition-colors focus:border-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/70 transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  Password must be at least 8 characters and include a lowercase
                  letter, uppercase letter, and digit.
                </p>

                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Signing up…" : "Sign up"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/"
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Log in.
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </Suspense>
  );
}
