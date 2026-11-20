<template>
  <div class="ritme-card">
    <!-- Streak Header -->
    <div class="ritme-section-header" style="align-items: center;">
      <div style="min-width: 0; flex: 1;">
        <h2 class="ritme-section-title">{{ t('habits.streakTitle') }}</h2>
        <div class="ritme-subtitle" style="font-size: 0.76rem; margin-top: 2px;">
          {{
            t('habits.restDayNote', {
              day: t(`days.${userStore.settings.weeklyRestDay}`),
            })
          }}
        </div>
      </div>

      <span class="ritme-badge ritme-title-row" style="gap: 4px;">
        <ion-icon
          :icon="flameOutline"
          :style="{
            fontSize: '0.88rem',
            color:
              habitStore.currentStreak > 0
                ? 'var(--ritme-gold)'
                : 'var(--ritme-accent-primary)',
          }"
        />
        {{ t('habits.streakDays', { count: habitStore.currentStreak }) }}
      </span>
    </div>

    <hr
      style="border: none; border-top: 1px solid var(--ritme-border); margin: 10px 0;"
    />

    <!-- 7-Day Consistency Overview -->
    <div class="ritme-section-header" style="align-items: center; margin-bottom: 8px;">
      <span style="font-weight: 600; font-size: 0.86rem;">
        {{ t('habits.weeklyTitle') }}
      </span>
      <span
        class="ritme-subtitle"
        style="font-size: 0.76rem; font-weight: 600; white-space: nowrap;"
      >
        {{
          t('habits.weeklyRate', {
            percent: habitStore.weeklyConsistencyPercent,
          })
        }}
      </span>
    </div>

    <div
      style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 5px; text-align: center;"
    >
      <div
        v-for="day in habitStore.last7DaysOverview"
        :key="day.date"
        :style="{
          padding: '6px 2px',
          borderRadius: '10px',
          background: day.isToday
            ? 'var(--ritme-accent-soft)'
            : 'var(--ritme-surface-subtle)',
          border: day.isToday
            ? '1px solid var(--ritme-accent-primary)'
            : '1px solid var(--ritme-border)',
        }"
      >
        <div class="ritme-subtitle" style="font-size: 0.68rem;">
          {{ t(`days.short${day.dayOfWeek}`) }}
        </div>
        <div
          style="font-weight: 700; font-size: 0.82rem; margin: 3px 0;"
          :style="{
            color:
              day.completedCount > 0
                ? 'var(--ritme-accent-primary)'
                : 'var(--ritme-text-primary)',
          }"
        >
          {{ day.dayNumber }}
        </div>
        <div
          v-if="day.isRestDay && day.completedCount === 0"
          style="font-size: 0.62rem; color: var(--ritme-warning); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
        >
          {{ t('habits.restDayBadge') }}
        </div>
        <div
          v-else
          style="font-size: 0.66rem; font-weight: 600; white-space: nowrap;"
          :style="{
            color:
              day.completedCount > 0
                ? 'var(--ritme-accent-secondary)'
                : 'var(--ritme-text-secondary)',
          }"
        >
          {{ day.completedCount }}/{{ day.totalActive }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { flameOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useHabitStore } from '@/stores/habitStore'
import { useUserStore } from '@/stores/userStore'

const { t } = useI18n()
const habitStore = useHabitStore()
const userStore = useUserStore()
</script>
