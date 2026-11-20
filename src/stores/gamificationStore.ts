import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { db } from '@/services/database/db'
import {
  getLocalDateString,
  getLocalWeekStartDateString,
  isDateInCurrentLocalWeek,
} from '@/utils/date'
import { generateId } from '@/utils/id'
import {
  DEFAULT_LEVEL_THRESHOLDS,
  loadCustomLevelThresholds,
  resetCustomLevelThresholds,
  saveCustomLevelThresholds,
} from '@/services/xp/levelConfigService'
import { useFocusStore } from '@/stores/focusStore'
import { useHabitStore } from '@/stores/habitStore'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import { playQuestCompleteChime } from '@/services/timer/soundFeedbackService'
import { dispatchImmediateNotification } from '@/services/notifications/localNotificationService'
import type {
  Achievement,
  CustomQuestRecord,
  DailyQuestItem,
  DailyReflection,
  EnergyMode,
  LevelThreshold,
  PersonalReward,
  RewardRedemption,
  XPSource,
  XPTransaction,
} from '@/types'

export const DAILY_XP_CAP = 100
export { DEFAULT_LEVEL_THRESHOLDS }

export const DEFAULT_ACHIEVEMENTS_SEED: Achievement[] = [
  {
    id: 'ach_first_step',
    title: 'achievements.ach_first_step.title',
    description: 'achievements.ach_first_step.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_first_streak',
    title: 'achievements.ach_first_streak.title',
    description: 'achievements.ach_first_streak.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_consistency',
    title: 'achievements.ach_consistency.title',
    description: 'achievements.ach_consistency.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_focus_master',
    title: 'achievements.ach_focus_master.title',
    description: 'achievements.ach_focus_master.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_knowledge_seeker',
    title: 'achievements.ach_knowledge_seeker.title',
    description: 'achievements.ach_knowledge_seeker.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_monthly_progress',
    title: 'achievements.ach_monthly_progress.title',
    description: 'achievements.ach_monthly_progress.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_first_boss',
    title: 'achievements.ach_first_boss.title',
    description: 'achievements.ach_first_boss.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_mistake_crusher',
    title: 'achievements.ach_mistake_crusher.title',
    description: 'achievements.ach_mistake_crusher.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_question_veteran',
    title: 'achievements.ach_question_veteran.title',
    description: 'achievements.ach_question_veteran.desc',
    unlocked: false,
    unlockedAt: null,
  },
  {
    id: 'ach_mock_contender',
    title: 'achievements.ach_mock_contender.title',
    description: 'achievements.ach_mock_contender.desc',
    unlocked: false,
    unlockedAt: null,
  },
]

export const DEFAULT_REWARDS_SEED: PersonalReward[] = [
  {
    id: 'reward_default_1',
    title: 'rewards.default.watchVideo',
    description: 'rewards.default.watchVideoDesc',
    xpCost: 25,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'reward_default_2',
    title: 'rewards.default.playGames',
    description: 'rewards.default.playGamesDesc',
    xpCost: 40,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'reward_default_3',
    title: 'rewards.default.favoriteMeal',
    description: 'rewards.default.favoriteMealDesc',
    xpCost: 60,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'reward_default_4',
    title: 'rewards.default.recreationalOuting',
    description: 'rewards.default.recreationalOutingDesc',
    xpCost: 100,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

export interface AchievementWithProgress extends Achievement {
  currentValue: number
  targetValue: number
  progressPercent: number
}

export interface SaveReflectionPayload {
  energyMode: EnergyMode
  achievement: string
  challenge: string
  improvement: string
  nextDayPlan: string
}

export interface GamificationCelebration {
  id: number
  kind: 'xp' | 'level_up' | 'achievement'
  xpAmount?: number
  previousLevel?: number
  newLevel?: number
  levelTitleId?: string
  levelTitleEn?: string
  achievementTitleKey?: string
}

export const useGamificationStore = defineStore('gamification', () => {
  const transactions = ref<XPTransaction[]>([])
  const achievements = ref<Achievement[]>([])
  const rewards = ref<PersonalReward[]>([])
  const rewardRedemptions = ref<RewardRedemption[]>([])
  const customQuests = ref<CustomQuestRecord[]>([])
  const levelThresholds = ref<LevelThreshold[]>([...DEFAULT_LEVEL_THRESHOLDS])
  const todayReflection = ref<DailyReflection | null>(null)
  const reflections = ref<DailyReflection[]>([])
  const todayReflectionCompleted = ref(false)
  const activeCelebration = ref<GamificationCelebration | null>(null)
  const isLoaded = ref(false)
  let initPromise: Promise<void> | null = null
  const pendingEventIds = new Set<string>()
  let isSavingReflection = false
  let isRedeemingReward = false
  let celebrationTimer: ReturnType<typeof setTimeout> | null = null

  function triggerCelebration(
    payload: Omit<GamificationCelebration, 'id'>,
    durationMs = 1900
  ): void {
    if (celebrationTimer !== null) {
      clearTimeout(celebrationTimer)
    }
    activeCelebration.value = {
      ...payload,
      id: Date.now(),
    }
    celebrationTimer = setTimeout(() => {
      activeCelebration.value = null
      celebrationTimer = null
    }, durationMs)
  }

  async function initGamificationStore(force = false): Promise<void> {
    if (force) {
      isLoaded.value = false
      initPromise = null
      transactions.value = []
      achievements.value = []
      rewards.value = []
      rewardRedemptions.value = []
      customQuests.value = []
      todayReflection.value = null
      reflections.value = []
      todayReflectionCompleted.value = false
    }
    if (isLoaded.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        transactions.value = await db.xpTransactions.toArray()
        customQuests.value = await db.customQuests
          .orderBy('createdAt')
          .reverse()
          .toArray()

        const storedAchievements = await db.achievements.toArray()
        if (storedAchievements.length === 0) {
          await db.achievements.bulkPut(DEFAULT_ACHIEVEMENTS_SEED)
          achievements.value = [...DEFAULT_ACHIEVEMENTS_SEED]
        } else {
          const existingIds = new Set(storedAchievements.map((a) => a.id))
          const missing = DEFAULT_ACHIEVEMENTS_SEED.filter(
            (seed) => !existingIds.has(seed.id)
          )
          if (missing.length > 0) {
            await db.achievements.bulkPut(missing)
            achievements.value = [...storedAchievements, ...missing]
          } else {
            achievements.value = storedAchievements
          }
        }

        const storedRewards = await db.personalRewards.toArray()
        if (storedRewards.length === 0) {
          await db.personalRewards.bulkPut(DEFAULT_REWARDS_SEED)
          rewards.value = [...DEFAULT_REWARDS_SEED]
        } else {
          rewards.value = storedRewards
        }

        rewardRedemptions.value = await db.rewardRedemptions.toArray()
        levelThresholds.value = await loadCustomLevelThresholds()

        const allReflections = await db.dailyReflections.toArray()
        reflections.value = allReflections.sort((a, b) =>
          b.date.localeCompare(a.date)
        )

        const today = getLocalDateString()
        const foundToday =
          allReflections.find((r) => r.date === today) || null
        todayReflection.value = foundToday
        todayReflectionCompleted.value = Boolean(foundToday)
      } catch (err) {
        console.error('[RITME] Failed to initialize gamificationStore:', err)
        if (achievements.value.length === 0) {
          achievements.value = [...DEFAULT_ACHIEVEMENTS_SEED]
        }
        if (rewards.value.length === 0) {
          rewards.value = [...DEFAULT_REWARDS_SEED]
        }
      } finally {
        isLoaded.value = true
      }
    })()

    return initPromise
  }

  const totalXP = computed(() => {
    const sum = transactions.value.reduce((acc, item) => acc + item.amount, 0)
    return Math.max(0, sum)
  })

  const totalSpentXP = computed(() => {
    return rewardRedemptions.value.reduce(
      (acc, item) => acc + Math.max(0, Number(item.xpCost) || 0),
      0
    )
  })

  const availableXP = computed(() => {
    return Math.max(0, totalXP.value - totalSpentXP.value)
  })

  const activeRewards = computed(() =>
    rewards.value
      .filter((r) => r.active)
      .slice()
      .sort((a, b) => a.xpCost - b.xpCost)
  )

  const sortedRedemptions = computed(() =>
    rewardRedemptions.value
      .slice()
      .sort(
        (a, b) =>
          new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime()
      )
  )

  const todayXP = computed(() => {
    const today = getLocalDateString()
    const rawToday = transactions.value
      .filter((tx) => tx.date === today && tx.amount > 0)
      .reduce((acc, item) => acc + item.amount, 0)
    return Math.min(rawToday, DAILY_XP_CAP)
  })

  const currentLevelThreshold = computed<LevelThreshold>(() => {
    const xp = totalXP.value
    const sorted = levelThresholds.value
      .slice()
      .sort((a, b) => a.minXP - b.minXP)
    let matched = sorted[0] || DEFAULT_LEVEL_THRESHOLDS[0]
    for (const lvl of sorted) {
      if (xp >= lvl.minXP) {
        matched = lvl
      }
    }
    return matched
  })

  const currentLevel = computed(() => currentLevelThreshold.value.level)

  const levelProgressInfo = computed(() => {
    const xp = totalXP.value
    const current = currentLevelThreshold.value
    const sorted = levelThresholds.value
      .slice()
      .sort((a, b) => a.minXP - b.minXP)
    const next = sorted.find((l) => l.minXP > current.minXP) || null

    if (!next) {
      return {
        currentLevel: current.level,
        currentLevelMinXP: current.minXP,
        titleId: current.titleId,
        titleEn: current.titleEn,
        nextLevel: null as number | null,
        nextLevelMinXP: null as number | null,
        remainingXPToNextLevel: 0,
        progressPercent: 100,
      }
    }

    const span = Math.max(1, next.minXP - current.minXP)
    const earnedInLevel = Math.max(0, xp - current.minXP)
    const progressPercent = Math.min(
      100,
      Math.round((earnedInLevel / span) * 100)
    )

    return {
      currentLevel: current.level,
      currentLevelMinXP: current.minXP,
      titleId: current.titleId,
      titleEn: current.titleEn,
      nextLevel: next.level,
      nextLevelMinXP: next.minXP,
      remainingXPToNextLevel: Math.max(0, next.minXP - xp),
      progressPercent,
    }
  })

  const sortedTransactions = computed(() =>
    transactions.value
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  )

  const totalActiveStudyDaysCount = computed(() => {
    const focusStore = useFocusStore()
    const habitStore = useHabitStore()
    const dates = new Set<string>()
    for (const c of habitStore.completions) {
      dates.add(c.date)
    }
    for (const s of focusStore.completedSessions) {
      dates.add(getLocalDateString(new Date(s.startTime)))
    }
    for (const r of reflections.value) {
      dates.add(r.date)
    }
    return dates.size
  })

  const achievementsWithProgress = computed<AchievementWithProgress[]>(() => {
    const focusStore = useFocusStore()
    const habitStore = useHabitStore()
    const learningStore = useLearningStore()

    const completedSessionsCount = focusStore.completedSessions.length
    const activeDaysOrStreak = Math.max(
      habitStore.currentStreak,
      totalActiveStudyDaysCount.value
    )
    const totalStudyMins = focusStore.totalEffectiveStudyMinutes
    const masteredTopics = learningStore.overallMasteryStats.mastered
    const bossClearedCount = learningStore.bossAttempts.filter(
      (b) => b.passed
    ).length
    const resolvedMistakesCount = learningStore.mistakeNotes.filter(
      (m) => m.resolved
    ).length
    const questionAttemptsCount = learningStore.questionAttempts.length
    const mockTestsCount = learningStore.mockTests.length

    const metricsMap: Record<string, { current: number; target: number }> = {
      ach_first_step: { current: completedSessionsCount, target: 1 },
      ach_first_streak: { current: activeDaysOrStreak, target: 3 },
      ach_consistency: { current: activeDaysOrStreak, target: 7 },
      ach_focus_master: { current: totalStudyMins, target: 600 },
      ach_knowledge_seeker: { current: masteredTopics, target: 10 },
      ach_monthly_progress: {
        current: totalActiveStudyDaysCount.value,
        target: 30,
      },
      ach_first_boss: { current: bossClearedCount, target: 1 },
      ach_mistake_crusher: { current: resolvedMistakesCount, target: 3 },
      ach_question_veteran: { current: questionAttemptsCount, target: 30 },
      ach_mock_contender: { current: mockTestsCount, target: 2 },
    }

    return DEFAULT_ACHIEVEMENTS_SEED.map((seed) => {
      const stored =
        achievements.value.find((a) => a.id === seed.id) || seed
      const metric = metricsMap[seed.id] || { current: 0, target: 1 }
      const clampedCurrent = Math.min(metric.target, metric.current)
      const isMet = metric.current >= metric.target || stored.unlocked

      return {
        ...stored,
        unlocked: isMet,
        currentValue: clampedCurrent,
        targetValue: metric.target,
        progressPercent: Math.min(
          100,
          Math.round((clampedCurrent / metric.target) * 100)
        ),
      }
    })
  })

  const unlockedAchievementsCount = computed(
    () => achievementsWithProgress.value.filter((a) => a.unlocked).length
  )

  async function evaluateAchievements(): Promise<void> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    const nowIso = new Date().toISOString()

    // Kept strictly for legacy data compatibility (TASK 07):
    // silently preserves historical table records without RPG popups, chimes, or push notifications.
    for (const item of achievementsWithProgress.value) {
      const idx = achievements.value.findIndex((a) => a.id === item.id)
      if (item.unlocked && idx !== -1 && !achievements.value[idx].unlocked) {
        const unlockedRecord: Achievement = {
          ...toRaw(achievements.value[idx]),
          unlocked: true,
          unlockedAt: nowIso,
        }
        achievements.value[idx] = unlockedRecord
        await db.achievements.put({ ...unlockedRecord })
      }
    }
  }

  function hasEventBeenAwarded(eventId: string): boolean {
    return transactions.value.some((tx) => tx.eventId === eventId)
  }

  async function awardXP(
    eventId: string,
    source: XPSource,
    amount: number
  ): Promise<number> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }

    if (pendingEventIds.has(eventId) || hasEventBeenAwarded(eventId)) {
      return 0
    }

    pendingEventIds.add(eventId)
    try {
      const existingInDb = await db.xpTransactions
        .where('eventId')
        .equals(eventId)
        .first()
      if (existingInDb) {
        if (!hasEventBeenAwarded(eventId)) {
          transactions.value.push(existingInDb)
        }
        return 0
      }

      const today = getLocalDateString()
      const currentDaily = todayXP.value
      if (amount > 0 && currentDaily >= DAILY_XP_CAP) {
        return 0
      }

      const effectiveAmount =
        amount > 0 ? Math.min(amount, DAILY_XP_CAP - currentDaily) : amount
      if (effectiveAmount === 0) {
        return 0
      }

      const tx: XPTransaction = {
        id: `xp_${eventId}`,
        eventId,
        source,
        amount: effectiveAmount,
        date: today,
        createdAt: new Date().toISOString(),
      }

      const prevLevel = currentLevel.value
      await db.xpTransactions.put(tx)
      if (!hasEventBeenAwarded(eventId)) {
        transactions.value.push(tx)
      }
      const newLevel = currentLevel.value
      if (newLevel > prevLevel) {
        playQuestCompleteChime()
        triggerCelebration(
          {
            kind: 'level_up',
            xpAmount: effectiveAmount,
            previousLevel: prevLevel,
            newLevel,
            levelTitleId: currentLevelThreshold.value.titleId,
            levelTitleEn: currentLevelThreshold.value.titleEn,
          },
          3000
        )
        const userStore = useUserStore()
        if (userStore.settings.notifyLevelUp !== false) {
          const isId = userStore.settings.language !== 'en'
          void dispatchImmediateNotification({
            title: isId ? 'Naik Level!' : 'Level Up!',
            body: isId
              ? `Level ${prevLevel} → Level ${newLevel}. Pertahankan ritme belajarmu!`
              : `Level ${prevLevel} → Level ${newLevel}. Keep up your study rhythm!`,
            settings: userStore.settings,
          })
        }
      } else if (effectiveAmount > 0) {
        triggerCelebration(
          {
            kind: 'xp',
            xpAmount: effectiveAmount,
          },
          2200
        )
      }
      return effectiveAmount
    } catch (err) {
      console.error('[RITME] Failed to award XP:', err)
      return 0
    } finally {
      pendingEventIds.delete(eventId)
    }
  }

  async function addPersonalReward(payload: {
    title: string
    description: string
    xpCost: number
  }): Promise<PersonalReward | null> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    const cleanTitle = payload.title.trim()
    if (!cleanTitle) return null

    const safeCost = Math.max(5, Math.round(Number(payload.xpCost) || 20))
    const newReward: PersonalReward = {
      id: generateId('reward'),
      title: cleanTitle,
      description: payload.description.trim(),
      xpCost: safeCost,
      active: true,
      createdAt: new Date().toISOString(),
    }

    rewards.value.push(newReward)
    await db.personalRewards.put({ ...newReward })
    return newReward
  }

  async function updatePersonalReward(
    rewardId: string,
    partial: Partial<Omit<PersonalReward, 'id' | 'createdAt'>>
  ): Promise<void> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    const idx = rewards.value.findIndex((r) => r.id === rewardId)
    if (idx === -1) return

    const current = toRaw(rewards.value[idx])
    const updated: PersonalReward = {
      ...current,
      ...partial,
      id: rewardId,
      title:
        partial.title !== undefined
          ? partial.title.trim() || current.title
          : current.title,
      description:
        partial.description !== undefined
          ? partial.description.trim()
          : current.description,
      xpCost:
        partial.xpCost !== undefined
          ? Math.max(5, Math.round(Number(partial.xpCost) || current.xpCost))
          : current.xpCost,
    }

    rewards.value[idx] = updated
    await db.personalRewards.put({ ...updated })
  }

  async function deletePersonalReward(rewardId: string): Promise<void> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    await db.personalRewards.delete(rewardId)
    rewards.value = rewards.value.filter((r) => r.id !== rewardId)
  }

  async function updateLevelThreshold(
    level: number,
    newMinXP: number
  ): Promise<void> {
    if (level <= 1) return
    const updated = levelThresholds.value.map((item) =>
      item.level === level
        ? { ...item, minXP: Math.max(10, Math.round(Number(newMinXP) || item.minXP)) }
        : { ...item }
    )
    levelThresholds.value = await saveCustomLevelThresholds(updated)
  }

  async function resetLevelThresholds(): Promise<void> {
    levelThresholds.value = await resetCustomLevelThresholds()
  }

  async function redeemReward(
    rewardId: string,
    displayTitle?: string
  ): Promise<RewardRedemption | null> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    if (isRedeemingReward) return null

    const reward = rewards.value.find((r) => r.id === rewardId)
    if (!reward) return null
    if (availableXP.value < reward.xpCost) return null

    isRedeemingReward = true
    try {
      const redemption: RewardRedemption = {
        id: generateId('redeem'),
        rewardId: reward.id,
        title: displayTitle || reward.title,
        xpCost: reward.xpCost,
        redeemedAt: new Date().toISOString(),
      }

      await db.rewardRedemptions.put({ ...redemption })
      rewardRedemptions.value.unshift(redemption)
      return redemption
    } catch (err) {
      console.error('[RITME] Failed to redeem reward:', err)
      return null
    } finally {
      isRedeemingReward = false
    }
  }

  async function saveDailyReflection(
    payload: SaveReflectionPayload
  ): Promise<{ saved: boolean; xpEarned: number }> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    if (isSavingReflection) {
      return { saved: false, xpEarned: 0 }
    }

    const achievement = payload.achievement.trim()
    const challenge = payload.challenge.trim()
    const improvement = payload.improvement.trim()
    const nextDayPlan = payload.nextDayPlan.trim()

    if (!achievement && !challenge && !improvement && !nextDayPlan) {
      return { saved: false, xpEarned: 0 }
    }

    isSavingReflection = true
    try {
      const today = getLocalDateString()
      const existingForToday = await db.dailyReflections
        .where('date')
        .equals(today)
        .first()

      const record: DailyReflection = {
        id: existingForToday?.id || `refl_${today}`,
        date: today,
        energyMode: payload.energyMode,
        achievement,
        challenge,
        improvement,
        nextDayPlan,
      }

      await db.dailyReflections.put(record)
      todayReflection.value = record
      todayReflectionCompleted.value = true

      const idx = reflections.value.findIndex((r) => r.date === today)
      if (idx !== -1) {
        reflections.value[idx] = record
      } else {
        reflections.value.unshift(record)
      }

      const userStore = useUserStore()
      await userStore.setEnergyMode(payload.energyMode)

      const xpEarned = await awardXP(
        `quest_daily_reflection_${today}`,
        'daily_reflection',
        5
      )

      return { saved: true, xpEarned }
    } catch (err) {
      console.error('[RITME] Failed to save daily reflection:', err)
      return { saved: false, xpEarned: 0 }
    } finally {
      isSavingReflection = false
    }
  }

  async function syncFocusBlocksXP(todayEffectiveMinutes: number): Promise<number> {
    const today = getLocalDateString()
    const totalBlocks = Math.floor(Math.max(0, todayEffectiveMinutes) / 20)
    let awardedTotal = 0

    for (let blockIdx = 1; blockIdx <= totalBlocks; blockIdx++) {
      const eventId =
        blockIdx === 1
          ? `quest_focus_block_20m_${today}`
          : `focus_block_20m_${today}_block_${blockIdx}`
      const gained = await awardXP(eventId, 'focus_block_20m', 15)
      awardedTotal += gained
    }

    return awardedTotal
  }

  async function syncDailyQuestRewards(): Promise<void> {
    const today = getLocalDateString()
    const focusStore = useFocusStore()
    const habitStore = useHabitStore()

    if (focusStore.hasStartedFocusToday) {
      await awardXP(`quest_first_focus_${today}`, 'first_focus_session', 5)
    }
    if (focusStore.todayStudyMinutes >= 20) {
      await syncFocusBlocksXP(focusStore.todayStudyMinutes)
    }
    if (habitStore.todayCompletedCount >= 1) {
      await awardXP(`quest_daily_habit_${today}`, 'daily_learning_task', 10)
    }
    if (todayReflectionCompleted.value) {
      await awardXP(`quest_daily_reflection_${today}`, 'daily_reflection', 5)
    }
  }

  const todayQuests = computed<DailyQuestItem[]>(() => {
    const today = getLocalDateString()
    const focusStore = useFocusStore()
    const habitStore = useHabitStore()

    const firstFocusEventId = `quest_first_focus_${today}`
    const focusBlockEventId = `quest_focus_block_20m_${today}`
    const dailyHabitEventId = `quest_daily_habit_${today}`
    const dailyReflectionEventId = `quest_daily_reflection_${today}`

    return [
      {
        id: 'first_focus',
        eventId: firstFocusEventId,
        source: 'first_focus_session',
        titleKey: 'quests.firstFocusTitle',
        descKey: 'quests.firstFocusDesc',
        xpReward: 5,
        completed: focusStore.hasStartedFocusToday,
        currentProgress: focusStore.hasStartedFocusToday ? 1 : 0,
        targetProgress: 1,
        progressUnit: 'steps',
      },
      {
        id: 'focus_block_20m',
        eventId: focusBlockEventId,
        source: 'focus_block_20m',
        titleKey: 'quests.focusBlockTitle',
        descKey: 'quests.focusBlockDesc',
        xpReward: 15,
        completed: focusStore.todayStudyMinutes >= 20,
        currentProgress: Math.min(20, focusStore.todayStudyMinutes),
        targetProgress: 20,
        progressUnit: 'minutes',
      },
      {
        id: 'daily_habit',
        eventId: dailyHabitEventId,
        source: 'daily_learning_task',
        titleKey: 'quests.dailyHabitTitle',
        descKey: 'quests.dailyHabitDesc',
        xpReward: 10,
        completed: habitStore.todayCompletedCount >= 1,
        currentProgress: Math.min(1, habitStore.todayCompletedCount),
        targetProgress: 1,
        progressUnit: 'steps',
      },
      {
        id: 'daily_reflection',
        eventId: dailyReflectionEventId,
        source: 'daily_reflection',
        titleKey: 'quests.dailyReflectionTitle',
        descKey: 'quests.dailyReflectionDesc',
        xpReward: 5,
        completed: todayReflectionCompleted.value,
        currentProgress: todayReflectionCompleted.value ? 1 : 0,
        targetProgress: 1,
        progressUnit: 'steps',
      },
    ]
  })

  const completedQuestsCount = computed(
    () => todayQuests.value.filter((q) => q.completed).length
  )

  /* ==========================================================================
     RITME 3.0 — Quest System 2.0 (Weekly, Main, Side, Custom) & Attributes
     ========================================================================== */

  const weeklyQuests = computed<DailyQuestItem[]>(() => {
    const focusStore = useFocusStore()
    const habitStore = useHabitStore()
    const learningStore = useLearningStore()
    const userStore = useUserStore()
    const weekKey = getLocalWeekStartDateString()

    const focusTarget = Math.max(
      30,
      Math.min(600, userStore.settings.weeklyFocusTargetMinutes || 120)
    )
    const practiceTarget = Math.max(
      1,
      Math.min(100, userStore.settings.weeklyPracticeTargetQuestions || 5)
    )
    const streakTarget = Math.max(
      1,
      Math.min(7, userStore.settings.weeklyStreakTargetDays || 4)
    )

    const weeklyFocusMins = focusStore.weeklyEffectiveStudyMinutes

    const weeklyUniqueQuestionIds = new Set(
      learningStore.questionAttempts
        .filter((a) => isDateInCurrentLocalWeek(a.attemptedAt))
        .map((a) => a.questionId)
    )
    const weeklyPracticeCount = weeklyUniqueQuestionIds.size

    const activeDatesThisWeek = new Set<string>()
    for (const c of habitStore.completions) {
      if (isDateInCurrentLocalWeek(c.date)) {
        activeDatesThisWeek.add(c.date)
      }
    }
    for (const s of focusStore.completedSessions) {
      if (isDateInCurrentLocalWeek(s.startTime)) {
        activeDatesThisWeek.add(getLocalDateString(new Date(s.startTime)))
      }
    }
    for (const r of reflections.value) {
      if (isDateInCurrentLocalWeek(r.date)) {
        activeDatesThisWeek.add(r.date)
      }
    }
    for (const a of learningStore.questionAttempts) {
      if (isDateInCurrentLocalWeek(a.attemptedAt)) {
        activeDatesThisWeek.add(getLocalDateString(new Date(a.attemptedAt)))
      }
    }
    const weeklyActiveDays = activeDatesThisWeek.size

    return [
      {
        id: 'weekly_focus_120',
        eventId: `quest_weekly_focus_120_${weekKey}`,
        source: 'quest_completed',
        titleKey: 'quests.weeklyFocusTitle',
        titleParams: { target: focusTarget },
        descKey: 'quests.weeklyFocusDesc',
        xpReward: 25,
        completed: weeklyFocusMins >= focusTarget,
        currentProgress: Math.min(focusTarget, weeklyFocusMins),
        targetProgress: focusTarget,
        progressUnit: 'minutes',
      },
      {
        id: 'weekly_practice_5',
        eventId: `quest_weekly_practice_5_${weekKey}`,
        source: 'quest_completed',
        titleKey: 'quests.weeklyPracticeTitle',
        titleParams: { target: practiceTarget },
        descKey: 'quests.weeklyPracticeDesc',
        xpReward: 20,
        completed: weeklyPracticeCount >= practiceTarget,
        currentProgress: Math.min(practiceTarget, weeklyPracticeCount),
        targetProgress: practiceTarget,
        progressUnit: 'questions',
      },
      {
        id: 'weekly_streak_4',
        eventId: `quest_weekly_streak_4_${weekKey}`,
        source: 'quest_completed',
        titleKey: 'quests.weeklyStreakTitle',
        titleParams: { target: streakTarget },
        descKey: 'quests.weeklyStreakDesc',
        xpReward: 25,
        completed: weeklyActiveDays >= streakTarget,
        currentProgress: Math.min(streakTarget, weeklyActiveDays),
        targetProgress: streakTarget,
        progressUnit: 'days',
      },
    ]
  })

  const mainQuests = computed<DailyQuestItem[]>(() => {
    const learningStore = useLearningStore()
    const clearedChaptersCount = learningStore.chapters.filter(
      (c) =>
        c.status === 'challenge_ready' ||
        c.status === 'completed' ||
        c.status === 'mastered'
    ).length
    const clearedBossCount = learningStore.bossAttempts.filter(
      (b) => b.passed
    ).length
    const masteredCount = learningStore.overallMasteryStats.mastered

    return [
      {
        id: 'main_first_chapter',
        eventId: 'quest_main_first_chapter',
        source: 'quest_completed',
        titleKey: 'quests.mainFirstChapterTitle',
        descKey: 'quests.mainFirstChapterDesc',
        xpReward: 25,
        completed: clearedChaptersCount >= 1,
        currentProgress: Math.min(1, clearedChaptersCount),
        targetProgress: 1,
        progressUnit: 'steps',
      },
      {
        id: 'main_first_boss',
        eventId: 'quest_main_first_boss',
        source: 'boss_challenge',
        titleKey: 'quests.mainFirstBossTitle',
        descKey: 'quests.mainFirstBossDesc',
        xpReward: 30,
        completed: clearedBossCount >= 1,
        currentProgress: Math.min(1, clearedBossCount),
        targetProgress: 1,
        progressUnit: 'steps',
      },
      {
        id: 'main_master_3',
        eventId: 'quest_main_master_3',
        source: 'concept_mastered',
        titleKey: 'quests.mainMaster3Title',
        descKey: 'quests.mainMaster3Desc',
        xpReward: 35,
        completed: masteredCount >= 3,
        currentProgress: Math.min(3, masteredCount),
        targetProgress: 3,
        progressUnit: 'topics',
      },
    ]
  })

  const sideQuests = computed<DailyQuestItem[]>(() => {
    const learningStore = useLearningStore()
    const resolvedMistakeCount = learningStore.mistakeNotes.filter(
      (m) => m.resolved
    ).length
    const loggedMockCount = learningStore.mockTests.length

    return [
      {
        id: 'side_mistake_resolve',
        eventId: 'quest_side_mistake_resolve',
        source: 'quest_completed',
        titleKey: 'quests.sideMistakeTitle',
        descKey: 'quests.sideMistakeDesc',
        xpReward: 15,
        completed: resolvedMistakeCount >= 1,
        currentProgress: Math.min(1, resolvedMistakeCount),
        targetProgress: 1,
        progressUnit: 'steps',
      },
      {
        id: 'side_mock_log',
        eventId: 'quest_side_mock_log',
        source: 'quest_completed',
        titleKey: 'quests.sideMockTitle',
        descKey: 'quests.sideMockDesc',
        xpReward: 15,
        completed: loggedMockCount >= 1,
        currentProgress: Math.min(1, loggedMockCount),
        targetProgress: 1,
        progressUnit: 'steps',
      },
    ]
  })

  /**
   * Compatibility wrapper (TASK 07):
   * Retired Weekly / Main / Side RPG quests are no longer silently awarded in the background.
   */
  async function syncAllQuestRewards(): Promise<void> {
    await syncDailyQuestRewards()
  }

  const characterAttributes = computed(() => {
    const learningStore = useLearningStore()
    const focusStore = useFocusStore()
    const habitStore = useHabitStore()

    const puProg = learningStore.getSubtestProgress('subtest_pu').percent
    const ppuProg = learningStore.getSubtestProgress('subtest_ppu').percent
    const pbmProg = learningStore.getSubtestProgress('subtest_pbm').percent
    const pkProg = learningStore.getSubtestProgress('subtest_pk').percent
    const lbiProg = learningStore.getSubtestProgress('subtest_lbi').percent
    const lbeProg = learningStore.getSubtestProgress('subtest_lbe').percent
    const pmProg = learningStore.getSubtestProgress('subtest_pm').percent

    const disciplineScore = Math.min(
      100,
      Math.round(
        habitStore.currentStreak * 10 + totalActiveStudyDaysCount.value * 4
      )
    )
    const focusScore = Math.min(
      100,
      Math.round((focusStore.totalEffectiveStudyMinutes / 300) * 100)
    )

    return {
      logic: Math.min(100, Math.max(0, puProg)),
      knowledge: Math.min(100, Math.max(0, Math.round((ppuProg + pbmProg) / 2))),
      literacy: Math.min(100, Math.max(0, Math.round((lbiProg + lbeProg) / 2))),
      quantitative: Math.min(100, Math.max(0, Math.round((pkProg + pmProg) / 2))),
      discipline: Math.max(0, disciplineScore),
      focus: Math.max(0, focusScore),
    }
  })

  async function addCustomQuest(payload: {
    title: string
    description: string
    targetCount?: number
    xpReward?: number
  }): Promise<CustomQuestRecord | null> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    const cleanTitle = payload.title.trim()
    if (!cleanTitle) return null

    const id = generateId('cquest')
    const record: CustomQuestRecord = {
      id,
      title: cleanTitle,
      description: payload.description.trim(),
      questType: 'custom',
      targetCount: Math.max(1, Math.round(Number(payload.targetCount) || 1)),
      currentCount: 0,
      xpReward: Math.max(5, Math.min(30, Math.round(Number(payload.xpReward) || 10))),
      completed: false,
      createdAt: new Date().toISOString(),
      completedEventId: `custom_quest_${id}`,
    }

    customQuests.value.unshift(record)
    await db.customQuests.put({ ...record })
    return record
  }

  async function incrementCustomQuestProgress(questId: string): Promise<number> {
    if (!isLoaded.value) {
      await initGamificationStore()
    }
    const idx = customQuests.value.findIndex((q) => q.id === questId)
    if (idx === -1) return 0

    const cur = toRaw(customQuests.value[idx])
    if (cur.completed) return 0

    const nextCount = Math.min(cur.targetCount, cur.currentCount + 1)
    const isNowCompleted = nextCount >= cur.targetCount

    const updated: CustomQuestRecord = {
      ...cur,
      currentCount: nextCount,
      completed: isNowCompleted,
    }
    customQuests.value[idx] = updated
    await db.customQuests.put({ ...updated })

    if (isNowCompleted) {
      return await awardXP(
        updated.completedEventId,
        'quest_completed',
        updated.xpReward
      )
    }
    return 0
  }

  const adventurerTitles = computed(() => {
    const learningStore = useLearningStore()

    const totalAnswered = learningStore.questionAttempts.length
    const passedBosses = learningStore.bossAttempts.filter(
      (b) => b.passed
    ).length
    const resolvedMistakes = learningStore.mistakeNotes.filter(
      (m) => m.resolved
    ).length
    const mockCount = learningStore.mockTests.length
    const masterMetric = Math.max(
      Math.min(1, Math.floor(currentLevel.value / 6)),
      Math.min(1, Math.floor(passedBosses / 5))
    )

    return [
      {
        id: 'default',
        titleKey: 'progress.titles.default',
        conditionKey: 'progress.titleConditions.default',
        unlocked: true,
        currentValue: 1,
        targetValue: 1,
      },
      {
        id: 'title_explorer',
        titleKey: 'progress.titles.explorer',
        conditionKey: 'progress.titleConditions.explorer',
        unlocked: totalAnswered >= 20,
        currentValue: Math.min(20, totalAnswered),
        targetValue: 20,
      },
      {
        id: 'title_boss_slayer',
        titleKey: 'progress.titles.bossSlayer',
        conditionKey: 'progress.titleConditions.bossSlayer',
        unlocked: passedBosses >= 1,
        currentValue: Math.min(1, passedBosses),
        targetValue: 1,
      },
      {
        id: 'title_archivist',
        titleKey: 'progress.titles.archivist',
        conditionKey: 'progress.titleConditions.archivist',
        unlocked: resolvedMistakes >= 3,
        currentValue: Math.min(3, resolvedMistakes),
        targetValue: 3,
      },
      {
        id: 'title_strategist',
        titleKey: 'progress.titles.strategist',
        conditionKey: 'progress.titleConditions.strategist',
        unlocked: mockCount >= 3,
        currentValue: Math.min(3, mockCount),
        targetValue: 3,
      },
      {
        id: 'title_ritme_knight',
        titleKey: 'progress.titles.ritmeKnight',
        conditionKey: 'progress.titleConditions.ritmeKnight',
        unlocked: currentLevel.value >= 6 || passedBosses >= 5,
        currentValue: masterMetric,
        targetValue: 1,
      },
    ]
  })

  const equippedTitleKey = computed<string | null>(() => {
    const userStore = useUserStore()
    const selectedId = userStore.settings.selectedTitleId || 'default'
    if (selectedId === 'default') return null
    const matched = adventurerTitles.value.find(
      (item) => item.id === selectedId && item.unlocked
    )
    return matched ? matched.titleKey : null
  })

  const realmRelics = computed(() => {
    const learningStore = useLearningStore()
    return learningStore.adventureRealms.map((r) => ({
      subtestId: r.subtest.id,
      code: r.subtest.code,
      realmNameId: r.realm.realmNameId,
      realmNameEn: r.realm.realmNameEn,
      icon: r.realm.icon,
      unlocked: r.bossCleared,
    }))
  })

  const avatarFrames = computed(() => {
    const learningStore = useLearningStore()
    const unlockedRelics = realmRelics.value.filter((r) => r.unlocked).length
    const finalCleared = learningStore.bossAttempts.some(
      (b) => b.bossType === 'final_challenge' && b.passed
    )
    return [
      {
        id: 'aurora_violet',
        titleKey: 'progress.frames.auroraViolet',
        conditionKey: 'progress.frameConditions.auroraViolet',
        unlocked: true,
      },
      {
        id: 'cyan_prism',
        titleKey: 'progress.frames.cyanPrism',
        conditionKey: 'progress.frameConditions.cyanPrism',
        unlocked: unlockedRelics >= 1,
      },
      {
        id: 'solar_gold',
        titleKey: 'progress.frames.solarGold',
        conditionKey: 'progress.frameConditions.solarGold',
        unlocked: currentLevel.value >= 4 || unlockedRelics >= 3,
      },
      {
        id: 'obsidian_master',
        titleKey: 'progress.frames.obsidianMaster',
        conditionKey: 'progress.frameConditions.obsidianMaster',
        unlocked: unlockedRelics >= 5 || finalCleared,
      },
    ]
  })

  const equippedFrameId = computed<string>(() => {
    const userStore = useUserStore()
    const candidate = userStore.settings.selectedFrameId || 'aurora_violet'
    const matched = avatarFrames.value.find(
      (f) => f.id === candidate && f.unlocked
    )
    return matched ? matched.id : 'aurora_violet'
  })

  async function equipTitle(titleId: string): Promise<void> {
    const userStore = useUserStore()
    const found = adventurerTitles.value.find((item) => item.id === titleId)
    if (!found || !found.unlocked) return
    await userStore.updateSettings({ selectedTitleId: titleId })
  }

  async function equipFrame(frameId: string): Promise<void> {
    const userStore = useUserStore()
    const found = avatarFrames.value.find((item) => item.id === frameId)
    if (!found || !found.unlocked) return
    await userStore.updateSettings({ selectedFrameId: frameId })
  }

  async function deleteCustomQuest(questId: string): Promise<void> {
    await db.customQuests.delete(questId)
    customQuests.value = customQuests.value.filter((q) => q.id !== questId)
  }

  return {
    transactions,
    sortedTransactions,
    achievements,
    achievementsWithProgress,
    unlockedAchievementsCount,
    adventurerTitles,
    equippedTitleKey,
    realmRelics,
    avatarFrames,
    equippedFrameId,
    equipTitle,
    equipFrame,
    rewards,
    activeRewards,
    rewardRedemptions,
    sortedRedemptions,
    customQuests,
    levelThresholds,
    todayReflection,
    reflections,
    todayReflectionCompleted,
    activeCelebration,
    totalActiveStudyDaysCount,
    isLoaded,
    totalXP,
    totalSpentXP,
    availableXP,
    todayXP,
    currentLevel,
    levelProgressInfo,
    todayQuests,
    weeklyQuests,
    mainQuests,
    sideQuests,
    characterAttributes,
    completedQuestsCount,
    initGamificationStore,
    hasEventBeenAwarded,
    awardXP,
    addPersonalReward,
    updatePersonalReward,
    deletePersonalReward,
    redeemReward,
    updateLevelThreshold,
    resetLevelThresholds,
    evaluateAchievements,
    saveDailyReflection,
    syncFocusBlocksXP,
    syncDailyQuestRewards,
    syncAllQuestRewards,
    addCustomQuest,
    incrementCustomQuestProgress,
    deleteCustomQuest,
  }
})
