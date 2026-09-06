"use client"

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import glassImage from "@/assets/auth-glass.jpg";
import { checkEmail, login, setAccessToken } from "@/lib/auth-api";
import Image from "next/image";
import Link from "next/link";

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.12 3.02-.85.99-2.24 1.76-3.4 1.67a3.6 3.6 0 0 1 1.13-2.9c.77-.87 2.1-1.53 3.2-1.6.06.27.19.53.19.81zM20.6 17.09c-.55 1.28-.82 1.85-1.53 2.98-1 1.58-2.4 3.55-4.14 3.56-1.55.02-1.95-1.01-4.05-1-2.1.01-2.54 1.02-4.09 1-1.74-.01-3.07-1.78-4.06-3.36C.09 15.86-.2 10.7 1.5 7.97c1.2-1.94 3.1-3.07 4.88-3.07 1.82 0 2.96 1.01 4.46 1.01 1.46 0 2.35-1.01 4.45-1.01 1.59 0 3.27.87 4.47 2.36-3.93 2.16-3.29 7.79 1.84 9.83z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4.01-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.1C6.23 6.88 8.88 4.77 12 4.77z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

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

export default function LoginPage() {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onEmailSubmit = async (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const { exists } = await checkEmail(trimmed);
      if (exists) {
        setStep("password");
      } else {
        router.push(`/signup?email=${encodeURIComponent(trimmed)}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (event) => {
    event.preventDefault();
    if (!password) return;
    setError(null);
    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      setAccessToken(result.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
      <div className="w-full max-w-5xl rounded-2xl bg-card p-10 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:p-14">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Image
            src={glassImage}
            alt="Textured frosted glass in warm gold and teal tones"
            width={880}
            height={880}
            loading="eager"
            className="hidden aspect-square w-full object-cover md:block"
          />

          {step === "email" ? (
            <div>
              <h1 className="text-[2rem] font-medium leading-tight tracking-tight text-foreground">
                Sign up or log in
              </h1>

              <form onSubmit={(e) => onEmailSubmit(e)} className="mt-8">
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

                {error && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Checking…" : "Continue"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Or continue with
              </p>

              <div className="mt-4 grid grid-cols-3 gap-4">
                {[
                  { label: "Apple", icon: <AppleIcon /> },
                  { label: "Google", icon: <GoogleIcon /> },
                  { label: "Facebook", icon: <FacebookIcon /> },
                ].map((provider) => (
                  <button
                    key={provider.label}
                    type="button"
                    aria-label={`Continue with ${provider.label}`}
                    className="flex h-14 items-center justify-center rounded-full border border-border-strong text-foreground transition-colors hover:bg-accent"
                  >
                    {provider.icon}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-[2rem] font-medium leading-tight tracking-tight text-foreground">
                Welcome back
              </h1>

              <form onSubmit={onPasswordSubmit} className="mt-8">
                <div className="relative">
                  <label
                    htmlFor={passwordId}
                    className="absolute -top-2 left-3 bg-card px-1 text-xs text-ring"
                  >
                    Password
                  </label>
                  <input
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 w-full rounded-md border border-ring bg-accent px-4 pr-12 text-base text-foreground outline-none transition-colors focus:border-foreground"
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

                <div className="mt-2 text-right">
                  <a
                    href="#"
                    className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Forgot Password?
                  </a>
                </div>

                {error && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-8 h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Logging in…" : "Log in"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href={`/signup?email=${encodeURIComponent(email.trim())}`}
                  search={{ email: email.trim() }}
                  className="font-medium text-foreground underline underline-offset-2"
                >
                  Sign up.
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}