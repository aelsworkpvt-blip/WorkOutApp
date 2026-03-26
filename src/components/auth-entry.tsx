"use client";

import { useEffect, useState } from "react";
import { AuthSection } from "@/components/auth-section";

const SPLASH_DURATION_MS = 5000;

function AuthSplash() {
  return (
    <section className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
      <div className="panel-dark relative w-full max-w-4xl overflow-hidden p-6 pb-12 sm:p-8 sm:pb-14 lg:p-10 lg:pb-16">
        <p className="text-sm uppercase tracking-[0.28em] text-white/45">
          Forge Motion
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl leading-tight font-[family:var(--font-sora)] text-white sm:text-5xl lg:text-6xl">
          Login first. Then mode, split, and onboarding unlock.
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 sm:text-base">
          Real email and password auth is now in place, so every workout history,
          measurement entry, and dashboard belongs to the logged-in user.
        </p>

        <div className="mt-6 inline-flex rounded-full border border-white/10 bg-white/4 px-4 py-2 text-sm text-white/78">
          Demo flow after auth: mode {"->"} split {"->"} onboarding {"->"} dashboard
        </div>

        <div className="mt-8 grid gap-3">
          {[
            "Create your own account with email and password.",
            "Choose your training mode right after login.",
            "Logout clears the session safely.",
            "After login: mode choice -> split choice -> onboarding -> dashboard.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[22px] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/68"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="absolute inset-x-6 bottom-6 h-1.5 overflow-hidden rounded-full bg-white/10 sm:inset-x-8 sm:bottom-8 lg:inset-x-10 lg:bottom-10">
          <div
            className="h-full rounded-full bg-[#ffd54f]"
            style={{
              animation: `auth-splash-progress ${SPLASH_DURATION_MS}ms linear forwards`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

export function AuthEntry({ notice }: { notice?: string | null } = {}) {
  const [showSplash, setShowSplash] = useState(!notice);

  useEffect(() => {
    if (!showSplash) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowSplash(false);
    }, SPLASH_DURATION_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [showSplash]);

  if (showSplash) {
    return <AuthSplash />;
  }

  return <AuthSection notice={notice} />;
}
