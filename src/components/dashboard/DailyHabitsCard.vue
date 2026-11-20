<template>
  <div class="ritme-card">
    <div
      class="ritme-section-header"
      style="align-items: center; flex-wrap: nowrap; gap: 8px;"
    >
      <div style="min-width: 0; flex: 1;">
        <h2 class="ritme-section-title">{{ t('home.dailyHabits') }}</h2>
        <div class="ritme-subtitle" style="font-size: 0.76rem; margin-top: 2px;">
          {{ habitsSummaryText }}
        </div>
      </div>

      <router-link
        v-if="showManageButton"
        to="/habits"
        class="ritme-glass-pill"
      >
        {{ t('home.manageHabitsBtn') }}
      </router-link>
    </div>

    <div v-if="visibleHabits.length === 0">
      <p class="ritme-subtitle" style="margin: 0 0 10px;">
        {{ t('home.emptyHabits') }}
      </p>
      <ion-button
        size="small"
        class="ritme-btn-glass-secondary"
        router-link="/habits"
        style="margin: 0;"
      >
        {{ t('home.manageHabitsBtn') }}
      </ion-button>
    </div>

    <div v-else>
      <div
        v-for="habit in visibleHabits"
        :key="habit.id"
        class="ritme-list-item"
        :class="{ 'is-completed': habitStore.isHabitCompletedToday(habit.id) }"
        role="button"
        tabindex="0"
        style="cursor: pointer; user-select: none; min-height: 46px;"
        @click="handleToggleHabit(habit.id)"
        @keydown.enter.prevent="handleToggleHabit(habit.id)"
        @keydown.space.prevent="handleToggleHabit(habit.id)"
      >
        <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
          <ion-checkbox
            class="ritme-checkbox"
            :checked="habitStore.isHabitCompletedToday(habit.id)"
            aria-label="Toggle habit"
            style="pointer-events: none; flex-shrink: 0;"
          />
          <div style="min-width: 0;">
            <div
              :style="{
                fontWeight: 600,
                fontSize: '0.88rem',
                color: habitStore.isHabitCompletedToday(habit.id)
                  ? 'var(--ritme-text-secondary)'
                  : 'var(--ritme-text-primary)',
                textDecoration: habitStore.isHabitCompletedToday(habit.id)
                  ? 'line-through'
                  : 'none',
              }"
            >
              {{ resolveHabitText(habit.name) }}
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="habitStore.activeHabits.length > 5 && showManageButton"
        class="ritme-subtitle"
        style="font-size: 0.74rem; margin-top: 8px; text-align: right;"
      >
        {{
          t('home.moreHabitsHint', {
            count: habitStore.activeHabits.length - 5,
          })
        }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { IonButton, IonCheckbox } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useHabitStore } from '@/stores/habitStore'
import { triggerActionHaptic } from '@/services/timer/soundFeedbackService'

const { t, te } = useI18n()
const route = useRoute()
const habitStore = useHabitStore()

const showManageButton = computed(
  () => route.path !== '/habits' && route.path !== '/tabs/habits'
)

const visibleHabits = computed(() => habitStore.activeHabits.slice(0, 5))

const visibleCompletedCount = computed(
  () =>
    visibleHabits.value.filter((h) => habitStore.isHabitCompletedToday(h.id))
      .length
)

const habitsSummaryText = computed(() => {
  const totalActive = habitStore.activeHabits.length
  if (totalActive > 5) {
    return t('home.habitsPriorityCompleted', {
      done: visibleCompletedCount.value,
      shown: visibleHabits.value.length,
      totalDone: habitStore.todayCompletedCount,
      totalAll: totalActive,
    })
  }
  return t('home.habitsCompleted', {
    done: habitStore.todayCompletedCount,
    total: totalActive,
  })
})

function resolveHabitText(keyOrText: string): string {
  return te(keyOrText) ? t(keyOrText) : keyOrText
}

async function handleToggleHabit(habitId: string): Promise<void> {
  triggerActionHaptic('light')
  await habitStore.toggleHabitToday(habitId)
}
</script>
