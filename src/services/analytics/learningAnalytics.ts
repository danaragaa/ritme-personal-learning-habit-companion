import { getLocalDateString, parseLocalDateString } from '@/utils/date'
import type { SmartReviewQueueItem } from '@/services/learning/masteryEngine'
import type {
  BossChallengeAttempt,
  LearningTopic,
  MistakeErrorCategory,
  MistakeNote,
  MockTestRecord,
  QuestionAttempt,
  SubtestCategory,
  TopicStatus,
} from '@/types'

export interface MockTestHistoryEntry {
  record: MockTestRecord
  deltaFromPrev: number | null
  accuracyPercent: number
}

export interface MockTestSubtestPerf {
  subtestId: string
  code: string
  nameId: string
  nameEn: string
  latestScore: number
  averageScore: number
  attemptsCount: number
  deltaFromPrev: number | null
}

export interface MockTestAnalyticsReport {
  count: number
  latestScore: number
  highestScore: number
  averageScore: number
  trendDelta: number
  targetMockScore: number
  latestDeltaFromTarget: number | null
  chronologicalPoints: MockTestHistoryEntry[]
  reverseHistory: MockTestHistoryEntry[]
  subtestPerformance: MockTestSubtestPerf[]
  weakestSubtest: MockTestSubtestPerf | null
}

export interface MasteryDistribution {
  totalTopics: number
  masteredCount: number
  proficientCount: number
  practicingCount: number
  needsReviewCount: number
  learningCount: number
  notStartedCount: number
}

export interface TopicAccuracySummary {
  topicId: string
  subtestId: string
  subtestCode: string
  title: string
  status: TopicStatus
  attemptedCount: number
  correctCount: number
  accuracyPercent: number
  unresolvedMistakes: number
}

export interface MistakeCategoryStat {
  category: MistakeErrorCategory
  count: number
  unresolvedCount: number
  resolvedCount: number
  percentOfTotal: number
}

export interface LearningAnalyticsReport {
  overallAttempts: number
  overallCorrect: number
  overallAccuracyPercent: number
  weeklyAttempts: number
  weeklyCorrect: number
  weeklyAccuracyPercent: number
  masteryDistribution: MasteryDistribution
  weakTopics: TopicAccuracySummary[]
  reviewedTopicsCount: number
  avgReviewAccuracy: number | null
  overdueReviewsCount: number
  dueTodayReviewsCount: number
  totalMistakes: number
  resolvedMistakes: number
  unresolvedMistakes: number
  mistakeResolutionRate: number
  mistakeCategoryBreakdown: MistakeCategoryStat[]
  topErrorCategory: MistakeCategoryStat | null
  totalBossAttempts: number
  passedBossCount: number
  bossPassRatePercent: number
  bestBossAccuracy: number
  questSummary: {
    dailyDone: number
    dailyTotal: number
    weeklyDone: number
    weeklyTotal: number
    mainSideDone: number
    mainSideTotal: number
    customDone: number
    customTotal: number
    overallDone: number
    overallTotal: number
    overallPercent: number
  }
}

const ALL_ERROR_CATEGORIES: MistakeErrorCategory[] = [
  'concept_not_understood',
  'misread_question',
  'calculation_error',
  'logic_error',
  'careless_mistake',
  'time_pressure',
  'unknown',
]

export function buildMockTestAnalytics(
  mockTests: MockTestRecord[],
  subtests: SubtestCategory[],
  rawTargetScore = 700
): MockTestAnalyticsReport {
  const targetMockScore = Math.max(
    100,
    Math.min(1000, Math.round(Number(rawTargetScore) || 700))
  )

  const sortedAsc = mockTests
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

  const chronologicalPoints: MockTestHistoryEntry[] = sortedAsc.map(
    (record, idx) => {
      const prev = idx > 0 ? sortedAsc[idx - 1] : null
      const denom =
        record.attemptedQuestions > 0
          ? record.attemptedQuestions
          : Math.max(1, record.totalQuestions)
      const accuracyPercent = Math.min(
        100,
        Math.round((record.correctAnswers / denom) * 100)
      )
      return {
        record,
        deltaFromPrev: prev ? record.overallScore - prev.overallScore : null,
        accuracyPercent,
      }
    }
  )

  const count = chronologicalPoints.length
  const latestPoint = count > 0 ? chronologicalPoints[count - 1] : null
  const highestScore = chronologicalPoints.reduce(
    (max, item) => Math.max(max, item.record.overallScore),
    0
  )
  const totalScore = chronologicalPoints.reduce(
    (acc, item) => acc + item.record.overallScore,
    0
  )
  const averageScore = count > 0 ? Math.round(totalScore / count) : 0
  const latestScore = latestPoint ? latestPoint.record.overallScore : 0
  const trendDelta = latestPoint?.deltaFromPrev ?? 0
  const latestDeltaFromTarget = latestPoint
    ? latestScore - targetMockScore
    : null

  // Per-subtest breakdown across chronological mock tests
  const subtestPerformance: MockTestSubtestPerf[] = []
  for (const sub of subtests) {
    const scores: number[] = []
    for (const entry of chronologicalPoints) {
      const val = entry.record.subtestScores?.[sub.id]
      if (typeof val === 'number' && !Number.isNaN(val) && val > 0) {
        scores.push(Math.max(0, Math.min(1000, Math.round(val))))
      }
    }
    if (scores.length > 0) {
      const sum = scores.reduce((a, b) => a + b, 0)
      const latestSub = scores[scores.length - 1]
      const prevSub = scores.length >= 2 ? scores[scores.length - 2] : null
      subtestPerformance.push({
        subtestId: sub.id,
        code: sub.code,
        nameId: sub.nameId,
        nameEn: sub.nameEn,
        latestScore: latestSub,
        averageScore: Math.round(sum / scores.length),
        attemptsCount: scores.length,
        deltaFromPrev: prevSub !== null ? latestSub - prevSub : null,
      })
    }
  }

  const weakestSubtest =
    subtestPerformance.length > 0
      ? subtestPerformance
          .slice()
          .sort((a, b) => a.averageScore - b.averageScore)[0]
      : null

  return {
    count,
    latestScore,
    highestScore,
    averageScore,
    trendDelta,
    targetMockScore,
    latestDeltaFromTarget,
    chronologicalPoints,
    reverseHistory: chronologicalPoints.slice().reverse(),
    subtestPerformance,
    weakestSubtest,
  }
}

export function buildLearningAnalyticsReport(params: {
  topics: LearningTopic[]
  subtests: SubtestCategory[]
  questionAttempts: QuestionAttempt[]
  mistakeNotes: MistakeNote[]
  bossAttempts: BossChallengeAttempt[]
  smartReviewQueue: SmartReviewQueueItem[]
  questCounts: {
    dailyDone: number
    dailyTotal: number
    weeklyDone: number
    weeklyTotal: number
    mainSideDone: number
    mainSideTotal: number
    customDone: number
    customTotal: number
  }
  todayLocalDate?: string
}): LearningAnalyticsReport {
  const {
    topics,
    subtests,
    questionAttempts,
    mistakeNotes,
    bossAttempts,
    smartReviewQueue,
    questCounts,
    todayLocalDate = getLocalDateString(),
  } = params

  // Local 7-day window inclusive of today
  const cutoffDate = parseLocalDateString(todayLocalDate)
  cutoffDate.setDate(cutoffDate.getDate() - 6)
  const weekStartStr = getLocalDateString(cutoffDate)

  const overallAttempts = questionAttempts.length
  const overallCorrect = questionAttempts.filter((a) => a.isCorrect).length
  const overallAccuracyPercent =
    overallAttempts > 0
      ? Math.round((overallCorrect / overallAttempts) * 100)
      : 0

  const weeklyAttemptRows = questionAttempts.filter((a) => {
    const attemptLocalDate = getLocalDateString(new Date(a.attemptedAt))
    return attemptLocalDate >= weekStartStr && attemptLocalDate <= todayLocalDate
  })
  const weeklyAttempts = weeklyAttemptRows.length
  const weeklyCorrect = weeklyAttemptRows.filter((a) => a.isCorrect).length
  const weeklyAccuracyPercent =
    weeklyAttempts > 0 ? Math.round((weeklyCorrect / weeklyAttempts) * 100) : 0

  // Mastery distribution
  let masteredCount = 0
  let proficientCount = 0
  let practicingCount = 0
  let needsReviewCount = 0
  let learningCount = 0
  let notStartedCount = 0

  for (const t of topics) {
    if (t.status === 'mastered') masteredCount += 1
    else if (t.status === 'proficient' || t.status === 'understood')
      proficientCount += 1
    else if (t.status === 'practicing') practicingCount += 1
    else if (t.status === 'needs_review') needsReviewCount += 1
    else if (t.status === 'learning') learningCount += 1
    else notStartedCount += 1
  }

  // Unresolved mistakes by topic
  const unresolvedByTopic = new Map<string, number>()
  for (const m of mistakeNotes) {
    if (!m.resolved) {
      unresolvedByTopic.set(
        m.topicId,
        (unresolvedByTopic.get(m.topicId) || 0) + 1
      )
    }
  }

  const subtestCodeById = new Map(subtests.map((s) => [s.id, s.code]))
  const topicAccuracySummaries: TopicAccuracySummary[] = topics
    .filter(
      (t) =>
        t.correctCount + t.incorrectCount > 0 ||
        (unresolvedByTopic.get(t.id) || 0) > 0 ||
        t.status === 'needs_review'
    )
    .map((t) => {
      const attempted = t.correctCount + t.incorrectCount
      const accuracyPercent =
        attempted > 0 ? Math.round((t.correctCount / attempted) * 100) : 0
      return {
        topicId: t.id,
        subtestId: t.subtestId,
        subtestCode: subtestCodeById.get(t.subtestId) || 'UTBK',
        title: t.title,
        status: t.status,
        attemptedCount: attempted,
        correctCount: t.correctCount,
        accuracyPercent,
        unresolvedMistakes: unresolvedByTopic.get(t.id) || 0,
      }
    })

  const weakTopics = topicAccuracySummaries
    .filter(
      (item) =>
        (item.attemptedCount > 0 && item.accuracyPercent < 75) ||
        item.unresolvedMistakes > 0 ||
        item.status === 'needs_review'
    )
    .sort((a, b) => {
      if (b.unresolvedMistakes !== a.unresolvedMistakes) {
        return b.unresolvedMistakes - a.unresolvedMistakes
      }
      if (a.attemptedCount > 0 && b.attemptedCount > 0) {
        return a.accuracyPercent - b.accuracyPercent
      }
      return b.attemptedCount - a.attemptedCount
    })
    .slice(0, 4)

  // Review completion & health
  const reviewedTopics = topics.filter(
    (t) => (t.reviewCount || 0) > 0 || Boolean(t.lastReviewedAt)
  )
  const accuracySamples = topics
    .map((t) => t.lastReviewAccuracy)
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  const avgReviewAccuracy =
    accuracySamples.length > 0
      ? Math.round(
          accuracySamples.reduce((a, b) => a + b, 0) / accuracySamples.length
        )
      : null
  const overdueReviewsCount = smartReviewQueue.filter(
    (q) => q.reasonKey === 'learning.reviewReason.overdue'
  ).length
  const dueTodayReviewsCount = smartReviewQueue.filter(
    (q) =>
      q.topic.reviewSchedule && q.topic.reviewSchedule <= todayLocalDate
  ).length

  // Mistake recurrence & breakdown
  const totalMistakes = mistakeNotes.length
  const resolvedMistakes = mistakeNotes.filter((m) => m.resolved).length
  const unresolvedMistakes = totalMistakes - resolvedMistakes
  const mistakeResolutionRate =
    totalMistakes > 0
      ? Math.round((resolvedMistakes / totalMistakes) * 100)
      : 0

  const mistakeCategoryBreakdown: MistakeCategoryStat[] = ALL_ERROR_CATEGORIES.map(
    (cat) => {
      const matching = mistakeNotes.filter((m) => m.errorCategory === cat)
      const count = matching.length
      const resolvedCount = matching.filter((m) => m.resolved).length
      const unresolvedCount = count - resolvedCount
      return {
        category: cat,
        count,
        unresolvedCount,
        resolvedCount,
        percentOfTotal:
          totalMistakes > 0 ? Math.round((count / totalMistakes) * 100) : 0,
      }
    }
  )
    .filter((stat) => stat.count > 0)
    .sort((a, b) => b.count - a.count)

  // Boss challenge summary
  const totalBossAttempts = bossAttempts.length
  const passedBossCount = bossAttempts.filter((b) => b.passed).length
  const bossPassRatePercent =
    totalBossAttempts > 0
      ? Math.round((passedBossCount / totalBossAttempts) * 100)
      : 0
  const bestBossAccuracy = bossAttempts.reduce(
    (max, item) => Math.max(max, item.accuracyPercent),
    0
  )

  const overallDone =
    questCounts.dailyDone +
    questCounts.weeklyDone +
    questCounts.mainSideDone +
    questCounts.customDone
  const overallTotal =
    questCounts.dailyTotal +
    questCounts.weeklyTotal +
    questCounts.mainSideTotal +
    questCounts.customTotal
  const overallPercent =
    overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0

  return {
    overallAttempts,
    overallCorrect,
    overallAccuracyPercent,
    weeklyAttempts,
    weeklyCorrect,
    weeklyAccuracyPercent,
    masteryDistribution: {
      totalTopics: topics.length,
      masteredCount,
      proficientCount,
      practicingCount,
      needsReviewCount,
      learningCount,
      notStartedCount,
    },
    weakTopics,
    reviewedTopicsCount: reviewedTopics.length,
    avgReviewAccuracy,
    overdueReviewsCount,
    dueTodayReviewsCount,
    totalMistakes,
    resolvedMistakes,
    unresolvedMistakes,
    mistakeResolutionRate,
    mistakeCategoryBreakdown,
    topErrorCategory: mistakeCategoryBreakdown[0] || null,
    totalBossAttempts,
    passedBossCount,
    bossPassRatePercent,
    bestBossAccuracy,
    questSummary: {
      ...questCounts,
      overallDone,
      overallTotal,
      overallPercent,
    },
  }
}
