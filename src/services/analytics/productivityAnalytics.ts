import { getLocalDateString } from '@/utils/date'
import type {
  DailyReflection,
  EnergyMode,
  StudySession,
  SubtestCategory,
} from '@/types'

export type TimeWindowKey = 'morning' | 'afternoon' | 'evening' | 'night'

export interface TimeWindowStat {
  key: TimeWindowKey
  minutes: number
  sessionsCount: number
  percent: number
}

export interface LocationStat {
  location: string
  minutes: number
  sessionsCount: number
  avgMinutes: number
}

export interface SubtestTimeDistribution {
  subtestId: string
  code: string
  nameId: string
  nameEn: string
  minutes: number
  sessionsCount: number
  percentOfTotal: number
}

export type RhythmBalanceStatus =
  | 'building_momentum'
  | 'balanced'
  | 'high_load'
  | 'recovery_focus'

export interface WeeklyWorkloadReview {
  greenDays: number
  yellowDays: number
  redDays: number
  avgDailyMinutesLast7: number
  peakDayMinutesLast7: number
  rhythmStatus: RhythmBalanceStatus
}

export interface ProductivityAnalyticsReport {
  timeWindows: TimeWindowStat[]
  bestTimeWindow: TimeWindowKey | null
  locations: LocationStat[]
  subtestDistribution: SubtestTimeDistribution[]
  mostStudiedSubtest: SubtestTimeDistribution | null
  leastStudiedSubtest: SubtestTimeDistribution | null
  workloadReview: WeeklyWorkloadReview
}

export function classifyHourToWindow(hour: number): TimeWindowKey {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

export function computeProductivityAnalytics(params: {
  completedSessions: StudySession[]
  subtests: SubtestCategory[]
  reflections: DailyReflection[]
  currentEnergyMode: EnergyMode
  dailyTargetMinutes: number
}): ProductivityAnalyticsReport {
  const {
    completedSessions,
    subtests,
    reflections,
    currentEnergyMode,
    dailyTargetMinutes,
  } = params

  // 1. Time of Day Windows
  const windowMap: Record<
    TimeWindowKey,
    { minutes: number; sessionsCount: number }
  > = {
    morning: { minutes: 0, sessionsCount: 0 },
    afternoon: { minutes: 0, sessionsCount: 0 },
    evening: { minutes: 0, sessionsCount: 0 },
    night: { minutes: 0, sessionsCount: 0 },
  }

  let totalMinutesAll = 0

  for (const s of completedSessions) {
    const mins = Math.max(0, Number(s.durationMinutes) || 0)
    totalMinutesAll += mins
    const startHour = new Date(s.startTime).getHours()
    const winKey = classifyHourToWindow(startHour)
    windowMap[winKey].minutes += mins
    windowMap[winKey].sessionsCount += 1
  }

  const windowOrder: TimeWindowKey[] = [
    'morning',
    'afternoon',
    'evening',
    'night',
  ]
  const timeWindows: TimeWindowStat[] = windowOrder.map((key) => ({
    key,
    minutes: windowMap[key].minutes,
    sessionsCount: windowMap[key].sessionsCount,
    percent:
      totalMinutesAll > 0
        ? Math.round((windowMap[key].minutes / totalMinutesAll) * 100)
        : 0,
  }))

  let bestTimeWindow: TimeWindowKey | null = null
  let maxWinMins = 0
  for (const w of timeWindows) {
    if (w.minutes > maxWinMins) {
      maxWinMins = w.minutes
      bestTimeWindow = w.key
    }
  }

  // 2. Study Locations
  const locMap = new Map<string, { minutes: number; sessionsCount: number }>()
  for (const s of completedSessions) {
    const locName = (s.location || '').trim() || 'Default'
    const mins = Math.max(0, Number(s.durationMinutes) || 0)
    const prev = locMap.get(locName) || { minutes: 0, sessionsCount: 0 }
    locMap.set(locName, {
      minutes: prev.minutes + mins,
      sessionsCount: prev.sessionsCount + 1,
    })
  }

  const locations: LocationStat[] = Array.from(locMap.entries())
    .map(([location, val]) => ({
      location,
      minutes: val.minutes,
      sessionsCount: val.sessionsCount,
      avgMinutes:
        val.sessionsCount > 0 ? Math.round(val.minutes / val.sessionsCount) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes)

  // 3. Subtest Study Time Distribution
  const subtestMinsMap = new Map<
    string,
    { minutes: number; sessionsCount: number }
  >()
  for (const s of completedSessions) {
    const mins = Math.max(0, Number(s.durationMinutes) || 0)
    const prev = subtestMinsMap.get(s.subjectId) || {
      minutes: 0,
      sessionsCount: 0,
    }
    subtestMinsMap.set(s.subjectId, {
      minutes: prev.minutes + mins,
      sessionsCount: prev.sessionsCount + 1,
    })
  }

  const sortedSubtests = subtests.slice().sort((a, b) => a.order - b.order)
  const subtestDistribution: SubtestTimeDistribution[] = sortedSubtests.map(
    (sub) => {
      const stat = subtestMinsMap.get(sub.id) || {
        minutes: 0,
        sessionsCount: 0,
      }
      return {
        subtestId: sub.id,
        code: sub.code,
        nameId: sub.nameId,
        nameEn: sub.nameEn,
        minutes: stat.minutes,
        sessionsCount: stat.sessionsCount,
        percentOfTotal:
          totalMinutesAll > 0
            ? Math.round((stat.minutes / totalMinutesAll) * 100)
            : 0,
      }
    }
  )

  const byMinutesDesc = subtestDistribution
    .slice()
    .sort((a, b) => b.minutes - a.minutes)
  const mostStudiedSubtest =
    byMinutesDesc.length > 0 && byMinutesDesc[0].minutes > 0
      ? byMinutesDesc[0]
      : null
  const leastStudiedSubtest =
    byMinutesDesc.length > 0
      ? byMinutesDesc[byMinutesDesc.length - 1]
      : null

  // 4. Weekly Workload & Energy Balance Review (Last 7 Days)
  const last7Dates = new Set<string>()
  const dailyMinsLast7 = new Map<string, number>()
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - offset)
    const dStr = getLocalDateString(d)
    last7Dates.add(dStr)
    dailyMinsLast7.set(dStr, 0)
  }

  for (const s of completedSessions) {
    const dStr = getLocalDateString(new Date(s.startTime))
    if (dailyMinsLast7.has(dStr)) {
      dailyMinsLast7.set(
        dStr,
        (dailyMinsLast7.get(dStr) || 0) +
          Math.max(0, Number(s.durationMinutes) || 0)
      )
    }
  }

  const energyByDate = new Map<string, EnergyMode>()
  for (const r of reflections) {
    if (last7Dates.has(r.date)) {
      energyByDate.set(r.date, r.energyMode)
    }
  }
  const todayStr = getLocalDateString()
  if (!energyByDate.has(todayStr)) {
    energyByDate.set(todayStr, currentEnergyMode)
  }

  let greenDays = 0
  let yellowDays = 0
  let redDays = 0
  for (const mode of energyByDate.values()) {
    if (mode === 'green') greenDays++
    else if (mode === 'yellow') yellowDays++
    else if (mode === 'red') redDays++
  }

  const minsArray = Array.from(dailyMinsLast7.values())
  const totalLast7 = minsArray.reduce((a, b) => a + b, 0)
  const avgDailyMinutesLast7 = Math.round(totalLast7 / 7)
  const peakDayMinutesLast7 = minsArray.reduce((m, v) => Math.max(m, v), 0)

  let rhythmStatus: RhythmBalanceStatus = 'building_momentum'
  if (redDays >= 3 || yellowDays >= 4) {
    rhythmStatus = 'recovery_focus'
  } else if (
    peakDayMinutesLast7 > Math.max(240, dailyTargetMinutes * 1.35)
  ) {
    rhythmStatus = 'high_load'
  } else if (totalLast7 >= 60) {
    rhythmStatus = 'balanced'
  }

  return {
    timeWindows,
    bestTimeWindow,
    locations,
    subtestDistribution,
    mostStudiedSubtest,
    leastStudiedSubtest,
    workloadReview: {
      greenDays,
      yellowDays,
      redDays,
      avgDailyMinutesLast7,
      peakDayMinutesLast7,
      rhythmStatus,
    },
  }
}
