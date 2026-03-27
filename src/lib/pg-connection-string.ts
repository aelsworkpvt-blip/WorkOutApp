const LEGACY_SSL_MODE_ALIASES = new Set(["prefer", "require", "verify-ca"]);

export function normalizePgConnectionString(
  connectionString: string | undefined,
) {
  if (!connectionString) {
    return connectionString;
  }

  try {
    const url = new URL(connectionString);
    const useLibpqCompat = url.searchParams.get("uselibpqcompat");
    const sslMode = url.searchParams.get("sslmode")?.toLowerCase();

    // Keep current pg behavior explicit and stable ahead of pg v9 changes.
    if (
      useLibpqCompat === "true" ||
      !sslMode ||
      !LEGACY_SSL_MODE_ALIASES.has(sslMode)
    ) {
      return connectionString;
    }

    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  } catch {
    return connectionString;
  }
}
