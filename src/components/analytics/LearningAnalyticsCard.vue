<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title ritme-title-row">
          <ion-icon :icon="schoolOutline" style="color: var(--ritme-accent-secondary);" />
          <span>{{ t('progress.learningAnalyticsTitle') }}</span>
        </h2>
        <p class="ritme-subtitle" style="margin-top: 2px;">
          {{ t('progress.learningAnalyticsSubtitle') }}
        </p>
      </div>
      <span class="ritme-badge ritme-badge-cyan">
        {{ t('progress.activityVsMasteryTag') }}
      </span>
    </div>

    <!-- Activity vs Mastery Separation Callout (PRD Section 24) -->
    <div
      class="ritme-title-row"
      style="width: 100%; padding: 9px 11px; border-radius: var(--ritme-radius-md); background: rgba(89, 203, 232, 0.08); border: 1px solid rgba(89, 203, 232, 0.25); font-size: 0.75rem; color: var(--ritme-text-secondary); line-height: 1.45; margin-bottom: 12px; align-items: flex-start;"
    >
      <ion-icon :icon="bulbOutline" style="font-size: 0.95rem; margin-top: 2px; color: var(--ritme-accent-secondary); flex-shrink: 0;" />
      <span>{{ t('progress.activityVsMasteryNote') }}</span>
    </div>

    <!-- 2x2 Key Performance Indicators -->
    <div
      style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;"
    >
      <!-- Weekly Practice Accuracy -->
      <div
        style="padding: 10px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line);"
      >
        <div class="ritme-subtitle" style="font-size: 0.72rem;">
          {{ t('progress.weeklyAccuracyLabel') }}
        </div>
        <div
          style="font-size: 1.2rem; font-weight: 800; color: var(--ritme-accent-secondary); margin-top: 2px;"
        >
          {{
            report.weeklyAttempts > 0
              ? `${report.weeklyAccuracyPercent}%`
              : `${report.overallAccuracyPercent}%`
          }}
        </div>
        <div class="ritme-subtitle" style="font-size: 0.68rem; margin-top: 2px;">
          {{
            t('progress.accuracyCountDetail', {
              correct:
                report.weeklyAttempts > 0
                  ? report.weeklyCorrect
                  : report.overallCorrect,
              total:
                report.weeklyAttempts > 0
                  ? report.weeklyAttempts
                  : report.overallAttempts,
            })
          }}
        </div>
      </div>

      <!-- Quest Completion Rate -->
      <div
        style="padding: 10px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line);"
      >
        <div class="ritme-subtitle" style="font-size: 0.72rem;">
          {{ t('progress.questCompletionRateLabel') }}
        </div>
        <div
          style="font-size: 1.2rem; font-weight: 800; color: var(--ritme-accent-primary); margin-top: 2px;"
        >
          {{ report.questSummary.overallPercent }}%
        </div>
        <div class="ritme-subtitle" style="font-size: 0.68rem; margin-top: 2px;">
          {{
            t('progress.questDoneCountDetail', {
              done: report.questSummary.overallDone,
              total: report.questSummary.overallTotal,
            })
          }}
        </div>
      </div>

      <!-- Boss Challenge Summary -->
      <div
        style="padding: 10px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line);"
      >
        <div class="ritme-subtitle" style="font-size: 0.72rem;">
          {{ t('progress.challengeSummaryLabel') }}
        </div>
        <div
          style="font-size: 1.2rem; font-weight: 800; color: var(--ritme-gold); margin-top: 2px;"
        >
          {{ report.passedBossCount }}/{{ report.totalBossAttempts }}
        </div>
        <div class="ritme-subtitle" style="font-size: 0.68rem; margin-top: 2px;">
          {{
            t('progress.challengeBestDetail', {
              best: report.bestBossAccuracy,
            })
          }}
        </div>
      </div>

      <!-- Mistake Notebook Resolution -->
      <div
        style="padding: 10px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line);"
      >
        <div class="ritme-subtitle" style="font-size: 0.72rem;">
          {{ t('progress.mistakeResolutionLabel') }}
        </div>
        <div
          style="font-size: 1.2rem; font-weight: 800; margin-top: 2px;"
          :style="{
            color:
              report.unresolvedMistakes === 0
                ? 'var(--ritme-accent-secondary)'
                : 'var(--ritme-warning)',
          }"
        >
          {{ report.mistakeResolutionRate }}%
        </div>
        <div class="ritme-subtitle" style="font-size: 0.68rem; margin-top: 2px;">
          {{
            t('progress.mistakeCountDetail', {
              resolved: report.resolvedMistakes,
              total: report.totalMistakes,
            })
          }}
        </div>
      </div>
    </div>

    <!-- Mastery Distribution Bar -->
    <div
      style="padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line); margin-bottom: 12px;"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"
      >
        <span class="ritme-title-row" style="font-size: 0.8rem; font-weight: 700; gap: 5px;">
          <ion-icon :icon="pieChartOutline" style="font-size: 0.95rem; color: var(--ritme-accent-primary);" />
          {{ t('progress.masteryDistTitle') }}
        </span>
        <span class="ritme-subtitle" style="font-size: 0.72rem;">
          {{
            t('progress.totalTopicsCount', {
              total: report.masteryDistribution.totalTopics,
            })
          }}
        </span>
      </div>

      <!-- Stacked Distribution Bar -->
      <div
        v-if="report.masteryDistribution.totalTopics > 0"
        style="display: flex; height: 10px; border-radius: 999px; overflow: hidden; background: var(--ritme-surface-subtle); margin-bottom: 8px;"
      >
        <div
          v-for="seg in masterySegments"
          :key="seg.key"
          :style="{
            width: `${seg.percent}%`,
            background: seg.color,
          }"
        />
      </div>

      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
        <span
          v-for="seg in masterySegments"
          :key="seg.key"
          class="ritme-badge"
          style="font-size: 0.68rem;"
        >
          <span
            style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 4px;"
            :style="{ background: seg.color }"
          />
          {{ seg.label }}: {{ seg.count }}
        </span>
      </div>
    </div>

    <!-- Weak Topics Priority -->
    <div
      style="padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line); margin-bottom: 12px;"
    >
      <div
        class="ritme-title-row"
        style="font-size: 0.8rem; font-weight: 700; color: var(--ritme-warning); margin-bottom: 6px; gap: 5px;"
      >
        <ion-icon :icon="locateOutline" style="font-size: 0.95rem;" />
        {{ t('progress.weakTopicsSectionTitle') }}
      </div>

      <p
        v-if="report.weakTopics.length === 0"
        class="ritme-subtitle"
        style="font-size: 0.74rem; margin: 0;"
      >
        {{ t('progress.noWeakTopicsAnalytics') }}
      </p>

      <div
        v-for="wt in report.weakTopics"
        :key="wt.topicId"
        style="display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid var(--ritme-border-line);"
      >
        <div style="min-width: 0; flex: 1;">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--ritme-text-primary);">
            {{ wt.subtestCode }} • {{ wt.title }}
          </div>
          <div class="ritme-subtitle" style="font-size: 0.7rem;">
            {{
              t('progress.weakTopicDetail', {
                accuracy: wt.accuracyPercent,
                attempts: wt.attemptedCount,
                mistakes: wt.unresolvedMistakes,
              })
            }}
          </div>
        </div>
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 28px; padding: 0 9px; font-size: 0.7rem; flex-shrink: 0; color: var(--ritme-accent-secondary); border-color: var(--ritme-accent-secondary); display: inline-flex; align-items: center; gap: 4px;"
          @click="goToTopicPractice(wt.subtestId, wt.topicId)"
        >
          <ion-icon :icon="createOutline" style="font-size: 0.8rem;" />
          {{ t('learning.practiceTopicBtn') }}
        </button>
      </div>
    </div>

    <!-- Mistake Category Breakdown & Spaced Review Health -->
    <div class="ritme-grid-2">
      <!-- Error Category Breakdown -->
      <div
        style="padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line);"
      >
        <div
          class="ritme-title-row"
          style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; gap: 5px;"
        >
          <ion-icon :icon="bookmarkOutline" style="font-size: 0.9rem; color: var(--ritme-gold);" />
          {{ t('progress.mistakeCategoriesTitle') }}
        </div>
        <p
          v-if="report.mistakeCategoryBreakdown.length === 0"
          class="ritme-subtitle"
          style="font-size: 0.72rem; margin: 0;"
        >
          {{ t('progress.noMistakeBreakdownYet') }}
        </p>
        <div
          v-for="cat in report.mistakeCategoryBreakdown"
          :key="cat.category"
          style="margin-bottom: 6px;"
        >
          <div style="display: flex; justify-content: space-between; font-size: 0.71rem;">
            <span>{{ t(`learning.errorCategories.${cat.category}`) }}</span>
            <strong>{{ cat.count }} ({{ cat.unresolvedCount }})</strong>
          </div>
          <div class="ritme-progress-track" style="height: 5px; margin-top: 2px;">
            <div
              class="ritme-progress-fill"
              :style="{ width: `${cat.percentOfTotal}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Review Health -->
      <div
        style="padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line);"
      >
        <div
          class="ritme-title-row"
          style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; gap: 5px;"
        >
          <ion-icon :icon="refreshCircleOutline" style="font-size: 0.92rem; color: var(--ritme-accent-secondary);" />
          {{ t('progress.reviewHealthTitle') }}
        </div>
        <div class="ritme-subtitle" style="font-size: 0.72rem; line-height: 1.55;">
          <div>
            {{
              t('progress.reviewedTopicsStat', {
                count: report.reviewedTopicsCount,
              })
            }}
          </div>
          <div>
            {{
              report.avgReviewAccuracy !== null
                ? t('progress.avgReviewAccuracyStat', {
                    accuracy: report.avgReviewAccuracy,
                  })
                : t('progress.avgReviewAccuracyEmpty')
            }}
          </div>
          <div>
            {{
              t('progress.dueOverdueStat', {
                due: report.dueTodayReviewsCount,
                overdue: report.overdueReviewsCount,
              })
            }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { IonIcon } from '@ionic/vue'
import {
  bookmarkOutline,
  bulbOutline,
  createOutline,
  locateOutline,
  pieChartOutline,
  refreshCircleOutline,
  schoolOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { buildLearningAnalyticsReport } from '@/services/analytics/learningAnalytics'

const { t } = useI18n()
const router = useRouter()
const learningStore = useLearningStore()
const gamificationStore = useGamificationStore()

const report = computed(() =>
  buildLearningAnalyticsReport({
    topics: learningStore.topics,
    subtests: learningStore.sortedSubtests,
    questionAttempts: learningStore.questionAttempts,
    mistakeNotes: learningStore.mistakeNotes,
    bossAttempts: learningStore.bossAttempts,
    smartReviewQueue: learningStore.smartReviewQueue,
    questCounts: {
      dailyDone: gamificationStore.todayQuests.filter((q) => q.completed).length,
      dailyTotal: gamificationStore.todayQuests.length,
      weeklyDone: gamificationStore.weeklyQuests.filter((q) => q.completed).length,
      weeklyTotal: gamificationStore.weeklyQuests.length,
      mainSideDone:
        gamificationStore.mainQuests.filter((q) => q.completed).length +
        gamificationStore.sideQuests.filter((q) => q.completed).length,
      mainSideTotal:
        gamificationStore.mainQuests.length +
        gamificationStore.sideQuests.length,
      customDone: gamificationStore.customQuests.filter((q) => q.completed).length,
      customTotal: gamificationStore.customQuests.length,
    },
  })
)

const masterySegments = computed(() => {
  const dist = report.value.masteryDistribution
  const total = Math.max(1, dist.totalTopics)
  return [
    {
      key: 'mastered',
      label: t('learning.status.mastered'),
      count: dist.masteredCount,
      percent: Math.round((dist.masteredCount / total) * 100),
      color: 'var(--ritme-gold)',
    },
    {
      key: 'proficient',
      label: t('learning.status.proficient'),
      count: dist.proficientCount,
      percent: Math.round((dist.proficientCount / total) * 100),
      color: 'var(--ritme-accent-secondary)',
    },
    {
      key: 'practicing',
      label: t('learning.status.practicing'),
      count: dist.practicingCount,
      percent: Math.round((dist.practicingCount / total) * 100),
      color: 'var(--ritme-accent-primary)',
    },
    {
      key: 'needs_review',
      label: t('learning.status.needs_review'),
      count: dist.needsReviewCount,
      percent: Math.round((dist.needsReviewCount / total) * 100),
      color: 'var(--ritme-warning)',
    },
    {
      key: 'learning',
      label: t('learning.status.learning'),
      count: dist.learningCount,
      percent: Math.round((dist.learningCount / total) * 100),
      color: 'rgba(139, 124, 255, 0.45)',
    },
    {
      key: 'not_started',
      label: t('learning.status.not_started'),
      count: dist.notStartedCount,
      percent: Math.round((dist.notStartedCount / total) * 100),
      color: 'var(--ritme-border-line)',
    },
  ]
})

function goToTopicPractice(subtestId: string, topicId: string) {
  router.push(
    `/tabs/learning?tab=practice&subtestId=${subtestId}&topicId=${topicId}`
  )
}
</script>
