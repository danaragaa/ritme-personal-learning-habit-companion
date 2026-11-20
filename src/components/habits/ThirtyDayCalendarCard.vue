<template>
  <div class="ritme-card">
    <div class="ritme-section-header" style="align-items: center;">
      <div style="min-width: 0; flex: 1;">
        <h2 class="ritme-section-title">{{ t('habits.challenge30Title') }}</h2>
        <div class="ritme-subtitle" style="font-size: 0.76rem; margin-top: 2px;">
          {{ t('habits.challenge30Subtitle') }}
        </div>
      </div>

      <span class="ritme-badge ritme-title-row" style="gap: 4px;">
        <ion-icon :icon="calendarOutline" style="font-size: 0.85rem;" />
        {{
          t('habits.challenge30Badge', {
            done: habitStore.activeDaysInLast30Count,
          })
        }}
      </span>
    </div>

    <!-- 30-Day Challenge Progress Bar -->
    <div class="ritme-progress-track" style="margin-bottom: 12px;">
      <div
        class="ritme-progress-fill"
        :style="{ width: `${challengeProgressPercent}%` }"
      ></div>
    </div>

    <!-- 30-Day Grid (6 Columns x 5 Rows for Proportional Mobile Width) -->
    <div
      style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 5px; text-align: center; margin-bottom: 10px;"
    >
      <button
        v-for="day in habitStore.last30DaysOverview"
        :key="day.date"
        type="button"
        class="ritme-pill-tab"
        :style="dayCellStyle(day)"
        @click="selectedDate = day.date"
      >
        <div style="font-size: 0.64rem; opacity: 0.8;">
          {{ t(`days.short${day.dayOfWeek}`) }}
        </div>
        <div style="font-weight: 700; font-size: 0.8rem; margin: 1px 0;">
          {{ day.dayNumber }}
        </div>
        <div style="font-size: 0.62rem; font-weight: 700; white-space: nowrap; display: flex; justify-content: center; align-items: center;">
          <template v-if="day.isActiveDay">
            <span v-if="day.studyMinutes > 0">{{ day.studyMinutes }}m</span>
            <ion-icon v-else :icon="checkmarkOutline" style="font-size: 0.72rem;" />
          </template>
          <span
            v-else-if="day.isRestDay"
            class="ritme-dot ritme-dot-yellow"
            style="width: 5px; height: 5px; margin: 3px 0;"
          />
          <span v-else style="opacity: 0.4;">-</span>
        </div>
      </button>
    </div>

    <!-- Selected Day Summary Bar -->
    <div
      v-if="selectedDayInfo"
      class="ritme-list-item"
      style="padding: 8px 10px; margin-bottom: 8px;"
    >
      <span style="font-weight: 700; font-size: 0.8rem; white-space: nowrap;">
        {{ selectedDayInfo.date }}
      </span>
      <span
        class="ritme-subtitle"
        style="font-size: 0.76rem; text-align: right;"
      >
        {{
          t('habits.dayDetailSummary', {
            habits: selectedDayInfo.completedHabitsCount,
            minutes: selectedDayInfo.studyMinutes,
          })
        }}
      </span>
    </div>

    <!-- Compact Vector Legend -->
    <div
      class="ritme-subtitle"
      style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 0.72rem;"
    >
      <span class="ritme-title-row" style="gap: 5px;">
        <span class="ritme-dot ritme-dot-primary" />
        {{ t('habits.legendActive') }}
      </span>
      <span class="ritme-title-row" style="gap: 5px;">
        <span class="ritme-dot ritme-dot-yellow" />
        {{ t('habits.legendRest') }}
      </span>
      <span class="ritme-title-row" style="gap: 5px;">
        <span
          style="display: inline-block; width: 8px; height: 8px; border-radius: 2px; border: 1.5px solid var(--ritme-accent-primary);"
        />
        {{ t('habits.legendToday') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import { calendarOutline, checkmarkOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import {
  useHabitStore,
  type CalendarDayOverview,
} from '@/stores/habitStore'
import { getLocalDateString } from '@/utils/date'

const { t } = useI18n()
const habitStore = useHabitStore()

const selectedDate = ref<string>(getLocalDateString())

const challengeProgressPercent = computed(() =>
  Math.min(100, Math.round((habitStore.activeDaysInLast30Count / 30) * 100))
)

const selectedDayInfo = computed(() =>
  habitStore.last30DaysOverview.find((d) => d.date === selectedDate.value) ||
  habitStore.last30DaysOverview[habitStore.last30DaysOverview.length - 1]
)

function dayCellStyle(day: CalendarDayOverview): Record<string, string> {
  const isSelected = selectedDate.value === day.date

  let background = 'var(--ritme-surface-subtle)'
  let color = 'var(--ritme-text-secondary)'
  let border = '1px solid var(--ritme-border)'

  if (day.isActiveDay) {
    background = 'var(--ritme-accent-soft)'
    color = 'var(--ritme-accent-secondary)'
    border = '1px solid var(--ritme-border-highlight)'
  } else if (day.isRestDay) {
    background = 'var(--ritme-warning-soft)'
    color = 'var(--ritme-warning)'
    border = '1px solid var(--ritme-warning-border)'
  }

  if (day.isToday || isSelected) {
    border = '1.5px solid var(--ritme-accent-primary)'
    if (!day.isActiveDay) {
      color = 'var(--ritme-text-primary)'
    }
  }

  return {
    padding: '5px 2px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontFamily: 'var(--ion-font-family)',
    background,
    color,
    border,
  }
}
</script>
