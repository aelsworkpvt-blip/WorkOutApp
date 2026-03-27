import Link from "next/link";
import { Database, LockKeyhole, ShieldCheck, Trash2 } from "lucide-react";
import { SectionHead } from "@/components/section-head";

export const metadata = {
  title: "Privacy Policy",
};

const policySections = [
  {
    title: "What we collect",
    description:
      "FitX stores the information you enter to run the app: account email, password hash, profile details like age, gender, height and weight, workout history, measurements, nutrition targets, and weekly training summaries.",
    icon: Database,
  },
  {
    title: "How we use it",
    description:
      "We use your data to authenticate you, personalize training setup, calculate nutrition targets, show progress charts, and keep your workout history attached to your account. We do not sell your personal or fitness data.",
    icon: ShieldCheck,
  },
  {
    title: "How we protect it",
    description:
      "Passwords are stored as hashes rather than plain text, and session state is kept in an HTTP-only cookie. Production deployments should serve the app over HTTPS and keep database access limited to trusted infrastructure.",
    icon: LockKeyhole,
  },
  {
    title: "Retention and deletion",
    description:
      "We keep your account data until you ask us to delete it. Signed-in users can permanently delete the account from the profile page. If you are outside the app, you can submit a deletion request from the public deletion page linked below.",
    icon: Trash2,
  },
];

export default function PrivacyPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="panel-dark p-6 sm:p-8">
          <p className="eyebrow border-white/10 bg-white/5 text-white/62">
            Privacy Policy
          </p>
          <h1 className="mt-4 text-3xl font-[family:var(--font-sora)] text-white sm:text-4xl">
            FitX privacy policy
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">
            Last updated on March 25, 2026. This page explains what data FitX
            stores, why it is used, and how users can request deletion of
            their account and fitness history.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/account/delete"
              className="rounded-full bg-[#ffd54f] px-5 py-3 text-sm font-semibold text-[#171717] transition hover:-translate-y-0.5"
            >
              Open deletion page
            </Link>
            <Link
              href="/auth"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to sign in
            </Link>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {policySections.map((section) => (
            <div key={section.title} className="panel-light p-6 sm:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#171717] text-white">
                <section.icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-[family:var(--font-sora)] text-[#171717]">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted-light)] sm:text-base">
                {section.description}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="panel-light p-6 sm:p-8">
            <SectionHead
              eyebrow="Details"
              title="A few important specifics"
              description="This policy is intentionally plain-language, but it still maps to how the app currently works in this codebase."
            />

            <ul className="mt-6 grid gap-3 text-sm leading-7 text-[var(--muted-light)] sm:text-base">
              <li className="rounded-[22px] bg-white/70 p-4">
                FitX currently collects workout and body-measurement data
                only when you enter it directly into the app.
              </li>
              <li className="rounded-[22px] bg-white/70 p-4">
                The app does not currently request device location, camera,
                microphone, contacts, or SMS access.
              </li>
              <li className="rounded-[22px] bg-white/70 p-4">
                If you request deletion from inside the app, the primary account,
                profile, nutrition, workout, digest, and measurement data are
                removed from the app database.
              </li>
              <li className="rounded-[22px] bg-white/70 p-4">
                We may retain a minimal deletion-request record, such as the email
                and timestamp of the request, to document that the request was
                fulfilled and to investigate abuse if needed.
              </li>
            </ul>
          </div>

          <div className="panel-light p-6 sm:p-8">
            <SectionHead
              eyebrow="Contact"
              title="Questions or deletion requests"
              description="The deletion page is the public contact mechanism for account-removal requests."
            />

            <div className="mt-6 grid gap-3 text-sm text-[var(--muted-light)]">
              <div className="rounded-[22px] bg-white/70 p-4">
                Signed in right now: open the profile page and use the delete
                account card for immediate removal.
              </div>
              <div className="rounded-[22px] bg-white/70 p-4">
                Outside the app: use the public deletion page to submit an email
                request for account removal.
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/account/delete"
                className="rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b]"
              >
                Delete account
              </Link>
              <Link
                href="/profile"
                className="rounded-full border border-black/8 bg-white/72 px-5 py-3 text-sm font-semibold text-[#171717] transition hover:bg-white"
              >
                Open profile
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
