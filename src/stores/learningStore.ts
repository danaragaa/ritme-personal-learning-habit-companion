import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { db } from '@/services/database/db'
import { getLocalDateString } from '@/utils/date'
import { generateId } from '@/utils/id'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'
import {
  ADVENTURE_REALMS,
  DEFAULT_CHAPTERS_SEED,
  DEFAULT_PRACTICE_QUESTIONS_SEED,
} from '@/services/learning/adventureContentSeed'
import {
  buildSmartReviewQueue,
  DEFAULT_MASTERY_CRITERIA,
  evaluateTopicMasteryState,
  type SmartReviewQueueItem,
} from '@/services/learning/masteryEngine'
import {
  isTopicCompletedStatus,
  mapTopicStatusToUi,
  mapUiStatusToStorage,
  validateExternalUrl,
} from '@/services/learning/learningTrackerService'
import { playBossPassFanfare, playQuestCompleteChime } from '@/services/timer/soundFeedbackService'
import type {
  AdventureChapter,
  BossChallengeAttempt,
  ChapterStatus,
  LearningTopic,
  MistakeErrorCategory,
  MistakeNote,
  MockTestRecord,
  PracticeQuestion,
  QuestionAttempt,
  RealmStatus,
  SubtestCategory,
  TopicStatus,
} from '@/types'

const DIAGNOSTIC_BASELINE_KEY = 'ritme_informal_baseline_21'

export interface InformalDiagnosticBaseline {
  correctCount: number
  totalQuestions: number
  notes: string
  recordedAt: string
}

export const DEFAULT_UTBK_SUBTESTS: SubtestCategory[] = [
  {
    id: 'subtest_pu',
    code: 'PU',
    nameId: 'Penalaran Umum',
    nameEn: 'General Reasoning',
    order: 1,
  },
  {
    id: 'subtest_ppu',
    code: 'PPU',
    nameId: 'Pengetahuan dan Pemahaman Umum',
    nameEn: 'General Knowledge & Understanding',
    order: 2,
  },
  {
    id: 'subtest_pbm',
    code: 'PBM',
    nameId: 'Pemahaman Bacaan dan Menulis',
    nameEn: 'Reading Comprehension & Writing',
    order: 3,
  },
  {
    id: 'subtest_pk',
    code: 'PK',
    nameId: 'Pengetahuan Kuantitatif',
    nameEn: 'Quantitative Knowledge',
    order: 4,
  },
  {
    id: 'subtest_lbi',
    code: 'LBI',
    nameId: 'Literasi Bahasa Indonesia',
    nameEn: 'Indonesian Literacy',
    order: 5,
  },
  {
    id: 'subtest_lbe',
    code: 'LBE',
    nameId: 'Literasi Bahasa Inggris',
    nameEn: 'English Literacy',
    order: 6,
  },
  {
    id: 'subtest_pm',
    code: 'PM',
    nameId: 'Penalaran Matematika',
    nameEn: 'Mathematical Reasoning',
    order: 7,
  },
]

export const DEFAULT_TOPICS_SEED: LearningTopic[] = [
  {
    id: 'topic_pu_1',
    subtestId: 'subtest_pu',
    title: 'Penalaran Induktif & Deduktif',
    description: 'Logika pernyataan, silogisme, dan penarikan kesimpulan',
    status: 'learning',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_pu_2',
    subtestId: 'subtest_pu',
    title: 'Penalaran Kuantitatif & Pola Bilangan',
    description: 'Deret angka, hubungan kuantitatif, dan analisis data tabel/grafik',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_ppu_1',
    subtestId: 'subtest_ppu',
    title: 'Makna Kata, Sinonim & Kepaduan Paragraf',
    description: 'Hubungan makna antarkalimat, gagasan pokok, dan struktur wacana',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_pbm_1',
    subtestId: 'subtest_pbm',
    title: 'Ejaan (EYD V), Tanda Baca & Kalimat Efektif',
    description: 'Penulisan kata baku, konjungsi, dan perbaikan kalimat tidak efektif',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_pk_1',
    subtestId: 'subtest_pk',
    title: 'Aljabar & Aritmetika Dasar',
    description: 'Operasi bilangan, perbandingan, dan persamaan linear',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_pk_2',
    subtestId: 'subtest_pk',
    title: 'Geometri, Fungsi & Peluang Dasar',
    description: 'Sudut, bangun datar/ruang, himpunan, dan kombinatorika dasar',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_lbi_1',
    subtestId: 'subtest_lbi',
    title: 'Ide Pokok & Simpulan Bacaan',
    description: 'Menentukan gagasan utama, fakta/opini, dan informasi tersirat',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_lbe_1',
    subtestId: 'subtest_lbe',
    title: 'Main Idea, Inference & Vocabulary in Context',
    description: 'Memahami inti teks bahasa Inggris, detail informasi, dan rujukan kata',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
  {
    id: 'topic_pm_1',
    subtestId: 'subtest_pm',
    title: 'Pemodelan Matematika Kontekstual',
    description: 'Penerapan konsep matematika, statistika, dan aritmetika sosial dalam soal cerita',
    status: 'not_started',
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  },
]

function addDaysToLocalDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return getLocalDateString(d)
}

export const useLearningStore = defineStore('learning', () => {
  const subtests = ref<SubtestCategory[]>([])
  const topics = ref<LearningTopic[]>([])
  const chapters = ref<AdventureChapter[]>([])
  const questions = ref<PracticeQuestion[]>([])
  const questionAttempts = ref<QuestionAttempt[]>([])
  const mistakeNotes = ref<MistakeNote[]>([])
  const bossAttempts = ref<BossChallengeAttempt[]>([])
  const mockTests = ref<MockTestRecord[]>([])
  const diagnosticBaseline = ref<InformalDiagnosticBaseline | null>(null)
  const isLoaded = ref(false)
  let initPromise: Promise<void> | null = null

  async function initLearningStore(force = false): Promise<void> {
    if (force) {
      isLoaded.value = false
      initPromise = null
      subtests.value = []
      topics.value = []
      chapters.value = []
      questions.value = []
      questionAttempts.value = []
      mistakeNotes.value = []
      bossAttempts.value = []
      mockTests.value = []
      diagnosticBaseline.value = null
    }
    if (isLoaded.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const storedSubtests = await db.subtestCategories.orderBy('order').toArray()
        if (storedSubtests.length === 0) {
          await db.subtestCategories.bulkPut(DEFAULT_UTBK_SUBTESTS)
          subtests.value = [...DEFAULT_UTBK_SUBTESTS]
        } else {
          subtests.value = storedSubtests
        }

        const storedTopics = await db.learningTopics.toArray()
        if (storedTopics.length === 0) {
          await db.learningTopics.bulkPut(DEFAULT_TOPICS_SEED)
          topics.value = [...DEFAULT_TOPICS_SEED]
        } else {
          const existingIds = new Set(storedTopics.map((t) => t.id))
          const subtestsWithTopics = new Set(storedTopics.map((t) => t.subtestId))
          const missingDefaults = DEFAULT_TOPICS_SEED.filter(
            (seed) =>
              !existingIds.has(seed.id) && !subtestsWithTopics.has(seed.subtestId)
          )
          if (missingDefaults.length > 0) {
            await db.learningTopics.bulkPut(missingDefaults)
            topics.value = [...storedTopics, ...missingDefaults]
          } else {
            topics.value = storedTopics
          }
        }

        // Seed PRD 3.0 Chapters (syncing localized seed copy while preserving status)
        const storedChapters = await db.chapters.orderBy('order').toArray()
        if (storedChapters.length === 0) {
          await db.chapters.bulkPut(DEFAULT_CHAPTERS_SEED)
          chapters.value = [...DEFAULT_CHAPTERS_SEED]
        } else {
          const seedById = new Map(DEFAULT_CHAPTERS_SEED.map((s) => [s.id, s]))
          const existingChapIds = new Set(storedChapters.map((c) => c.id))
          const syncedChapters: AdventureChapter[] = []
          const changedChapters: AdventureChapter[] = []

          for (const storedChap of storedChapters) {
            const seed = seedById.get(storedChap.id)
            if (seed && seed.titleId !== storedChap.titleId) {
              const merged: AdventureChapter = {
                ...seed,
                status: storedChap.status,
              }
              syncedChapters.push(merged)
              changedChapters.push(merged)
            } else {
              syncedChapters.push(storedChap)
            }
          }

          const missingChaps = DEFAULT_CHAPTERS_SEED.filter(
            (c) => !existingChapIds.has(c.id)
          )
          if (changedChapters.length > 0 || missingChaps.length > 0) {
            await db.chapters.bulkPut([...changedChapters, ...missingChaps])
          }
          chapters.value = [...syncedChapters, ...missingChaps]
        }

        // Seed PRD 3.0 Practice Questions
        const storedQuestions = await db.questions.toArray()
        if (storedQuestions.length === 0) {
          await db.questions.bulkPut(DEFAULT_PRACTICE_QUESTIONS_SEED)
          questions.value = [...DEFAULT_PRACTICE_QUESTIONS_SEED]
        } else {
          const existingQIds = new Set(storedQuestions.map((q) => q.id))
          const missingQs = DEFAULT_PRACTICE_QUESTIONS_SEED.filter(
            (q) => !existingQIds.has(q.id)
          )
          if (missingQs.length > 0) {
            await db.questions.bulkPut(missingQs)
            questions.value = [...storedQuestions, ...missingQs]
          } else {
            questions.value = storedQuestions
          }
        }

        const [
          storedAttempts,
          storedMistakes,
          storedBossAttempts,
          storedMockTests,
          baselinePref,
        ] = await Promise.all([
          db.questionAttempts.orderBy('attemptedAt').reverse().toArray(),
          db.mistakeNotes.orderBy('dateRecorded').reverse().toArray(),
          db.bossAttempts.orderBy('attemptedAt').reverse().toArray(),
          db.mockTests.orderBy('date').reverse().toArray(),
          Preferences.get({ key: DIAGNOSTIC_BASELINE_KEY }),
        ])

        questionAttempts.value = storedAttempts
        mistakeNotes.value = storedMistakes
        bossAttempts.value = storedBossAttempts
        mockTests.value = storedMockTests

        if (baselinePref.value) {
          diagnosticBaseline.value = JSON.parse(
            baselinePref.value
          ) as InformalDiagnosticBaseline
        }
      } catch (err) {
        console.error('[RITME] Failed to initialize learningStore:', err)
        if (subtests.value.length === 0) {
          subtests.value = [...DEFAULT_UTBK_SUBTESTS]
        }
        if (topics.value.length === 0) {
          topics.value = [...DEFAULT_TOPICS_SEED]
        }
        if (chapters.value.length === 0) {
          chapters.value = [...DEFAULT_CHAPTERS_SEED]
        }
        if (questions.value.length === 0) {
          questions.value = [...DEFAULT_PRACTICE_QUESTIONS_SEED]
        }
      } finally {
        isLoaded.value = true
      }
    })()

    return initPromise
  }

  const sortedSubtests = computed(() =>
    subtests.value.slice().sort((a, b) => a.order - b.order)
  )

  const topicsNeedingReview = computed(() => {
    const today = getLocalDateString()
    return topics.value.filter(
      (t) =>
        t.status === 'needs_review' ||
        (Boolean(t.reviewSchedule) && (t.reviewSchedule as string) <= today)
    )
  })

  const overallMasteryStats = computed(() => {
    const total = topics.value.length
    const mastered = topics.value.filter((t) => t.status === 'mastered').length
    const proficient = topics.value.filter(
      (t) => t.status === 'proficient' || t.status === 'understood'
    ).length
    const practicing = topics.value.filter(
      (t) => t.status === 'practicing'
    ).length
    const needsReview = topics.value.filter((t) => t.status === 'needs_review').length
    const learning = topics.value.filter((t) => t.status === 'learning').length
    const notStarted = topics.value.filter((t) => t.status === 'not_started').length

    const weightedSum =
      mastered * 1 +
      proficient * 0.75 +
      practicing * 0.5 +
      (learning + needsReview) * 0.3
    const progressPercent =
      total > 0 ? Math.min(100, Math.round((weightedSum / total) * 100)) : 0

    return {
      total,
      mastered,
      proficient,
      understood: proficient,
      practicing,
      needsReview,
      learning,
      notStarted,
      progressPercent,
    }
  })

  function getTopicsBySubtest(subtestId: string): LearningTopic[] {
    return topics.value.filter((t) => t.subtestId === subtestId)
  }

  function getSubtestProgress(subtestId: string): {
    total: number
    mastered: number
    understood: number
    proficient: number
    needsReview: number
    percent: number
  } {
    const list = getTopicsBySubtest(subtestId)
    const total = list.length
    if (total === 0) {
      return {
        total: 0,
        mastered: 0,
        understood: 0,
        proficient: 0,
        needsReview: 0,
        percent: 0,
      }
    }
    const mastered = list.filter((t) => t.status === 'mastered').length
    const proficient = list.filter(
      (t) => t.status === 'proficient' || t.status === 'understood'
    ).length
    const practicing = list.filter((t) => t.status === 'practicing').length
    const needsReview = list.filter((t) => t.status === 'needs_review').length
    const learning = list.filter((t) => t.status === 'learning').length
    const weighted =
      mastered * 1 +
      proficient * 0.75 +
      practicing * 0.5 +
      (learning + needsReview) * 0.3
    const percent = Math.min(100, Math.round((weighted / total) * 100))

    return {
      total,
      mastered,
      understood: proficient,
      proficient,
      needsReview,
      percent,
    }
  }

  function getSubtestById(subtestId: string): SubtestCategory | undefined {
    return subtests.value.find((s) => s.id === subtestId)
  }

  function getTopicById(topicId: string): LearningTopic | undefined {
    return topics.value.find((t) => t.id === topicId)
  }

  function countUnresolvedMistakesForTopic(
    topicId: string,
    overrideList?: MistakeNote[]
  ): number {
    const list = overrideList ?? mistakeNotes.value
    return list.filter((m) => m.topicId === topicId && !m.resolved).length
  }

  function computeEvaluatedTopicUpdate(
    baseTopic: LearningTopic,
    overrideMistakes?: MistakeNote[]
  ): LearningTopic {
    const unresolvedCount = countUnresolvedMistakesForTopic(
      baseTopic.id,
      overrideMistakes
    )
    const evaluation = evaluateTopicMasteryState({
      topic: baseTopic,
      unresolvedMistakesCount: unresolvedCount,
      config: DEFAULT_MASTERY_CRITERIA,
    })

    // Preserve legacy v2.0 manual 'understood'/'mastered' ONLY if zero evidence recorded yet and not overdue/mistaken
    const totalEvidence =
      baseTopic.correctCount +
      baseTopic.incorrectCount +
      (baseTopic.reviewCount || 0)
    const keepLegacy =
      totalEvidence === 0 &&
      unresolvedCount === 0 &&
      (baseTopic.status === 'understood' || baseTopic.status === 'mastered') &&
      evaluation.status !== 'needs_review'

    const finalStatus = keepLegacy ? baseTopic.status : evaluation.status
    const nowIso = new Date().toISOString()

    return {
      ...baseTopic,
      status: finalStatus,
      masteryReasonKey: keepLegacy
        ? 'learning.masteryReason.legacyPreserved'
        : evaluation.reasonKey,
      masteryReasonParams: keepLegacy ? {} : evaluation.reasonParams,
      statusUpdatedAt:
        finalStatus !== baseTopic.status
          ? nowIso
          : baseTopic.statusUpdatedAt || nowIso,
    }
  }

  async function updateTopicStatus(
    topicId: string,
    status: TopicStatus
  ): Promise<number> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const idx = topics.value.findIndex((t) => t.id === topicId)
    if (idx === -1) return 0

    const current = toRaw(topics.value[idx])
    const wasCompleted = isTopicCompletedStatus(current.status)
    const targetUi = mapTopicStatusToUi(status)
    const canonicalStatus: TopicStatus =
      status === 'needs_review' ? 'needs_review' : mapUiStatusToStorage(targetUi)
    const isNowCompleted = isTopicCompletedStatus(canonicalStatus)
    const nowIso = new Date().toISOString()

    const updated: LearningTopic = {
      ...current,
      status: canonicalStatus,
      lastStudiedAt:
        canonicalStatus === 'not_started' ? current.lastStudiedAt : nowIso,
      completedAt: isNowCompleted ? current.completedAt || nowIso : null,
      statusUpdatedAt: nowIso,
    }

    topics.value[idx] = updated
    await db.learningTopics.put({ ...updated })

    let xpEarned = 0
    const gamificationStore = useGamificationStore()
    if (!wasCompleted && isNowCompleted) {
      xpEarned = await gamificationStore.awardXP(
        `concept_mastered_${topicId}`,
        'concept_mastered',
        10
      )
    }
    return xpEarned
  }

  async function addTopic(payload: {
    subtestId: string
    title: string
    description?: string
    status?: TopicStatus
    sourceName?: string
    sourceUrl?: string
    targetDurationMinutes?: number | null
    notes?: string
    reviewSchedule?: string | null
  }): Promise<{ topic: LearningTopic | null; xpEarned: number }> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const cleanTitle = payload.title.trim()
    if (!cleanTitle) return { topic: null, xpEarned: 0 }

    const targetUi = mapTopicStatusToUi(payload.status || 'not_started')
    const initialStatus: TopicStatus = mapUiStatusToStorage(targetUi)
    const isNowCompleted = isTopicCompletedStatus(initialStatus)
    const nowIso = new Date().toISOString()

    const urlCheck = validateExternalUrl(payload.sourceUrl || '')
    const cleanDuration =
      payload.targetDurationMinutes !== undefined &&
      payload.targetDurationMinutes !== null &&
      Number.isFinite(Number(payload.targetDurationMinutes)) &&
      Number(payload.targetDurationMinutes) > 0
        ? Math.max(
            1,
            Math.min(600, Math.round(Number(payload.targetDurationMinutes)))
          )
        : null

    const newTopic: LearningTopic = {
      id: generateId('topic'),
      subtestId: payload.subtestId,
      title: cleanTitle,
      description: (payload.description || '').trim(),
      status: initialStatus,
      sourceName: (payload.sourceName || '').trim(),
      sourceUrl: urlCheck.valid ? urlCheck.normalizedUrl : '',
      targetDurationMinutes: cleanDuration,
      completedAt: isNowCompleted ? nowIso : null,
      practiceCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      notes: (payload.notes || '').trim(),
      lastStudiedAt: initialStatus !== 'not_started' ? nowIso : null,
      reviewSchedule: payload.reviewSchedule || null,
      reviewIntervalDays: 1,
      reviewCount: 0,
      statusUpdatedAt: nowIso,
    }

    topics.value.push(newTopic)
    await db.learningTopics.put({ ...newTopic })

    let xpEarned = 0
    if (isNowCompleted) {
      const gamificationStore = useGamificationStore()
      xpEarned = await gamificationStore.awardXP(
        `concept_mastered_${newTopic.id}`,
        'concept_mastered',
        10
      )
    }

    return { topic: newTopic, xpEarned }
  }

  async function updateTopic(
    topicId: string,
    partial: Partial<Omit<LearningTopic, 'id'>>
  ): Promise<number> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const idx = topics.value.findIndex((t) => t.id === topicId)
    if (idx === -1) return 0

    const current = toRaw(topics.value[idx])
    const wasCompleted = isTopicCompletedStatus(current.status)
    const currentUi = mapTopicStatusToUi(current.status)

    let nextStatus: TopicStatus = current.status
    if (partial.status !== undefined) {
      const requestedUi = mapTopicStatusToUi(partial.status)
      if (requestedUi !== currentUi) {
        nextStatus = mapUiStatusToStorage(requestedUi)
      }
    }

    const isNowCompleted = isTopicCompletedStatus(nextStatus)
    const statusChanged = nextStatus !== current.status
    const nowIso = new Date().toISOString()

    let nextSourceUrl = current.sourceUrl || ''
    if (partial.sourceUrl !== undefined) {
      const urlCheck = validateExternalUrl(partial.sourceUrl)
      nextSourceUrl = urlCheck.valid ? urlCheck.normalizedUrl : ''
    }

    let nextDuration = current.targetDurationMinutes ?? null
    if (partial.targetDurationMinutes !== undefined) {
      nextDuration =
        partial.targetDurationMinutes !== null &&
        Number.isFinite(Number(partial.targetDurationMinutes)) &&
        Number(partial.targetDurationMinutes) > 0
          ? Math.max(
              1,
              Math.min(600, Math.round(Number(partial.targetDurationMinutes)))
            )
          : null
    }

    const updated: LearningTopic = {
      ...current,
      ...partial,
      status: nextStatus,
      id: topicId,
      title:
        partial.title !== undefined
          ? partial.title.trim() || current.title
          : current.title,
      description:
        partial.description !== undefined
          ? partial.description.trim()
          : current.description,
      sourceName:
        partial.sourceName !== undefined
          ? partial.sourceName.trim()
          : current.sourceName || '',
      sourceUrl: nextSourceUrl,
      targetDurationMinutes: nextDuration,
      practiceCount: Math.max(
        0,
        Number(partial.practiceCount ?? current.practiceCount) || 0
      ),
      correctCount: Math.max(
        0,
        Number(partial.correctCount ?? current.correctCount) || 0
      ),
      incorrectCount: Math.max(
        0,
        Number(partial.incorrectCount ?? current.incorrectCount) || 0
      ),
      notes: partial.notes !== undefined ? partial.notes.trim() : current.notes,
      lastStudiedAt:
        statusChanged && nextStatus !== 'not_started'
          ? nowIso
          : partial.lastStudiedAt ?? current.lastStudiedAt,
      completedAt:
        !wasCompleted && isNowCompleted
          ? nowIso
          : !isNowCompleted
            ? null
            : current.completedAt || nowIso,
      statusUpdatedAt: statusChanged ? nowIso : current.statusUpdatedAt || nowIso,
    }

    topics.value[idx] = updated
    await db.learningTopics.put({ ...updated })

    let xpEarned = 0
    const gamificationStore = useGamificationStore()
    if (!wasCompleted && isNowCompleted) {
      xpEarned = await gamificationStore.awardXP(
        `concept_mastered_${topicId}`,
        'concept_mastered',
        10
      )
    }
    return xpEarned
  }

  async function recordPracticeAttempt(
    topicId: string,
    correctAdded: number,
    incorrectAdded: number
  ): Promise<{ xpEarned: number; updatedTopic: LearningTopic | null }> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const idx = topics.value.findIndex((t) => t.id === topicId)
    if (idx === -1) return { xpEarned: 0, updatedTopic: null }

    const current = toRaw(topics.value[idx])
    const safeCorrect = Math.max(0, Math.round(Number(correctAdded) || 0))
    const safeIncorrect = Math.max(0, Math.round(Number(incorrectAdded) || 0))
    if (safeCorrect === 0 && safeIncorrect === 0) {
      return { xpEarned: 0, updatedTopic: current }
    }

    const draft: LearningTopic = {
      ...current,
      practiceCount: current.practiceCount + 1,
      correctCount: current.correctCount + safeCorrect,
      incorrectCount: current.incorrectCount + safeIncorrect,
      status: current.status === 'not_started' ? 'practicing' : current.status,
      reviewSchedule: current.reviewSchedule || addDaysToLocalDate(1),
      reviewIntervalDays: current.reviewIntervalDays || 1,
      lastStudiedAt: new Date().toISOString(),
    }

    const updated = computeEvaluatedTopicUpdate(draft)
    topics.value[idx] = updated
    await db.learningTopics.put({ ...updated })

    let xpEarned = 0
    const gamificationStore = useGamificationStore()
    if (updated.status === 'mastered') {
      xpEarned = await gamificationStore.awardXP(
        `concept_mastered_${topicId}`,
        'concept_mastered',
        10
      )
    }
    await gamificationStore.syncAllQuestRewards()
    await gamificationStore.evaluateAchievements()
    return { xpEarned, updatedTopic: updated }
  }

  async function deleteTopic(topicId: string): Promise<void> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    await db.learningTopics.delete(topicId)
    topics.value = topics.value.filter((t) => t.id !== topicId)
  }

  async function addSubtestCategory(payload: {
    code: string
    nameId: string
    nameEn?: string
  }): Promise<SubtestCategory | null> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const cleanCode = payload.code.trim().toUpperCase()
    const cleanNameId = payload.nameId.trim()
    if (!cleanCode || !cleanNameId) return null

    const maxOrder = subtests.value.reduce(
      (max, s) => Math.max(max, s.order),
      0
    )

    const newSubtest: SubtestCategory = {
      id: generateId('subtest'),
      code: cleanCode,
      nameId: cleanNameId,
      nameEn: (payload.nameEn || cleanNameId).trim(),
      order: maxOrder + 1,
    }

    subtests.value.push(newSubtest)
    await db.subtestCategories.put({ ...newSubtest })
    return newSubtest
  }

  async function updateSubtestCategory(
    subtestId: string,
    partial: { code?: string; nameId?: string; nameEn?: string }
  ): Promise<void> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const idx = subtests.value.findIndex((s) => s.id === subtestId)
    if (idx === -1) return

    const current = toRaw(subtests.value[idx])
    const updated: SubtestCategory = {
      ...current,
      code:
        partial.code !== undefined
          ? partial.code.trim().toUpperCase() || current.code
          : current.code,
      nameId:
        partial.nameId !== undefined
          ? partial.nameId.trim() || current.nameId
          : current.nameId,
      nameEn:
        partial.nameEn !== undefined
          ? partial.nameEn.trim() || current.nameEn
          : current.nameEn,
    }

    subtests.value[idx] = updated
    await db.subtestCategories.put({ ...updated })
  }

  async function deleteSubtestCategory(subtestId: string): Promise<boolean> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    if (subtests.value.length <= 1) return false

    await db.subtestCategories.delete(subtestId)
    const topicIds = topics.value
      .filter((t) => t.subtestId === subtestId)
      .map((t) => t.id)
    if (topicIds.length > 0) {
      await db.learningTopics.bulkDelete(topicIds)
    }

    subtests.value = subtests.value.filter((s) => s.id !== subtestId)
    topics.value = topics.value.filter((t) => t.subtestId !== subtestId)
    return true
  }

  async function saveDiagnosticBaseline(
    correctCount: number,
    notes: string
  ): Promise<void> {
    const clampedCorrect = Math.max(
      0,
      Math.min(21, Math.round(Number(correctCount) || 0))
    )
    const record: InformalDiagnosticBaseline = {
      correctCount: clampedCorrect,
      totalQuestions: 21,
      notes: notes.trim(),
      recordedAt: new Date().toISOString(),
    }
    diagnosticBaseline.value = record
    await Preferences.set({
      key: DIAGNOSTIC_BASELINE_KEY,
      value: JSON.stringify(record),
    })
  }

  /* ==========================================================================
     RITME 3.0 — Adventure Realms, Question Engine, Spaced Review, Boss & Mock Test
     ========================================================================== */

  function isChapterLocked(chapterId: string): boolean {
    const chap = chapters.value.find((c) => c.id === chapterId)
    return chap ? chap.status === 'locked' : false
  }

  const unlockedQuestions = computed(() =>
    questions.value.filter((q) => !isChapterLocked(q.chapterId))
  )

  function getChaptersBySubtest(subtestId: string): AdventureChapter[] {
    return chapters.value
      .filter((c) => c.subtestId === subtestId)
      .slice()
      .sort((a, b) => a.order - b.order)
  }

  function getQuestionsBySubtest(
    subtestId: string,
    chapterId?: string,
    includeLocked = false
  ): PracticeQuestion[] {
    return questions.value.filter(
      (q) =>
        (subtestId === 'all' || q.subtestId === subtestId) &&
        (!chapterId || chapterId === 'all' || q.chapterId === chapterId) &&
        (includeLocked || !isChapterLocked(q.chapterId))
    )
  }

  const adventureRealms = computed(() => {
    return sortedSubtests.value.map((sub) => {
      const meta = ADVENTURE_REALMS.find((r) => r.subtestId === sub.id) || {
        subtestId: sub.id,
        code: sub.code,
        realmNameId: `Wilayah ${sub.code}`,
        realmNameEn: `${sub.code} Realm`,
        themeId: sub.nameId,
        themeEn: sub.nameEn,
        icon: 'compass',
      }
      const subChaps = getChaptersBySubtest(sub.id)
      const prog = getSubtestProgress(sub.id)
      const bossCleared = bossAttempts.value.some(
        (b) => b.subtestId === sub.id && b.passed
      )

      let realmStatus: RealmStatus = 'available'
      if (prog.percent >= 90 && bossCleared) {
        realmStatus = 'mastered'
      } else if (prog.percent >= 75 || bossCleared) {
        realmStatus = 'completed'
      } else if (
        prog.percent > 0 ||
        subChaps.some(
          (c) =>
            c.status === 'learning' ||
            c.status === 'challenge_ready' ||
            c.status === 'completed' ||
            c.status === 'mastered'
        )
      ) {
        realmStatus = 'in_progress'
      }

      return {
        subtest: sub,
        realm: meta,
        chapters: subChaps,
        progress: prog,
        status: realmStatus,
        bossCleared,
      }
    })
  })

  const continueLearningRecommendation = computed(() => {
    const userStore = useUserStore()
    const prioritySubId = userStore.settings.prioritySubtestId

    // 1. Check recently studied incomplete topic
    const studiedTopics = topics.value
      .filter((t) => t.lastStudiedAt && !isTopicCompletedStatus(t.status))
      .slice()
      .sort((a, b) =>
        (b.lastStudiedAt || '').localeCompare(a.lastStudiedAt || '')
      )

    const priorityTopic = prioritySubId
      ? topics.value.find(
          (t) =>
            t.subtestId === prioritySubId && !isTopicCompletedStatus(t.status)
        )
      : undefined

    const targetTopic =
      studiedTopics[0] ||
      priorityTopic ||
      topics.value.find((t) => t.status === 'learning') ||
      topics.value[0]

    const subtest = targetTopic
      ? getSubtestById(targetTopic.subtestId)
      : (prioritySubId ? getSubtestById(prioritySubId) : undefined) ||
        sortedSubtests.value[0]

    const realmMeta = subtest
      ? ADVENTURE_REALMS.find((r) => r.subtestId === subtest.id)
      : ADVENTURE_REALMS[0]

    const subChapters = subtest ? getChaptersBySubtest(subtest.id) : []
    const activeChapter =
      subChapters.find(
        (c) => c.status === 'learning' || c.status === 'challenge_ready'
      ) ||
      subChapters.find((c) => c.status === 'available') ||
      subChapters[0]

    return {
      subtestId: subtest?.id || 'subtest_pu',
      subtestCode: subtest?.code || 'PU',
      subtestNameId: subtest?.nameId || 'Penalaran Umum',
      subtestNameEn: subtest?.nameEn || 'General Reasoning',
      realmNameId: realmMeta?.realmNameId || 'Wilayah Logika',
      realmNameEn: realmMeta?.realmNameEn || 'Realm of Logic',
      icon: realmMeta?.icon || 'pu',
      chapterId: activeChapter?.id || 'chap_pu_1',
      chapterTitleId:
        activeChapter?.titleId || 'Bab 1: Silogisme & Ekuivalensi Logika',
      chapterTitleEn:
        activeChapter?.titleEn || 'Chapter 1: Syllogism & Logical Equivalence',
      topicTitle: targetTopic?.title || 'Penalaran Induktif & Deduktif',
    }
  })

  const smartReviewQueue = computed<SmartReviewQueueItem[]>(() =>
    buildSmartReviewQueue({
      topics: topics.value,
      mistakeNotes: mistakeNotes.value,
      subtests: subtests.value,
    })
  )

  function getReviewQuestionsForTopic(
    topicId: string,
    subtestId: string
  ): PracticeQuestion[] {
    const unlocked = unlockedQuestions.value
    const exactTopic = unlocked.filter((q) => q.topicId === topicId)
    if (exactTopic.length >= 2) return exactTopic.slice(0, 5)
    const sameSubtest = unlocked.filter(
      (q) => q.subtestId === subtestId && q.topicId !== topicId
    )
    const combined = [...exactTopic, ...sameSubtest]
    return combined.length > 0 ? combined.slice(0, 5) : unlocked.slice(0, 3)
  }

  const unresolvedMistakes = computed(() =>
    mistakeNotes.value.filter((m) => !m.resolved)
  )

  const mockTestStats = computed(() => {
    const list = mockTests.value.slice().sort((a, b) => a.date.localeCompare(b.date))
    if (list.length === 0) {
      return {
        count: 0,
        latestScore: 0,
        highestScore: 0,
        averageScore: 0,
        trendDelta: 0,
      }
    }
    const latest = list[list.length - 1]
    const prev = list.length >= 2 ? list[list.length - 2] : null
    const highestScore = list.reduce(
      (max, item) => Math.max(max, item.overallScore),
      0
    )
    const sum = list.reduce((acc, item) => acc + item.overallScore, 0)
    const averageScore = Math.round(sum / list.length)
    const trendDelta = prev ? latest.overallScore - prev.overallScore : 0

    return {
      count: list.length,
      latestScore: latest.overallScore,
      highestScore,
      averageScore,
      trendDelta,
    }
  })

  async function completeChapterStudy(
    chapterId: string,
    targetStatus: ChapterStatus = 'challenge_ready'
  ): Promise<number> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const idx = chapters.value.findIndex((c) => c.id === chapterId)
    if (idx === -1) return 0

    const current = toRaw(chapters.value[idx])
    // Enforce locked chapter rule (Section 26: Locked content cannot be accessed/completed)
    if (current.status === 'locked') {
      return 0
    }

    const updated: AdventureChapter = {
      ...current,
      status:
        current.status === 'completed' || current.status === 'mastered'
          ? current.status
          : targetStatus,
    }
    chapters.value[idx] = updated
    await db.chapters.put({ ...updated })

    // Unlock the next chapter in the same subtest if it is locked
    const nextIdx = chapters.value.findIndex(
      (c) =>
        c.subtestId === current.subtestId &&
        c.order === current.order + 1 &&
        c.status === 'locked'
    )
    if (nextIdx !== -1) {
      const unlockedNext: AdventureChapter = {
        ...toRaw(chapters.value[nextIdx]),
        status: 'available',
      }
      chapters.value[nextIdx] = unlockedNext
      await db.chapters.put({ ...unlockedNext })
    }

    const gamificationStore = useGamificationStore()
    const today = getLocalDateString()
    const xp = await gamificationStore.awardXP(
      `chapter_study_${chapterId}_${today}`,
      'daily_learning_task',
      10
    )
    await gamificationStore.syncAllQuestRewards()
    await gamificationStore.evaluateAchievements()
    playQuestCompleteChime()
    return xp
  }

  async function submitQuestionAttempt(payload: {
    questionId: string
    selectedIndex: number
  }): Promise<{
    isCorrect: boolean
    correctIndex: number
    xpEarned: number
  }> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const q = questions.value.find((item) => item.id === payload.questionId)
    if (!q || isChapterLocked(q.chapterId)) {
      return { isCorrect: false, correctIndex: q?.correctIndex ?? 0, xpEarned: 0 }
    }

    const isCorrect = payload.selectedIndex === q.correctIndex
    const nowIso = new Date().toISOString()
    const attempt: QuestionAttempt = {
      id: generateId('qattempt'),
      questionId: q.id,
      subtestId: q.subtestId,
      chapterId: q.chapterId,
      topicId: q.topicId,
      selectedIndex: payload.selectedIndex,
      isCorrect,
      attemptedAt: nowIso,
    }

    const topicIdx = topics.value.findIndex((t) => t.id === q.topicId)
    let updatedTopic: LearningTopic | null = null
    if (topicIdx !== -1) {
      const curTopic = toRaw(topics.value[topicIdx])
      updatedTopic = computeEvaluatedTopicUpdate({
        ...curTopic,
        practiceCount: curTopic.practiceCount + 1,
        correctCount: curTopic.correctCount + (isCorrect ? 1 : 0),
        incorrectCount: curTopic.incorrectCount + (isCorrect ? 0 : 1),
        status: curTopic.status === 'not_started' ? 'practicing' : curTopic.status,
        reviewSchedule: curTopic.reviewSchedule || addDaysToLocalDate(1),
        reviewIntervalDays: curTopic.reviewIntervalDays || 1,
        lastStudiedAt: nowIso,
      })
    }

    const chapIdx = chapters.value.findIndex((c) => c.id === q.chapterId)
    let updatedChap: AdventureChapter | null = null
    if (chapIdx !== -1 && chapters.value[chapIdx].status === 'available') {
      updatedChap = {
        ...toRaw(chapters.value[chapIdx]),
        status: 'learning',
      }
    }

    // PRD 3.0 Section 21.5 Atomic multi-table transaction
    await db.transaction(
      'rw',
      [db.questionAttempts, db.learningTopics, db.chapters],
      async () => {
        await db.questionAttempts.put({ ...attempt })
        if (updatedTopic) {
          await db.learningTopics.put({ ...updatedTopic })
        }
        if (updatedChap) {
          await db.chapters.put({ ...updatedChap })
        }
      }
    )

    questionAttempts.value.unshift(attempt)
    if (topicIdx !== -1 && updatedTopic) {
      topics.value[topicIdx] = updatedTopic
    }
    if (chapIdx !== -1 && updatedChap) {
      chapters.value[chapIdx] = updatedChap
    }

    // Award daily practice XP + mastery XP if triggered (idempotent) & sync Quests
    const gamificationStore = useGamificationStore()
    const today = getLocalDateString()
    let xpEarned = await gamificationStore.awardXP(
      `practice_completed_${today}`,
      'practice_completed',
      5
    )
    if (updatedTopic && updatedTopic.status === 'mastered') {
      xpEarned += await gamificationStore.awardXP(
        `concept_mastered_${updatedTopic.id}`,
        'concept_mastered',
        10
      )
    }
    await gamificationStore.syncAllQuestRewards()
    await gamificationStore.evaluateAchievements()

    return {
      isCorrect,
      correctIndex: q.correctIndex,
      xpEarned,
    }
  }

  async function saveMistakeNote(payload: {
    questionId: string
    subtestId: string
    topicId: string
    questionPreview: string
    userAnswer: string
    correctAnswer: string
    explanation: string
    errorCategory: MistakeErrorCategory
    personalNote?: string
  }): Promise<MistakeNote> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const today = getLocalDateString()
    const note: MistakeNote = {
      id: generateId('mistake'),
      questionId: payload.questionId,
      subtestId: payload.subtestId,
      topicId: payload.topicId,
      questionPreview: payload.questionPreview.trim(),
      userAnswer: payload.userAnswer.trim(),
      correctAnswer: payload.correctAnswer.trim(),
      explanation: payload.explanation.trim(),
      errorCategory: payload.errorCategory,
      personalNote: (payload.personalNote || '').trim(),
      resolved: false,
      dateRecorded: today,
      nextReviewDate: addDaysToLocalDate(1),
    }

    const nextMistakesList = [note, ...mistakeNotes.value]
    const topicIdx = topics.value.findIndex((t) => t.id === payload.topicId)
    let updatedTopic: LearningTopic | null = null
    if (topicIdx !== -1) {
      const cur = toRaw(topics.value[topicIdx])
      updatedTopic = computeEvaluatedTopicUpdate(
        {
          ...cur,
          reviewSchedule: addDaysToLocalDate(1),
          reviewIntervalDays: 1,
        },
        nextMistakesList
      )
    }

    await db.transaction(
      'rw',
      [db.mistakeNotes, db.learningTopics],
      async () => {
        await db.mistakeNotes.put({ ...note })
        if (updatedTopic) {
          await db.learningTopics.put({ ...updatedTopic })
        }
      }
    )

    mistakeNotes.value.unshift(note)
    if (topicIdx !== -1 && updatedTopic) {
      topics.value[topicIdx] = updatedTopic
    }

    return note
  }

  async function retryMistakeNoteAttempt(payload: {
    mistakeId: string
    selectedIndex: number
    selectedAnswerText: string
  }): Promise<{
    isCorrect: boolean
    correctIndex: number
    resolved: boolean
    explanation: string
  } | null> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const mIdx = mistakeNotes.value.findIndex((m) => m.id === payload.mistakeId)
    if (mIdx === -1) return null

    const note = toRaw(mistakeNotes.value[mIdx])
    const q = questions.value.find((item) => item.id === note.questionId)
    if (!q) return null

    const isCorrect = payload.selectedIndex === q.correctIndex
    const nowIso = new Date().toISOString()

    const attempt: QuestionAttempt = {
      id: generateId('qattempt'),
      questionId: q.id,
      subtestId: q.subtestId,
      chapterId: q.chapterId,
      topicId: q.topicId,
      selectedIndex: payload.selectedIndex,
      isCorrect,
      attemptedAt: nowIso,
    }

    const updatedNote: MistakeNote = {
      ...note,
      userAnswer: payload.selectedAnswerText.trim() || note.userAnswer,
      resolved: isCorrect ? true : false,
      nextReviewDate: isCorrect ? note.nextReviewDate : addDaysToLocalDate(1),
    }

    const nextMistakesList = mistakeNotes.value.map((m) =>
      m.id === updatedNote.id ? updatedNote : m
    )

    const topicIdx = topics.value.findIndex((t) => t.id === q.topicId)
    let updatedTopic: LearningTopic | null = null
    if (topicIdx !== -1) {
      const curTopic = toRaw(topics.value[topicIdx])
      updatedTopic = computeEvaluatedTopicUpdate(
        {
          ...curTopic,
          practiceCount: curTopic.practiceCount + 1,
          correctCount: curTopic.correctCount + (isCorrect ? 1 : 0),
          incorrectCount: curTopic.incorrectCount + (isCorrect ? 0 : 1),
          lastStudiedAt: nowIso,
        },
        nextMistakesList
      )
    }

    await db.transaction(
      'rw',
      [db.questionAttempts, db.mistakeNotes, db.learningTopics],
      async () => {
        await db.questionAttempts.put({ ...attempt })
        await db.mistakeNotes.put({ ...updatedNote })
        if (updatedTopic) {
          await db.learningTopics.put({ ...updatedTopic })
        }
      }
    )

    questionAttempts.value.unshift(attempt)
    mistakeNotes.value[mIdx] = updatedNote
    if (topicIdx !== -1 && updatedTopic) {
      topics.value[topicIdx] = updatedTopic
    }

    if (isCorrect) {
      playQuestCompleteChime()
      const gamificationStore = useGamificationStore()
      if (updatedTopic && updatedTopic.status === 'mastered') {
        await gamificationStore.awardXP(
          `concept_mastered_${updatedTopic.id}`,
          'concept_mastered',
          10
        )
      }
      await gamificationStore.syncAllQuestRewards()
      await gamificationStore.evaluateAchievements()
    }

    return {
      isCorrect,
      correctIndex: q.correctIndex,
      resolved: updatedNote.resolved,
      explanation: updatedNote.explanation,
    }
  }

  async function toggleResolveMistakeNote(noteId: string): Promise<void> {
    const idx = mistakeNotes.value.findIndex((m) => m.id === noteId)
    if (idx === -1) return
    const cur = toRaw(mistakeNotes.value[idx])
    const updated: MistakeNote = {
      ...cur,
      resolved: !cur.resolved,
    }
    const nextMistakesList = mistakeNotes.value.map((m) =>
      m.id === updated.id ? updated : m
    )

    const topicIdx = topics.value.findIndex((t) => t.id === cur.topicId)
    let updatedTopic: LearningTopic | null = null
    if (topicIdx !== -1) {
      updatedTopic = computeEvaluatedTopicUpdate(
        toRaw(topics.value[topicIdx]),
        nextMistakesList
      )
    }

    await db.transaction(
      'rw',
      [db.mistakeNotes, db.learningTopics],
      async () => {
        await db.mistakeNotes.put({ ...updated })
        if (updatedTopic) {
          await db.learningTopics.put({ ...updatedTopic })
        }
      }
    )

    mistakeNotes.value[idx] = updated
    if (topicIdx !== -1 && updatedTopic) {
      topics.value[topicIdx] = updatedTopic
    }

    if (updated.resolved) {
      const gamificationStore = useGamificationStore()
      await gamificationStore.syncAllQuestRewards()
      await gamificationStore.evaluateAchievements()
    }
  }

  async function deleteMistakeNote(noteId: string): Promise<void> {
    await db.mistakeNotes.delete(noteId)
    mistakeNotes.value = mistakeNotes.value.filter((m) => m.id !== noteId)
  }

  async function snoozeTopicReview(topicId: string, days = 1): Promise<string> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const idx = topics.value.findIndex((t) => t.id === topicId)
    const nextDate = addDaysToLocalDate(Math.max(1, days))
    if (idx === -1) return nextDate

    const cur = toRaw(topics.value[idx])
    const updated: LearningTopic = {
      ...cur,
      reviewSchedule: nextDate,
      masteryReasonKey: 'learning.masteryReason.reviewSnoozed',
      masteryReasonParams: { date: nextDate },
    }
    topics.value[idx] = updated
    await db.learningTopics.put({ ...updated })
    return nextDate
  }

  async function completeReviewSession(payload: {
    topicId: string
    results: Array<{ questionId: string; selectedIndex: number }>
  }): Promise<{
    correctCount: number
    totalCount: number
    accuracyPercent: number
    nextIntervalDays: number
    nextReviewDate: string
    newStatus: TopicStatus
    xpEarned: number
  }> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const total = Math.max(1, payload.results.length)
    const nowIso = new Date().toISOString()
    const newAttempts: QuestionAttempt[] = []
    let correctCount = 0

    for (const item of payload.results) {
      const q = questions.value.find((entry) => entry.id === item.questionId)
      if (!q) continue
      const isCorrect = item.selectedIndex === q.correctIndex
      if (isCorrect) correctCount++
      newAttempts.push({
        id: generateId('qattempt'),
        questionId: q.id,
        subtestId: q.subtestId,
        chapterId: q.chapterId,
        topicId: payload.topicId,
        selectedIndex: item.selectedIndex,
        isCorrect,
        attemptedAt: nowIso,
      })
    }

    const incorrectCount = Math.max(0, newAttempts.length - correctCount)
    const accuracyPercent = Math.round(
      (correctCount / Math.max(1, newAttempts.length)) * 100
    )

    const idx = topics.value.findIndex((t) => t.id === payload.topicId)
    if (idx === -1) {
      return {
        correctCount,
        totalCount: total,
        accuracyPercent,
        nextIntervalDays: 1,
        nextReviewDate: addDaysToLocalDate(1),
        newStatus: 'learning',
        xpEarned: 0,
      }
    }

    const cur = toRaw(topics.value[idx])
    const currentInterval = cur.reviewIntervalDays || 1
    let nextIntervalDays = 1

    // PRD 3.0 Section 10.2–10.3: H+1 -> H+3 -> H+7 -> H+14 progression based on real quiz accuracy
    if (accuracyPercent >= 80) {
      if (currentInterval < 3) nextIntervalDays = 3
      else if (currentInterval < 7) nextIntervalDays = 7
      else nextIntervalDays = 14
    } else if (accuracyPercent < 60) {
      nextIntervalDays = 1
    } else {
      nextIntervalDays = Math.max(1, Math.min(3, currentInterval))
    }

    const nextReviewDate = addDaysToLocalDate(nextIntervalDays)
    const draft: LearningTopic = {
      ...cur,
      practiceCount: cur.practiceCount + 1,
      correctCount: cur.correctCount + correctCount,
      incorrectCount: cur.incorrectCount + incorrectCount,
      reviewSchedule: nextReviewDate,
      reviewIntervalDays: nextIntervalDays,
      lastReviewedAt: nowIso,
      lastStudiedAt: nowIso,
      reviewCount: (cur.reviewCount || 0) + 1,
      lastReviewAccuracy: accuracyPercent,
    }

    const updatedTopic = computeEvaluatedTopicUpdate(draft)

    await db.transaction(
      'rw',
      [db.questionAttempts, db.learningTopics],
      async () => {
        if (newAttempts.length > 0) {
          await db.questionAttempts.bulkPut(newAttempts)
        }
        await db.learningTopics.put({ ...updatedTopic })
      }
    )

    if (newAttempts.length > 0) {
      questionAttempts.value.unshift(...newAttempts.slice().reverse())
    }
    topics.value[idx] = updatedTopic

    const gamificationStore = useGamificationStore()
    const today = getLocalDateString()
    let xpEarned = await gamificationStore.awardXP(
      `review_completed_${payload.topicId}_${today}`,
      'review_completed',
      5
    )
    if (updatedTopic.status === 'mastered') {
      xpEarned += await gamificationStore.awardXP(
        `concept_mastered_${updatedTopic.id}`,
        'concept_mastered',
        10
      )
    }
    await gamificationStore.syncAllQuestRewards()
    await gamificationStore.evaluateAchievements()
    playQuestCompleteChime()

    return {
      correctCount,
      totalCount: newAttempts.length || total,
      accuracyPercent,
      nextIntervalDays,
      nextReviewDate,
      newStatus: updatedTopic.status,
      xpEarned,
    }
  }

  async function completeSpacedReview(
    topicId: string,
    accuracyPercent: number
  ): Promise<{ nextIntervalDays: number; nextReviewDate: string; xpEarned: number }> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const idx = topics.value.findIndex((t) => t.id === topicId)
    if (idx === -1) {
      return {
        nextIntervalDays: 1,
        nextReviewDate: addDaysToLocalDate(1),
        xpEarned: 0,
      }
    }

    const cur = toRaw(topics.value[idx])
    const currentInterval = cur.reviewIntervalDays || 1
    let nextIntervalDays = 1

    if (accuracyPercent >= 80) {
      if (currentInterval < 3) nextIntervalDays = 3
      else if (currentInterval < 7) nextIntervalDays = 7
      else nextIntervalDays = 14
    } else if (accuracyPercent < 60) {
      nextIntervalDays = 1
    } else {
      nextIntervalDays = 3
    }

    const nextReviewDate = addDaysToLocalDate(nextIntervalDays)
    const nowIso = new Date().toISOString()
    const updated = computeEvaluatedTopicUpdate({
      ...cur,
      reviewSchedule: nextReviewDate,
      reviewIntervalDays: nextIntervalDays,
      lastReviewedAt: nowIso,
      lastStudiedAt: nowIso,
      reviewCount: (cur.reviewCount || 0) + 1,
      lastReviewAccuracy: accuracyPercent,
    })

    topics.value[idx] = updated
    await db.learningTopics.put({ ...updated })

    const gamificationStore = useGamificationStore()
    const today = getLocalDateString()
    let xpEarned = await gamificationStore.awardXP(
      `review_completed_${topicId}_${today}`,
      'review_completed',
      5
    )
    if (updated.status === 'mastered') {
      xpEarned += await gamificationStore.awardXP(
        `concept_mastered_${topicId}`,
        'concept_mastered',
        10
      )
    }
    await gamificationStore.syncAllQuestRewards()
    await gamificationStore.evaluateAchievements()
    playQuestCompleteChime()

    return { nextIntervalDays, nextReviewDate, xpEarned }
  }

  const finalChallengeEligible = computed(() => {
    const unlockedSubtestsCount = new Set(
      chapters.value.filter((c) => c.status !== 'locked').map((c) => c.subtestId)
    ).size
    return unlockedSubtestsCount >= 2 && unlockedQuestions.value.length >= 4
  })

  function getFinalChallengeQuestions(maxCount = 14): PracticeQuestion[] {
    const bySubtest = new Map<string, PracticeQuestion[]>()
    for (const q of unlockedQuestions.value) {
      const list = bySubtest.get(q.subtestId) || []
      list.push(q)
      bySubtest.set(q.subtestId, list)
    }
    const result: PracticeQuestion[] = []
    const buckets = Array.from(bySubtest.values())
    let round = 0
    while (result.length < maxCount) {
      let pushedInRound = false
      for (const bucket of buckets) {
        if (round < bucket.length && result.length < maxCount) {
          result.push(bucket[round])
          pushedInRound = true
        }
      }
      if (!pushedInRound) break
      round += 1
    }
    return result
  }

  async function submitBossChallengeAttempt(payload: {
    bossType: 'mini_boss' | 'chapter_boss' | 'subtest_boss' | 'final_challenge'
    subtestId: string
    chapterId: string
    totalQuestions: number
    correctCount: number
    timeSpentSeconds: number
    passingThreshold?: number
    questionResults?: Array<{
      questionId: string
      topicId: string
      selectedIndex: number
      isCorrect: boolean
    }>
  }): Promise<{
    passed: boolean
    accuracyPercent: number
    passingThreshold: number
    xpEarned: number
    firstClear: boolean
    weakTopicIds: string[]
    unlockedChapterTitleId?: string
    unlockedChapterTitleEn?: string
  }> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const total = Math.max(1, payload.totalQuestions)
    const correct = Math.max(0, Math.min(total, payload.correctCount))
    const incorrect = Math.max(0, total - correct)
    const accuracyPercent = Math.round((correct / total) * 100)
    const passingThreshold = Math.max(
      50,
      Math.min(100, Math.round(Number(payload.passingThreshold) || 70))
    )
    const passed = accuracyPercent >= passingThreshold
    const bossId =
      payload.bossType === 'final_challenge'
        ? 'final_challenge_all'
        : `${payload.bossType}_${payload.subtestId}_${payload.chapterId}`
    const nowIso = new Date().toISOString()

    const alreadyCleared = bossAttempts.value.some(
      (b) => b.bossId === bossId && b.passed
    )

    const weakTopicIdSet = new Set<string>()
    const newAttempts: QuestionAttempt[] = []
    const topicDelta = new Map<string, { correct: number; incorrect: number }>()

    if (Array.isArray(payload.questionResults)) {
      for (const item of payload.questionResults) {
        if (!item.isCorrect && item.topicId) {
          weakTopicIdSet.add(item.topicId)
        }
        const prev = topicDelta.get(item.topicId) || { correct: 0, incorrect: 0 }
        topicDelta.set(item.topicId, {
          correct: prev.correct + (item.isCorrect ? 1 : 0),
          incorrect: prev.incorrect + (item.isCorrect ? 0 : 1),
        })
        newAttempts.push({
          id: generateId('qattempt'),
          questionId: item.questionId,
          subtestId: payload.subtestId,
          chapterId: payload.chapterId,
          topicId: item.topicId,
          selectedIndex: item.selectedIndex,
          isCorrect: item.isCorrect,
          attemptedAt: nowIso,
        })
      }
    }

    const weakTopicIds = Array.from(weakTopicIdSet)
    const updatedTopicsToSave: LearningTopic[] = []
    const today = getLocalDateString()

    for (const [tId, delta] of topicDelta.entries()) {
      const tIdx = topics.value.findIndex((t) => t.id === tId)
      if (tIdx !== -1) {
        const curT = toRaw(topics.value[tIdx])
        const evaluated = computeEvaluatedTopicUpdate({
          ...curT,
          practiceCount: curT.practiceCount + 1,
          correctCount: curT.correctCount + delta.correct,
          incorrectCount: curT.incorrectCount + delta.incorrect,
          reviewSchedule: delta.incorrect > 0 ? today : curT.reviewSchedule,
          lastStudiedAt: nowIso,
        })
        topics.value[tIdx] = evaluated
        updatedTopicsToSave.push(evaluated)
      }
    }

    // Calculate XP before storing record so history accurately reflects xpAwarded
    let xpEarned = 0
    const gamificationStore = useGamificationStore()
    if (passed && !alreadyCleared) {
      const xpReward =
        payload.bossType === 'final_challenge'
          ? 40
          : payload.bossType === 'subtest_boss'
            ? 35
            : payload.bossType === 'chapter_boss'
              ? 25
              : 15
      xpEarned = await gamificationStore.awardXP(
        `boss_first_clear_${bossId}`,
        'boss_challenge',
        xpReward
      )
    }

    const record: BossChallengeAttempt = {
      id: generateId('boss'),
      bossId,
      bossType: payload.bossType,
      subtestId: payload.subtestId,
      chapterId: payload.chapterId,
      totalQuestions: total,
      correctCount: correct,
      incorrectCount: incorrect,
      accuracyPercent,
      passingThreshold,
      passed,
      timeSpentSeconds: Math.max(1, payload.timeSpentSeconds),
      weakTopicIds,
      xpAwarded: xpEarned,
      attemptedAt: nowIso,
    }

    const chapIdx =
      payload.bossType === 'final_challenge'
        ? -1
        : chapters.value.findIndex((c) => c.id === payload.chapterId)
    let updatedChap: AdventureChapter | null = null
    let unlockedNextChap: AdventureChapter | null = null
    let unlockedNextIdx = -1

    if (passed && chapIdx !== -1) {
      playBossPassFanfare()
      const curChap = toRaw(chapters.value[chapIdx])
      const nextChapStatus: ChapterStatus =
        accuracyPercent >= 90 ? 'mastered' : 'completed'
      updatedChap = {
        ...curChap,
        status: nextChapStatus,
      }

      unlockedNextIdx = chapters.value.findIndex(
        (c) =>
          c.subtestId === curChap.subtestId &&
          c.order === curChap.order + 1 &&
          c.status === 'locked'
      )
      if (unlockedNextIdx !== -1) {
        unlockedNextChap = {
          ...toRaw(chapters.value[unlockedNextIdx]),
          status: 'available',
        }
      }
    } else if (passed) {
      playBossPassFanfare()
    }

    await db.transaction(
      'rw',
      [db.bossAttempts, db.chapters, db.questionAttempts, db.learningTopics],
      async () => {
        await db.bossAttempts.put({ ...record })
        if (updatedChap) {
          await db.chapters.put({ ...updatedChap })
        }
        if (unlockedNextChap) {
          await db.chapters.put({ ...unlockedNextChap })
        }
        if (newAttempts.length > 0) {
          await db.questionAttempts.bulkPut(newAttempts)
        }
        if (updatedTopicsToSave.length > 0) {
          await db.learningTopics.bulkPut(updatedTopicsToSave)
        }
      }
    )

    bossAttempts.value.unshift(record)
    if (newAttempts.length > 0) {
      questionAttempts.value.unshift(...newAttempts.slice().reverse())
    }
    if (chapIdx !== -1 && updatedChap) {
      chapters.value[chapIdx] = updatedChap
    }
    if (unlockedNextIdx !== -1 && unlockedNextChap) {
      chapters.value[unlockedNextIdx] = unlockedNextChap
    }

    await gamificationStore.syncAllQuestRewards()
    await gamificationStore.evaluateAchievements()

    return {
      passed,
      accuracyPercent,
      passingThreshold,
      xpEarned,
      firstClear: passed && !alreadyCleared,
      weakTopicIds,
      unlockedChapterTitleId: unlockedNextChap?.titleId,
      unlockedChapterTitleEn: unlockedNextChap?.titleEn,
    }
  }

  async function addMockTestRecord(payload: {
    testName: string
    date: string
    source: string
    durationMinutes: number
    totalQuestions: number
    attemptedQuestions: number
    correctAnswers: number
    incorrectAnswers: number
    overallScore: number
    subtestScores?: Record<string, number>
    notes?: string
  }): Promise<MockTestRecord | null> {
    if (!isLoaded.value) {
      await initLearningStore()
    }
    const cleanName = payload.testName.trim()
    if (!cleanName) return null

    const record: MockTestRecord = {
      id: generateId('mock'),
      testName: cleanName,
      date: payload.date || getLocalDateString(),
      source: (payload.source || 'Simulasi Mandiri').trim(),
      durationMinutes: Math.max(10, Number(payload.durationMinutes) || 195),
      totalQuestions: Math.max(1, Number(payload.totalQuestions) || 155),
      attemptedQuestions: Math.max(0, Number(payload.attemptedQuestions) || 0),
      correctAnswers: Math.max(0, Number(payload.correctAnswers) || 0),
      incorrectAnswers: Math.max(0, Number(payload.incorrectAnswers) || 0),
      overallScore: Math.max(0, Math.min(1000, Math.round(Number(payload.overallScore) || 0))),
      subtestScores: payload.subtestScores || {},
      notes: (payload.notes || '').trim(),
    }

    mockTests.value.unshift(record)
    await db.mockTests.put({ ...record })

    return record
  }

  async function deleteMockTestRecord(mockId: string): Promise<void> {
    await db.mockTests.delete(mockId)
    mockTests.value = mockTests.value.filter((m) => m.id !== mockId)
  }

  return {
    subtests,
    topics,
    chapters,
    questions,
    unlockedQuestions,
    questionAttempts,
    mistakeNotes,
    bossAttempts,
    mockTests,
    diagnosticBaseline,
    isLoaded,
    sortedSubtests,
    topicsNeedingReview,
    overallMasteryStats,
    adventureRealms,
    continueLearningRecommendation,
    smartReviewQueue,
    unresolvedMistakes,
    mockTestStats,
    initLearningStore,
    isChapterLocked,
    getTopicsBySubtest,
    getChaptersBySubtest,
    getQuestionsBySubtest,
    getReviewQuestionsForTopic,
    getSubtestProgress,
    getSubtestById,
    getTopicById,
    updateTopicStatus,
    addTopic,
    updateTopic,
    recordPracticeAttempt,
    deleteTopic,
    addSubtestCategory,
    updateSubtestCategory,
    deleteSubtestCategory,
    saveDiagnosticBaseline,
    completeChapterStudy,
    submitQuestionAttempt,
    saveMistakeNote,
    retryMistakeNoteAttempt,
    toggleResolveMistakeNote,
    deleteMistakeNote,
    snoozeTopicReview,
    completeReviewSession,
    completeSpacedReview,
    submitBossChallengeAttempt,
    finalChallengeEligible,
    getFinalChallengeQuestions,
    addMockTestRecord,
    deleteMockTestRecord,
  }
})
