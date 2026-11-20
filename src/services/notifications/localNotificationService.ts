import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { UserSettings } from '@/types'
import type { StudyReminderConfig } from '@/stores/userStore'

const CHANNEL_REMINDERS = 'ritme_reminders'
const CHANNEL_TIMER = 'ritme_timer_alarm'
const RITME_SMALL_ICON = 'ritme_notification'

export const NOTIF_IDS = {
  STUDY_MORNING: 1001,
  REFLECTION_EVENING: 1002,
  REVIEW_DUE: 1003,
  QUEST_EVENING: 1004,
  STREAK_GUARD: 1005,
  STUDY_SNOOZED: 1006,
  FOCUS_COMPLETE: 2001,
  BOSS_OR_MILESTONE: 3001,
  TEST: 9001,
} as const

const MANAGED_DAILY_IDS = [
  NOTIF_IDS.STUDY_MORNING,
  NOTIF_IDS.REFLECTION_EVENING,
  NOTIF_IDS.REVIEW_DUE,
  NOTIF_IDS.QUEST_EVENING,
  NOTIF_IDS.STREAK_GUARD,
]

export type NotifPermissionState = 'granted' | 'denied' | 'prompt'

function parseMinutesOfDay(hhmm: string | undefined, fallback: string): number {
  const clean = (hhmm || fallback).trim()
  const [hStr, mStr] = clean.split(':')
  const h = Math.max(0, Math.min(23, Number(hStr) || 0))
  const m = Math.max(0, Math.min(59, Number(mStr) || 0))
  return h * 60 + m
}

export function isTimeWithinQuietHours(
  date: Date,
  settings: Partial<UserSettings>
): boolean {
  if (!settings.quietHoursEnabled) return false
  const startMin = parseMinutesOfDay(settings.quietHoursStart, '22:00')
  const endMin = parseMinutesOfDay(settings.quietHoursEnd, '06:00')
  if (startMin === endMin) return false

  const targetMin = date.getHours() * 60 + date.getMinutes()
  if (startMin < endMin) {
    return targetMin >= startMin && targetMin < endMin
  }
  // Overnight quiet hours window (e.g. 22:00 -> 06:00)
  return targetMin >= startMin || targetMin < endMin
}

function buildNextNonRestTriggerDate(
  hhmm: string,
  weeklyRestDay: number,
  now = new Date()
): Date {
  const [hStr, mStr] = hhmm.split(':')
  const h = Math.max(0, Math.min(23, Number(hStr) || 8))
  const m = Math.max(0, Math.min(59, Number(mStr) || 0))

  const candidate = new Date(now)
  candidate.setHours(h, m, 0, 0)
  if (candidate.getTime() <= now.getTime() + 15000) {
    candidate.setDate(candidate.getDate() + 1)
  }
  // Skip scheduled rest day cleanly (advance max 7 days guard)
  for (let i = 0; i < 7; i += 1) {
    if (candidate.getDay() !== weeklyRestDay) break
    candidate.setDate(candidate.getDate() + 1)
  }
  return candidate
}

function getTimeFromOffset(hhmm: string, offsetMinutes: number): string {
  const total = (parseMinutesOfDay(hhmm, '08:00') + offsetMinutes + 1440) % 1440
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

export async function initNotificationChannels(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_REMINDERS,
      name: 'RITME Study Reminders',
      description: 'Study rhythm, daily reflection, and streak reminders',
      importance: 3,
      visibility: 1,
      vibration: true,
    })
    await LocalNotifications.createChannel({
      id: CHANNEL_TIMER,
      name: 'RITME Focus Timer Alarm',
      description: 'Notifications when a focus or Pomodoro break timer ends',
      importance: 4,
      visibility: 1,
      vibration: true,
    })
  } catch (err) {
    console.warn('[RITME] Notification channel init skipped:', err)
  }
}

export async function getNotificationPermissionState(): Promise<NotifPermissionState> {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await LocalNotifications.checkPermissions()
      if (res.display === 'granted') return 'granted'
      if (res.display === 'denied') return 'denied'
      return 'prompt'
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return 'granted'
      if (Notification.permission === 'denied') return 'denied'
    }
  } catch {
    // fallback
  }
  return 'prompt'
}

export async function requestNotificationPermission(): Promise<NotifPermissionState> {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await LocalNotifications.requestPermissions()
      await initNotificationChannels()
      if (res.display === 'granted') return 'granted'
      if (res.display === 'denied') return 'denied'
      return 'prompt'
    }
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission()
      if (perm === 'granted') return 'granted'
      if (perm === 'denied') return 'denied'
    }
  } catch (err) {
    console.warn('[RITME] Permission request failed:', err)
  }
  return 'prompt'
}

async function cancelIds(ids: number[]): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    await LocalNotifications.cancel({
      notifications: ids.map((id) => ({ id })),
    })
  } catch {
    // ignore if none pending
  }
}

export async function scheduleFocusCompletionNotification(params: {
  targetEndMs: number
  isBreak: boolean
  settings: UserSettings
}): Promise<void> {
  await cancelFocusCompletionNotification()
  const { targetEndMs, isBreak, settings } = params

  if (settings.notificationsEnabled === false) return
  if (isBreak && settings.notifyBreakReminder === false) return
  if (!isBreak && settings.notifyFocusCompletion === false) return
  if (targetEndMs <= Date.now() + 2000) return
  if (!Capacitor.isNativePlatform()) return

  const perm = await getNotificationPermissionState()
  if (perm !== 'granted') return

  const isId = settings.language !== 'en'
  const title = isBreak
    ? isId
      ? 'Waktu Istirahat Selesai'
      : 'Break Time Complete'
    : isId
      ? 'Sesi Fokus Selesai!'
      : 'Focus Session Complete!'
  const body = isBreak
    ? isId
      ? 'Istirahat selesai. Siap lanjut ke siklus fokus berikutnya!'
      : 'Break finished. Ready for your next focus cycle!'
    : isId
      ? 'Target waktu belajarmu tercapai. Simpan sesi untuk meraih XP.'
      : 'Your focus block is complete. Save your session to collect XP.'

  try {
    await initNotificationChannels()
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIF_IDS.FOCUS_COMPLETE,
          title,
          body,
          channelId: CHANNEL_TIMER,
          smallIcon: RITME_SMALL_ICON,
          schedule: {
            at: new Date(targetEndMs),
            allowWhileIdle: true,
          },
          autoCancel: true,
        },
      ],
    })
  } catch (err) {
    console.warn('[RITME] Failed to schedule timer notification:', err)
  }
}

export async function cancelFocusCompletionNotification(): Promise<void> {
  await cancelIds([NOTIF_IDS.FOCUS_COMPLETE])
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await cancelIds(Object.values(NOTIF_IDS))
}

export async function syncAdaptiveNotifications(params: {
  settings: UserSettings
  reminderConfig: StudyReminderConfig
  dueReviewsCount: number
  incompleteTodayQuestsCount: number
  currentStreak: number
}): Promise<void> {
  await cancelIds(MANAGED_DAILY_IDS)

  const {
    settings,
    reminderConfig,
    currentStreak,
  } = params

  if (!Capacitor.isNativePlatform()) return
  if (settings.notificationsEnabled === false || !reminderConfig.enabled) return

  const perm = await getNotificationPermissionState()
  if (perm !== 'granted') return

  const isId = settings.language !== 'en'
  const restDay = settings.weeklyRestDay ?? 0
  const isRecoveryDay = settings.currentEnergyMode === 'red'
  const toSchedule: Array<{
    id: number
    title: string
    body: string
    at: Date
  }> = []

  // 1. Morning Study Reminder (adapts to Red Energy Mode)
  if (settings.notifyStudyReminder !== false) {
    const at = buildNextNonRestTriggerDate(reminderConfig.morningTime, restDay)
    if (!isTimeWithinQuietHours(at, settings)) {
      toSchedule.push({
        id: NOTIF_IDS.STUDY_MORNING,
        title: isId ? 'Waktunya Ritme Belajar' : 'Time for Study Rhythm',
        body: isRecoveryDay
          ? isId
            ? 'Mode pemulihan aktif: cukup mulai 2 menit ringan tanpa tekanan.'
            : 'Recovery mode active: start with a gentle 2-minute session.'
          : isId
            ? 'Siapkan meja belajarmu dan mulai satu blok fokus pertamamu hari ini.'
            : 'Prepare your desk and begin your first focus block today.',
        at,
      })
    }
  }

  // Note: REVIEW_DUE (1003) and QUEST_EVENING (1004) remain in MANAGED_DAILY_IDS above
  // so any legacy scheduled reminders are cancelled cleanly, and are no longer scheduled (TASK 07).

  // 2. Evening Reflection Reminder (every active/rest day)
  if (settings.notifyReflectionReminder !== false) {
    const at = buildNextNonRestTriggerDate(reminderConfig.eveningTime, -1)
    if (!isTimeWithinQuietHours(at, settings)) {
      toSchedule.push({
        id: NOTIF_IDS.REFLECTION_EVENING,
        title: isId ? 'Refleksi Harian RITME' : 'Daily RITME Reflection',
        body: isId
          ? 'Luangkan 1 menit mencatat pencapaian dan rencana belajar esok hari.'
          : 'Take 1 minute to note today’s progress and plan tomorrow.',
        at,
      })
    }
  }

  // 5. Streak Protection Reminder (if streak >= 1)
  if (settings.notifyStreakProtection !== false && currentStreak >= 1) {
    const guardTime = getTimeFromOffset(reminderConfig.eveningTime, 30)
    const at = buildNextNonRestTriggerDate(guardTime, restDay)
    if (!isTimeWithinQuietHours(at, settings)) {
      toSchedule.push({
        id: NOTIF_IDS.STREAK_GUARD,
        title: isId ? 'Jaga Runtutan Belajarmu' : 'Protect Your Study Streak',
        body: isId
          ? `Runtutan ${currentStreak} harimu aktif. Selesaikan 1 tugas singkat agar ritmemu tetap terjaga.`
          : `Your ${currentStreak}-day streak is active. Finish one quick step to keep your rhythm.`,
        at,
      })
    }
  }

  if (toSchedule.length === 0) return

  try {
    await initNotificationChannels()
    await LocalNotifications.schedule({
      notifications: toSchedule.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        channelId: CHANNEL_REMINDERS,
        smallIcon: RITME_SMALL_ICON,
        schedule: {
          at: item.at,
          allowWhileIdle: true,
        },
        autoCancel: true,
      })),
    })
  } catch (err) {
    console.warn('[RITME] Failed to schedule adaptive notifications:', err)
  }
}

export async function dispatchImmediateNotification(params: {
  id?: number
  title: string
  body: string
  settings?: Partial<UserSettings>
  ignoreQuietHours?: boolean
}): Promise<'native' | 'web' | 'skipped'> {
  const {
    id = NOTIF_IDS.BOSS_OR_MILESTONE,
    title,
    body,
    settings,
    ignoreQuietHours = false,
  } = params

  if (settings?.notificationsEnabled === false && !ignoreQuietHours) {
    return 'skipped'
  }
  if (
    !ignoreQuietHours &&
    settings &&
    isTimeWithinQuietHours(new Date(), settings)
  ) {
    return 'skipped'
  }

  try {
    if (Capacitor.isNativePlatform()) {
      let perm = await getNotificationPermissionState()
      if (perm !== 'granted') {
        perm = await requestNotificationPermission()
      }
      if (perm === 'granted') {
        await initNotificationChannels()
        await LocalNotifications.schedule({
          notifications: [
            {
              id,
              title,
              body,
              channelId: CHANNEL_REMINDERS,
              smallIcon: RITME_SMALL_ICON,
              schedule: {
                at: new Date(Date.now() + 1000),
              },
              autoCancel: true,
            },
          ],
        })
        return 'native'
      }
    }

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body })
        return 'web'
      }
      if (Notification.permission === 'default' && ignoreQuietHours) {
        const res = await Notification.requestPermission()
        if (res === 'granted') {
          new Notification(title, { body })
          return 'web'
        }
      }
    }
  } catch (err) {
    console.warn('[RITME] Instant notification failed:', err)
  }

  return 'skipped'
}

export async function scheduleSnoozedStudyNotification(params: {
  minutes: number
  settings: UserSettings
}): Promise<boolean> {
  const { minutes, settings } = params
  const clampedMins = Math.max(5, Math.min(120, Math.round(minutes) || 15))
  const triggerAt = new Date(Date.now() + clampedMins * 60 * 1000)

  if (settings.notificationsEnabled === false) return false
  if (settings.notifyStudyReminder === false) return false
  if (isTimeWithinQuietHours(triggerAt, settings)) return false
  if (!Capacitor.isNativePlatform()) return false

  const perm = await getNotificationPermissionState()
  if (perm !== 'granted') return false

  const isId = settings.language !== 'en'
  try {
    await cancelIds([NOTIF_IDS.STUDY_SNOOZED])
    await initNotificationChannels()
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIF_IDS.STUDY_SNOOZED,
          title: isId ? 'Pengingat Belajar (Ditunda)' : 'Snoozed Study Reminder',
          body: isId
            ? 'Waktu tunda selesai. Yuk mulai satu blok fokus atau aturan 2 menit!'
            : 'Snooze finished. Ready for a focus block or Two-Minute Starter!',
          channelId: CHANNEL_REMINDERS,
          smallIcon: RITME_SMALL_ICON,
          schedule: {
            at: triggerAt,
            allowWhileIdle: true,
          },
          autoCancel: true,
        },
      ],
    })
    return true
  } catch (err) {
    console.warn('[RITME] Failed to schedule snoozed notification:', err)
    return false
  }
}
