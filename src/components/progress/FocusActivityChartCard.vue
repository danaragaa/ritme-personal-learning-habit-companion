<template>
  <section class="ritme-card">
    <div class="ritme-section-header" style="align-items: flex-start; margin-bottom: 12px;">
      <div style="min-width: 0;">
        <h2 class="ritme-section-title">
          {{ t('progress.minimal.chartTitle') }}
        </h2>
        <p class="ritme-subtitle" style="margin: 2px 0 0; font-size: 0.75rem;">
          {{
            chartData.period === 'week'
              ? t('progress.minimal.chartSubtitleWeek', {
                  days: chartData.activeDaysCount,
                })
              : t('progress.minimal.chartSubtitleMonth', {
                  days: chartData.activeDaysCount,
                })
          }}
        </p>
      </div>
      <span class="ritme-badge ritme-glass-chip" style="flex-shrink: 0;">
        {{ formattedTotal }}
      </span>
    </div>

    <!-- 7-Day Monochrome Bar Chart (Default: Minggu Ini) -->
    <div v-if="chartData.period === 'week'" class="ritme-week-bars">
      <div
        v-for="bar in chartData.bars"
        :key="bar.dateStr"
        class="ritme-week-bar-col"
      >
        <span
          class="ritme-bar-val"
          :class="{ 'is-empty': bar.minutes === 0 }"
        >
          {{ bar.minutes > 0 ? formatShortMinutes(bar.minutes) : '' }}
        </span>

        <div class="ritme-bar-track">
          <div
            v-if="bar.minutes > 0"
            class="ritme-bar-fill"
            :class="{ 'is-today': bar.isToday }"
            :style="{ height: `${bar.heightPercent}%` }"
          ></div>
        </div>

        <span
          class="ritme-bar-day"
          :class="{ 'is-today': bar.isToday }"
        >
          {{ t(`days.short${bar.dayOfWeek}`) }}
        </span>
      </div>
    </div>

    <!-- 30-Day Slim Monochrome Bar Chart (30 Hari) -->
    <div v-else>
      <svg
        viewBox="0 0 300 84"
        class="ritme-month-svg"
        role="img"
        :aria-label="t('progress.minimal.chartTitle')"
      >
        <line
          x1="0"
          y1="76"
          x2="300"
          y2="76"
          stroke="var(--ritme-border-line)"
          stroke-width="1"
        />
        <g v-for="(bar, idx) in chartData.bars" :key="bar.dateStr">
          <rect
            :x="idx * 10 + 1.5"
            y="8"
            width="6.5"
            height="68"
            rx="3.25"
            fill="var(--ritme-surface-subtle)"
          />
          <rect
            v-if="bar.minutes > 0"
            :x="idx * 10 + 1.5"
            :y="76 - Math.max(6, Math.round((bar.heightPercent / 100) * 68))"
            width="6.5"
            :height="Math.max(6, Math.round((bar.heightPercent / 100) * 68))"
            rx="3.25"
            :fill="
              bar.isToday
                ? 'var(--ritme-text-primary)'
                : 'var(--ritme-accent-secondary)'
            "
            :opacity="bar.isToday ? 1 : 0.78"
          />
        </g>
      </svg>

      <div class="ritme-month-axis">
        <span>{{ formatCompactDate(chartData.bars[0]?.dateStr) }}</span>
        <span>{{ formatCompactDate(chartData.bars[14]?.dateStr) }}</span>
        <span style="color: var(--ritme-text-primary); font-weight: 700;">
          {{ t('progress.minimal.todayAxisLabel') }}
        </span>
      </div>
    </div>

    <p
      v-if="chartData.totalMinutes === 0"
      class="ritme-subtitle"
      style="margin: 10px 0 0; font-size: 0.74rem; text-align: center;"
    >
      {{ t('progress.minimal.chartEmptyHint') }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  formatFocusDuration,
  type FocusActivityChartData,
} from '@/services/analytics/progressSummaryService'
import { parseLocalDateString } from '@/utils/date'

const props = defineProps<{
  chartData: FocusActivityChartData
  locale: 'id' | 'en'
}>()

const { t } = useI18n()

const formattedTotal = computed(() =>
  formatFocusDuration(props.chartData.totalMinutes, props.locale)
)

function formatShortMinutes(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (props.locale === 'id') {
      return m === 0 ? `${h}j` : `${h}j${m}`
    }
    return m === 0 ? `${h}h` : `${h}h${m}`
  }
  return `${minutes}m`
}

function formatCompactDate(dateStr?: string): string {
  if (!dateStr) return ''
  const parsed = parseLocalDateString(dateStr)
  return new Intl.DateTimeFormat(props.locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
  }).format(parsed)
}
</script>

<style scoped>
.ritme-week-bars {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 8px;
  align-items: end;
  padding-top: 2px;
}

.ritme-week-bar-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ritme-bar-val {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--ritme-text-secondary);
  font-variant-numeric: tabular-nums;
  min-height: 14px;
  line-height: 14px;
  white-space: nowrap;
}

.ritme-bar-val.is-empty {
  opacity: 0;
}

.ritme-bar-track {
  width: 100%;
  max-width: 24px;
  height: 82px;
  border-radius: 999px;
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  padding: 2px;
}

.ritme-bar-fill {
  width: 100%;
  border-radius: 999px;
  background: var(--ritme-accent-secondary);
  opacity: 0.72;
  transition: height 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ritme-bar-fill.is-today {
  background: var(--ritme-text-primary);
  opacity: 1;
}

.ritme-bar-day {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ritme-text-secondary);
}

.ritme-bar-day.is-today {
  color: var(--ritme-text-primary);
  font-weight: 800;
}

.ritme-month-svg {
  width: 100%;
  height: 92px;
  display: block;
}

.ritme-month-axis {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 0.7rem;
  color: var(--ritme-text-secondary);
}
</style>
