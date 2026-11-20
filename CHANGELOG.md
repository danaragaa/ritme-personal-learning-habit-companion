# Changelog

All notable milestone changes for **RITME — Personal Learning & Habit Companion** are documented in this file.

## [3.1.0] — Current Portfolio Milestone

### Brand & Visual Identity
- Integrated the official **RITME Paced Ring v1.0** horizontal SVG lockup into the Home Floating Glass Appbar with reactive Dark (`#FFFFFF`) and Light (`#111214`) theme switching.
- Deployed the official Android adaptive launcher icon (`mipmap-anydpi-v26/ic_launcher.xml`, `ic_launcher_round.xml`), foreground VectorDrawable, Android 13+ themed monochrome layer, and `mdpi`–`xxxhdpi` fallback icons.
- Integrated the 1-color transparent `24dp` notification small icon (`ritme_notification.xml`) into `@capacitor/local-notifications` configuration and scheduling call sites.
- Adopted the **Neutral Monochrome Liquid Glass** design system across all active pages with a compact `48px` floating glass Appbar, floating 4-tab capsule bar, and Dark/Light theme switching.

### Core Product Features
- **Four-Tab Navigation Architecture:** Streamlined primary navigation into `Home`, `Learning`, `Focus`, and `Progress`, with dedicated `Habits` and `Settings` pages.
- **Personal Learning Tracker:** Support for 7 UTBK subtests, topic CRUD with notes and validated external HTTP/HTTPS study resource links, and 3 clear learning statuses (`Not Started`, `In Progress`, `Completed`) while retaining compatibility with legacy 7-status data.
- **Focus Sessions:** Timestamp-based focus timer supporting `Free Focus` and `Pomodoro` modes, custom durations, topic linking, Zen Focus view, pause/resume exclusion, background & reload recovery, and focus history filtering.
- **Habit Management:** Daily habit tracking with priority habits (up to 5 on Home), 1-tap toggles, weekly rest-day handling, 30-day calendar history, and weekly consistency summary.
- **Personal Progress Dashboard:** Focused on 4 core metrics (`Total Focus Time`, `Completed Sessions`, `Completed Learning Topics`, `Habit Consistency`), 7-subtest breakdown, focus activity chart, and deduplicated activity history across `This Week` and `30 Days` periods.
- **Lightweight Gamification:** Simplified motivation layer with XP, levels, streaks (respecting rest days), daily XP cap (`100 XP/day`), idempotent event awarding, anti-grinding guards, and compact toast feedback.
- **Organized Settings & Local Data Safety:** Structured into `General`, `Reminders & Sound`, `Data Management`, and `About RITME`. Supports bilingual localization (`id` / `en`), adaptive local reminders, quiet hours, snooze, sound/haptics preferences, full JSON backup export/import (v1 & v2 schema validation with cross-storage rollback), and selective RITME preferences reset.

### Engineering & Verification
- Offline-first persistence using **Dexie 4 / IndexedDB** (`RitmeOfflineDB`, schema v1 → v2 non-destructive upgrade across 18 tables) paired with **Capacitor Preferences**.
- Verified `22/22` offline regression tests covering local date keys, mastery calculation, timer lifecycle, quiet hours, backup validation & rollback, selective reset, XP idempotency, and v3.1.0 route/version alignment.
- Synchronized Capacitor 8 Android project (`com.ritme.app`, `versionCode 2`, `compileSdk 36`, `targetSdk 36`) and verified debug APK compilation (`app-debug.apk`). Physical Android device QA remains pending.
