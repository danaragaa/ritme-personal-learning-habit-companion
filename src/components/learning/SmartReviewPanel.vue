<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title ritme-title-row">
          <ion-icon :icon="refreshCircleOutline" style="color: var(--ritme-accent-secondary);" />
          <span>{{ t('learning.reviewQueueTitle') }}</span>
        </h2>
        <p class="ritme-subtitle" style="margin-top: 2px;">
          {{ t('learning.reviewQueueSubtitle') }}
        </p>
      </div>
      <span class="ritme-badge ritme-badge-gold">
        {{ learningStore.smartReviewQueue.length }}
      </span>
    </div>

    <!-- Review Session Result Feedback -->
    <div
      v-if="lastReviewOutcome"
      style="padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-gold-border); margin-bottom: 12px;"
    >
      <div
        class="ritme-title-row"
        style="font-weight: 800; font-size: 0.88rem; color: var(--ritme-gold); margin-bottom: 4px;"
      >
        <ion-icon :icon="checkmarkCircleOutline" style="font-size: 1rem;" />
        <span>{{ t('learning.reviewResultTitle') }} — {{ lastReviewOutcome.topicTitle }}</span>
      </div>
      <div style="font-size: 0.8rem; color: var(--ritme-text-primary); margin-bottom: 4px;">
        {{
          t('learning.reviewResultStats', {
            correct: lastReviewOutcome.correctCount,
            total: lastReviewOutcome.totalCount,
            accuracy: lastReviewOutcome.accuracyPercent,
            interval: lastReviewOutcome.nextIntervalDays,
            date: lastReviewOutcome.nextReviewDate,
          })
        }}
      </div>
      <div class="ritme-subtitle" style="font-size: 0.74rem;">
        {{ t(`learning.status.${lastReviewOutcome.newStatus}`) }}
        <span
          v-if="lastReviewOutcome.xpEarned > 0"
          style="color: var(--ritme-gold); font-weight: 700; margin-left: 6px;"
        >
          +{{ lastReviewOutcome.xpEarned }} XP
        </span>
      </div>
    </div>

    <!-- Snooze Notice -->
    <div
      v-if="snoozeNotice"
      class="ritme-list-item"
      style="margin-bottom: 10px; border-color: var(--ritme-warning); font-size: 0.78rem; color: var(--ritme-warning);"
    >
      {{ snoozeNotice }}
    </div>

    <!-- Active Question-Based Review Session -->
    <div
      v-if="activeReviewTopicId"
      style="padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-accent-primary); margin-bottom: 12px;"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"
      >
        <strong
          class="ritme-title-row"
          style="font-size: 0.9rem; color: var(--ritme-accent-secondary);"
        >
          <ion-icon :icon="refreshCircleOutline" style="font-size: 1rem;" />
          <span>{{ activeReviewTopicTitle }}</span>
        </strong>
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 26px; padding: 0 9px; font-size: 0.72rem;"
          @click="activeReviewTopicId = null"
        >
          {{ t('learning.cancelBtn') }}
        </button>
      </div>

      <div
        v-for="(rq, qIdx) in activeReviewQuestions"
        :key="rq.id"
        style="padding: 10px; border-radius: 10px; background: var(--ritme-bg-primary); border: 1px solid var(--ritme-border-line); margin-bottom: 10px;"
      >
        <div style="font-weight: 700; font-size: 0.8rem; color: var(--ritme-accent-primary); margin-bottom: 6px;">
          #{{ qIdx + 1 }} • {{ resolveSubtestCode(rq.subtestId) }}
        </div>
        <div style="font-size: 0.85rem; line-height: 1.45; white-space: pre-line; margin-bottom: 8px;">
          {{
            userStore.settings.language === 'id'
              ? rq.questionIdText
              : rq.questionEnText
          }}
        </div>

        <button
          v-for="(opt, oIdx) in userStore.settings.language === 'id'
            ? rq.optionsId
            : rq.optionsEn"
          :key="oIdx"
          type="button"
          style="width: 100%; text-align: left; padding: 8px 10px; border-radius: 8px; margin-bottom: 6px; font-size: 0.8rem; cursor: pointer;"
          :style="{
            background:
              reviewAnswers[rq.id] === oIdx
                ? 'rgba(139, 124, 255, 0.22)'
                : 'var(--ritme-bg-elevated)',
            border:
              reviewAnswers[rq.id] === oIdx
                ? '1px solid var(--ritme-accent-primary)'
                : '1px solid var(--ritme-border-line)',
            color: 'var(--ritme-text-primary)',
          }"
          @click="reviewAnswers[rq.id] = oIdx"
        >
          <strong>{{ ['A', 'B', 'C', 'D', 'E'][oIdx] }}.</strong> {{ opt }}
        </button>
      </div>

      <ion-button
        expand="block"
        color="primary"
        :disabled="!allReviewQuestionsAnswered"
        style="font-weight: 700;"
        @click="submitReviewQuiz"
      >
        <ion-icon slot="start" :icon="checkmarkOutline" />
        {{ t('learning.submitReviewSessionBtn') }}
      </ion-button>
    </div>

    <!-- Smart Review Queue List -->
    <p
      v-if="learningStore.smartReviewQueue.length === 0 && !activeReviewTopicId"
      class="ritme-subtitle"
      style="text-align: center; padding: 12px 0;"
    >
      {{ t('learning.emptyReviewTopics') }}
    </p>

    <div
      v-for="item in learningStore.smartReviewQueue"
      :key="item.topic.id"
      class="ritme-list-item"
      style="display: block;"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;"
      >
        <div>
          <span class="ritme-badge" style="margin-right: 6px;">
            {{ item.subtestCode }}
          </span>
          <strong style="font-size: 0.9rem;">{{ item.topic.title }}</strong>
        </div>
        <span class="ritme-badge ritme-badge-cyan">
          {{ t('learning.reviewIntervalBadge', { days: item.intervalDays }) }}
        </span>
      </div>

      <!-- Transparent Recommendation Reason (PRD Section 10.4 & 26 AC) -->
      <div
        class="ritme-title-row"
        style="width: 100%; padding: 6px 8px; border-radius: 8px; background: var(--ritme-bg-primary); font-size: 0.75rem; color: var(--ritme-accent-secondary); margin-bottom: 6px; align-items: flex-start;"
      >
        <ion-icon :icon="bulbOutline" style="font-size: 0.9rem; margin-top: 2px; flex-shrink: 0;" />
        <span>
          <strong>{{ t('learning.reviewReasonPrefix') }}</strong>
          {{ t(item.reasonKey, item.reasonParams) }}
        </span>
      </div>

      <div class="ritme-subtitle" style="font-size: 0.74rem; margin-bottom: 8px;">
        {{ t('learning.accuracy', { percent: item.accuracy }) }}
        <span v-if="item.topic.reviewSchedule">
          •
          {{
            t('learning.reviewScheduled', {
              date: item.topic.reviewSchedule,
            })
          }}
        </span>
        <span v-if="item.lastReviewedAt">
          •
          {{
            t('learning.lastReviewedLabel', {
              date: item.lastReviewedAt.slice(0, 10),
              count: item.reviewCount,
            })
          }}
        </span>
      </div>

      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <ion-button
          size="small"
          color="primary"
          style="margin: 0; font-weight: 700;"
          @click="startReviewQuiz(item)"
        >
          <ion-icon slot="start" :icon="refreshCircleOutline" />
          {{ t('learning.startReviewSessionBtn') }}
        </ion-button>
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 32px; padding: 0 10px; font-size: 0.74rem; color: var(--ritme-text-secondary); display: inline-flex; align-items: center; gap: 4px;"
          @click="handleSnoozeReview(item.topic.id)"
        >
          <ion-icon :icon="timeOutline" style="font-size: 0.85rem;" />
          {{ t('learning.snoozeReviewBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import {
  bulbOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  refreshCircleOutline,
  timeOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import type { SmartReviewQueueItem } from '@/services/learning/masteryEngine'
import type { PracticeQuestion, TopicStatus } from '@/types'

const { t } = useI18n()
const learningStore = useLearningStore()
const userStore = useUserStore()

const activeReviewTopicId = ref<string | null>(null)
const activeReviewTopicTitle = ref<string>('')
const activeReviewQuestions = ref<PracticeQuestion[]>([])
const reviewAnswers = ref<Record<string, number>>({})
const snoozeNotice = ref<string>('')
const lastReviewOutcome = ref<{
  topicTitle: string
  correctCount: number
  totalCount: number
  accuracyPercent: number
  nextIntervalDays: number
  nextReviewDate: string
  newStatus: TopicStatus
  xpEarned: number
} | null>(null)

const allReviewQuestionsAnswered = computed(() => {
  if (activeReviewQuestions.value.length === 0) return false
  return activeReviewQuestions.value.every(
    (q) => reviewAnswers.value[q.id] !== undefined
  )
})

function startReviewQuiz(item: SmartReviewQueueItem): void {
  const qs = learningStore.getReviewQuestionsForTopic(
    item.topic.id,
    item.topic.subtestId
  )
  activeReviewTopicId.value = item.topic.id
  activeReviewTopicTitle.value = item.topic.title
  activeReviewQuestions.value = qs
  reviewAnswers.value = {}
  snoozeNotice.value = ''
}

async function submitReviewQuiz(): Promise<void> {
  if (!activeReviewTopicId.value || !allReviewQuestionsAnswered.value) return
  const results = activeReviewQuestions.value.map((q) => ({
    questionId: q.id,
    selectedIndex: reviewAnswers.value[q.id],
  }))
  const res = await learningStore.completeReviewSession({
    topicId: activeReviewTopicId.value,
    results,
  })
  lastReviewOutcome.value = {
    topicTitle: activeReviewTopicTitle.value,
    correctCount: res.correctCount,
    totalCount: res.totalCount,
    accuracyPercent: res.accuracyPercent,
    nextIntervalDays: res.nextIntervalDays,
    nextReviewDate: res.nextReviewDate,
    newStatus: res.newStatus,
    xpEarned: res.xpEarned,
  }
  activeReviewTopicId.value = null
}

async function handleSnoozeReview(topicId: string): Promise<void> {
  const nextDate = await learningStore.snoozeTopicReview(topicId, 1)
  snoozeNotice.value = t('learning.snoozeConfirmNote', { date: nextDate })
}

function resolveSubtestCode(subtestId: string): string {
  return learningStore.getSubtestById(subtestId)?.code || subtestId
}
</script>
