import { Preferences } from '@capacitor/preferences'
import type { FocusMode, PomodoroPhase } from '@/types'

const ACTIVE_TIMER_PREF_KEY = 'ritme_active_timer_state'
const POMODORO_CONFIG_PREF_KEY = 'ritme_pomodoro_config'

export interface PersistedTimerState {
  sessionId: string
  startTimeMs: number
  targetDurationSeconds: number
  accumulatedPausedMs: number
  pausedAtMs: number | null
  status: 'running' | 'paused'
  subjectId: string
  topicId: string
  customTopicTitle: string
  location: string
  notes: string
  focusMode?: FocusMode
  pomodoroPhase?: PomodoroPhase
  pomodoroCycleCount?: number
  isBreakSession?: boolean
}

export interface PersistedPomodoroConfig {
  focusMode: FocusMode
  pomodoroPhase: PomodoroPhase
  pomodoroCycleCount: number
  autoStartBreak: boolean
  focusMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
}

export const DEFAULT_POMODORO_CONFIG: PersistedPomodoroConfig = {
  focusMode: 'free',
  pomodoroPhase: 'focus',
  pomodoroCycleCount: 1,
  autoStartBreak: false,
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
}

/**
 * Calculates effective elapsed seconds and remaining seconds purely from timestamps.
 * Immune to browser/WebView throttling when app is backgrounded.
 */
export function computeTimerProgress(
  state: PersistedTimerState,
  nowMs: number = Date.now()
): {
  effectiveElapsedSeconds: number
  remainingSeconds: number
  totalPausedSeconds: number
  isTimeUp: boolean
} {
  const currentPauseDeltaMs =
    state.status === 'paused' && state.pausedAtMs !== null
      ? Math.max(0, nowMs - state.pausedAtMs)
      : 0

  const totalPausedMs = Math.max(0, state.accumulatedPausedMs + currentPauseDeltaMs)
  const rawElapsedMs = Math.max(0, nowMs - state.startTimeMs - totalPausedMs)
  const effectiveElapsedSeconds = Math.floor(rawElapsedMs / 1000)
  const remainingSeconds = Math.max(
    0,
    state.targetDurationSeconds - effectiveElapsedSeconds
  )

  return {
    effectiveElapsedSeconds,
    remainingSeconds,
    totalPausedSeconds: Math.floor(totalPausedMs / 1000),
    isTimeUp: remainingSeconds <= 0,
  }
}

export async function saveActiveTimerState(
  state: PersistedTimerState
): Promise<void> {
  try {
    await Preferences.set({
      key: ACTIVE_TIMER_PREF_KEY,
      value: JSON.stringify(state),
    })
  } catch (err) {
    console.error('[RITME] Failed to persist active timer state:', err)
  }
}

export async function loadActiveTimerState(): Promise<PersistedTimerState | null> {
  try {
    const res = await Preferences.get({ key: ACTIVE_TIMER_PREF_KEY })
    if (!res.value) return null
    const parsed = JSON.parse(res.value) as PersistedTimerState
    if (
      parsed &&
      typeof parsed.sessionId === 'string' &&
      typeof parsed.startTimeMs === 'number' &&
      typeof parsed.targetDurationSeconds === 'number'
    ) {
      return parsed
    }
    return null
  } catch (err) {
    console.error('[RITME] Failed to load active timer state:', err)
    return null
  }
}

export async function clearActiveTimerState(): Promise<void> {
  try {
    await Preferences.remove({ key: ACTIVE_TIMER_PREF_KEY })
  } catch (err) {
    console.error('[RITME] Failed to clear active timer state:', err)
  }
}

export async function savePomodoroConfig(
  config: PersistedPomodoroConfig
): Promise<void> {
  try {
    await Preferences.set({
      key: POMODORO_CONFIG_PREF_KEY,
      value: JSON.stringify(config),
    })
  } catch (err) {
    console.error('[RITME] Failed to persist Pomodoro config:', err)
  }
}

export async function loadPomodoroConfig(): Promise<PersistedPomodoroConfig> {
  try {
    const res = await Preferences.get({ key: POMODORO_CONFIG_PREF_KEY })
    if (!res.value) return { ...DEFAULT_POMODORO_CONFIG }
    const parsed = JSON.parse(res.value) as Partial<PersistedPomodoroConfig>
    return {
      focusMode: parsed.focusMode === 'pomodoro' ? 'pomodoro' : 'free',
      pomodoroPhase:
        parsed.pomodoroPhase === 'short_break' ||
        parsed.pomodoroPhase === 'long_break'
          ? parsed.pomodoroPhase
          : 'focus',
      pomodoroCycleCount: Math.max(
        1,
        Math.min(4, Math.round(Number(parsed.pomodoroCycleCount) || 1))
      ),
      autoStartBreak: Boolean(parsed.autoStartBreak),
      focusMinutes: Math.max(
        5,
        Math.min(120, Math.round(Number(parsed.focusMinutes) || 25))
      ),
      shortBreakMinutes: Math.max(
        1,
        Math.min(30, Math.round(Number(parsed.shortBreakMinutes) || 5))
      ),
      longBreakMinutes: Math.max(
        5,
        Math.min(60, Math.round(Number(parsed.longBreakMinutes) || 15))
      ),
    }
  } catch (err) {
    console.error('[RITME] Failed to load Pomodoro config:', err)
    return { ...DEFAULT_POMODORO_CONFIG }
  }
}

export function formatSecondsToMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
