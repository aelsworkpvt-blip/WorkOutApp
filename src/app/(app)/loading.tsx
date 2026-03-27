function SkeletonBlock({
  className,
  dark = false,
}: {
  className: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`${className} animate-pulse rounded-full ${
        dark ? "bg-white/10" : "bg-black/8"
      }`}
    />
  );
}

export default function AppLoading() {
  return (
    <div className="grid gap-6">
      <section className="panel-dark p-6 sm:p-8">
        <SkeletonBlock className="h-3 w-16" dark />
        <SkeletonBlock className="mt-5 h-12 w-64 max-w-full" dark />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" dark />
        <SkeletonBlock className="mt-3 h-4 w-11/12 max-w-xl" dark />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="panel-dark-soft p-5">
              <SkeletonBlock className="h-3 w-24" dark />
              <SkeletonBlock className="mt-4 h-9 w-20" dark />
              <SkeletonBlock className="mt-3 h-3 w-28" dark />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel-dark-soft p-5">
            <SkeletonBlock className="h-3 w-28" dark />
            <div className="mt-6 flex justify-center">
              <div className="h-28 w-28 animate-pulse rounded-full bg-white/8" />
            </div>
          </div>

          <div className="panel-dark-soft p-5">
            <div className="flex flex-wrap gap-3">
              {[0, 1, 2].map((index) => (
                <SkeletonBlock key={index} className="h-10 w-28" dark />
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-[20px] bg-white/6 px-4 py-5"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel-light p-6 sm:p-8">
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-5 h-10 w-56 max-w-full" />
          <SkeletonBlock className="mt-4 h-4 w-full max-w-2xl" />
          <SkeletonBlock className="mt-3 h-4 w-4/5 max-w-xl" />

          <div className="mt-8 grid gap-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="animate-pulse rounded-[26px] bg-white/72 px-5 py-6"
              />
            ))}
          </div>
        </div>

        <div className="panel-dark p-6 sm:p-8">
          <SkeletonBlock className="h-3 w-20" dark />
          <SkeletonBlock className="mt-5 h-10 w-48 max-w-full" dark />
          <SkeletonBlock className="mt-4 h-4 w-full max-w-lg" dark />

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="animate-pulse rounded-[24px] border border-white/8 bg-white/4 px-5 py-6"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
