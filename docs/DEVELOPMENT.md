# Development & Build Guide

This guide covers local environment setup, web development, regression testing, Capacitor synchronization, and Android Debug APK compilation for **RITME v3.1.0**.

---

## 1. Environment Requirements

### Web Development & Testing
- **Node.js:** `22.x` LTS or newer (verified with Node `24.x` locally and `22.x` in CI)
- **npm:** Included with Node.js (uses committed `package-lock.json`)

### Android Build (Optional — required only for APK compilation)
- **JDK:** Java 21 (`JAVA_HOME` or Android Studio JBR 21)
- **Android SDK:** Compile SDK `36` / Target SDK `36`, Android SDK Platform-Tools (`adb`)
- **Local SDK Config:** Create `android/local.properties` (excluded from Git via `.gitignore`):
  ```properties
  sdk.dir=/path/to/your/Android/Sdk
  ```
  *(On Windows, escape backslashes, e.g. `sdk.dir=C\:\\Users\\<user>\\AppData\\Local\\Android\\Sdk`.)*

---

## 2. Installation

```bash
git clone https://github.com/danaragaa/ritme-personal-learning-habit-companion.git
cd ritme-personal-learning-habit-companion
npm ci
```

*(You may also use `npm install` for local development.)*

---

## 3. Available npm Scripts (`package.json`)

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite` | Starts the Vite web development server with HMR. |
| `npm run build` | `vue-tsc && vite build` | Runs TypeScript type-checking and builds the production web bundle into `dist/`. |
| `npm run preview` | `vite preview` | Serves the compiled `dist/` bundle locally for production preview & QA. |
| `npm test` | `node --test tests/ritme-regression.test.mjs` | Runs the 22 offline regression tests (database, timer, XP, backup, routes, version checks). |
| `npm run cap:sync` | `npx cap sync android` | Copies existing `dist/` and updates Capacitor Android plugins/config. |
| `npm run android:sync` | `npm run build && npx cap sync android` | Builds the production web bundle and syncs it into `android/`. |
| `npm run android:apk` | `node scripts/android-apk.mjs debug` | Runs web build, Capacitor sync, and Gradle `:app:assembleDebug`. |
| `npm run android:apk:release` | `node scripts/android-apk.mjs release` | Runs web build, Capacitor sync, and Gradle `:app:assembleRelease` (unsigned unless signing is configured locally). |
| `npm run android:run` | `node scripts/android-apk.mjs run` | Builds the debug APK and, if an `adb` device/emulator is connected, installs and launches `com.ritme.app/.MainActivity`. |
| `npm run cap:open` | `npx cap open android` | Opens the `android/` project in Android Studio. |

---

## 4. Web Development Workflow

1. Start the local dev server:
   ```bash
   npm run dev
   ```
2. Run the offline regression suite after changes:
   ```bash
   npm test
   ```
3. Verify TypeScript compilation and the production bundle:
   ```bash
   npm run build
   ```

---

## 5. Android Debug APK Build Process

1. Ensure JDK 21 and Android SDK (API 36) are installed and `android/local.properties` points to your local Android SDK directory.
2. Build web assets, sync Capacitor Android, and compile the debug APK:
   ```bash
   npm run android:apk
   ```
   *(If `dist/` and Capacitor sync are already up to date, you can invoke `node scripts/android-apk.mjs debug --skip-web-build`.)*
3. Expected output path (ignored by Git):
   ```text
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
4. To install and launch directly on a USB-debugging Android device or emulator:
   ```bash
   npm run android:run
   ```

---

## 6. Testing Notes

- `tests/ritme-regression.test.mjs` bundles TypeScript modules into a temporary directory using `esbuild` with lightweight storage mocks so all `22` regression tests run offline in Node.js without requiring IndexedDB in a browser or an Android emulator.
- Physical Android device QA (adaptive icon masking, Material You themed monochrome icon, status bar notification icon rendering, background timer alarm reliability, and vendor safe-area behavior) is tracked as a pending manual checklist on real Android hardware.
