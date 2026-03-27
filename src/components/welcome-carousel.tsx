"use client";

import { startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Flame,
  LineChart,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { dismissWelcomeCarouselAction } from "@/app/actions";

type WelcomeCarouselProps = {
  userName: string;
};

export function WelcomeCarousel({ userName }: WelcomeCarouselProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const slides = useMemo(
    () => [
      {
        eyebrow: "Workout flow",
        title: "Pick the training day, then log only the lifts you actually perform.",
        description:
          "The workout page is built for execution. Choose Push, Pull, Legs, Chest, Back, Shoulders, or Arms, then log the exact exercises for today.",
        accent: "#ffd54f",
        cards: [
          {
            icon: Dumbbell,
            title: "Workout picker",
            body: "Select the exact day and see all available exercises for that area.",
          },
          {
            icon: Target,
            title: "Workout memory",
            body: "Every exercise remembers your last performance and suggests the next overload step.",
          },
          {
            icon: LineChart,
            title: "Only what matters",
            body: "No clutter inside the app screens. The guidance is here, once, up front.",
          },
        ],
      },
      {
        eyebrow: "Weekly review",
        title: "One weekly page for measurements, digest, and progress clarity.",
        description:
          "Body changes, calories burned, consistency, and volume trends now live in one weekly check-in flow that feels clean on mobile.",
        accent: "#79d2c0",
        cards: [
          {
            icon: Scale,
            title: "Measurements",
            body: "Track weight, waist, arms, chest, thighs, calves, and body-fat over time.",
          },
          {
            icon: Flame,
            title: "Weekly digest",
            body: "See average burn, workouts completed, total volume, and your next focus for the week.",
          },
          {
            icon: LineChart,
            title: "Progress charts",
            body: "Open one page and understand body changes and training momentum immediately.",
          },
        ],
      },
      {
        eyebrow: "Pain points solved",
        title: "This app is built to remove guesswork for lifters.",
        description:
          "You should not have to remember last week's weights, guess muscle-building macros, or wonder whether the plan is moving the body in the right direction.",
        accent: "#ff9f68",
        cards: [
          {
            icon: Sparkles,
            title: "Workout memory",
            body: "The next set is not a guess.",
          },
          {
            icon: Sparkles,
            title: "Muscle-building nutrition",
            body: "Calories, protein, carbs, fiber, and fat are tuned for the live muscle-growth path.",
          },
          {
            icon: Sparkles,
            title: `${userName}, your weekly rhythm matters`,
            body: "Weekly measurements and digest summaries help you adjust before wasting another cycle.",
          },
        ],
      },
    ],
    [userName],
  );

  const slide = slides[activeIndex];
  const isFinalSlide = activeIndex === slides.length - 1;

  async function closeCarousel() {
    setIsClosing(true);
    await dismissWelcomeCarouselAction();
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(12,16,24,0.66)] p-4 backdrop-blur-md">
      <div className="panel-light w-full max-w-xl overflow-hidden rounded-[34px] border border-white/30 shadow-[0_30px_100px_rgba(6,10,16,0.42)]">
        <div
          className="h-2 w-full"
          style={{
            background: `linear-gradient(90deg, ${slide.accent}, rgba(255,255,255,0.82))`,
          }}
        />

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <span className="eyebrow border-black/8 text-[var(--muted-light)]">
              <Sparkles className="h-3.5 w-3.5" />
              {slide.eyebrow}
            </span>
            <button
              type="button"
              onClick={closeCarousel}
              disabled={isClosing}
              className="text-sm font-semibold text-[var(--muted-light)] transition hover:text-[#171717] disabled:opacity-60"
            >
              Skip
            </button>
          </div>

          <h2 className="mt-5 text-3xl leading-tight font-[family:var(--font-sora)] text-[#171717] sm:text-4xl">
            {slide.title}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--muted-light)] sm:text-base">
            {slide.description}
          </p>

          <div className="mt-6 grid gap-3">
            {slide.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-[24px] border border-black/8 bg-white/72 p-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[#171717]">
                  <card.icon className="h-4 w-4" style={{ color: slide.accent }} />
                  {card.title}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted-light)]">
                  {card.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {slides.map((item, index) => (
                <span
                  key={item.title}
                  className={
                    index === activeIndex
                      ? "h-2.5 w-8 rounded-full"
                      : "h-2.5 w-2.5 rounded-full bg-black/12"
                  }
                  style={
                    index === activeIndex
                      ? { backgroundColor: slide.accent }
                      : undefined
                  }
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
                disabled={activeIndex === 0 || isClosing}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white/72 text-[#171717] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isFinalSlide) {
                    void closeCarousel();
                    return;
                  }

                  setActiveIndex((index) =>
                    Math.min(slides.length - 1, index + 1),
                  );
                }}
                disabled={isClosing}
                className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isFinalSlide ? "Enter app" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
