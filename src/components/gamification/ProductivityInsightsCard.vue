<template>
  <div class="ritme-card">
    <div class="ritme-section-header" style="align-items: center;">
      <h2 class="ritme-section-title">{{ t('progress.analyticsTitle') }}</h2>
      <span
        v-if="report.bestTimeWindow"
        class="ritme-badge"
      >
        {{
          t('progress.bestWindowBadge', {
            window: t(`progress.windows.${report.bestTimeWindow}`),
          })
        }}
      </span>
    </div>

    <!-- 1. Weekly Workload & Energy Balance -->
    <div class="ritme-list-item" style="display: block; margin-bottom: 10px;">
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;"
      >
        <span style="font-weight: 700; font-size: 0.84rem;">
          {{ t('progress.workloadTitle') }}
        </span>
        <div style="display: flex; gap: 8px; font-size: 0.74rem; font-weight: 600;">
          <span class="ritme-title-row" style="color: var(--ritme-energy-green); gap: 4px;">
            <span class="ritme-dot ritme-dot-green" />
            {{ report.workloadReview.greenDays }}
          </span>
          <span class="ritme-title-row" style="color: var(--ritme-energy-yellow); gap: 4px;">
            <span class="ritme-dot ritme-dot-yellow" />
            {{ report.workloadReview.yellowDays }}
          </span>
          <span class="ritme-title-row" style="color: var(--ritme-energy-red); gap: 4px;">
            <span class="ritme-dot ritme-dot-red" />
            {{ report.workloadReview.redDays }}
          </span>
        </div>
      </div>

      <div class="ritme-subtitle" style="font-size: 0.76rem; margin-bottom: 6px;">
        {{
          t('progress.avgDailyStudy', {
            avg: report.workloadReview.avgDailyMinutesLast7,
            peak: report.workloadReview.peakDayMinutesLast7,
          })
        }}
      </div>

      <div
        class="ritme-title-row"
        style="width: 100%; font-size: 0.78rem; padding: 6px 8px; border-radius: 8px; background: var(--ritme-accent-soft); color: var(--ritme-accent-primary); font-weight: 600;"
      >
        <ion-icon :icon="pulseOutline" style="font-size: 0.92rem; flex-shrink: 0;" />
        <span>{{ t(`progress.rhythmStatus.${report.workloadReview.rhythmStatus}`) }}</span>
      </div>
    </div>

    <!-- 2. Peak Productive Time Windows (2x2 Compact Grid) -->
    <div style="margin-bottom: 10px;">
      <div
        class="ritme-subtitle"
        style="font-size: 0.78rem; font-weight: 600; margin-bottom: 6px;"
      >
        {{ t('progress.peakTimeTitle') }}
      </div>

      <div
        v-if="focusStore.completedSessions.length === 0"
        class="ritme-list-item ritme-subtitle ritme-title-row"
        style="width: 100%; font-size: 0.76rem; margin-bottom: 8px;"
      >
        <ion-icon :icon="bulbOutline" style="font-size: 0.92rem; color: var(--ritme-gold); flex-shrink: 0;" />
        <span>{{ t('progress.noSessionsYet') }}</span>
      </div>

      <div
        style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px;"
      >
        <div
          v-for="win in report.timeWindows"
          :key="win.key"
          class="ritme-list-item"
          style="margin-bottom: 0; padding: 8px 10px;"
        >
          <div style="min-width: 0;">
            <div class="ritme-title-row" style="font-size: 0.76rem; font-weight: 600; gap: 5px;">
              <ion-icon :icon="windowIcon(win.key)" style="font-size: 0.88rem; color: var(--ritme-accent-secondary);" />
              <span>{{ t(`progress.windows.${win.key}`) }}</span>
            </div>
            <div class="ritme-subtitle" style="font-size: 0.72rem; margin-top: 2px;">
              {{ win.minutes }} {{ t('focus.minutesShort') }} ({{ win.percent }}%)
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Subtest Study Time Balance -->
    <div
      v-if="report.leastStudiedSubtest"
      class="ritme-list-item"
      style="display: block; margin-bottom: 10px;"
    >
      <div
        style="font-weight: 700; font-size: 0.82rem; margin-bottom: 4px;"
      >
        {{ t('progress.subtestBalanceTitle') }}
      </div>
      <div
        style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap; font-size: 0.76rem;"
      >
        <span
          v-if="report.mostStudiedSubtest"
          style="color: var(--ritme-accent-primary); font-weight: 600;"
        >
          {{
            t('progress.mostStudiedLabel', {
              code: report.mostStudiedSubtest.code,
              mins: report.mostStudiedSubtest.minutes,
            })
          }}
        </span>
        <span style="color: var(--ritme-warning); font-weight: 600;">
          {{
            t('progress.leastStudiedLabel', {
              code: report.leastStudiedSubtest.code,
              mins: report.leastStudiedSubtest.minutes,
            })
          }}
        </span>
      </div>
    </div>

    <!-- 4. Study Location Effectiveness -->
    <div v-if="report.locations.length > 0">
      <div
        class="ritme-subtitle"
        style="font-size: 0.78rem; font-weight: 600; margin-bottom: 6px;"
      >
        {{ t('progress.locationTitle') }}
      </div>
      <div
        v-for="loc in report.locations.slice(0, 3)"
        :key="loc.location"
        class="ritme-list-item"
        style="padding: 8px 10px;"
      >
        <div style="min-width: 0;">
          <div class="ritme-title-row" style="font-weight: 600; font-size: 0.82rem; gap: 5px;">
            <ion-icon :icon="locationOutline" style="font-size: 0.9rem; color: var(--ritme-accent-secondary);" />
            <span>{{ loc.location }}</span>
          </div>
          <div class="ritme-subtitle" style="font-size: 0.72rem; margin-top: 2px;">
            {{
              t('progress.locationStats', {
                sessions: loc.sessionsCount,
                avg: loc.avgMinutes,
              })
            }}
          </div>
        </div>
        <span class="ritme-badge">
          {{ loc.minutes }} {{ t('focus.minutesShort') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  bulbOutline,
  cloudyNightOutline,
  locationOutline,
  moonOutline,
  partlySunnyOutline,
  pulseOutline,
  sunnyOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useFocusStore } from '@/stores/focusStore'
import { useLearningStore } from '@/stores/learningStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'
import {
  computeProductivityAnalytics,
  type TimeWindowKey,
} from '@/services/analytics/productivityAnalytics'

const { t } = useI18n()
const focusStore = useFocusStore()
const learningStore = useLearningStore()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

function windowIcon(key: TimeWindowKey): string {
  if (key === 'morning') return partlySunnyOutline
  if (key === 'afternoon') return sunnyOutline
  if (key === 'evening') return cloudyNightOutline
  return moonOutline
}

const report = computed(() =>
  computeProductivityAnalytics({
    completedSessions: focusStore.completedSessions,
    subtests: learningStore.sortedSubtests,
    reflections: gamificationStore.reflections,
    currentEnergyMode: userStore.settings.currentEnergyMode,
    dailyTargetMinutes: userStore.settings.dailyTargetMinutes,
  })
)
</script>
