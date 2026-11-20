import { getLocalDateString } from '@/utils/date'
import {
  isTopicCompletedStatus,
  mapTopicStatusToUi,
} from '@/services/learning/learningTrackerService'
import type {
  Habit,
  HabitCompletion,
  LearningTopic,
  StudySession,
  SubtestCategory,
} from '@/types'

export type ProgressPeriod = 'week' | 'month'
export type ProgressHistoryFilter = 'today' | 'week' | 'all'

export interface PeriodDateBucket {
  dateStr: string
  dayOfWeek: number
  dayNumber: string
  isToday: boolean
}

export interface PeriodFocusStats {
  totalFocusMinutes: number
  completedSessionsCount: number
  activeDaysCount: number
}

export interface FocusActivityBarItem {
  dateStr: string
  dayOfWeek: number
  dayNumber: string
  isToday: boolean
  minutes: number
  sessionsCount: number
  heightPercent: number
}

export interface FocusActivityChartData {
  period: ProgressPeriod
  bars: FocusActivityBarItem[]
  totalMinutes: number
  maxMinutes: number
  activeDaysCount: number
}

export interface HabitConsistencyResult {
  consistencyPercent: number
  plannedDaysCount: number
  restDaysExcludedCount: number
  activeHabitsCount: number
}

export interface CompletedTopicsSummary {
  totalTopics: number
  completedTopics: number
  learningTopics: number
  notStartedTopics: number
  completionPercent: number
}

export interface SubtestCompletionItem {
  subtestId: string
  code: string
  nameId: string
  nameEn: string
  totalTopics: number
  completedTopics: number
  inProgressTopics: number
  completionPercent: number
}

export type LearningActivityKind =
  | 'focus_session'
  | 'topic_completed'
  | 'topic_learning'

export interface LearningActivityItem {
  id: string
  kind: LearningActivityKind
  timestamp: string
  timestampMs: number
  localDate: string
  subjectId: string
  subtestCode: string
  topicId: string
  topicTitle: string
  durationMinutes: number | null
}

/**
 * Generates inclusive rolling local day buckets:
 * - 'week'  => last 7 local days inclusive of refDate
 * - 'month' => last 30 local days inclusive of refDate
 */
export function getPeriodRangeDates(
  period: ProgressPeriod,
  refDate: Date = new Date()
): {
  startDateStr: string
  endDateStr: string
  buckets: PeriodDateBucket[]
} {
  const daysCount = period === 'month' ? 30 : 7
  const todayStr = getLocalDateString(refDate)
  const buckets: PeriodDateBucket[] = []

  for (let offset = daysCount - 1; offset >= 0; offset--) {
    const d = new Date(
      refDate.getFullYear(),
      refDate.getMonth(),
      refDate.getDate(),
      12,
      0,
      0,
      0
    )
    d.setDate(d.getDate() - offset)
    const dateStr = getLocalDateString(d)
    buckets.push({
      dateStr,
      dayOfWeek: d.getDay(),
      dayNumber: String(d.getDate()).padStart(2, '0'),
      isToday: dateStr === todayStr,
    })
  }

  return {
    startDateStr: buckets[0]?.dateStr || todayStr,
    endDateStr: todayStr,
    buckets,
  }
}

/**
 * Strictly validates that a StudySession is a finished focus session
 * (excludes running, paused, cancelled, and any break records).
 */
export function isValidCompletedFocusSession(session: StudySession): boolean {
  if (!session || session.status !== 'completed') return false
  if (String(session.id || '').startsWith('break_')) return false
  const parsed = new Date(session.startTime)
  return !Number.isNaN(parsed.getTime())
}

/**
 * Deduplicates completed focus sessions by session.id so durations and counts
 * are never double-counted.
 */
export function dedupeCompletedFocusSessions(
  sessions: StudySession[]
): StudySession[] {
  const seen = new Set<string>()
  const unique: StudySession[] = []
  for (const session of sessions) {
    if (!isValidCompletedFocusSession(session)) continue
    if (seen.has(session.id)) continue
    seen.add(session.id)
    unique.push(session)
  }
  return unique
}

/**
 * Computes completed focus minutes & session count within 'week' (7d) or 'month' (30d).
 * Preserves existing StudySession.durationMinutes contract honestly (no fake rounding).
 */
export function computePeriodFocusStats(
  sessions: StudySession[],
  period: ProgressPeriod,
  refDate: Date = new Date()
): PeriodFocusStats {
  const { startDateStr, endDateStr } = getPeriodRangeDates(period, refDate)
  const uniqueCompleted = dedupeCompletedFocusSessions(sessions)

  let totalFocusMinutes = 0
  let completedSessionsCount = 0
  const activeDates = new Set<string>()

  for (const session of uniqueCompleted) {
    const localDate = getLocalDateString(new Date(session.startTime))
    if (localDate < startDateStr || localDate > endDateStr) continue
    const mins = Math.max(0, Number(session.durationMinutes) || 0)
    totalFocusMinutes += mins
    completedSessionsCount += 1
    activeDates.add(localDate)
  }

  return {
    totalFocusMinutes,
    completedSessionsCount,
    activeDaysCount: activeDates.size,
  }
}

/**
 * Builds daily completed focus duration bars for the minimalist monochrome chart.
 */
export function buildFocusActivityBars(
  sessions: StudySession[],
  period: ProgressPeriod,
  refDate: Date = new Date()
): FocusActivityChartData {
  const { startDateStr, endDateStr, buckets } = getPeriodRangeDates(
    period,
    refDate
  )
  const uniqueCompleted = dedupeCompletedFocusSessions(sessions)

  const minsByDate = new Map<string, { minutes: number; count: number }>()
  for (const session of uniqueCompleted) {
    const localDate = getLocalDateString(new Date(session.startTime))
    if (localDate < startDateStr || localDate > endDateStr) continue
    const prev = minsByDate.get(localDate) || { minutes: 0, count: 0 }
    minsByDate.set(localDate, {
      minutes: prev.minutes + Math.max(0, Number(session.durationMinutes) || 0),
      count: prev.count + 1,
    })
  }

  let maxMinutes = 0
  let totalMinutes = 0
  let activeDaysCount = 0

  const rawBars = buckets.map((bucket) => {
    const entry = minsByDate.get(bucket.dateStr) || { minutes: 0, count: 0 }
    if (entry.minutes > maxMinutes) maxMinutes = entry.minutes
    totalMinutes += entry.minutes
    if (entry.minutes > 0 || entry.count > 0) activeDaysCount += 1
    return {
      ...bucket,
      minutes: entry.minutes,
      sessionsCount: entry.count,
    }
  })

  const bars: FocusActivityBarItem[] = rawBars.map((bar) => ({
    ...bar,
    heightPercent:
      bar.minutes <= 0 || maxMinutes <= 0
        ? 0
        : Math.max(10, Math.round((bar.minutes / maxMinutes) * 100)),
  }))

  return {
    period,
    bars,
    totalMinutes,
    maxMinutes,
    activeDaysCount,
  }
}

/**
 * Computes habit consistency percentage aligned with habitStore.weeklyConsistencyPercent:
 * - Only active habits are counted (inactive habits never dilute consistency).
 * - Scheduled weekly rest days with 0 completions are excluded (never penalized as failures).
 * - Completing habits on a rest day still counts positively.
 * - Broken streaks apply zero penalty.
 */
export function computeHabitConsistency(params: {
  activeHabits: Habit[]
  completions: HabitCompletion[]
  weeklyRestDay: number
  period: ProgressPeriod
  refDate?: Date
}): HabitConsistencyResult {
  const {
    activeHabits,
    completions,
    weeklyRestDay,
    period,
    refDate = new Date(),
  } = params

  const trulyActive = activeHabits.filter((h) => h.active)
  const activeIds = new Set(trulyActive.map((h) => h.id))
  const totalActive = activeIds.size
  const { buckets } = getPeriodRangeDates(period, refDate)

  if (totalActive === 0) {
    return {
      consistencyPercent: 0,
      plannedDaysCount: buckets.filter((b) => b.dayOfWeek !== weeklyRestDay)
        .length,
      restDaysExcludedCount: buckets.filter(
        (b) => b.dayOfWeek === weeklyRestDay
      ).length,
      activeHabitsCount: 0,
    }
  }

  let plannedDaysCount = 0
  let restDaysExcludedCount = 0
  let rateSum = 0

  for (const bucket of buckets) {
    const completedUniqueIds = new Set<string>()
    for (const c of completions) {
      if (c.date === bucket.dateStr && activeIds.has(c.habitId)) {
        completedUniqueIds.add(c.habitId)
      }
    }

    const completedCount = completedUniqueIds.size
    const isRestDay = bucket.dayOfWeek === weeklyRestDay

    if (isRestDay && completedCount === 0) {
      restDaysExcludedCount += 1
      continue
    }

    plannedDaysCount += 1
    const ratePercent = Math.min(
      100,
      Math.round((completedCount / totalActive) * 100)
    )
    rateSum += ratePercent
  }

  const consistencyPercent =
    plannedDaysCount > 0 ? Math.round(rateSum / plannedDaysCount) : 0

  return {
    consistencyPercent,
    plannedDaysCount,
    restDaysExcludedCount,
    activeHabitsCount: totalActive,
  }
}

/**
 * Counts topic statuses using the single source of truth from learningTrackerService.ts
 * so legacy 'understood', 'proficient', and 'mastered' all count as Completed.
 */
export function computeCompletedTopicsSummary(
  topics: LearningTopic[]
): CompletedTopicsSummary {
  let completedTopics = 0
  let learningTopics = 0
  let notStartedTopics = 0

  for (const topic of topics) {
    const uiStatus = mapTopicStatusToUi(topic.status)
    if (uiStatus === 'completed') completedTopics += 1
    else if (uiStatus === 'learning') learningTopics += 1
    else notStartedTopics += 1
  }

  const totalTopics = topics.length
  const completionPercent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  return {
    totalTopics,
    completedTopics,
    learningTopics,
    notStartedTopics,
    completionPercent,
  }
}

/**
 * Computes completion progress (completed topics / total topics) for the 7 UTBK subtests
 * strictly via learningTrackerService.ts (never overallMasteryStats or raw 'mastered' checks).
 */
export function computeSubtestCompletionBreakdown(
  subtests: SubtestCategory[],
  topics: LearningTopic[]
): SubtestCompletionItem[] {
  const sorted = subtests.slice().sort((a, b) => a.order - b.order)

  return sorted.map((sub) => {
    const subTopics = topics.filter((t) => t.subtestId === sub.id)
    const totalTopics = subTopics.length
    let completedTopics = 0
    let inProgressTopics = 0

    for (const topic of subTopics) {
      if (isTopicCompletedStatus(topic.status)) {
        completedTopics += 1
      } else if (mapTopicStatusToUi(topic.status) === 'learning') {
        inProgressTopics += 1
      }
    }

    const completionPercent =
      totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

    return {
      subtestId: sub.id,
      code: sub.code,
      nameId: sub.nameId,
      nameEn: sub.nameEn,
      totalTopics,
      completedTopics,
      inProgressTopics,
      completionPercent,
    }
  })
}

/**
 * Builds a deduplicated, newest-first learning activity feed combining:
 * 1. Completed focus sessions (excludes running, paused, cancelled, breaks)
 * 2. Topics marked completed (with timestamp)
 * 3. Topics actively being learned (with timestamp)
 * Never includes XPTransaction rows to prevent duplicate activity noise.
 */
export function buildLearningActivityHistory(params: {
  sessions: StudySession[]
  topics: LearningTopic[]
  subtests: SubtestCategory[]
  filter: ProgressHistoryFilter
  refDate?: Date
}): LearningActivityItem[] {
  const {
    sessions,
    topics,
    subtests,
    filter,
    refDate = new Date(),
  } = params

  const todayStr = getLocalDateString(refDate)
  const { startDateStr: weekStartStr } = getPeriodRangeDates('week', refDate)

  const subtestCodeById = new Map(subtests.map((s) => [s.id, s.code]))
  const topicById = new Map(topics.map((t) => [t.id, t]))

  const items: LearningActivityItem[] = []
  const seenIds = new Set<string>()

  // 1. Completed Focus Sessions
  const uniqueCompletedSessions = dedupeCompletedFocusSessions(sessions)
  for (const session of uniqueCompletedSessions) {
    const itemId = `focus_${session.id}`
    if (seenIds.has(itemId)) continue

    const tsIso = session.endTime || session.startTime
    const tsDate = new Date(tsIso)
    if (Number.isNaN(tsDate.getTime())) continue

    const localDate = getLocalDateString(new Date(session.startTime))
    const matchedTopic = session.topicId
      ? topicById.get(session.topicId) ||
        topics.find(
          (t) =>
            t.title === session.topicId &&
            (!session.subjectId || t.subtestId === session.subjectId)
        )
      : undefined

    seenIds.add(itemId)
    items.push({
      id: itemId,
      kind: 'focus_session',
      timestamp: tsIso,
      timestampMs: tsDate.getTime(),
      localDate,
      subjectId: session.subjectId || matchedTopic?.subtestId || '',
      subtestCode:
        subtestCodeById.get(session.subjectId) ||
        (matchedTopic ? subtestCodeById.get(matchedTopic.subtestId) || '' : ''),
      topicId: matchedTopic?.id || '',
      topicTitle: matchedTopic?.title || (session.topicId || '').trim(),
      durationMinutes: Math.max(0, Number(session.durationMinutes) || 0),
    })
  }

  // 2. Learning Topic Milestones (Completed or Started Learning with real timestamp)
  for (const topic of topics) {
    const uiStatus = mapTopicStatusToUi(topic.status)
    if (uiStatus === 'not_started') continue

    const rawTs =
      uiStatus === 'completed'
        ? topic.completedAt || topic.statusUpdatedAt || topic.lastStudiedAt
        : topic.statusUpdatedAt || topic.lastStudiedAt

    if (!rawTs) continue
    const tsDate = new Date(rawTs)
    if (Number.isNaN(tsDate.getTime())) continue

    const kind: LearningActivityKind =
      uiStatus === 'completed' ? 'topic_completed' : 'topic_learning'
    const itemId = `${kind}_${topic.id}`
    if (seenIds.has(itemId)) continue

    seenIds.add(itemId)
    items.push({
      id: itemId,
      kind,
      timestamp: rawTs,
      timestampMs: tsDate.getTime(),
      localDate: getLocalDateString(tsDate),
      subjectId: topic.subtestId,
      subtestCode: subtestCodeById.get(topic.subtestId) || '',
      topicId: topic.id,
      topicTitle: topic.title,
      durationMinutes: null,
    })
  }

  const filtered = items.filter((item) => {
    if (filter === 'today') return item.localDate === todayStr
    if (filter === 'week') {
      return item.localDate >= weekStartStr && item.localDate <= todayStr
    }
    return true
  })

  return filtered.sort(
    (a, b) => b.timestampMs - a.timestampMs || a.id.localeCompare(b.id)
  )
}

/**
 * Formats integer focus minutes into concise human-readable duration.
 */
export function formatFocusDuration(
  totalMinutes: number,
  locale: 'id' | 'en' = 'id'
): string {
  const safe = Math.max(0, Math.floor(Number(totalMinutes) || 0))
  if (safe < 60) {
    return locale === 'id' ? `${safe} mnt` : `${safe}m`
  }
  const hours = Math.floor(safe / 60)
  const mins = safe % 60
  if (mins === 0) {
    return locale === 'id' ? `${hours} jam` : `${hours}h`
  }
  return locale === 'id' ? `${hours}j ${mins}m` : `${hours}h ${mins}m`
}
