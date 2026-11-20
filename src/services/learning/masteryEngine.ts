import { getLocalDateString, parseLocalDateString } from '@/utils/date'
import type {
  LearningTopic,
  MistakeNote,
  SubtestCategory,
  TopicStatus,
} from '@/types'

export interface MasteryCriteriaConfig {
  minQuestionsForProficient: number
  proficientAccuracyPercent: number
  minQuestionsForMastered: number
  masteredAccuracyPercent: number
  minReviewsForMastered: number
  lowAccuracyThresholdPercent: number
  staleDaysBeforeReview: number
}

export const DEFAULT_MASTERY_CRITERIA: MasteryCriteriaConfig = {
  minQuestionsForProficient: 2,
  proficientAccuracyPercent: 70,
  minQuestionsForMastered: 3,
  masteredAccuracyPercent: 85,
  minReviewsForMastered: 1,
  lowAccuracyThresholdPercent: 60,
  staleDaysBeforeReview: 14,
}

export interface MasteryEvaluationResult {
  status: TopicStatus
  reasonKey: string
  reasonParams: Record<string, string | number>
}

export interface SmartReviewQueueItem {
  topic: LearningTopic
  subtestCode: string
  accuracy: number
  intervalDays: number
  reviewCount: number
  lastReviewedAt: string | null
  priorityRank: number
  reasonKey: string
  reasonParams: Record<string, string | number>
}

function daysBetweenLocalDates(olderIsoOrDate: string, todayStr: string): number {
  const older = /^\d{4}-\d{2}-\d{2}$/.test(olderIsoOrDate.trim())
    ? parseLocalDateString(olderIsoOrDate)
    : new Date(olderIsoOrDate)
  const today = parseLocalDateString(todayStr)
  if (Number.isNaN(older.getTime()) || Number.isNaN(today.getTime())) return 0
  const diffMs = today.getTime() - older.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

/**
 * Computes Topic Mastery deterministically from learning evidence (attempts, accuracy, reviews, freshness).
 * PRD 3.0 Section 9.7: Mastery is derived from learning data, can regress if stale/weak, and explains why.
 */
export function evaluateTopicMasteryState(params: {
  topic: LearningTopic
  unresolvedMistakesCount: number
  todayStr?: string
  config?: MasteryCriteriaConfig
}): MasteryEvaluationResult {
  const {
    topic,
    unresolvedMistakesCount,
    todayStr = getLocalDateString(),
    config = DEFAULT_MASTERY_CRITERIA,
  } = params

  const totalAnswered = Math.max(0, topic.correctCount + topic.incorrectCount)
  const accuracy =
    totalAnswered > 0 ? Math.round((topic.correctCount / totalAnswered) * 100) : 0
  const reviewCount = topic.reviewCount || 0
  const lastActivityRef = topic.lastReviewedAt || topic.lastStudiedAt
  const daysSinceActivity = lastActivityRef
    ? daysBetweenLocalDates(lastActivityRef, todayStr)
    : 0
  const isReviewOverdue = Boolean(
    topic.reviewSchedule && topic.reviewSchedule < todayStr
  )

  if (unresolvedMistakesCount > 0) {
    return {
      status: 'needs_review',
      reasonKey: 'learning.masteryReason.unresolvedMistakes',
      reasonParams: { count: unresolvedMistakesCount },
    }
  }

  if (
    topic.lastReviewAccuracy !== undefined &&
    topic.lastReviewAccuracy !== null &&
    topic.lastReviewAccuracy < config.lowAccuracyThresholdPercent
  ) {
    return {
      status: 'needs_review',
      reasonKey: 'learning.masteryReason.lowReviewAccuracy',
      reasonParams: { accuracy: topic.lastReviewAccuracy },
    }
  }

  if (totalAnswered >= 2 && accuracy < config.lowAccuracyThresholdPercent) {
    return {
      status: 'needs_review',
      reasonKey: 'learning.masteryReason.lowPracticeAccuracy',
      reasonParams: {
        accuracy,
        threshold: config.lowAccuracyThresholdPercent,
      },
    }
  }

  if ((totalAnswered > 0 || reviewCount > 0) && isReviewOverdue && topic.reviewSchedule) {
    return {
      status: 'needs_review',
      reasonKey: 'learning.masteryReason.reviewOverdue',
      reasonParams: { date: topic.reviewSchedule },
    }
  }

  if (
    (topic.status === 'mastered' ||
      topic.status === 'proficient' ||
      topic.status === 'understood') &&
    daysSinceActivity >= config.staleDaysBeforeReview
  ) {
    return {
      status: 'needs_review',
      reasonKey: 'learning.masteryReason.staleEvidence',
      reasonParams: { days: daysSinceActivity },
    }
  }

  if (
    totalAnswered >= config.minQuestionsForMastered &&
    accuracy >= config.masteredAccuracyPercent &&
    reviewCount >= config.minReviewsForMastered
  ) {
    return {
      status: 'mastered',
      reasonKey: 'learning.masteryReason.masteredMet',
      reasonParams: {
        accuracy,
        count: totalAnswered,
        reviews: reviewCount,
      },
    }
  }

  if (
    totalAnswered >= config.minQuestionsForProficient &&
    accuracy >= config.proficientAccuracyPercent
  ) {
    return {
      status: 'proficient',
      reasonKey: 'learning.masteryReason.proficientMet',
      reasonParams: {
        accuracy,
        count: totalAnswered,
        reviewsNeeded: Math.max(0, config.minReviewsForMastered - reviewCount),
      },
    }
  }

  if (totalAnswered >= 1) {
    return {
      status: 'practicing',
      reasonKey: 'learning.masteryReason.practicing',
      reasonParams: {
        accuracy,
        count: totalAnswered,
        minProficient: config.minQuestionsForProficient,
      },
    }
  }

  if (topic.status !== 'not_started') {
    return {
      status: 'learning',
      reasonKey: 'learning.masteryReason.learningNoPractice',
      reasonParams: {},
    }
  }

  return {
    status: 'not_started',
    reasonKey: 'learning.masteryReason.notStarted',
    reasonParams: {},
  }
}

/**
 * Builds the prioritized Smart Review Queue (PRD 3.0 Section 10.4):
 * 1. Overdue reviews
 * 2. Low review result / unresolved mistakes
 * 3. Low practice accuracy (< 65%)
 * 4. Due today or marked needs_review
 * 5. Practiced but never reviewed yet
 */
export function buildSmartReviewQueue(params: {
  topics: LearningTopic[]
  mistakeNotes: MistakeNote[]
  subtests: SubtestCategory[]
  todayStr?: string
}): SmartReviewQueueItem[] {
  const { topics, mistakeNotes, subtests, todayStr = getLocalDateString() } = params
  const subtestMap = new Map(subtests.map((s) => [s.id, s]))

  const unresolvedByTopic = new Map<string, number>()
  for (const note of mistakeNotes) {
    if (!note.resolved) {
      unresolvedByTopic.set(
        note.topicId,
        (unresolvedByTopic.get(note.topicId) || 0) + 1
      )
    }
  }

  const queue: SmartReviewQueueItem[] = []

  for (const t of topics) {
    const total = t.correctCount + t.incorrectCount
    const accuracy = total > 0 ? Math.round((t.correctCount / total) * 100) : 0
    const reviewCount = t.reviewCount || 0
    const unresolvedCount = unresolvedByTopic.get(t.id) || 0

    let priorityRank: number | null = null
    let reasonKey = ''
    let reasonParams: Record<string, string | number> = {}

    if (t.reviewSchedule && t.reviewSchedule < todayStr) {
      priorityRank = 1
      reasonKey = 'learning.reviewReason.overdue'
      reasonParams = { date: t.reviewSchedule }
    } else if (
      (t.lastReviewAccuracy !== undefined &&
        t.lastReviewAccuracy !== null &&
        t.lastReviewAccuracy < 60) ||
      unresolvedCount > 0
    ) {
      priorityRank = 2
      if (unresolvedCount > 0) {
        reasonKey = 'learning.reviewReason.unresolvedMistakes'
        reasonParams = { count: unresolvedCount }
      } else {
        reasonKey = 'learning.reviewReason.lowReviewResult'
        reasonParams = { accuracy: t.lastReviewAccuracy ?? 0 }
      }
    } else if (total >= 2 && accuracy < 65) {
      priorityRank = 3
      reasonKey = 'learning.reviewReason.lowAccuracy'
      reasonParams = { accuracy }
    } else if (
      t.status === 'needs_review' ||
      (t.reviewSchedule && t.reviewSchedule <= todayStr)
    ) {
      priorityRank = 4
      reasonKey = t.reviewSchedule
        ? 'learning.reviewReason.dueToday'
        : 'learning.reviewReason.markedNeedsReview'
      reasonParams = t.reviewSchedule ? { date: t.reviewSchedule } : {}
    } else if (total > 0 && reviewCount === 0 && t.status !== 'mastered') {
      priorityRank = 5
      reasonKey = 'learning.reviewReason.neverReviewed'
      reasonParams = { count: total }
    }

    if (priorityRank !== null) {
      queue.push({
        topic: t,
        subtestCode: subtestMap.get(t.subtestId)?.code || 'UTBK',
        accuracy,
        intervalDays: t.reviewIntervalDays || 1,
        reviewCount,
        lastReviewedAt: t.lastReviewedAt || null,
        priorityRank,
        reasonKey,
        reasonParams,
      })
    }
  }

  return queue.sort((a, b) => {
    if (a.priorityRank !== b.priorityRank) {
      return a.priorityRank - b.priorityRank
    }
    return a.accuracy - b.accuracy
  })
}
