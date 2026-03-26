"use client";

import { useRef, useState } from "react";
import { Mail, ShieldAlert } from "lucide-react";
import { requestAccountDeletionAction } from "@/app/actions";

export function AccountDeletionRequestForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleRequest(formData: FormData) {
    if (pending) {
      return;
    }

    setPending(true);
    const result = await requestAccountDeletionAction(formData);
    setPending(false);

    if (!result.success) {
      setError(result.error ?? "Unable to record that request right now.");
      setMessage(null);
      return;
    }

    setError(null);
    setMessage(
      result.message ??
        "If an account matches that email address, the deletion request has been received.",
    );
    formRef.current?.reset();
  }

  return (
    <div className="rounded-[28px] border border-black/8 bg-white/72 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#111622] p-2 text-white">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[#171717]">
            Request account deletion by email
          </p>
          <p className="mt-2 text-sm leading-7 text-[var(--muted-light)]">
            Use this form if you are outside the app and need us to process a
            deletion request manually. If you can still sign in, the fastest path
            is deleting the account directly from the profile screen.
          </p>
        </div>
      </div>

      <form ref={formRef} action={handleRequest} className="mt-5 grid gap-4">
        <label className="text-sm text-[var(--muted-light)]">
          Account email
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[var(--muted-light)]/72" />
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="field-light pl-11"
              placeholder="you@example.com"
            />
          </div>
        </label>

        <label className="text-sm text-[var(--muted-light)]">
          Anything we should know? (optional)
          <textarea
            name="reason"
            rows={4}
            className="field-light mt-2 min-h-28 resize-y"
            placeholder="Example: I no longer use the app and want the profile removed."
          />
        </label>

        {error ? (
          <div className="rounded-[20px] border border-[#f1c27d] bg-[#fff2dd] px-4 py-3 text-sm text-[#8b5f17]">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-[20px] border border-[#9ddbcf] bg-[#eefbf7] px-4 py-3 text-sm text-[#176b57]">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending ? "Sending request..." : "Request deletion"}
        </button>
      </form>
    </div>
  );
}
