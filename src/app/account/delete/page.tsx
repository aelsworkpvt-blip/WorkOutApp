import Link from "next/link";
import { ArrowRight, ShieldAlert, Trash2 } from "lucide-react";
import { AccountDeletionRequestForm } from "@/components/account-deletion-request-form";
import { DeleteAccountCard } from "@/components/delete-account-card";
import { LegalLinks } from "@/components/legal-links";
import { SectionHead } from "@/components/section-head";
import { getCurrentViewer } from "@/lib/auth";

export const metadata = {
  title: "Delete Account",
};

export const dynamic = "force-dynamic";

export default async function AccountDeletePage() {
  const viewer = await getCurrentViewer();
  const canDeleteImmediately = Boolean(viewer?.email);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="panel-dark p-6 sm:p-8">
          <p className="eyebrow border-white/10 bg-white/5 text-white/62">
            Account Deletion
          </p>
          <h1 className="mt-4 text-3xl font-[family:var(--font-sora)] text-white sm:text-4xl">
            Delete your Forge Motion account
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
            This public page exists for Play Store compliance and real user support.
            If you are signed in, you can delete instantly. If you are outside the
            app, submit an email request and we can process it manually.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/72">
              Your account includes profile data, workout sessions, measurement
              entries, nutrition targets, goals, and weekly digests.
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/4 p-4 text-sm leading-7 text-white/72">
              The privacy policy also documents how deletion requests are handled
              and what minimal audit records may remain after the main account is removed.
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
          <div className="panel-light p-6 sm:p-8">
            <SectionHead
              eyebrow={canDeleteImmediately ? "Signed in" : "Outside the app"}
              title={
                canDeleteImmediately
                  ? "Delete the account right now"
                  : "Submit a deletion request"
              }
              description={
                canDeleteImmediately
                  ? `You are currently signed in as ${viewer?.email}.`
                  : "Use the request form below if you do not have access to the in-app profile screen right now."
              }
            />

            {canDeleteImmediately && viewer?.email ? (
              <DeleteAccountCard email={viewer.email} />
            ) : (
              <div className="mt-6">
                <AccountDeletionRequestForm />
              </div>
            )}
          </div>

          <div className="panel-light p-6 sm:p-8">
            <SectionHead
              eyebrow="What happens"
              title="Deletion is meant to be clear and discoverable"
              description="This page covers both the in-app and outside-the-app deletion paths that Play asks for."
            />

            <div className="mt-6 grid gap-3 text-sm text-[var(--muted-light)]">
              <div className="rounded-[22px] bg-white/72 p-4">
                <div className="flex items-center gap-2 font-semibold text-[#171717]">
                  <Trash2 className="h-4 w-4 text-[#ff8c68]" />
                  In-app deletion
                </div>
                <p className="mt-2 leading-7">
                  Signed-in users can delete the account immediately from the
                  profile page or from this public deletion page while logged in.
                </p>
              </div>

              <div className="rounded-[22px] bg-white/72 p-4">
                <div className="flex items-center gap-2 font-semibold text-[#171717]">
                  <ShieldAlert className="h-4 w-4 text-[#79d2c0]" />
                  Outside-the-app request
                </div>
                <p className="mt-2 leading-7">
                  Signed-out users can submit a deletion request by email. This
                  avoids requiring access to the app before a request can be made.
                </p>
              </div>
            </div>

            <LegalLinks className="mt-6" />

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b]"
              >
                Read privacy policy
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/auth"
                className="rounded-full border border-black/8 bg-white/72 px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-white"
              >
                Open sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
