import { defineStore } from 'pinia'
import { computed, ref, toRaw } from 'vue'
import { db } from '@/services/database/db'
import { getLocalDateString } from '@/utils/date'
import { generateId } from '@/utils/id'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'
import { useFocusStore } from '@/stores/focusStore'
import type { Habit, HabitCompletion } from '@/types'

export interface DailyHabitOverview {
  date: string
  dayOfWeek: number
  dayNumber: string
  isToday: boolean
  isRestDay: boolean
  completedCount: number
  totalActive: number
  ratePercent: number
}

export interface CalendarDayOverview {
  date: string
  dayOfWeek: number
  dayNumber: string
  isToday: boolean
  isRestDay: boolean
  completedHabitsCount: number
  studyMinutes: number
  isActiveDay: boolean
}

const DEFAULT_HABITS_SEED: Habit[] = [
  {
    id: 'habit_default_1',
    name: 'defaultHabits.afterBreakfast',
    description: 'defaultHabits.afterBreakfastDesc',
    active: true,
    stackOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_default_2',
    name: 'defaultHabits.prepareDesk',
    description: 'defaultHabits.prepareDeskDesc',
    active: true,
    stackOrder: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_default_3',
    name: 'defaultHabits.putPhoneAway',
    description: 'defaultHabits.putPhoneAwayDesc',
    active: true,
    stackOrder: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_default_4',
    name: 'defaultHabits.completeSession',
    description: 'defaultHabits.completeSessionDesc',
    active: true,
    stackOrder: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_default_6',
    name: 'defaultHabits.completeExercises',
    description: 'defaultHabits.completeExercisesDesc',
    active: true,
    stackOrder: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_default_5',
    name: 'defaultHabits.reviewMistakes',
    description: 'defaultHabits.reviewMistakesDesc',
    active: true,
    stackOrder: 6,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_default_7',
    name: 'defaultHabits.prepareNextDay',
    description: 'defaultHabits.prepareNextDayDesc',
    active: true,
    stackOrder: 7,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
]

export const useHabitStore = defineStore('habit', () => {
  const habits = ref<Habit[]>([])
  const completions = ref<HabitCompletion[]>([])
  const isLoaded = ref(false)
  let initPromise: Promise<void> | null = null
  const pendingHabitToggles = new Set<string>()

  async function initHabitStore(force = false): Promise<void> {
    if (force) {
      isLoaded.value = false
      initPromise = null
      habits.value = []
      completions.value = []
    }
    if (isLoaded.value) return
    if (initPromise) return initPromise

    initPromise = (async () => {
      try {
        const storedHabits = await db.habits.orderBy('stackOrder').toArray()
        if (storedHabits.length === 0) {
          await db.habits.bulkPut(DEFAULT_HABITS_SEED)
          habits.value = [...DEFAULT_HABITS_SEED]
        } else {
          habits.value = storedHabits
        }

        completions.value = await db.habitCompletions.toArray()
      } catch (err) {
        console.error('[RITME] Failed to initialize habitStore:', err)
        if (habits.value.length === 0) {
          habits.value = [...DEFAULT_HABITS_SEED]
        }
      } finally {
        isLoaded.value = true
      }
    })()

    return initPromise
  }

  const activeHabits = computed(() =>
    habits.value
      .filter((h) => h.active)
      .slice()
      .sort((a, b) => a.stackOrder - b.stackOrder)
  )

  const inactiveHabits = computed(() =>
    habits.value
      .filter((h) => !h.active)
      .slice()
      .sort((a, b) => a.stackOrder - b.stackOrder)
  )

  const todayCompletions = computed(() => {
    const today = getLocalDateString()
    return completions.value.filter((c) => c.date === today)
  })

  function isHabitCompletedOnDate(habitId: string, dateStr: string): boolean {
    return completions.value.some(
      (c) => c.habitId === habitId && c.date === dateStr
    )
  }

  function isHabitCompletedToday(habitId: string): boolean {
    return isHabitCompletedOnDate(habitId, getLocalDateString())
  }

  const todayCompletedCount = computed(() => {
    return activeHabits.value.filter((h) => isHabitCompletedToday(h.id)).length
  })

  const last7DaysOverview = computed<DailyHabitOverview[]>(() => {
    const userStore = useUserStore()
    const restDay = userStore.settings.weeklyRestDay
    const activeIds = new Set(activeHabits.value.map((h) => h.id))
    const totalActive = Math.max(1, activeHabits.value.length)
    const todayStr = getLocalDateString()
    const days: DailyHabitOverview[] = []

    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - offset)
      const dateStr = getLocalDateString(d)
      const dayOfWeek = d.getDay()

      const completedUniqueIds = new Set(
        completions.value
          .filter((c) => c.date === dateStr && activeIds.has(c.habitId))
          .map((c) => c.habitId)
      )
      const completedCount = completedUniqueIds.size
      const ratePercent = Math.min(
        100,
        Math.round((completedCount / totalActive) * 100)
      )

      days.push({
        date: dateStr,
        dayOfWeek,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        isToday: dateStr === todayStr,
        isRestDay: dayOfWeek === restDay,
        completedCount,
        totalActive: activeHabits.value.length,
        ratePercent,
      })
    }

    return days
  })

  const weeklyConsistencyPercent = computed(() => {
    const plannedDays = last7DaysOverview.value.filter(
      (d) => !d.isRestDay || d.completedCount > 0
    )
    if (plannedDays.length === 0) return 0
    const sum = plannedDays.reduce((acc, d) => acc + d.ratePercent, 0)
    return Math.round(sum / plannedDays.length)
  })

  const last30DaysOverview = computed<CalendarDayOverview[]>(() => {
    const userStore = useUserStore()
    const focusStore = useFocusStore()
    const restDay = userStore.settings.weeklyRestDay
    const activeIds = new Set(activeHabits.value.map((h) => h.id))
    const todayStr = getLocalDateString()

    // Map study minutes by date
    const studyByDate = new Map<string, number>()
    for (const s of focusStore.completedSessions) {
      const dStr = getLocalDateString(new Date(s.startTime))
      const prev = studyByDate.get(dStr) || 0
      studyByDate.set(
        dStr,
        prev + Math.max(0, Number(s.durationMinutes) || 0)
      )
    }

    const days: CalendarDayOverview[] = []
    for (let offset = 29; offset >= 0; offset--) {
      const d = new Date()
      d.setHours(12, 0, 0, 0)
      d.setDate(d.getDate() - offset)
      const dateStr = getLocalDateString(d)
      const dayOfWeek = d.getDay()

      const completedUniqueIds = new Set(
        completions.value
          .filter((c) => c.date === dateStr && activeIds.has(c.habitId))
          .map((c) => c.habitId)
      )
      const completedHabitsCount = completedUniqueIds.size
      const studyMinutes = studyByDate.get(dateStr) || 0

      days.push({
        date: dateStr,
        dayOfWeek,
        dayNumber: String(d.getDate()).padStart(2, '0'),
        isToday: dateStr === todayStr,
        isRestDay: dayOfWeek === restDay,
        completedHabitsCount,
        studyMinutes,
        isActiveDay: completedHabitsCount > 0 || studyMinutes > 0,
      })
    }

    return days
  })

  const activeDaysInLast30Count = computed(
    () => last30DaysOverview.value.filter((d) => d.isActiveDay).length
  )

  /**
   * Calculates consecutive active days respecting the user's scheduled Weekly Rest Day (PRD Section 8).
   */
  const currentStreak = computed(() => {
    const userStore = useUserStore()
    const focusStore = useFocusStore()
    const restDay = userStore.settings.weeklyRestDay

    const activeDates = new Set<string>()
    for (const c of completions.value) {
      activeDates.add(c.date)
    }
    for (const s of focusStore.sessions) {
      if (s.status === 'completed') {
        activeDates.add(getLocalDateString(new Date(s.startTime)))
      }
    }

    let streak = 0
    const cursor = new Date()
    cursor.setHours(12, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
      const dateStr = getLocalDateString(cursor)
      const dayOfWeek = cursor.getDay()
      const hasActivity = activeDates.has(dateStr)

      if (hasActivity) {
        streak++
      } else if (i === 0) {
        // Today hasn't been completed yet; check yesterday before breaking streak
      } else if (dayOfWeek === restDay) {
        // Scheduled rest day does not break streak
      } else {
        break
      }

      cursor.setDate(cursor.getDate() - 1)
    }

    return streak
  })

  async function toggleHabitToday(habitId: string): Promise<void> {
    if (!isLoaded.value) {
      await initHabitStore()
    }

    if (pendingHabitToggles.has(habitId)) {
      return
    }

    pendingHabitToggles.add(habitId)
    try {
      const today = getLocalDateString()
      const matching = completions.value.filter(
        (c) => c.habitId === habitId && c.date === today
      )

      if (matching.length > 0) {
        const idsToDelete = matching.map((c) => c.id)
        await db.habitCompletions.bulkDelete(idsToDelete)
        completions.value = completions.value.filter(
          (c) => !(c.habitId === habitId && c.date === today)
        )
      } else {
        const record: HabitCompletion = {
          id: `hcomp_${habitId}_${today}`,
          habitId,
          date: today,
          completedAt: new Date().toISOString(),
        }
        await db.habitCompletions.put(record)
        completions.value.push(record)

        const gamificationStore = useGamificationStore()
        await gamificationStore.awardXP(
          `quest_daily_habit_${today}`,
          'daily_learning_task',
          10
        )
      }
    } catch (err) {
      console.error('[RITME] Failed to toggle habit completion:', err)
    } finally {
      pendingHabitToggles.delete(habitId)
    }
  }

  async function addHabit(payload: {
    name: string
    description: string
    active?: boolean
  }): Promise<Habit | null> {
    if (!isLoaded.value) {
      await initHabitStore()
    }
    const cleanName = payload.name.trim()
    if (!cleanName) return null

    const maxOrder = habits.value.reduce(
      (max, h) => Math.max(max, h.stackOrder),
      0
    )

    const newHabit: Habit = {
      id: generateId('habit'),
      name: cleanName,
      description: payload.description.trim(),
      active: payload.active !== undefined ? payload.active : true,
      stackOrder: maxOrder + 1,
      createdAt: new Date().toISOString(),
    }

    habits.value.push(newHabit)
    await db.habits.put({ ...newHabit })
    return newHabit
  }

  async function updateHabit(
    habitId: string,
    partial: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ): Promise<void> {
    if (!isLoaded.value) {
      await initHabitStore()
    }
    const idx = habits.value.findIndex((h) => h.id === habitId)
    if (idx === -1) return

    const current = toRaw(habits.value[idx])
    const updated: Habit = {
      ...current,
      ...partial,
      id: habitId,
      name:
        partial.name !== undefined
          ? partial.name.trim() || current.name
          : current.name,
      description:
        partial.description !== undefined
          ? partial.description.trim()
          : current.description,
    }

    habits.value[idx] = updated
    await db.habits.put({ ...updated })
  }

  async function moveHabitOrder(
    habitId: string,
    direction: 'up' | 'down'
  ): Promise<void> {
    if (!isLoaded.value) {
      await initHabitStore()
    }
    const ordered = activeHabits.value.slice()
    const currentIndex = ordered.findIndex((h) => h.id === habitId)
    if (currentIndex === -1) return

    const targetIndex =
      direction === 'up' ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= ordered.length) return

    const currentHabit = toRaw(ordered[currentIndex])
    const neighborHabit = toRaw(ordered[targetIndex])

    const tempOrder = currentHabit.stackOrder
    const updatedCurrent: Habit = {
      ...currentHabit,
      stackOrder: neighborHabit.stackOrder,
    }
    const updatedNeighbor: Habit = {
      ...neighborHabit,
      stackOrder: tempOrder,
    }

    // If both had identical stackOrder, normalize all active habits' stackOrder
    if (updatedCurrent.stackOrder === updatedNeighbor.stackOrder) {
      ordered[currentIndex] = updatedNeighbor
      ordered[targetIndex] = updatedCurrent
      for (let i = 0; i < ordered.length; i++) {
        const normalized: Habit = { ...toRaw(ordered[i]), stackOrder: i + 1 }
        const idx = habits.value.findIndex((h) => h.id === normalized.id)
        if (idx !== -1) habits.value[idx] = normalized
        await db.habits.put(normalized)
      }
      return
    }

    const idxA = habits.value.findIndex((h) => h.id === updatedCurrent.id)
    const idxB = habits.value.findIndex((h) => h.id === updatedNeighbor.id)
    if (idxA !== -1) habits.value[idxA] = updatedCurrent
    if (idxB !== -1) habits.value[idxB] = updatedNeighbor

    await db.habits.bulkPut([updatedCurrent, updatedNeighbor])
  }

  async function deleteHabit(habitId: string): Promise<void> {
    if (!isLoaded.value) {
      await initHabitStore()
    }
    await db.habits.delete(habitId)
    const compIds = completions.value
      .filter((c) => c.habitId === habitId)
      .map((c) => c.id)
    if (compIds.length > 0) {
      await db.habitCompletions.bulkDelete(compIds)
    }
    habits.value = habits.value.filter((h) => h.id !== habitId)
    completions.value = completions.value.filter((c) => c.habitId !== habitId)
  }

  return {
    habits,
    completions,
    isLoaded,
    activeHabits,
    inactiveHabits,
    todayCompletions,
    todayCompletedCount,
    last7DaysOverview,
    last30DaysOverview,
    activeDaysInLast30Count,
    weeklyConsistencyPercent,
    currentStreak,
    initHabitStore,
    isHabitCompletedToday,
    isHabitCompletedOnDate,
    toggleHabitToday,
    addHabit,
    updateHabit,
    moveHabitOrder,
    deleteHabit,
  }
})
