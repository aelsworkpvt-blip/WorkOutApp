const DEV_AUTH_SECRET = "forge-motion-dev-secret-change-me";
const DEV_APP_URL = "http://localhost:3000";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const SHA256_FINGERPRINT_PATTERN = /^([A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}$/;

export function getAuthSecretValue() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (secret && secret !== DEV_AUTH_SECRET) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_AUTH_SECRET;
  }

  throw new Error(
    "AUTH_SECRET must be set in production and must not use the development fallback.",
  );
}

export function getAppUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!rawUrl) {
    if (process.env.NODE_ENV !== "production") {
      return new URL(DEV_APP_URL);
    }

    throw new Error("NEXT_PUBLIC_APP_URL must be set in production.");
  }

  let appUrl: URL;

  try {
    appUrl = new URL(rawUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_APP_URL must be a valid absolute URL.");
  }

  if (process.env.NODE_ENV === "production") {
    if (appUrl.protocol !== "https:") {
      throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
    }

    if (LOCAL_HOSTS.has(appUrl.hostname)) {
      throw new Error(
        "NEXT_PUBLIC_APP_URL must point to the live domain in production, not localhost.",
      );
    }
  }

  return appUrl;
}

export function getAndroidPackageName() {
  return process.env.ANDROID_PACKAGE_NAME?.trim() || null;
}

export function getAndroidSha256Fingerprints() {
  const rawValue = process.env.ANDROID_SHA256_CERT_FINGERPRINTS?.trim();

  if (!rawValue) {
    return [];
  }

  return rawValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .filter((entry) => SHA256_FINGERPRINT_PATTERN.test(entry));
}
