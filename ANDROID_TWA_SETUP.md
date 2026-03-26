# Android TWA Setup

Last reviewed: 2026-03-25

This repo now includes the web-side pieces required for a Trusted Web Activity:

- `/.well-known/assetlinks.json` is served by `src/app/.well-known/assetlinks.json/route.ts`
- Android package name and signing fingerprints are driven by env vars
- A Bubblewrap wrapper script exists at `scripts/twa-sync.ps1`

## 1. Set the required env vars

Add these to `.env` with real values:

```env
NEXT_PUBLIC_APP_URL="https://your-real-domain.com"
ANDROID_PACKAGE_NAME="com.ElithX.FitX"
ANDROID_SHA256_CERT_FINGERPRINTS="AA:BB:...:99"
```

Notes:

- `NEXT_PUBLIC_APP_URL` must be your live HTTPS domain.
- `ANDROID_PACKAGE_NAME` should be your final Play package name. This repo is currently configured to use `com.ElithX.FitX`.
- `ANDROID_SHA256_CERT_FINGERPRINTS` should be a comma-separated list if you need more than one signing certificate fingerprint.

## 2. Check the hosted asset links file

The app now serves:

```text
https://your-real-domain.com/.well-known/assetlinks.json
```

You can preview the JSON locally from env values with:

```powershell
npm run android:assetlinks:print
```

When `ANDROID_PACKAGE_NAME` or `ANDROID_SHA256_CERT_FINGERPRINTS` is missing, the route returns an empty JSON array and the response header `X-Assetlinks-Status: unconfigured`.

## 3. Generate or update the Android shell

Run:

```powershell
npm run android:twa:sync
```

What the script does:

- loads `.env` if present
- builds the manifest URL from `NEXT_PUBLIC_APP_URL`
- creates an `android/` folder if missing
- runs `bubblewrap init` if no TWA project exists yet
- runs `bubblewrap update` if `android/twa-manifest.json` already exists

Important:

- `scripts/twa-sync.ps1` auto-selects an installed Temurin JDK 17 when available.
- The Bubblewrap wrapper now defaults the init prompts to the configured production host and `ANDROID_PACKAGE_NAME`.
- Do not casually change package names later if you plan to publish to Play.

If your live deployment is still behind, you can still bootstrap the Android project from a local manifest:

```powershell
npm run dev
```

Then, in a second terminal:

```powershell
npm run android:twa:sync -- -ManifestUrl http://127.0.0.1:3000/manifest.webmanifest
```

The sync script will still store `NEXT_PUBLIC_APP_URL` as the production web manifest origin inside `android/twa-manifest.json`, so later updates stay pointed at the live domain.

## 4. Get the SHA256 fingerprint for asset links

After creating or choosing the upload keystore, get the SHA256 fingerprint from the keystore and copy it into `ANDROID_SHA256_CERT_FINGERPRINTS`.

Typical command:

```powershell
keytool -list -v -alias <alias> -keystore <path-to-keystore>
```

If `keytool` is not on PATH, use the `bin` folder from your JDK 17 installation.

## 5. Recommended order

1. Finalize the package name.
2. Set the real production domain in `.env`.
3. Run `npm run android:twa:sync`.
4. Create or confirm the keystore.
5. Add the SHA256 fingerprint to `.env`.
6. Deploy the app so `/.well-known/assetlinks.json` is live with real values.
7. Build the Android App Bundle from the generated Android project.

For Gradle commands on this machine, prefer the helper wrapper so Android builds also use Temurin JDK 17:

```powershell
npm run android:gradle -- help
```

Later, the release bundle command will be:

```powershell
npm run android:gradle -- bundleRelease
```

## Official references

- Trusted Web Activity quick start: https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
- Digital Asset Links relation used by TWA: https://developers.google.com/digital-asset-links/v1/relation-strings
