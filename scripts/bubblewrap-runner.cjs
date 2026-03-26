const { spawn } = require("node:child_process");

const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
const debugLogFile = process.env.BUBBLEWRAP_DEBUG_LOG;

function parseUrl(input) {
  if (!input) {
    return null;
  }

  try {
    return new URL(input);
  } catch {
    return null;
  }
}

function resolveDefaultJavaHome() {
  const explicit = process.env.BUBBLEWRAP_JAVA_HOME || process.env.JAVA_HOME;
  if (explicit) {
    return explicit;
  }

  const installRoot = path.join(
    process.env.LOCALAPPDATA || "",
    "Programs",
    "JDK",
  );

  if (!fs.existsSync(installRoot)) {
    return "";
  }

  const candidates = fs
    .readdirSync(installRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith("Temurin-jdk-17."));

  const chosen = candidates.sort().at(-1);
  return chosen ? path.join(installRoot, chosen) : "";
}

const javaHome = resolveDefaultJavaHome();
const resolvedAppUrl = parseUrl(
  process.env.TWA_APP_URL || process.env.NEXT_PUBLIC_APP_URL,
);

function resolvePromptValue(kind) {
  switch (kind) {
    case "host":
      return process.env.TWA_HOST || resolvedAppUrl?.host || "";
    case "startUrl":
      return process.env.TWA_START_URL || resolvedAppUrl?.pathname || "/";
    case "packageId":
      return process.env.TWA_PACKAGE_ID || process.env.ANDROID_PACKAGE_NAME || "";
    default:
      return "";
  }
}

const command =
  process.platform === "win32"
    ? ["cmd.exe", ["/d", "/s", "/c", `npx @bubblewrap/cli ${args.join(" ")}`]]
    : ["npx", ["@bubblewrap/cli", ...args]];

const child = spawn(command[0], command[1], {
  stdio: ["pipe", "pipe", "pipe"],
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${javaHome}\\bin;${process.env.PATH || ""}`,
  },
});

const sentPrompts = new Set();

function sendResponse(promptKey, value = "") {
  if (sentPrompts.has(promptKey)) {
    return;
  }

  child.stdin.write(`${value}\n`);
  sentPrompts.add(promptKey);

  if (debugLogFile) {
    fs.appendFileSync(
      debugLogFile,
      `\n[auto-response:${promptKey}] ${value || "<enter>"}\n`,
    );
  }
}

const automatedPrompts = [
  {
    key: "installJdk",
    includes: "Do you want Bubblewrap to install the JDK",
    value: "n",
  },
  {
    key: "javaPath",
    includes: "Path to your existing JDK 17",
    value: () => javaHome,
  },
  {
    key: "installSdk",
    includes: "Do you want Bubblewrap to install the Android SDK",
    value: "y",
  },
  {
    key: "sdkTerms",
    includes: "Do you agree to the Android SDK terms and conditions",
    value: "y",
  },
  {
    key: "host",
    includes: "? Domain:",
    value: () => resolvePromptValue("host"),
  },
  {
    key: "name",
    includes: "? Application name:",
    value: "",
  },
  {
    key: "launcherName",
    includes: "? Short name:",
    value: "",
  },
  {
    key: "displayMode",
    includes: "? Display mode:",
    value: "",
  },
  {
    key: "orientation",
    includes: "? Orientation:",
    value: "",
  },
  {
    key: "themeColor",
    includes: "? Status bar color:",
    value: "",
  },
  {
    key: "backgroundColor",
    includes: "? Splash screen color:",
    value: "",
  },
  {
    key: "startUrl",
    includes: "? URL path:",
    value: () => resolvePromptValue("startUrl"),
  },
  {
    key: "iconUrl",
    includes: "? Icon URL:",
    value: "",
  },
  {
    key: "maskableIconUrl",
    includes: "? Maskable icon URL:",
    value: "",
  },
  {
    key: "shortcuts",
    includes: "? Include app shortcuts?",
    value: "",
  },
  {
    key: "monochromeIconUrl",
    includes: "? Monochrome icon URL:",
    value: "",
  },
  {
    key: "playBilling",
    includes: "? Include support for Play Billing?",
    value: "",
  },
  {
    key: "locationDelegation",
    includes: "? Request geolocation permission?",
    value: "",
  },
  {
    key: "packageId",
    includes: "? Application ID:",
    value: () => resolvePromptValue("packageId"),
  },
  {
    key: "versionCode",
    includes: "? Starting version code for the new app version:",
    value: "",
  },
  {
    key: "keyPath",
    includes: "? Key store location:",
    value: "",
  },
  {
    key: "keyAlias",
    includes: "? Key name:",
    value: "",
  },
  {
    key: "createKey",
    includes: "? Do you want to create one now?",
    value: "n",
  },
];

function maybeRespond(chunk) {
  const text = chunk.toString();
  process.stdout.write(text);

  if (debugLogFile) {
    fs.appendFileSync(debugLogFile, text);
  }

  for (const prompt of automatedPrompts) {
    if (!text.includes(prompt.includes)) {
      continue;
    }

    const resolvedValue =
      typeof prompt.value === "function" ? prompt.value() : prompt.value;

    sendResponse(prompt.key, resolvedValue);
  }
}

child.stdout.on("data", maybeRespond);
child.stderr.on("data", maybeRespond);

child.on("close", (code) => {
  process.exit(code ?? 1);
});
