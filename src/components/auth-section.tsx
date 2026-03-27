"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction, signUpAction } from "@/app/actions";
import { LegalLinks } from "@/components/legal-links";

export function AuthSection({ notice }: { notice?: string | null } = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);

  async function handleAction(formData: FormData) {
    const result =
      mode === "login"
        ? await loginAction(formData)
        : await signUpAction(formData);

    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }

    setError(null);
    startTransition(() => {
      router.push("/");
      router.refresh();
    });
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-md items-center">
      <div className="panel-light w-full p-6 sm:p-7">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--muted-light)]">
          FitX
        </p>
        <h1 className="mt-4 text-3xl leading-tight font-[family:var(--font-sora)] text-[#171717] sm:text-4xl">
          Login or create your account.
        </h1>
        <p className="mt-3 text-sm leading-7 text-[var(--muted-light)]">
          Once you sign in, you choose your training mode. Muscle Growth is live
          right now, while Fat Loss and Body Recomposition stay visible as
          coming soon before split setup, onboarding, and your dashboard.
        </p>

        {notice ? (
          <div className="mt-5 rounded-[20px] border border-[#9ddbcf] bg-[#eefbf7] px-4 py-3 text-sm text-[#176b57]">
            {notice}
          </div>
        ) : null}

        <div className="flex gap-3">
          {[
            { key: "login", label: "Login" },
            { key: "signup", label: "Create account" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMode(item.key as "login" | "signup");
                setError(null);
              }}
              className={
                mode === item.key
                  ? "rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white"
                  : "rounded-full border border-black/8 bg-white/72 px-4 py-3 text-sm font-semibold text-[#171717]"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <form action={handleAction} className="mt-6 grid gap-4">
          {mode === "signup" ? (
            <label className="text-sm text-[var(--muted-light)]">
              Full name
              <input name="name" className="field-light" placeholder="Enter your name" />
            </label>
          ) : null}

          <label className="text-sm text-[var(--muted-light)]">
            Email
            <input
              name="email"
              type="email"
              className="field-light"
              placeholder="you@example.com"
            />
          </label>

          <label className="text-sm text-[var(--muted-light)]">
            Password
            <input
              name="password"
              type="password"
              className="field-light"
              placeholder="Minimum 8 characters"
            />
          </label>

          {error ? (
            <div className="rounded-[20px] border border-[#f1c27d] bg-[#fff2dd] px-4 py-3 text-sm text-[#8b5f17]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b]"
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>

        <LegalLinks className="mt-6" />
      </div>
    </section>
  );
}
