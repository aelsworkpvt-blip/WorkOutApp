# Android Play Upload Checklist

Last reviewed: 2026-03-25

Assumption: this project will go to Google Play as a Trusted Web Activity (TWA) because the repo is a Next.js PWA and does not currently contain a native Android project.

Current repo status:

- [x] PWA manifest exists in `src/app/manifest.ts`
- [x] Service worker exists in `public/sw.js`
- [x] Production build passes with `npm run build`
- [x] Lint passes with `npm run lint`
- [ ] Android wrapper project exists
- [ ] Signed Android App Bundle (`.aab`) exists
- [ ] Privacy policy URL exists
- [ ] Account deletion flow exists
- [ ] Play Console listing/setup is complete

## 1. Release blockers

- [ ] Pick Android packaging path
  Recommended: TWA with Bubblewrap.
  Use Capacitor only if we need native device APIs or app-store-only native features.

- [ ] Create Android app shell
  Missing today: no `android/` project, no Bubblewrap config, no Capacitor config, no signing config.

- [ ] Produce a signed `.aab`
  Google Play accepts Android App Bundles for new apps.

- [ ] Set a real production app URL
  `NEXT_PUBLIC_APP_URL` must point to the live HTTPS domain.
  Do not ship with the current localhost fallback in `src/app/layout.tsx`.

- [ ] Host the production web app on HTTPS
  TWA and Play launch depend on the real site being publicly reachable over HTTPS.

- [ ] Add Digital Asset Links
  Missing today: `public/.well-known/assetlinks.json`.
  This is required for the Android app and website to trust each other in a TWA flow.

## 2. App compliance blockers

- [ ] Publish a privacy policy on a public webpage
  This app stores account, authentication, and fitness/body-measurement data.
  Play requires a privacy policy URL in Play Console and a privacy policy link or text in the app.

- [ ] Add account deletion inside the app
  This app supports account creation, so users must be able to request account deletion from within the app.

- [ ] Add account deletion outside the app
  Play also requires an external web URL where users can request account deletion.

- [ ] Document retention/deletion behavior
  State what is deleted immediately, what is retained temporarily, and why.

- [ ] Prepare the Data safety form
  Likely includes:
  Account info
  Authentication info
  Health and fitness data
  App activity if analytics/crash reporting are added later

## 3. Security and production hardening

- [ ] Make `AUTH_SECRET` mandatory in production
  `src/lib/auth.ts` currently falls back to `forge-motion-dev-secret-change-me`.

- [ ] Point `DATABASE_URL` to production Postgres
  Confirm backups, access control, and SSL requirements with the hosting provider.

- [ ] Verify cookies and auth on the production domain
  Check login, logout, session expiry, cross-page navigation, and reinstall behavior from the Android shell.

- [ ] Remove any accidental dev/demo release settings
  Confirm no demo data, test accounts, localhost metadata, or staging URLs leak into production.

## 4. Android build checklist

- [ ] Reserve Android package name
  Chosen package name: `com.ElithX.FitX`

- [ ] Generate the Android project
  Bubblewrap/TWA path should define:
  Package name
  App name
  Launcher icons
  Start URL
  Splash screen
  Signing setup

- [ ] Configure signing
  Create upload keystore.
  Store keystore path, alias, and passwords safely.
  Enroll in Play App Signing.

- [ ] Set Android SDK targets
  As of 2026-03-25, Play requires new apps and app updates to target Android 15 / API 35 or higher.

- [ ] Set versioning
  Increment `versionCode` and `versionName` for every release.

- [ ] Build release bundle
  Final artifact should be a signed release `.aab`.

## 5. Store listing checklist

- [ ] App title finalized
- [ ] Short description finalized
- [ ] Full description finalized
- [ ] App category selected
- [ ] Contact email added
- [ ] Support website added
- [ ] Privacy policy URL added
- [ ] High-res app icon prepared
- [ ] Feature graphic prepared
- [ ] Phone screenshots prepared
- [ ] Tablet screenshots prepared if targeting tablets

## 6. Play Console setup checklist

- [ ] Create the Play app entry
- [ ] Complete App access declaration
- [ ] Complete Data safety form
- [ ] Complete Ads declaration
- [ ] Complete Content rating questionnaire
- [ ] Complete target audience declaration
- [ ] Complete government/financial/health declarations only if applicable
- [ ] Add countries/regions
- [ ] Set release track

## 7. Testing and launch checklist

- [ ] Test install and launch from Android device
- [ ] Test login and signup flow
- [ ] Test onboarding flow
- [ ] Test workout logging
- [ ] Test measurement entry
- [ ] Test offline screen
- [ ] Test app relaunch after backgrounding
- [ ] Test logout/login across app restarts
- [ ] Test broken-network scenarios
- [ ] Test app icon, splash, and back navigation

- [ ] Run internal testing release
- [ ] Run closed testing release if needed
  Note: personal Play developer accounts created after 2023-11-13 must complete the current closed-testing requirement before production access.

- [ ] Roll out production release

## 8. Repo-specific pending work

- [x] Add a privacy policy page and link it from the app
- [x] Add account deletion UI and backend action
- [x] Add public deletion request webpage
- [ ] Configure `.well-known/assetlinks.json` with the real package name and SHA256 fingerprint
- [x] Lock down production env validation for `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL`
- [ ] Choose TWA package name and generate Android shell
- [ ] Build and sign the first `.aab`
- [ ] Prepare Play listing assets and declarations

## 9. Recommended order

1. Add privacy policy and account deletion flow.
2. Set real production env vars and live HTTPS domain.
3. Add Digital Asset Links.
4. Generate TWA Android shell.
5. Create signing setup and build `.aab`.
6. Prepare store listing assets and Play declarations.
7. Run testing track and submit.

## Sources

- Google Play User Data policy: https://support.google.com/googleplay/android-developer/answer/10144311?hl=en
- Google Play target API policy: https://support.google.com/googleplay/android-developer/answer/16561298?hl=en
- Target API exact timeline page: https://support.google.com/googleplay/android-developer/answer/11926878
- Create and set up your app: https://support.google.com/googleplay/android-developer/answer/9859152?hl=en
- Testing requirement for new personal developer accounts: https://support.google.com/googleplay/android-developer/answer/14151465?hl=en
- Trusted Web Activity overview: https://developer.chrome.com/docs/android/trusted-web-activity
