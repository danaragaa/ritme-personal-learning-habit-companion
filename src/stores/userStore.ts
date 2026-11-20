import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { db } from '@/services/database/db'
import { setI18nLocale } from '@/i18n'
import { scheduleSnoozedStudyNotification } from '@/services/notifications/localNotificationService'
import type { AppLanguage, AppTheme, EnergyMode, UserSettings } from '@/types'

const WEEKLY_SCHEDULE_KEY = 'ritme_weekly_schedule'
const REMINDERS_CONFIG_KEY = 'ritme_study_reminders'
const REMINDER_SNOOZE_KEY = 'ritme_reminder_snooze_until'

export type WeeklyStudySchedule = Record<number, string>

export interface StudyReminderConfig {
  enabled: boolean
  morningTime: string
  eveningTime: string
}

export const DEFAULT_WEEKLY_SCHEDULE: WeeklyStudySchedule = {
  0: 'subtest_lbe',
  1: 'subtest_pu',
  2: 'subtest_pk',
  3: 'subtest_ppu',
  4: 'subtest_pbm',
  5: 'subtest_lbi',
  6: 'subtest_pm',
}

export const DEFAULT_REMINDER_CONFIG: StudyReminderConfig = {
  enabled: true,
  morningTime: '08:00',
  eveningTime: '20:00',
}

const DEFAULT_SETTINGS: UserSettings = {
  id: 'default_user',
  displayName: '',
  language: 'id',
  theme: 'dark',
  dailyTargetMinutes: 180,
  idealTargetMinutes: 240,
  maximumTargetMinutes: 300,
  studyTrigger: 'Setelah sarapan dan membersihkan diri',
  primaryLocation: 'Meja belajar di rumah',
  alternativeLocation: 'Perpustakaan umum atau ruang belajar tenang',
  weeklyRestDay: 0, // Minggu / Sunday
  onboardingCompleted: false,
  currentEnergyMode: 'green',
  targetMockScore: 700,
  prioritySubtestId: 'subtest_pu',
  selectedTitleId: 'default',
  selectedFrameId: 'aurora_violet',
  snoozeMinutes: 15,
  weeklyFocusTargetMinutes: 120,
  weeklyPracticeTargetQuestions: 5,
  weeklyStreakTargetDays: 4,
  notificationsEnabled: true,
  notifyStudyReminder: true,
  notifyFocusCompletion: true,
  notifyBreakReminder: true,
  notifyQuestReminder: true,
  notifyReviewReminder: true,
  notifyReflectionReminder: true,
  notifyStreakProtection: true,
  notifyAchievementUnlock: true,
  notifyLevelUp: true,
  notifyBossReady: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
  soundEffectsEnabled: true,
  timerAlarmEnabled: true,
  soundVolume: 70,
  alarmTone: 'chime',
  vibrationEnabled: true,
  silentMode: false,
}

function getCachedInitialLanguage(): AppLanguage {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached =
        localStorage.getItem('ritme_lang_cache') ||
        localStorage.getItem('CapacitorStorage.ritme_language')
      if (cached === 'en' || cached === 'id') return cached
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_SETTINGS.language
}

function getCachedInitialTheme(): AppTheme {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached =
        localStorage.getItem('ritme_theme_cache') ||
        localStorage.getItem('CapacitorStorage.ritme_theme')
      if (cached === 'light' || cached === 'dark') return cached
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_SETTINGS.theme
}

export const useUserStore = defineStore('user', () => {
  const settings = ref<UserSettings>({
    ...DEFAULT_SETTINGS,
    language: getCachedInitialLanguage(),
    theme: getCachedInitialTheme(),
  })
  const weeklySchedule = ref<WeeklyStudySchedule>({
    ...DEFAULT_WEEKLY_SCHEDULE,
  })
  const reminderConfig = ref<StudyReminderConfig>({
    ...DEFAULT_REMINDER_CONFIG,
  })
  const snoozedUntilMs = ref<number>(0)
  const isLoaded = ref(false)
  let initPromise: Promise<void> | null = null

  function applyTheme(theme: AppTheme) {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('theme-light')
      root.classList.remove('ion-palette-dark')
    } else {
      root.classList.remove('theme-light')
      root.classList.add('ion-palette-dark')
    }
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('ritme_theme_cache', theme)
      }
      if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
        const meta = document.querySelector('meta[name="theme-color"]')
        if (meta) {
          meta.setAttribute('content', theme === 'light' ? '#F2F2F7' : '#101114')
        }
      }
    } catch {
      // Ignore storage/DOM unavailability in headless test environments
    }
  }

  function applyLanguage(lang: AppLanguage) {
    setI18nLocale(lang)
  }

  async function initUserStore(force = false): Promise<void> {
    if (force) {
      isLoaded.value = false
      initPromise = null
      weeklySchedule.value = { ...DEFAULT_WEEKLY_SCHEDULE }
      reminderConfig.value = { ...DEFAULT_REMINDER_CONFIG }
      snoozedUntilMs.value = 0
    }
    if (isLoaded.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const existing = await db.userSettings.get('default_user')
        const merged: UserSettings = existing
          ? { ...DEFAULT_SETTINGS, ...existing, id: 'default_user' }
          : { ...DEFAULT_SETTINGS }

        const prefLang = await Preferences.get({ key: 'ritme_language' })
        if (prefLang.value === 'id' || prefLang.value === 'en') {
          merged.language = prefLang.value
        }

        const prefTheme = await Preferences.get({ key: 'ritme_theme' })
        if (prefTheme.value === 'dark' || prefTheme.value === 'light') {
          merged.theme = prefTheme.value
        }

        const schedPref = await Preferences.get({ key: WEEKLY_SCHEDULE_KEY })
        if (schedPref.value) {
          try {
            const parsed = JSON.parse(schedPref.value) as WeeklyStudySchedule
            weeklySchedule.value = { ...DEFAULT_WEEKLY_SCHEDULE, ...parsed }
          } catch {
            weeklySchedule.value = { ...DEFAULT_WEEKLY_SCHEDULE }
          }
        }

        const remPref = await Preferences.get({ key: REMINDERS_CONFIG_KEY })
        if (remPref.value) {
          try {
            const parsed = JSON.parse(remPref.value) as StudyReminderConfig
            reminderConfig.value = { ...DEFAULT_REMINDER_CONFIG, ...parsed }
          } catch {
            reminderConfig.value = { ...DEFAULT_REMINDER_CONFIG }
          }
        }

        const snoozePref = await Preferences.get({ key: REMINDER_SNOOZE_KEY })
        if (snoozePref.value) {
          const parsedUntil = Number(snoozePref.value)
          snoozedUntilMs.value =
            Number.isFinite(parsedUntil) && parsedUntil > Date.now()
              ? parsedUntil
              : 0
        }

        settings.value = merged
        await db.userSettings.put({ ...toRaw(settings.value) })
      } catch (err) {
        console.error('[RITME] Failed to initialize userStore:', err)
      } finally {
        applyLanguage(settings.value.language)
        applyTheme(settings.value.theme)
        isLoaded.value = true
      }
    })()

    return initPromise
  }

  async function updateSettings(partial: Partial<UserSettings>): Promise<void> {
    if (!isLoaded.value && initPromise) {
      await initPromise
    }

    settings.value = {
      ...settings.value,
      ...partial,
      id: 'default_user',
    }

    try {
      await db.userSettings.put({ ...toRaw(settings.value) })

      if (partial.language) {
        applyLanguage(partial.language)
        await Preferences.set({ key: 'ritme_language', value: partial.language })
      }
      if (partial.theme) {
        applyTheme(partial.theme)
        await Preferences.set({ key: 'ritme_theme', value: partial.theme })
      }
    } catch (err) {
      console.error('[RITME] Failed to persist userSettings:', err)
    }
  }

  async function setDaySubtestSchedule(
    dayOfWeek: number,
    subtestId: string
  ): Promise<void> {
    weeklySchedule.value = {
      ...weeklySchedule.value,
      [dayOfWeek]: subtestId,
    }
    await Preferences.set({
      key: WEEKLY_SCHEDULE_KEY,
      value: JSON.stringify(weeklySchedule.value),
    })
  }

  async function updateReminderConfig(
    partial: Partial<StudyReminderConfig>
  ): Promise<void> {
    reminderConfig.value = {
      ...reminderConfig.value,
      ...partial,
    }
    await Preferences.set({
      key: REMINDERS_CONFIG_KEY,
      value: JSON.stringify(reminderConfig.value),
    })
  }

  async function setLanguage(language: AppLanguage): Promise<void> {
    await updateSettings({ language })
  }

  async function setTheme(theme: AppTheme): Promise<void> {
    await updateSettings({ theme })
  }

  async function setEnergyMode(currentEnergyMode: EnergyMode): Promise<void> {
    await updateSettings({ currentEnergyMode })
  }

  const effectiveDailyTargetMinutes = computed(() => {
    const base = Math.max(15, settings.value.dailyTargetMinutes || 180)
    if (settings.value.currentEnergyMode === 'yellow') {
      return Math.min(base, 90)
    }
    if (settings.value.currentEnergyMode === 'red') {
      return Math.min(base, 20)
    }
    return base
  })

  const todayScheduledSubtestId = computed(() => {
    const todayDay = new Date().getDay()
    if (todayDay === settings.value.weeklyRestDay) {
      return 'rest'
    }
    return weeklySchedule.value[todayDay] || 'subtest_pu'
  })

  const isReminderSnoozed = computed(() => snoozedUntilMs.value > Date.now())

  async function snoozeStudyReminder(minutes?: number): Promise<number> {
    const mins = Math.max(
      5,
      Math.min(120, Math.round(minutes ?? settings.value.snoozeMinutes ?? 15))
    )
    const targetMs = Date.now() + mins * 60 * 1000
    snoozedUntilMs.value = targetMs
    await Preferences.set({
      key: REMINDER_SNOOZE_KEY,
      value: String(targetMs),
    })
    await scheduleSnoozedStudyNotification({
      minutes: mins,
      settings: settings.value,
    })
    return mins
  }

  return {
    settings,
    weeklySchedule,
    reminderConfig,
    snoozedUntilMs,
    isReminderSnoozed,
    isLoaded,
    effectiveDailyTargetMinutes,
    todayScheduledSubtestId,
    initUserStore,
    updateSettings,
    setDaySubtestSchedule,
    updateReminderConfig,
    snoozeStudyReminder,
    setLanguage,
    setTheme,
    setEnergyMode,
  }
})
