"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccountAction } from "@/app/actions";

export function DeleteAccountCard({
  email,
  redirectTo = "/auth?accountDeleted=1",
}: {
  email: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const canSubmit =
    confirmation.trim().toLowerCase() === email.toLowerCase() && !pending;

  async function handleDelete(formData: FormData) {
    if (pending) {
      return;
    }

    setPending(true);
    const result = await deleteAccountAction(formData);

    if (!result.success) {
      setError(result.error ?? "Unable to delete this account right now.");
      setPending(false);
      return;
    }

    setError(null);
    startTransition(() => {
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return (
    <div className="mt-6 rounded-[28px] border border-[#ffcc80]/22 bg-[#1b2230] p-5 text-white sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#ffd54f]/12 p-2 text-[#ffd54f]">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold">Delete this account permanently</p>
          <p className="mt-2 text-sm leading-7 text-white/68">
            This removes your profile, workout history, measurements, goals, and
            saved dashboard data from the app database. Type your account email
            exactly to confirm the deletion.
          </p>
        </div>
      </div>

      <form action={handleDelete} className="mt-5 grid gap-4">
        <label className="text-sm text-white/68">
          Confirm with your email
          <input
            name="confirmation"
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            autoComplete="off"
            className="field-dark mt-2"
            placeholder={email}
          />
        </label>

        {error ? (
          <div className="rounded-[20px] border border-[#f1c27d]/28 bg-[#2a1f14] px-4 py-3 text-sm text-[#ffd5a0]">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-[#ff8c68] px-5 py-4 text-sm font-semibold text-[#171717] transition hover:bg-[#ff9f7e] disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Trash2 className="h-4 w-4" />
          {pending ? "Deleting account..." : "Delete account"}
        </button>
      </form>
    </div>
  );
}
