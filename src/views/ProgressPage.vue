<template>
  <ion-page>
    <ion-header class="ritme-floating-header">
      <ion-toolbar>
        <ion-title>{{ t('progress.minimal.pageTitle') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-page-container">
        <!-- A. Supporting Subtitle + Period Selector (No Duplicate Page H1) -->
        <header class="ritme-progress-header">
          <p class="ritme-subtitle ritme-progress-desc">
            {{ t('progress.minimal.headerSubtitle') }}
          </p>

          <div
            class="ritme-period-segment"
            role="tablist"
            :aria-label="t('progress.minimal.periodAriaLabel')"
          >
            <button
              type="button"
              role="tab"
              :aria-selected="selectedPeriod === 'week'"
              class="ritme-period-pill"
              :class="{ 'is-active': selectedPeriod === 'week' }"
              @click="selectedPeriod = 'week'"
            >
              {{ t('progress.minimal.periodWeek') }}
            </button>
            <button
              type="button"
              role="tab"
              :aria-selected="selectedPeriod === 'month'"
              class="ritme-period-pill"
              :class="{ 'is-active': selectedPeriod === 'month' }"
              @click="selectedPeriod = 'month'"
            >
              {{ t('progress.minimal.periodMonth') }}
            </button>
          </div>
        </header>

        <!-- B. Four Main Statistics (2x2 Neutral Monochrome Liquid Glass Grid) -->
        <section
          class="ritme-stats-grid"
          :aria-label="t('progress.minimal.statsAriaLabel')"
        >
          <!-- 1. Total Focus Time -->
          <div class="ritme-stat-card">
            <div class="ritme-stat-head">
              <ion-icon :icon="timeOutline" class="ritme-stat-icon" />
              <span class="ritme-stat-label">
                {{ t('progress.minimal.statFocusTime') }}
              </span>
            </div>
            <div class="ritme-stat-value">
              {{ formattedFocusDuration }}
            </div>
            <div class="ritme-subtitle ritme-stat-sub">
              {{ periodWindowLabel }}
            </div>
          </div>

          <!-- 2. Completed Sessions -->
          <div class="ritme-stat-card">
            <div class="ritme-stat-head">
              <ion-icon :icon="checkmarkDoneOutline" class="ritme-stat-icon" />
              <span class="ritme-stat-label">
                {{ t('progress.minimal.statCompletedSessions') }}
              </span>
            </div>
            <div class="ritme-stat-value">
              {{ periodFocusStats.completedSessionsCount }}
            </div>
            <div class="ritme-subtitle ritme-stat-sub">
              {{ t('progress.minimal.statSessionsSub') }}
            </div>
          </div>

          <!-- 3. Completed Learning Topics -->
          <div class="ritme-stat-card">
            <div class="ritme-stat-head">
              <ion-icon :icon="bookOutline" class="ritme-stat-icon" />
              <span class="ritme-stat-label">
                {{ t('progress.minimal.statCompletedTopics') }}
              </span>
            </div>
            <div class="ritme-stat-value">
              {{ completedTopicsSummary.completedTopics }}
            </div>
            <div class="ritme-subtitle ritme-stat-sub">
              {{
                t('progress.minimal.statTopicsSub', {
                  total: completedTopicsSummary.totalTopics,
                })
              }}
            </div>
          </div>

          <!-- 4. Habit Consistency -->
          <div class="ritme-stat-card">
            <div class="ritme-stat-head">
              <ion-icon :icon="repeatOutline" class="ritme-stat-icon" />
              <span class="ritme-stat-label">
                {{ t('progress.minimal.statHabitConsistency') }}
              </span>
            </div>
            <div class="ritme-stat-value">
              {{ habitConsistency.consistencyPercent }}%
            </div>
            <div class="ritme-subtitle ritme-stat-sub">
              {{
                t('progress.minimal.statHabitSub', {
                  days: habitConsistency.plannedDaysCount,
                })
              }}
            </div>
          </div>
        </section>

        <!-- Secondary Lightweight Gamification Strip (Level, XP, Streak & Next-Level Bar) -->
        <section
          class="ritme-gamification-strip"
          :aria-label="t('progress.minimal.gamificationAriaLabel')"
        >
          <div class="ritme-gami-row">
            <div class="ritme-gami-item">
              <span class="ritme-subtitle ritme-gami-label">
                {{ t('progress.minimal.summaryLevelLabel') }}
              </span>
              <strong class="ritme-gami-val">
                {{ gamificationStore.currentLevel }}
              </strong>
            </div>

            <span class="ritme-gami-divider" aria-hidden="true"></span>

            <div class="ritme-gami-item">
              <span class="ritme-subtitle ritme-gami-label">
                {{ t('progress.minimal.summaryXpLabel') }}
              </span>
              <strong class="ritme-gami-val">
                {{ gamificationStore.totalXP }} XP
              </strong>
            </div>

            <span class="ritme-gami-divider" aria-hidden="true"></span>

            <div class="ritme-gami-item">
              <span class="ritme-subtitle ritme-gami-label">
                {{ t('progress.minimal.summaryStreakLabel') }}
              </span>
              <strong class="ritme-gami-val">
                {{
                  t('progress.minimal.streakDaysValue', {
                    days: habitStore.currentStreak,
                  })
                }}
              </strong>
            </div>
          </div>

          <div class="ritme-gami-level-progress">
            <div
              class="ritme-progress-track"
              role="progressbar"
              :aria-valuenow="gamificationStore.levelProgressInfo.progressPercent"
              aria-valuemin="0"
              aria-valuemax="100"
              style="height: 4px;"
            >
              <div
                class="ritme-progress-fill"
                :style="{
                  width: `${gamificationStore.levelProgressInfo.progressPercent}%`,
                }"
              ></div>
            </div>
            <div class="ritme-subtitle ritme-gami-level-caption">
              <span v-if="gamificationStore.levelProgressInfo.nextLevel !== null">
                {{
                  t('gamification.nextLevelCompact', {
                    current: gamificationStore.totalXP,
                    target: gamificationStore.levelProgressInfo.nextLevelMinXP,
                    nextLevel: gamificationStore.levelProgressInfo.nextLevel,
                  })
                }}
              </span>
              <span v-else>
                {{ t('gamification.maxLevelCompact') }}
              </span>
              <span>{{ gamificationStore.levelProgressInfo.progressPercent }}%</span>
            </div>
          </div>
        </section>

        <!-- C. Focus Activity Chart -->
        <FocusActivityChartCard :chart-data="focusChartData" :locale="locale" />

        <!-- D. Seven UTBK Subtest Progress (Completed / Total via learningTrackerService) -->
        <SubtestProgressCard
          :subtest-items="subtestBreakdown"
          :locale="locale"
        />

        <!-- E. Learning Activity History (Today / This Week / All) -->
        <LearningActivityHistoryCard
          :items="activityHistory"
          :filter="historyFilter"
          :locale="locale"
          @update:filter="historyFilter = $event"
        />

        <!-- Secondary Mock Test Tracker (Collapsed by Default) -->
        <section class="ritme-mock-secondary">
          <button
            type="button"
            class="ritme-secondary-toggle"
            :aria-expanded="showMockTracker"
            @click="showMockTracker = !showMockTracker"
          >
            <span class="ritme-secondary-toggle-left">
              <ion-icon :icon="statsChartOutline" style="font-size: 1rem;" />
              <span>{{ t('progress.minimal.mockSecondaryToggle') }}</span>
            </span>

            <span class="ritme-secondary-toggle-right">
              <span class="ritme-badge ritme-glass-chip">
                {{
                  learningStore.mockTests.length > 0
                    ? t('progress.minimal.mockCountBadge', {
                        count: learningStore.mockTests.length,
                      })
                    : t('progress.minimal.mockOptionalBadge')
                }}
              </span>
              <ion-icon
                :icon="showMockTracker ? chevronUpOutline : chevronDownOutline"
                style="font-size: 0.95rem; color: var(--ritme-text-secondary);"
              />
            </span>
          </button>

          <div v-if="showMockTracker" style="margin-top: 10px;">
            <MockTestTrackerCard />
          </div>
        </section>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import {
  bookOutline,
  checkmarkDoneOutline,
  chevronDownOutline,
  chevronUpOutline,
  repeatOutline,
  statsChartOutline,
  timeOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useFocusStore } from '@/stores/focusStore'
import { useHabitStore } from '@/stores/habitStore'
import { useLearningStore } from '@/stores/learningStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'
import {
  buildFocusActivityBars,
  buildLearningActivityHistory,
  computeCompletedTopicsSummary,
  computeHabitConsistency,
  computePeriodFocusStats,
  computeSubtestCompletionBreakdown,
  formatFocusDuration,
  type ProgressHistoryFilter,
  type ProgressPeriod,
} from '@/services/analytics/progressSummaryService'
import FocusActivityChartCard from '@/components/progress/FocusActivityChartCard.vue'
import SubtestProgressCard from '@/components/progress/SubtestProgressCard.vue'
import LearningActivityHistoryCard from '@/components/progress/LearningActivityHistoryCard.vue'
import MockTestTrackerCard from '@/components/analytics/MockTestTrackerCard.vue'

const { t } = useI18n()
const focusStore = useFocusStore()
const habitStore = useHabitStore()
const learningStore = useLearningStore()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

const selectedPeriod = ref<ProgressPeriod>('week')
const historyFilter = ref<ProgressHistoryFilter>('week')
const showMockTracker = ref(false)

const locale = computed<'id' | 'en'>(() =>
  userStore.settings.language === 'en' ? 'en' : 'id'
)

const periodWindowLabel = computed(() =>
  selectedPeriod.value === 'week'
    ? t('progress.minimal.periodWeekSub')
    : t('progress.minimal.periodMonthSub')
)

// 1 & 2. Total Focus Time + Completed Sessions (completed focus only, no breaks/cancelled)
const periodFocusStats = computed(() =>
  computePeriodFocusStats(focusStore.completedSessions, selectedPeriod.value)
)

const formattedFocusDuration = computed(() =>
  formatFocusDuration(periodFocusStats.value.totalFocusMinutes, locale.value)
)

// 3. Completed Learning Topics (via learningTrackerService single source of truth)
const completedTopicsSummary = computed(() =>
  computeCompletedTopicsSummary(learningStore.topics)
)

// 4. Habit Consistency (respects active habits + weeklyRestDay; aligned with habitStore)
const habitConsistency = computed(() =>
  computeHabitConsistency({
    activeHabits: habitStore.activeHabits,
    completions: habitStore.completions,
    weeklyRestDay: userStore.settings.weeklyRestDay,
    period: selectedPeriod.value,
  })
)

// C. Focus Activity Bar Chart
const focusChartData = computed(() =>
  buildFocusActivityBars(focusStore.completedSessions, selectedPeriod.value)
)

// D. Seven UTBK Subtests (completed topics / total topics only)
const subtestBreakdown = computed(() =>
  computeSubtestCompletionBreakdown(
    learningStore.sortedSubtests,
    learningStore.topics
  )
)

// E. Learning Activity History (deduplicated completed focus + topic updates)
const activityHistory = computed(() =>
  buildLearningActivityHistory({
    sessions: focusStore.completedSessions,
    topics: learningStore.topics,
    subtests: learningStore.sortedSubtests,
    filter: historyFilter.value,
  })
)
</script>

<style scoped>
.ritme-progress-header {
  padding: 2px 2px 14px;
}

.ritme-progress-h1 {
  margin: 0;
  font-size: 1.24rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--ritme-text-primary);
}

.ritme-progress-desc {
  margin: 0 2px 12px;
  font-size: var(--ritme-font-sub);
}

.ritme-period-segment {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 4px;
  border-radius: var(--ritme-radius-pill);
  background: var(--ritme-glass-surface);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
}

.ritme-period-pill {
  min-height: 36px;
  padding: 0 12px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--ritme-text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--ritme-motion-fast);
}

.ritme-period-pill.is-active {
  background: var(--ritme-state-selected-bg);
  border-color: var(--ritme-state-selected-border);
  color: var(--ritme-text-primary);
  box-shadow: var(--ritme-glass-inset);
}

.ritme-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.ritme-stat-card {
  padding: 13px 13px 12px;
  border-radius: var(--ritme-radius-lg);
  background: var(--ritme-glass-surface);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset), var(--ritme-glass-shadow);
  min-width: 0;
}

.ritme-stat-head {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ritme-stat-icon {
  font-size: 0.9rem;
  color: var(--ritme-text-secondary);
  flex-shrink: 0;
}

.ritme-stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ritme-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ritme-stat-value {
  font-size: 1.38rem;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--ritme-text-primary);
  font-variant-numeric: tabular-nums;
  margin-top: 8px;
}

.ritme-stat-sub {
  font-size: 0.7rem;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ritme-gamification-strip {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding: 11px 14px;
  margin-bottom: 14px;
  border-radius: var(--ritme-radius-lg);
  background: var(--ritme-glass-surface);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
}

.ritme-gami-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ritme-gami-level-progress {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px solid var(--ritme-border-line);
}

.ritme-gami-level-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-size: 0.69rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.ritme-gami-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 1px;
}

.ritme-gami-label {
  font-size: 0.66rem;
  font-weight: 600;
}

.ritme-gami-val {
  font-size: 0.84rem;
  font-weight: 800;
  color: var(--ritme-text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ritme-gami-divider {
  width: 1px;
  height: 22px;
  background: var(--ritme-border-line);
  flex-shrink: 0;
}

.ritme-mock-secondary {
  margin-top: 4px;
}

.ritme-secondary-toggle {
  width: 100%;
  min-height: 48px;
  padding: 10px 14px;
  border-radius: var(--ritme-radius-lg);
  background: var(--ritme-glass-surface);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
  color: var(--ritme-text-primary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: background var(--ritme-motion-fast);
}

.ritme-secondary-toggle-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  min-width: 0;
}

.ritme-secondary-toggle-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
</style>
