import Link from "next/link";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-xl items-center">
        <div className="panel-dark w-full p-6 sm:p-8">
          <p className="eyebrow border-white/10 bg-white/5 text-white/62">
            Offline Mode
          </p>
          <h1 className="mt-4 text-3xl font-[family:var(--font-sora)] text-white sm:text-4xl">
            You are offline right now.
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
            FitX can open again as soon as your connection comes back.
            Your saved data is still safe, but new workout logs and measurements
            need the internet before they can sync to Postgres.
          </p>

          <div className="mt-6 grid gap-3 text-sm text-white/70">
            <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
              Reconnect and reopen the app to continue your dashboard flow.
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/5 p-4">
              If you just installed the app, keep it pinned and it will reopen
              like a native app on your phone.
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full bg-[#ffd54f] px-5 py-3 text-sm font-semibold text-[#171717] transition hover:-translate-y-0.5"
            >
              Try again
            </Link>
            <Link
              href="/auth"
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
