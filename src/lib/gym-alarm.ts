export const DEFAULT_GYM_ALARM_TIME = "19:00";
export const GYM_ALARM_ENABLED_KEY = "fitx-gym-alarm-enabled";
export const GYM_ALARM_TIME_KEY = "fitx-gym-alarm-time";
export const GYM_ALARM_LAST_FIRED_DAY_KEY = "fitx-gym-alarm-last-fired-day";
export const GYM_ALARM_SETTINGS_EVENT = "fitx:gym-alarm-settings";

export type GymAlarmSettings = {
  enabled: boolean;
  time: string;
};

export function getDefaultGymAlarmSettings(): GymAlarmSettings {
  return {
    enabled: true,
    time: DEFAULT_GYM_ALARM_TIME,
  };
}

export function normalizeGymAlarmTime(value: string) {
  return /^\d{2}:\d{2}$/.test(value) ? value : DEFAULT_GYM_ALARM_TIME;
}

export function loadGymAlarmSettings(storage: Storage): GymAlarmSettings {
  const enabledValue = storage.getItem(GYM_ALARM_ENABLED_KEY);
  const timeValue = storage.getItem(GYM_ALARM_TIME_KEY);

  return {
    enabled: enabledValue === null ? true : enabledValue === "true",
    time: normalizeGymAlarmTime(timeValue ?? DEFAULT_GYM_ALARM_TIME),
  };
}

export function saveGymAlarmSettings(
  storage: Storage,
  settings: GymAlarmSettings,
) {
  storage.setItem(GYM_ALARM_ENABLED_KEY, String(settings.enabled));
  storage.setItem(GYM_ALARM_TIME_KEY, normalizeGymAlarmTime(settings.time));
}

export function timeStringToMinutes(value: string) {
  const normalized = normalizeGymAlarmTime(value);
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}

export function getLocalDayStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
