"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Clock3 } from "lucide-react";
import {
  GYM_ALARM_SETTINGS_EVENT,
  getDefaultGymAlarmSettings,
  loadGymAlarmSettings,
  saveGymAlarmSettings,
  type GymAlarmSettings,
} from "@/lib/gym-alarm";

type NotificationState = NotificationPermission | "unsupported";

function dispatchAlarmSettingsUpdate() {
  window.dispatchEvent(new Event(GYM_ALARM_SETTINGS_EVENT));
}

export function GymAlarmSettings({
  todayCompleted,
}: {
  todayCompleted: boolean;
}) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<GymAlarmSettings>(
    getDefaultGymAlarmSettings(),
  );
  const [notificationState, setNotificationState] =
    useState<NotificationState>("unsupported");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setSettings(loadGymAlarmSettings(window.localStorage));
      setNotificationState(
        "Notification" in window ? Notification.permission : "unsupported",
      );
      setReady(true);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const updateSettings = (next: GymAlarmSettings) => {
    setSettings(next);
    saveGymAlarmSettings(window.localStorage, next);
    dispatchAlarmSettingsUpdate();
  };

  const handleToggle = () => {
    updateSettings({
      ...settings,
      enabled: !settings.enabled,
    });
  };

  const handleTimeChange = (value: string) => {
    updateSettings({
      ...settings,
      time: value,
    });
  };

  const handleRequestNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationState("unsupported");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(permission);
  };

  return (
    <div className="panel-light p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-light)]/76">
            Reminder alarm
          </p>
          <h3 className="mt-3 text-2xl font-[family:var(--font-sora)] text-[#171717]">
            Daily missed-gym reminder
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-light)]">
            If no workout is logged by your chosen time, FitX raises an in-app alarm.
            If browser notifications are allowed, it can also fire a device notification
            while the app is still open or running in the background.
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={!ready}
          className={
            settings.enabled
              ? "inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-60"
              : "inline-flex items-center gap-2 rounded-full border border-black/8 bg-white px-4 py-3 text-sm font-semibold text-[#171717] transition hover:bg-white/88 disabled:cursor-not-allowed disabled:opacity-60"
          }
        >
          {settings.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          {settings.enabled ? "Alarm on" : "Alarm off"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[24px] bg-white/72 p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
            <Clock3 className="h-4 w-4 text-[#ff9f68]" />
            Reminder time
          </div>
          <input
            type="time"
            value={settings.time}
            onChange={(event) => handleTimeChange(event.target.value)}
            disabled={!ready || !settings.enabled}
            className="field-light mt-4"
          />
          <p className="mt-3 text-sm leading-7 text-[var(--muted-light)]">
            {todayCompleted
              ? "Today's workout is already logged, so the alarm stays quiet for today."
              : "If today's workout is still missing at that time, the alarm fires once."}
          </p>
        </div>

        <div className="rounded-[24px] bg-white/72 p-5">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-light)]">
            <Bell className="h-4 w-4 text-[#79d2c0]" />
            Device notification
          </div>
          <p className="mt-4 text-lg font-semibold text-[#171717]">
            {notificationState === "granted"
              ? "Browser notifications are enabled."
              : notificationState === "denied"
                ? "Browser notifications are blocked."
                : notificationState === "default"
                  ? "Browser notifications are available."
                  : "Browser notifications are unavailable on this device."}
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--muted-light)]">
            This is optional. The in-app alarm works without it. Closed-app alarms still need
            push or native scheduling, which this version does not have yet.
          </p>
          <button
            type="button"
            onClick={handleRequestNotifications}
            disabled={notificationState === "granted" || notificationState === "unsupported"}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2b2b2b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Enable notifications
          </button>
        </div>
      </div>
    </div>
  );
}
