import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { db } from '@/services/database/db'
import { getLocalDateString, isDateInCurrentLocalWeek } from '@/utils/date'
import { generateId } from '@/utils/id'
import {
  clearActiveTimerState,
  computeTimerProgress,
  DEFAULT_POMODORO_CONFIG,
  formatSecondsToMMSS,
  loadActiveTimerState,
  loadPomodoroConfig,
  saveActiveTimerState,
  savePomodoroConfig,
  type PersistedTimerState,
} from '@/services/timer/focusTimerService'
import {
  playTimerCompleteAlarm,
  playTimerStartTone,
} from '@/services/timer/soundFeedbackService'
import {
  cancelFocusCompletionNotification,
  scheduleFocusCompletionNotification,
} from '@/services/notifications/localNotificationService'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import type { FocusMode, PomodoroPhase, StudySession } from '@/types'

export interface FocusCompletionSummary {
  sessionId: string
  durationMinutes: number
  targetMinutes: number
  effectiveSeconds: number
  xpEarned: number
  subjectId: string
  topicLabel: string
  questionsAnsweredToday: number
  completedAt: string
  isBreak: boolean
  focusMode?: FocusMode
  pomodoroPhase?: PomodoroPhase
}

export const useFocusStore = defineStore('focus', () => {
  const sessions = ref<StudySession[]>([])
  const activeSession = ref<StudySession | null>(null)
  const timerState = ref<PersistedTimerState | null>(null)
  const isLoaded = ref(false)
  let initPromise: Promise<void> | null = null
  let tickIntervalId: ReturnType<typeof setInterval> | null = null
  let listenersBound = false
  let isStartingSession = false
  let isFinishingSession = false
  let isCancellingSession = false

  // Timer Configuration State
  const focusMode = ref<FocusMode>('free')
  const pomodoroPhase = ref<PomodoroPhase>('focus')
  const pomodoroCycleCount = ref<number>(1)
  const autoStartBreak = ref<boolean>(false)
  const pomodoroFocusMinutes = ref<number>(DEFAULT_POMODORO_CONFIG.focusMinutes)
  const pomodoroShortBreakMinutes = ref<number>(
    DEFAULT_POMODORO_CONFIG.shortBreakMinutes
  )
  const pomodoroLongBreakMinutes = ref<number>(
    DEFAULT_POMODORO_CONFIG.longBreakMinutes
  )
  const selectedDurationMinutes = ref<number>(25)
  const selectedSubjectId = ref<string>('')
  const selectedTopicId = ref<string>('')
  const customTopicTitle = ref<string>('')
  const selectedLocation = ref<string>('')
  const sessionNotes = ref<string>('')
  let hasPlayedTimeUpAlarm = false

  // Live Timestamp Computed State
  const remainingSeconds = ref<number>(25 * 60)
  const effectiveElapsedSeconds = ref<number>(0)
  const totalPausedSeconds = ref<number>(0)
  const lastCompletionSummary = ref<FocusCompletionSummary | null>(null)

  function getDurationForPomodoroPhase(phase: PomodoroPhase): number {
    if (phase === 'short_break') return pomodoroShortBreakMinutes.value
    if (phase === 'long_break') return pomodoroLongBreakMinutes.value
    return pomodoroFocusMinutes.value
  }

  function persistPomodoroState(): void {
    void savePomodoroConfig({
      focusMode: focusMode.value,
      pomodoroPhase: pomodoroPhase.value,
      pomodoroCycleCount: pomodoroCycleCount.value,
      autoStartBreak: autoStartBreak.value,
      focusMinutes: pomodoroFocusMinutes.value,
      shortBreakMinutes: pomodoroShortBreakMinutes.value,
      longBreakMinutes: pomodoroLongBreakMinutes.value,
    })
  }

  function syncTickFromTimestamp(): void {
    if (!timerState.value) {
      remainingSeconds.value = selectedDurationMinutes.value * 60
      effectiveElapsedSeconds.value = 0
      totalPausedSeconds.value = 0
      hasPlayedTimeUpAlarm = false
      return
    }

    const progress = computeTimerProgress(timerState.value, Date.now())
    remainingSeconds.value = progress.remainingSeconds
    effectiveElapsedSeconds.value = progress.effectiveElapsedSeconds
    totalPausedSeconds.value = progress.totalPausedSeconds
    if (progress.isTimeUp && !hasPlayedTimeUpAlarm) {
      hasPlayedTimeUpAlarm = true
      playTimerCompleteAlarm()
    }
  }

  function startTickLoop(): void {
    stopTickLoop()
    syncTickFromTimestamp()
    tickIntervalId = setInterval(() => {
      syncTickFromTimestamp()
    }, 500)

    if (!listenersBound && typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          syncTickFromTimestamp()
        }
      })
      document.addEventListener('resume', () => {
        syncTickFromTimestamp()
      })
      window.addEventListener('focus', () => {
        syncTickFromTimestamp()
      })
      listenersBound = true
    }
  }

  function stopTickLoop(): void {
    if (tickIntervalId !== null) {
      clearInterval(tickIntervalId)
      tickIntervalId = null
    }
  }

  async function initFocusStore(force = false): Promise<void> {
    if (force) {
      stopTickLoop()
      isLoaded.value = false
      initPromise = null
      sessions.value = []
      activeSession.value = null
      timerState.value = null
      lastCompletionSummary.value = null
      focusMode.value = 'free'
      pomodoroPhase.value = 'focus'
      pomodoroCycleCount.value = 1
      autoStartBreak.value = false
      pomodoroFocusMinutes.value = DEFAULT_POMODORO_CONFIG.focusMinutes
      pomodoroShortBreakMinutes.value =
        DEFAULT_POMODORO_CONFIG.shortBreakMinutes
      pomodoroLongBreakMinutes.value = DEFAULT_POMODORO_CONFIG.longBreakMinutes
      selectedDurationMinutes.value = 25
      selectedSubjectId.value = ''
      selectedTopicId.value = ''
      customTopicTitle.value = ''
      isStartingSession = false
      isFinishingSession = false
      isCancellingSession = false
    }
    if (isLoaded.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const [allSessions, pomoConfig, persistedTimer] = await Promise.all([
          db.studySessions.toArray(),
          loadPomodoroConfig(),
          loadActiveTimerState(),
        ])

        sessions.value = allSessions.sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )

        focusMode.value = pomoConfig.focusMode
        pomodoroPhase.value = pomoConfig.pomodoroPhase
        pomodoroCycleCount.value = pomoConfig.pomodoroCycleCount
        autoStartBreak.value = pomoConfig.autoStartBreak
        pomodoroFocusMinutes.value = pomoConfig.focusMinutes
        pomodoroShortBreakMinutes.value = pomoConfig.shortBreakMinutes
        pomodoroLongBreakMinutes.value = pomoConfig.longBreakMinutes

        if (focusMode.value === 'pomodoro') {
          selectedDurationMinutes.value = getDurationForPomodoroPhase(
            pomodoroPhase.value
          )
        } else {
          selectedDurationMinutes.value = 25
        }

        if (persistedTimer) {
          timerState.value = persistedTimer
          selectedSubjectId.value = persistedTimer.subjectId
          selectedTopicId.value = persistedTimer.topicId
          customTopicTitle.value = persistedTimer.customTopicTitle
          selectedLocation.value = persistedTimer.location
          sessionNotes.value = persistedTimer.notes

          if (persistedTimer.focusMode) {
            focusMode.value = persistedTimer.focusMode
          }
          if (persistedTimer.pomodoroPhase) {
            pomodoroPhase.value = persistedTimer.pomodoroPhase
          }
          if (persistedTimer.pomodoroCycleCount) {
            pomodoroCycleCount.value = persistedTimer.pomodoroCycleCount
          }
          selectedDurationMinutes.value = Math.max(
            1,
            Math.round(persistedTimer.targetDurationSeconds / 60)
          )

          const isRecoveredBreak =
            Boolean(persistedTimer.isBreakSession) ||
            (persistedTimer.focusMode === 'pomodoro' &&
              persistedTimer.pomodoroPhase !== 'focus')

          if (isRecoveredBreak) {
            // Break sessions must never be persisted as StudySessions
            activeSession.value = null
          } else {
            const matchingSession = sessions.value.find(
              (s) => s.id === persistedTimer.sessionId
            )
            if (matchingSession) {
              activeSession.value = matchingSession
            } else {
              const recoveredSession: StudySession = {
                id: persistedTimer.sessionId,
                startTime: new Date(persistedTimer.startTimeMs).toISOString(),
                endTime: null,
                durationMinutes: 0,
                pausedDuration: 0,
                subjectId: persistedTimer.subjectId,
                topicId:
                  persistedTimer.customTopicTitle || persistedTimer.topicId,
                notes: persistedTimer.notes,
                location: persistedTimer.location,
                status: persistedTimer.status,
              }
              await db.studySessions.put(recoveredSession)
              sessions.value.unshift(recoveredSession)
              activeSession.value = recoveredSession
            }
          }
          startTickLoop()
        } else {
          remainingSeconds.value = selectedDurationMinutes.value * 60
        }
      } catch (err) {
        console.error('[RITME] Failed to initialize focusStore:', err)
      } finally {
        isLoaded.value = true
      }
    })()

    return initPromise
  }

  const timerStatus = computed<'idle' | 'running' | 'paused'>(() => {
    if (!timerState.value) return 'idle'
    return timerState.value.status
  })

  const isBreakPhase = computed<boolean>(() => {
    if (timerState.value?.isBreakSession !== undefined) {
      return timerState.value.isBreakSession
    }
    return focusMode.value === 'pomodoro' && pomodoroPhase.value !== 'focus'
  })

  const formattedRemainingTime = computed(() =>
    formatSecondsToMMSS(remainingSeconds.value)
  )

  const timerProgressPercent = computed(() => {
    if (!timerState.value || timerState.value.targetDurationSeconds <= 0) {
      return 0
    }
    return Math.min(
      100,
      Math.round(
        (effectiveElapsedSeconds.value /
          timerState.value.targetDurationSeconds) *
          100
      )
    )
  })

  const todaySessions = computed(() => {
    const today = getLocalDateString()
    return sessions.value.filter(
      (session) => getLocalDateString(new Date(session.startTime)) === today
    )
  })

  const completedSessions = computed(() =>
    sessions.value
      .filter((s) => s.status === 'completed')
      .slice()
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      )
  )

  const todayStudyMinutes = computed(() => {
    return todaySessions.value
      .filter((s) => s.status === 'completed')
      .reduce((sum, s) => sum + Math.max(0, Number(s.durationMinutes) || 0), 0)
  })

  const totalEffectiveStudyMinutes = computed(() => {
    return completedSessions.value.reduce(
      (sum, s) => sum + Math.max(0, Number(s.durationMinutes) || 0),
      0
    )
  })

  const last7DaysSessions = computed(() => {
    const cutoff = new Date()
    cutoff.setHours(0, 0, 0, 0)
    cutoff.setDate(cutoff.getDate() - 6)
    const cutoffMs = cutoff.getTime()

    return completedSessions.value.filter(
      (s) => new Date(s.startTime).getTime() >= cutoffMs
    )
  })

  const last7DaysStudyMinutes = computed(() => {
    return last7DaysSessions.value.reduce(
      (sum, s) => sum + Math.max(0, Number(s.durationMinutes) || 0),
      0
    )
  })

  const weeklyEffectiveStudyMinutes = computed(() => {
    return completedSessions.value
      .filter((s) => isDateInCurrentLocalWeek(s.startTime))
      .reduce((sum, s) => sum + Math.max(0, Number(s.durationMinutes) || 0), 0)
  })

  const hasStartedFocusToday = computed(() => {
    return todaySessions.value.some((s) => s.status === 'completed')
  })

  function setDurationMinutes(minutes: number): void {
    if (timerState.value) return
    const clamped = Math.max(1, Math.min(180, Math.round(Number(minutes) || 25)))
    selectedDurationMinutes.value = clamped
    remainingSeconds.value = clamped * 60
    if (focusMode.value === 'pomodoro') {
      if (pomodoroPhase.value === 'short_break') {
        pomodoroShortBreakMinutes.value = Math.min(30, clamped)
      } else if (pomodoroPhase.value === 'long_break') {
        pomodoroLongBreakMinutes.value = Math.min(60, clamped)
      } else {
        pomodoroFocusMinutes.value = Math.min(120, clamped)
      }
      persistPomodoroState()
    }
  }

  function setFocusMode(mode: FocusMode): void {
    if (timerState.value) return
    focusMode.value = mode
    if (mode === 'pomodoro') {
      pomodoroPhase.value = 'focus'
      const mins = getDurationForPomodoroPhase('focus')
      selectedDurationMinutes.value = mins
      remainingSeconds.value = mins * 60
    } else {
      selectedDurationMinutes.value = 25
      remainingSeconds.value = 25 * 60
    }
    persistPomodoroState()
  }

  function selectPomodoroPhase(phase: PomodoroPhase): void {
    if (timerState.value) return
    pomodoroPhase.value = phase
    const mins = getDurationForPomodoroPhase(phase)
    selectedDurationMinutes.value = mins
    remainingSeconds.value = mins * 60
    persistPomodoroState()
  }

  function skipPomodoroPhase(): void {
    if (timerState.value) return
    if (pomodoroPhase.value === 'focus') {
      if (pomodoroCycleCount.value >= 4) {
        selectPomodoroPhase('long_break')
      } else {
        selectPomodoroPhase('short_break')
      }
    } else {
      if (pomodoroPhase.value === 'long_break') {
        pomodoroCycleCount.value = 1
      } else {
        pomodoroCycleCount.value = Math.min(4, pomodoroCycleCount.value + 1)
      }
      selectPomodoroPhase('focus')
    }
  }

  function setAutoStartBreak(enabled: boolean): void {
    autoStartBreak.value = enabled
    persistPomodoroState()
  }

  function updatePomodoroDurations(payload: {
    focusMinutes: number
    shortBreakMinutes: number
    longBreakMinutes: number
  }): void {
    pomodoroFocusMinutes.value = Math.max(
      5,
      Math.min(120, Math.round(Number(payload.focusMinutes) || 25))
    )
    pomodoroShortBreakMinutes.value = Math.max(
      1,
      Math.min(30, Math.round(Number(payload.shortBreakMinutes) || 5))
    )
    pomodoroLongBreakMinutes.value = Math.max(
      5,
      Math.min(60, Math.round(Number(payload.longBreakMinutes) || 15))
    )

    if (focusMode.value === 'pomodoro' && !timerState.value) {
      const activeMins = getDurationForPomodoroPhase(pomodoroPhase.value)
      selectedDurationMinutes.value = activeMins
      remainingSeconds.value = activeMins * 60
    }
    persistPomodoroState()
  }

  async function startSession(options?: {
    preserveSummary?: boolean
  }): Promise<void> {
    if (isStartingSession || timerState.value) return
    isStartingSession = true
    try {
      if (!isLoaded.value) {
        await initFocusStore()
      }
      if (timerState.value) return

      playTimerStartTone()

      const userStore = useUserStore()
      const nowMs = Date.now()
      const isBreak =
        focusMode.value === 'pomodoro' && pomodoroPhase.value !== 'focus'
      const sessionId = generateId(isBreak ? 'break' : 'sess')
      const targetSeconds = Math.max(60, selectedDurationMinutes.value * 60)
      const location =
        selectedLocation.value || userStore.settings.primaryLocation
      const resolvedTopic =
        customTopicTitle.value.trim() || selectedTopicId.value

      const newTimerState: PersistedTimerState = {
        sessionId,
        startTimeMs: nowMs,
        targetDurationSeconds: targetSeconds,
        accumulatedPausedMs: 0,
        pausedAtMs: null,
        status: 'running',
        subjectId: selectedSubjectId.value,
        topicId: selectedTopicId.value,
        customTopicTitle: customTopicTitle.value.trim(),
        location,
        notes: sessionNotes.value.trim(),
        focusMode: focusMode.value,
        pomodoroPhase: pomodoroPhase.value,
        pomodoroCycleCount: pomodoroCycleCount.value,
        isBreakSession: isBreak,
      }

      if (!options?.preserveSummary) {
        lastCompletionSummary.value = null
      }
      timerState.value = newTimerState

      if (isBreak) {
        activeSession.value = null
        await saveActiveTimerState(newTimerState)
        startTickLoop()
        void scheduleFocusCompletionNotification({
          targetEndMs: nowMs + targetSeconds * 1000,
          isBreak: true,
          settings: userStore.settings,
        })
        return
      }

      const newSession: StudySession = {
        id: sessionId,
        startTime: new Date(nowMs).toISOString(),
        endTime: null,
        durationMinutes: 0,
        pausedDuration: 0,
        subjectId: selectedSubjectId.value,
        topicId: resolvedTopic,
        notes: sessionNotes.value.trim(),
        location,
        status: 'running',
      }

      activeSession.value = newSession
      sessions.value.unshift(newSession)

      await db.studySessions.put({ ...toRaw(newSession) })
      await saveActiveTimerState(newTimerState)
      startTickLoop()
      void scheduleFocusCompletionNotification({
        targetEndMs: nowMs + targetSeconds * 1000,
        isBreak: false,
        settings: userStore.settings,
      })
    } finally {
      isStartingSession = false
    }
  }

  async function pauseSession(): Promise<void> {
    if (!timerState.value || timerState.value.status !== 'running') return

    const nowMs = Date.now()
    timerState.value = {
      ...timerState.value,
      status: 'paused',
      pausedAtMs: nowMs,
    }
    syncTickFromTimestamp()
    void cancelFocusCompletionNotification()

    if (activeSession.value) {
      activeSession.value.status = 'paused'
      activeSession.value.pausedDuration = totalPausedSeconds.value
      await db.studySessions.put({ ...toRaw(activeSession.value) })
    }
    await saveActiveTimerState(timerState.value)
  }

  async function resumeSession(): Promise<void> {
    if (!timerState.value || timerState.value.status !== 'paused') return

    const nowMs = Date.now()
    const pauseDelta =
      timerState.value.pausedAtMs !== null
        ? Math.max(0, nowMs - timerState.value.pausedAtMs)
        : 0

    timerState.value = {
      ...timerState.value,
      status: 'running',
      accumulatedPausedMs: timerState.value.accumulatedPausedMs + pauseDelta,
      pausedAtMs: null,
    }
    syncTickFromTimestamp()
    void scheduleFocusCompletionNotification({
      targetEndMs: nowMs + Math.max(1, remainingSeconds.value) * 1000,
      isBreak:
        Boolean(timerState.value.isBreakSession) ||
        (timerState.value.focusMode === 'pomodoro' &&
          timerState.value.pomodoroPhase !== 'focus'),
      settings: useUserStore().settings,
    })

    if (activeSession.value) {
      activeSession.value.status = 'running'
      activeSession.value.pausedDuration = totalPausedSeconds.value
      await db.studySessions.put({ ...toRaw(activeSession.value) })
    }
    await saveActiveTimerState(timerState.value)
  }

  async function finishSession(): Promise<FocusCompletionSummary | null> {
    if (isFinishingSession || !timerState.value) return null
    isFinishingSession = true

    let shouldAutoStartBreak = false
    let summary: FocusCompletionSummary | null = null

    try {
      const nowMs = Date.now()
      const completedTimer = timerState.value
      const resolvedFocusMode: FocusMode =
        completedTimer.focusMode || focusMode.value
      const resolvedPhase: PomodoroPhase | undefined =
        completedTimer.pomodoroPhase ||
        (resolvedFocusMode === 'pomodoro' ? pomodoroPhase.value : undefined)
      const isBreak =
        Boolean(completedTimer.isBreakSession) ||
        (resolvedFocusMode === 'pomodoro' && resolvedPhase !== 'focus')

      if (!isBreak && !activeSession.value) return null

      const progress = computeTimerProgress(completedTimer, nowMs)
      const targetMinutes = Math.round(completedTimer.targetDurationSeconds / 60)

      // Calculate effective study duration in minutes (excluding paused duration)
      const calculatedMinutes = progress.isTimeUp
        ? targetMinutes
        : Math.min(targetMinutes, Math.floor(progress.effectiveElapsedSeconds / 60))

      if (isBreak) {
        await clearActiveTimerState()
        void cancelFocusCompletionNotification()
        stopTickLoop()
        timerState.value = null
        activeSession.value = null
        if (!hasPlayedTimeUpAlarm) {
          playTimerCompleteAlarm()
        }
        hasPlayedTimeUpAlarm = false

        if (focusMode.value === 'pomodoro') {
          skipPomodoroPhase()
        } else {
          remainingSeconds.value = selectedDurationMinutes.value * 60
        }
        effectiveElapsedSeconds.value = 0
        totalPausedSeconds.value = 0

        const learningStore = useLearningStore()
        const todayKey = getLocalDateString(new Date(nowMs))
        const questionsAnsweredToday = learningStore.questionAttempts.filter(
          (a) => getLocalDateString(new Date(a.attemptedAt)) === todayKey
        ).length

        summary = {
          sessionId: completedTimer.sessionId,
          durationMinutes: calculatedMinutes,
          targetMinutes,
          effectiveSeconds: progress.effectiveElapsedSeconds,
          xpEarned: 0,
          subjectId: completedTimer.subjectId,
          topicLabel: completedTimer.customTopicTitle || completedTimer.topicId,
          questionsAnsweredToday,
          completedAt: new Date(nowMs).toISOString(),
          isBreak: true,
          focusMode: resolvedFocusMode,
          pomodoroPhase: resolvedPhase,
        }

        lastCompletionSummary.value = summary
        return summary
      }

      const baseSession = toRaw(activeSession.value as StudySession)
      const completedRecord: StudySession = {
        ...baseSession,
        endTime: new Date(nowMs).toISOString(),
        durationMinutes: calculatedMinutes,
        pausedDuration: progress.totalPausedSeconds,
        notes: sessionNotes.value.trim(),
        status: 'completed',
      }

      const idx = sessions.value.findIndex((s) => s.id === completedRecord.id)
      if (idx !== -1) {
        sessions.value[idx] = completedRecord
      } else {
        sessions.value.unshift(completedRecord)
      }

      await db.studySessions.put({ ...completedRecord })
      await clearActiveTimerState()
      void cancelFocusCompletionNotification()

      stopTickLoop()
      timerState.value = null
      activeSession.value = null
      if (!hasPlayedTimeUpAlarm) {
        playTimerCompleteAlarm()
      }
      hasPlayedTimeUpAlarm = false

      if (focusMode.value === 'pomodoro') {
        skipPomodoroPhase()
      } else {
        remainingSeconds.value = selectedDurationMinutes.value * 60
      }
      effectiveElapsedSeconds.value = 0
      totalPausedSeconds.value = 0

      // Award XP idempotently (First Focus Session + 20-minute Focus Blocks + Quest sync)
      const gamificationStore = useGamificationStore()
      const today = getLocalDateString(new Date(nowMs))
      let xpEarned = 0
      xpEarned += await gamificationStore.awardXP(
        `quest_first_focus_${today}`,
        'first_focus_session',
        5
      )
      xpEarned += await gamificationStore.syncFocusBlocksXP(
        todayStudyMinutes.value
      )

      const learningStore = useLearningStore()
      const questionsAnsweredToday = learningStore.questionAttempts.filter(
        (a) => getLocalDateString(new Date(a.attemptedAt)) === today
      ).length

      summary = {
        sessionId: completedRecord.id,
        durationMinutes: calculatedMinutes,
        targetMinutes,
        effectiveSeconds: progress.effectiveElapsedSeconds,
        xpEarned,
        subjectId: completedRecord.subjectId,
        topicLabel: completedRecord.topicId,
        questionsAnsweredToday,
        completedAt: completedRecord.endTime || new Date(nowMs).toISOString(),
        isBreak: false,
        focusMode: resolvedFocusMode,
        pomodoroPhase: resolvedPhase,
      }

      lastCompletionSummary.value = summary

      shouldAutoStartBreak =
        focusMode.value === 'pomodoro' &&
        autoStartBreak.value &&
        pomodoroPhase.value !== 'focus'
    } finally {
      isFinishingSession = false
    }

    if (shouldAutoStartBreak) {
      await startSession({ preserveSummary: true })
    }

    return summary
  }

  async function cancelSession(): Promise<void> {
    if (isCancellingSession || !timerState.value) return
    isCancellingSession = true
    try {
      const nowMs = Date.now()
      const progress = computeTimerProgress(timerState.value, nowMs)

      if (activeSession.value) {
        const cancelledRecord: StudySession = {
          ...toRaw(activeSession.value),
          endTime: new Date(nowMs).toISOString(),
          durationMinutes: 0,
          pausedDuration: progress.totalPausedSeconds,
          status: 'cancelled',
        }
        const idx = sessions.value.findIndex((s) => s.id === cancelledRecord.id)
        if (idx !== -1) {
          sessions.value[idx] = cancelledRecord
        }
        await db.studySessions.put({ ...cancelledRecord })
      }

      await clearActiveTimerState()
      void cancelFocusCompletionNotification()
      stopTickLoop()
      timerState.value = null
      activeSession.value = null
      hasPlayedTimeUpAlarm = false
      remainingSeconds.value = selectedDurationMinutes.value * 60
      effectiveElapsedSeconds.value = 0
      totalPausedSeconds.value = 0
    } finally {
      isCancellingSession = false
    }
  }

  function clearCompletionSummary(): void {
    lastCompletionSummary.value = null
  }

  function syncTimerNow(): void {
    syncTickFromTimestamp()
  }

  return {
    sessions,
    activeSession,
    timerState,
    isLoaded,
    focusMode,
    pomodoroPhase,
    pomodoroCycleCount,
    autoStartBreak,
    pomodoroFocusMinutes,
    pomodoroShortBreakMinutes,
    pomodoroLongBreakMinutes,
    isBreakPhase,
    selectedDurationMinutes,
    selectedSubjectId,
    selectedTopicId,
    customTopicTitle,
    selectedLocation,
    sessionNotes,
    remainingSeconds,
    effectiveElapsedSeconds,
    totalPausedSeconds,
    lastCompletionSummary,
    timerStatus,
    formattedRemainingTime,
    timerProgressPercent,
    todaySessions,
    completedSessions,
    todayStudyMinutes,
    totalEffectiveStudyMinutes,
    weeklyEffectiveStudyMinutes,
    last7DaysSessions,
    last7DaysStudyMinutes,
    hasStartedFocusToday,
    initFocusStore,
    setDurationMinutes,
    setFocusMode,
    selectPomodoroPhase,
    skipPomodoroPhase,
    setAutoStartBreak,
    updatePomodoroDurations,
    startSession,
    pauseSession,
    resumeSession,
    finishSession,
    cancelSession,
    clearCompletionSummary,
    syncTimerNow,
  }
})
