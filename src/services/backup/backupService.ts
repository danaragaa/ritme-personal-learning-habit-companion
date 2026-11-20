import { Preferences } from '@capacitor/preferences'
import { db } from '@/services/database/db'
import { getLocalDateString } from '@/utils/date'
import { clearActiveTimerState } from '@/services/timer/focusTimerService'
import {
  cancelAllScheduledNotifications,
  syncAdaptiveNotifications,
} from '@/services/notifications/localNotificationService'
import { useUserStore } from '@/stores/userStore'
import { useHabitStore } from '@/stores/habitStore'
import { useFocusStore } from '@/stores/focusStore'
import {
  useLearningStore,
  type InformalDiagnosticBaseline,
} from '@/stores/learningStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import {
  validateBackupPayload,
  type RitmeBackupPayload as BaseRitmeBackupPayload,
  type RitmeBackupPreferences,
} from '@/services/backup/backupSchema'

const LANGUAGE_PREF_KEY = 'ritme_language'
const THEME_PREF_KEY = 'ritme_theme'
const DIAGNOSTIC_BASELINE_KEY = 'ritme_informal_baseline_21'
const WEEKLY_SCHEDULE_KEY = 'ritme_weekly_schedule'
const REMINDERS_CONFIG_KEY = 'ritme_study_reminders'
const REMINDER_SNOOZE_KEY = 'ritme_reminder_snooze_until'
const ACTIVE_TIMER_PREF_KEY = 'ritme_active_timer_state'
const POMODORO_CONFIG_PREF_KEY = 'ritme_pomodoro_config'
const LEVEL_THRESHOLDS_PREF_KEY = 'ritme_level_thresholds'

export const RITME_PREFERENCE_KEYS = [
  LANGUAGE_PREF_KEY,
  THEME_PREF_KEY,
  WEEKLY_SCHEDULE_KEY,
  REMINDERS_CONFIG_KEY,
  REMINDER_SNOOZE_KEY,
  ACTIVE_TIMER_PREF_KEY,
  POMODORO_CONFIG_PREF_KEY,
  LEVEL_THRESHOLDS_PREF_KEY,
  DIAGNOSTIC_BASELINE_KEY,
] as const

const RITME_PREFERENCE_PREFIX = 'ritme_'

export type RitmeBackupPayload =
  BaseRitmeBackupPayload<InformalDiagnosticBaseline | null>
export { validateBackupPayload }

interface DexieTablesSnapshot {
  userSettings: unknown[]
  habits: unknown[]
  habitCompletions: unknown[]
  studySessions: unknown[]
  subtestCategories: unknown[]
  learningTopics: unknown[]
  xpTransactions: unknown[]
  achievements: unknown[]
  personalRewards: unknown[]
  rewardRedemptions: unknown[]
  dailyReflections: unknown[]
  chapters: unknown[]
  questions: unknown[]
  questionAttempts: unknown[]
  mistakeNotes: unknown[]
  customQuests: unknown[]
  bossAttempts: unknown[]
  mockTests: unknown[]
}

function getAllDexieTables() {
  return [
    db.userSettings,
    db.habits,
    db.habitCompletions,
    db.studySessions,
    db.subtestCategories,
    db.learningTopics,
    db.xpTransactions,
    db.achievements,
    db.personalRewards,
    db.rewardRedemptions,
    db.dailyReflections,
    db.chapters,
    db.questions,
    db.questionAttempts,
    db.mistakeNotes,
    db.customQuests,
    db.bossAttempts,
    db.mockTests,
  ]
}

function safeParseJson<T>(raw: string | null | undefined): T | undefined {
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export async function getAllRitmePreferenceKeys(): Promise<string[]> {
  const keySet = new Set<string>(RITME_PREFERENCE_KEYS)
  try {
    if (typeof Preferences.keys === 'function') {
      const { keys } = await Preferences.keys()
      if (Array.isArray(keys)) {
        for (const key of keys) {
          if (typeof key === 'string' && key.startsWith(RITME_PREFERENCE_PREFIX)) {
            keySet.add(key)
          }
        }
      }
    }
  } catch (err) {
    console.warn('[RITME] Preferences.keys() unavailable, using known key list:', err)
  }
  return Array.from(keySet)
}

export async function clearRitmePreferences(): Promise<void> {
  const keys = await getAllRitmePreferenceKeys()
  await Promise.all(keys.map((key) => Preferences.remove({ key })))
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('ritme_theme_cache')
      localStorage.removeItem('ritme_lang_cache')
    }
  } catch {
    // Ignore in environments without localStorage
  }
}

async function snapshotRitmePreferences(): Promise<Map<string, string>> {
  const keys = await getAllRitmePreferenceKeys()
  const entries = await Promise.all(
    keys.map(async (key) => {
      const res = await Preferences.get({ key })
      return [key, res.value] as const
    })
  )
  const snapshot = new Map<string, string>()
  for (const [key, value] of entries) {
    if (value !== null && value !== undefined) {
      snapshot.set(key, value)
    }
  }
  return snapshot
}

async function restoreRitmePreferences(
  snapshot: Map<string, string>
): Promise<void> {
  const currentKeys = await getAllRitmePreferenceKeys()
  const keysToRemove = currentKeys.filter((key) => !snapshot.has(key))
  await Promise.allSettled(
    keysToRemove.map((key) => Preferences.remove({ key }))
  )
  await Promise.allSettled(
    Array.from(snapshot.entries()).map(([key, value]) =>
      Preferences.set({ key, value })
    )
  )
}

async function snapshotDexieTables(): Promise<DexieTablesSnapshot> {
  const [
    userSettings,
    habits,
    habitCompletions,
    studySessions,
    subtestCategories,
    learningTopics,
    xpTransactions,
    achievements,
    personalRewards,
    rewardRedemptions,
    dailyReflections,
    chapters,
    questions,
    questionAttempts,
    mistakeNotes,
    customQuests,
    bossAttempts,
    mockTests,
  ] = await Promise.all([
    db.userSettings.toArray(),
    db.habits.toArray(),
    db.habitCompletions.toArray(),
    db.studySessions.toArray(),
    db.subtestCategories.toArray(),
    db.learningTopics.toArray(),
    db.xpTransactions.toArray(),
    db.achievements.toArray(),
    db.personalRewards.toArray(),
    db.rewardRedemptions.toArray(),
    db.dailyReflections.toArray(),
    db.chapters.toArray(),
    db.questions.toArray(),
    db.questionAttempts.toArray(),
    db.mistakeNotes.toArray(),
    db.customQuests.toArray(),
    db.bossAttempts.toArray(),
    db.mockTests.toArray(),
  ])

  return {
    userSettings,
    habits,
    habitCompletions,
    studySessions,
    subtestCategories,
    learningTopics,
    xpTransactions,
    achievements,
    personalRewards,
    rewardRedemptions,
    dailyReflections,
    chapters,
    questions,
    questionAttempts,
    mistakeNotes,
    customQuests,
    bossAttempts,
    mockTests,
  }
}

async function replaceAllDexieTables(
  data: Partial<DexieTablesSnapshot>
): Promise<void> {
  await db.transaction('rw', getAllDexieTables(), async () => {
    await Promise.all([
      db.userSettings.clear(),
      db.habits.clear(),
      db.habitCompletions.clear(),
      db.studySessions.clear(),
      db.subtestCategories.clear(),
      db.learningTopics.clear(),
      db.xpTransactions.clear(),
      db.achievements.clear(),
      db.personalRewards.clear(),
      db.rewardRedemptions.clear(),
      db.dailyReflections.clear(),
      db.chapters.clear(),
      db.questions.clear(),
      db.questionAttempts.clear(),
      db.mistakeNotes.clear(),
      db.customQuests.clear(),
      db.bossAttempts.clear(),
      db.mockTests.clear(),
    ])

    if (Array.isArray(data.userSettings) && data.userSettings.length > 0) {
      await db.userSettings.bulkPut(data.userSettings as never[])
    }
    if (Array.isArray(data.habits) && data.habits.length > 0) {
      await db.habits.bulkPut(data.habits as never[])
    }
    if (
      Array.isArray(data.habitCompletions) &&
      data.habitCompletions.length > 0
    ) {
      await db.habitCompletions.bulkPut(data.habitCompletions as never[])
    }
    if (Array.isArray(data.studySessions) && data.studySessions.length > 0) {
      await db.studySessions.bulkPut(data.studySessions as never[])
    }
    if (
      Array.isArray(data.subtestCategories) &&
      data.subtestCategories.length > 0
    ) {
      await db.subtestCategories.bulkPut(data.subtestCategories as never[])
    }
    if (Array.isArray(data.learningTopics) && data.learningTopics.length > 0) {
      await db.learningTopics.bulkPut(data.learningTopics as never[])
    }
    if (Array.isArray(data.xpTransactions) && data.xpTransactions.length > 0) {
      await db.xpTransactions.bulkPut(data.xpTransactions as never[])
    }
    if (Array.isArray(data.achievements) && data.achievements.length > 0) {
      await db.achievements.bulkPut(data.achievements as never[])
    }
    if (
      Array.isArray(data.personalRewards) &&
      data.personalRewards.length > 0
    ) {
      await db.personalRewards.bulkPut(data.personalRewards as never[])
    }
    if (
      Array.isArray(data.rewardRedemptions) &&
      data.rewardRedemptions.length > 0
    ) {
      await db.rewardRedemptions.bulkPut(data.rewardRedemptions as never[])
    }
    if (
      Array.isArray(data.dailyReflections) &&
      data.dailyReflections.length > 0
    ) {
      await db.dailyReflections.bulkPut(data.dailyReflections as never[])
    }
    if (Array.isArray(data.chapters) && data.chapters.length > 0) {
      await db.chapters.bulkPut(data.chapters as never[])
    }
    if (Array.isArray(data.questions) && data.questions.length > 0) {
      await db.questions.bulkPut(data.questions as never[])
    }
    if (
      Array.isArray(data.questionAttempts) &&
      data.questionAttempts.length > 0
    ) {
      await db.questionAttempts.bulkPut(data.questionAttempts as never[])
    }
    if (Array.isArray(data.mistakeNotes) && data.mistakeNotes.length > 0) {
      await db.mistakeNotes.bulkPut(data.mistakeNotes as never[])
    }
    if (Array.isArray(data.customQuests) && data.customQuests.length > 0) {
      await db.customQuests.bulkPut(data.customQuests as never[])
    }
    if (Array.isArray(data.bossAttempts) && data.bossAttempts.length > 0) {
      await db.bossAttempts.bulkPut(data.bossAttempts as never[])
    }
    if (Array.isArray(data.mockTests) && data.mockTests.length > 0) {
      await db.mockTests.bulkPut(data.mockTests as never[])
    }
  })
}

async function resyncNotificationsFromStores(): Promise<void> {
  const userStore = useUserStore()
  const learningStore = useLearningStore()
  const gamificationStore = useGamificationStore()
  const habitStore = useHabitStore()
  await syncAdaptiveNotifications({
    settings: userStore.settings,
    reminderConfig: userStore.reminderConfig,
    dueReviewsCount: learningStore.smartReviewQueue.length,
    incompleteTodayQuestsCount: gamificationStore.todayQuests.filter(
      (q) => !q.completed
    ).length,
    currentStreak: habitStore.currentStreak,
  })
}

export async function reloadAllStores(): Promise<void> {
  const userStore = useUserStore()
  const habitStore = useHabitStore()
  const focusStore = useFocusStore()
  const learningStore = useLearningStore()
  const gamificationStore = useGamificationStore()

  await Promise.all([
    userStore.initUserStore(true),
    habitStore.initHabitStore(true),
    focusStore.initFocusStore(true),
    learningStore.initLearningStore(true),
    gamificationStore.initGamificationStore(true),
  ])
}

export async function generateBackupJson(): Promise<string> {
  const [
    dexieData,
    baselinePref,
    weeklySchedulePref,
    reminderConfigPref,
    pomodoroConfigPref,
    levelThresholdsPref,
  ] = await Promise.all([
    snapshotDexieTables(),
    Preferences.get({ key: DIAGNOSTIC_BASELINE_KEY }),
    Preferences.get({ key: WEEKLY_SCHEDULE_KEY }),
    Preferences.get({ key: REMINDERS_CONFIG_KEY }),
    Preferences.get({ key: POMODORO_CONFIG_PREF_KEY }),
    Preferences.get({ key: LEVEL_THRESHOLDS_PREF_KEY }),
  ])

  const diagnosticBaseline =
    safeParseJson<InformalDiagnosticBaseline>(baselinePref.value) ?? null

  const preferences: RitmeBackupPreferences = {}
  const weeklySchedule = safeParseJson<Record<number, string>>(
    weeklySchedulePref.value
  )
  if (weeklySchedule) preferences.weeklySchedule = weeklySchedule
  const reminderConfig = safeParseJson<RitmeBackupPreferences['reminderConfig']>(
    reminderConfigPref.value
  )
  if (reminderConfig) preferences.reminderConfig = reminderConfig
  const pomodoroConfig = safeParseJson<unknown>(pomodoroConfigPref.value)
  if (pomodoroConfig !== undefined) preferences.pomodoroConfig = pomodoroConfig
  const levelThresholds = safeParseJson<unknown>(levelThresholdsPref.value)
  if (levelThresholds !== undefined) {
    preferences.levelThresholds = levelThresholds
  }

  const payload: RitmeBackupPayload = {
    schemaVersion: 2,
    appName: 'RITME',
    exportedAt: new Date().toISOString(),
    data: {
      ...(dexieData as unknown as RitmeBackupPayload['data']),
      diagnosticBaseline,
      preferences,
    },
  }

  return JSON.stringify(payload, null, 2)
}

export function triggerBackupDownload(jsonContent: string): void {
  const filename = `ritme-backup-${getLocalDateString()}.json`
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export async function importBackupFromJson(rawJson: string): Promise<boolean> {
  const parsed = validateBackupPayload(rawJson) as RitmeBackupPayload | null
  if (!parsed) {
    return false
  }

  let prevDexie: DexieTablesSnapshot | null = null
  let prevPrefs: Map<string, string> | null = null

  try {
    // Capture full cross-storage rollback snapshot BEFORE mutating Dexie or Preferences
    ;[prevDexie, prevPrefs] = await Promise.all([
      snapshotDexieTables(),
      snapshotRitmePreferences(),
    ])

    const { data } = parsed

    // 1. Replace all 18 Dexie tables inside a single IndexedDB transaction
    await replaceAllDexieTables(data)

    // 2. Apply imported RITME Preferences (clearing omitted optional keys cleanly)
    const importedUser =
      Array.isArray(data.userSettings) && data.userSettings[0]
        ? data.userSettings[0]
        : null

    if (importedUser?.language) {
      await Preferences.set({
        key: LANGUAGE_PREF_KEY,
        value: importedUser.language,
      })
    } else {
      await Preferences.remove({ key: LANGUAGE_PREF_KEY })
    }

    if (importedUser?.theme) {
      await Preferences.set({
        key: THEME_PREF_KEY,
        value: importedUser.theme,
      })
    } else {
      await Preferences.remove({ key: THEME_PREF_KEY })
    }

    if (data.diagnosticBaseline) {
      await Preferences.set({
        key: DIAGNOSTIC_BASELINE_KEY,
        value: JSON.stringify(data.diagnosticBaseline),
      })
    } else {
      await Preferences.remove({ key: DIAGNOSTIC_BASELINE_KEY })
    }

    const prefs =
      data.preferences && typeof data.preferences === 'object'
        ? data.preferences
        : undefined

    if (prefs?.weeklySchedule) {
      await Preferences.set({
        key: WEEKLY_SCHEDULE_KEY,
        value: JSON.stringify(prefs.weeklySchedule),
      })
    } else {
      await Preferences.remove({ key: WEEKLY_SCHEDULE_KEY })
    }

    if (prefs?.reminderConfig) {
      await Preferences.set({
        key: REMINDERS_CONFIG_KEY,
        value: JSON.stringify(prefs.reminderConfig),
      })
    } else {
      await Preferences.remove({ key: REMINDERS_CONFIG_KEY })
    }

    if (prefs?.pomodoroConfig !== undefined) {
      await Preferences.set({
        key: POMODORO_CONFIG_PREF_KEY,
        value: JSON.stringify(prefs.pomodoroConfig),
      })
    } else {
      await Preferences.remove({ key: POMODORO_CONFIG_PREF_KEY })
    }

    if (prefs?.levelThresholds !== undefined) {
      await Preferences.set({
        key: LEVEL_THRESHOLDS_PREF_KEY,
        value: JSON.stringify(prefs.levelThresholds),
      })
    } else {
      await Preferences.remove({ key: LEVEL_THRESHOLDS_PREF_KEY })
    }

    await Preferences.remove({ key: REMINDER_SNOOZE_KEY })
    await clearActiveTimerState()
    await cancelAllScheduledNotifications()
    await reloadAllStores()
    await resyncNotificationsFromStores()

    return true
  } catch (err) {
    console.error(
      '[RITME] Failed to import backup JSON; running cross-storage rollback:',
      err
    )

    // Compensating cross-storage rollback restoring both Dexie and RITME Preferences
    try {
      if (prevDexie) {
        await replaceAllDexieTables(prevDexie)
      }
    } catch (rollbackDexieErr) {
      console.error('[RITME] Rollback of Dexie tables failed:', rollbackDexieErr)
    }

    try {
      if (prevPrefs) {
        await restoreRitmePreferences(prevPrefs)
      }
    } catch (rollbackPrefErr) {
      console.error(
        '[RITME] Rollback of Capacitor Preferences failed:',
        rollbackPrefErr
      )
    }

    try {
      await cancelAllScheduledNotifications()
      await reloadAllStores()
      await resyncNotificationsFromStores()
    } catch (reloadErr) {
      console.error('[RITME] Store reload after rollback failed:', reloadErr)
    }

    return false
  }
}

export async function resetAllApplicationData(): Promise<void> {
  await clearActiveTimerState()
  await cancelAllScheduledNotifications()

  await db.transaction('rw', getAllDexieTables(), async () => {
    await Promise.all([
      db.userSettings.clear(),
      db.habits.clear(),
      db.habitCompletions.clear(),
      db.studySessions.clear(),
      db.subtestCategories.clear(),
      db.learningTopics.clear(),
      db.xpTransactions.clear(),
      db.achievements.clear(),
      db.personalRewards.clear(),
      db.rewardRedemptions.clear(),
      db.dailyReflections.clear(),
      db.chapters.clear(),
      db.questions.clear(),
      db.questionAttempts.clear(),
      db.mistakeNotes.clear(),
      db.customQuests.clear(),
      db.bossAttempts.clear(),
      db.mockTests.clear(),
    ])
  })

  // Selective removal of RITME-owned Preferences keys only (preserves foreign keys)
  await clearRitmePreferences()
  await reloadAllStores()
}
