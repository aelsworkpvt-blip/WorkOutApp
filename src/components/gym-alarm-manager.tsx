"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BellRing, Flame, X } from "lucide-react";
import {
  GYM_ALARM_LAST_FIRED_DAY_KEY,
  GYM_ALARM_SETTINGS_EVENT,
  getLocalDayStamp,
  loadGymAlarmSettings,
  timeStringToMinutes,
} from "@/lib/gym-alarm";

type GymAlarmManagerProps = {
  userName: string;
  todayCompleted: boolean;
  currentStreak: number;
  workoutHref: string;
};

function getFirstName(userName: string) {
  return userName.trim().split(" ")[0] || "Athlete";
}

function buildAlarmCopy(userName: string, currentStreak: number) {
  const firstName = getFirstName(userName);

  if (currentStreak > 0) {
    return `No workout is logged today yet. Keep your ${currentStreak}-day streak alive, ${firstName}.`;
  }

  return `No workout is logged today yet. This is your sign to show up, ${firstName}.`;
}

export function GymAlarmManager({
  userName,
  todayCompleted,
  currentStreak,
  workoutHref,
}: GymAlarmManagerProps) {
  const [ready, setReady] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState("19:00");
  const [isOpen, setIsOpen] = useState(false);
  const [alarmDay, setAlarmDay] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncSettings = () => {
      const settings = loadGymAlarmSettings(window.localStorage);
      setEnabled(settings.enabled);
      setReminderTime(settings.time);
      setReady(true);
    };

    const frameId = window.requestAnimationFrame(syncSettings);

    window.addEventListener("storage", syncSettings);
    window.addEventListener(GYM_ALARM_SETTINGS_EVENT, syncSettings);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener(GYM_ALARM_SETTINGS_EVENT, syncSettings);
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!enabled || todayCompleted) {
      const frameId = window.requestAnimationFrame(() => {
        setIsOpen(false);
        setAlarmDay(null);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    let cancelled = false;

    const evaluateAlarm = async () => {
      if (cancelled) {
        return;
      }

      const now = new Date();
      const todayKey = getLocalDayStamp(now);

      if (alarmDay && alarmDay !== todayKey) {
        setIsOpen(false);
        setAlarmDay(null);
      }

      const reminderMinutes = timeStringToMinutes(reminderTime);
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      if (nowMinutes < reminderMinutes) {
        return;
      }

      const lastFiredDay = window.localStorage.getItem(GYM_ALARM_LAST_FIRED_DAY_KEY);

      if (lastFiredDay === todayKey) {
        return;
      }

      window.localStorage.setItem(GYM_ALARM_LAST_FIRED_DAY_KEY, todayKey);
      setAlarmDay(todayKey);
      setIsOpen(true);

      if (
        document.visibilityState === "hidden" &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        "serviceWorker" in navigator
      ) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();

          if (registration) {
            await registration.showNotification("FitX gym alarm", {
              body: buildAlarmCopy(userName, currentStreak),
              icon: "/icon-192.png",
              badge: "/icon-192.png",
              tag: `fitx-gym-alarm-${todayKey}`,
              data: {
                url: workoutHref,
              },
            });
          }
        } catch (error) {
          console.error("Unable to show gym alarm notification", error);
        }
      }
    };

    void evaluateAlarm();

    const intervalId = window.setInterval(() => {
      void evaluateAlarm();
    }, 60_000);

    const handleVisibilityChange = () => {
      void evaluateAlarm();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    alarmDay,
    currentStreak,
    enabled,
    ready,
    reminderTime,
    todayCompleted,
    userName,
    workoutHref,
  ]);

  if (!isOpen || alarmDay !== getLocalDayStamp() || !enabled || todayCompleted) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-24 z-40 px-4 md:bottom-6">
      <div className="mx-auto max-w-md rounded-[28px] border border-white/12 bg-[#111622]/96 p-5 text-white shadow-[0_30px_80px_rgba(9,12,20,0.4)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff7b31]/16 text-[#ffb36c]">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
                Gym alarm
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">
                You missed today&apos;s gym check-in
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setAlarmDay(null);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white/74 transition hover:bg-white/8"
            aria-label="Dismiss gym alarm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-7 text-white/72">
          {buildAlarmCopy(userName, currentStreak)}
        </p>

        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/4 px-4 py-4 text-sm text-white/68">
          Reminder time: {reminderTime}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={workoutHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#ffd54f] px-4 py-3 text-sm font-semibold text-[#171717] transition hover:bg-[#ffe07a]"
            onClick={() => {
              setIsOpen(false);
              setAlarmDay(null);
            }}
          >
            <Flame className="h-4 w-4" />
            Open workouts
          </Link>

          <Link
            href="/streak"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/8"
            onClick={() => {
              setIsOpen(false);
              setAlarmDay(null);
            }}
          >
            Reminder settings
          </Link>
        </div>
      </div>
    </div>
  );
}
