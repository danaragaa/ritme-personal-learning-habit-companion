<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title ritme-title-row">
          <ion-icon :icon="bookmarkOutline" style="color: var(--ritme-gold);" />
          <span>{{ t('learning.mistakeBookTitle') }}</span>
        </h2>
        <p class="ritme-subtitle" style="margin-top: 2px;">
          {{ t('learning.mistakeBookSubtitle') }}
        </p>
      </div>
      <span class="ritme-badge ritme-badge-gold">
        {{ learningStore.unresolvedMistakes.length }}
      </span>
    </div>

    <div style="display: flex; gap: 6px; margin-bottom: 12px;">
      <button
        v-for="f in (['all', 'unresolved', 'resolved'] as const)"
        :key="f"
        type="button"
        class="ritme-btn-outline"
        style="height: 28px; padding: 0 10px; font-size: 0.74rem;"
        :style="{
          borderColor:
            mistakeFilter === f
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-border-line)',
          color:
            mistakeFilter === f
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-text-secondary)',
        }"
        @click="mistakeFilter = f"
      >
        {{
          f === 'all'
            ? t('learning.mistakeFilterAll')
            : f === 'unresolved'
              ? t('learning.mistakeFilterUnresolved')
              : t('learning.mistakeFilterResolved')
        }}
      </button>
    </div>

    <p
      v-if="filteredMistakes.length === 0"
      class="ritme-subtitle"
      style="text-align: center; padding: 12px 0;"
    >
      {{ t('learning.emptyMistakes') }}
    </p>

    <div
      v-for="note in filteredMistakes"
      :key="note.id"
      class="ritme-list-item"
      style="display: block;"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;"
      >
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          <span class="ritme-badge">
            {{ resolveSubtestCode(note.subtestId) }}
          </span>
          <span class="ritme-badge ritme-badge-gold" style="font-size: 0.68rem;">
            {{ t(`learning.errorCategories.${note.errorCategory}`) }}
          </span>
          <span
            v-if="note.resolved"
            class="ritme-badge ritme-badge-cyan ritme-title-row"
            style="font-size: 0.68rem; gap: 4px;"
          >
            <ion-icon :icon="checkmarkOutline" style="font-size: 0.78rem;" />
            {{ t('learning.mistakeFilterResolved') }}
          </span>
        </div>
        <span class="ritme-subtitle" style="font-size: 0.72rem;">
          {{ note.dateRecorded }} •
          {{
            t('learning.nextMistakeReviewLabel', {
              date: note.nextReviewDate,
            })
          }}
        </span>
      </div>

      <div style="font-size: 0.84rem; font-weight: 600; margin-bottom: 6px;">
        {{ note.questionPreview }}
      </div>

      <!-- Inline Retry ("Kerjakan Ulang") UI (PRD 3.0 Section 11.3 & 26 AC) -->
      <div
        v-if="activeRetryNoteId === note.id && activeRetryQuestion"
        style="margin: 8px 0 10px; padding: 10px; border-radius: 10px; background: var(--ritme-bg-primary); border: 1px solid var(--ritme-accent-primary);"
      >
        <div style="font-size: 0.85rem; line-height: 1.45; white-space: pre-line; margin-bottom: 8px;">
          {{
            userStore.settings.language === 'id'
              ? activeRetryQuestion.questionIdText
              : activeRetryQuestion.questionEnText
          }}
        </div>

        <button
          v-for="(opt, idx) in activeRetryOptions"
          :key="idx"
          type="button"
          style="width: 100%; text-align: left; padding: 8px 10px; border-radius: 8px; margin-bottom: 6px; font-size: 0.8rem; cursor: pointer;"
          :style="{
            background:
              retrySelectedIndex === idx
                ? 'rgba(139, 124, 255, 0.22)'
                : 'var(--ritme-bg-elevated)',
            border:
              retrySelectedIndex === idx
                ? '1px solid var(--ritme-accent-primary)'
                : '1px solid var(--ritme-border-line)',
            color: 'var(--ritme-text-primary)',
          }"
          @click="retrySelectedIndex = idx"
        >
          <strong>{{ ['A', 'B', 'C', 'D', 'E'][idx] }}.</strong> {{ opt }}
        </button>

        <div style="display: flex; gap: 8px; margin-top: 6px;">
          <ion-button
            size="small"
            color="primary"
            :disabled="retrySelectedIndex === null"
            @click="submitRetryAnswer(note.id)"
          >
            {{ t('learning.submitRetryBtn') }}
          </ion-button>
          <ion-button
            size="small"
            fill="outline"
            color="secondary"
            @click="activeRetryNoteId = null"
          >
            {{ t('learning.cancelBtn') }}
          </ion-button>
        </div>
      </div>

      <!-- Retry Result Banner -->
      <div
        v-if="retryFeedbackById[note.id]"
        style="padding: 8px 10px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; margin-bottom: 8px;"
        :style="{
          background: retryFeedbackById[note.id].isCorrect
            ? 'rgba(89, 203, 232, 0.14)'
            : 'rgba(245, 197, 107, 0.14)',
          color: retryFeedbackById[note.id].isCorrect
            ? 'var(--ritme-accent-secondary)'
            : 'var(--ritme-warning)',
        }"
      >
        {{
          retryFeedbackById[note.id].isCorrect
            ? t('learning.retrySuccessBanner')
            : t('learning.retryFailBanner')
        }}
      </div>

      <!-- Standard Summary Details (Hidden while actively retrying to prevent spoiling) -->
      <template v-if="activeRetryNoteId !== note.id">
        <div class="ritme-subtitle" style="font-size: 0.78rem; margin-bottom: 4px;">
          <strong style="color: var(--ritme-warning);">
            {{ t('learning.userAnswerLabel') }}
          </strong>
          {{ note.userAnswer }}
        </div>
        <div class="ritme-subtitle" style="font-size: 0.78rem; margin-bottom: 6px;">
          <strong style="color: var(--ritme-accent-secondary);">
            {{ t('learning.correctAnswerLabel') }}
          </strong>
          {{ note.correctAnswer }}
        </div>

        <div
          v-if="note.explanation"
          class="ritme-title-row"
          style="width: 100%; padding: 8px; border-radius: 8px; background: var(--ritme-bg-primary); font-size: 0.78rem; color: var(--ritme-text-secondary); margin-bottom: 6px; align-items: flex-start;"
        >
          <ion-icon :icon="bulbOutline" style="font-size: 0.9rem; margin-top: 2px; color: var(--ritme-gold); flex-shrink: 0;" />
          <span>{{ note.explanation }}</span>
        </div>
      </template>

      <div
        v-if="note.personalNote"
        class="ritme-title-row"
        style="font-size: 0.76rem; color: var(--ritme-gold); margin-bottom: 8px;"
      >
        <ion-icon :icon="createOutline" style="font-size: 0.85rem; flex-shrink: 0;" />
        <span>{{ note.personalNote }}</span>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap;">
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button
            v-if="hasLinkedQuestion(note.questionId) && activeRetryNoteId !== note.id"
            type="button"
            class="ritme-btn-outline"
            style="height: 28px; padding: 0 10px; font-size: 0.74rem; color: var(--ritme-accent-primary); border-color: var(--ritme-accent-primary); display: inline-flex; align-items: center; gap: 4px;"
            @click="startRetry(note)"
          >
            <ion-icon :icon="repeatOutline" style="font-size: 0.86rem;" />
            {{ t('learning.retryMistakeBtn') }}
          </button>

          <button
            v-if="note.resolved || !hasLinkedQuestion(note.questionId)"
            type="button"
            class="ritme-btn-outline"
            style="height: 28px; padding: 0 10px; font-size: 0.74rem; display: inline-flex; align-items: center; gap: 4px;"
            :style="{
              color: note.resolved
                ? 'var(--ritme-text-secondary)'
                : 'var(--ritme-accent-secondary)',
            }"
            @click="learningStore.toggleResolveMistakeNote(note.id)"
          >
            <ion-icon
              v-if="!note.resolved"
              :icon="checkmarkOutline"
              style="font-size: 0.84rem;"
            />
            <span>
              {{
                note.resolved
                  ? t('learning.markUnresolvedBtn')
                  : t('learning.markResolvedBtn')
              }}
            </span>
          </button>
        </div>

        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 28px; padding: 0 8px; font-size: 0.74rem; color: var(--ritme-danger);"
          @click="learningStore.deleteMistakeNote(note.id)"
        >
          {{ t('learning.deleteBtn') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import {
  bookmarkOutline,
  bulbOutline,
  checkmarkOutline,
  createOutline,
  repeatOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import { playAnswerFeedback } from '@/services/timer/soundFeedbackService'
import type { MistakeNote, PracticeQuestion } from '@/types'

const { t } = useI18n()
const learningStore = useLearningStore()
const userStore = useUserStore()

const mistakeFilter = ref<'all' | 'unresolved' | 'resolved'>('all')
const activeRetryNoteId = ref<string | null>(null)
const retrySelectedIndex = ref<number | null>(null)
const retryFeedbackById = ref<Record<string, { isCorrect: boolean }>>({})

const filteredMistakes = computed(() => {
  if (mistakeFilter.value === 'unresolved') {
    return learningStore.mistakeNotes.filter((m) => !m.resolved)
  }
  if (mistakeFilter.value === 'resolved') {
    return learningStore.mistakeNotes.filter((m) => m.resolved)
  }
  return learningStore.mistakeNotes
})

const activeRetryNote = computed<MistakeNote | null>(
  () =>
    learningStore.mistakeNotes.find((m) => m.id === activeRetryNoteId.value) ||
    null
)

const activeRetryQuestion = computed<PracticeQuestion | null>(() => {
  if (!activeRetryNote.value) return null
  return (
    learningStore.questions.find(
      (q) => q.id === activeRetryNote.value?.questionId
    ) || null
  )
})

const activeRetryOptions = computed(() => {
  if (!activeRetryQuestion.value) return []
  return userStore.settings.language === 'id'
    ? activeRetryQuestion.value.optionsId
    : activeRetryQuestion.value.optionsEn
})

function hasLinkedQuestion(questionId: string): boolean {
  return learningStore.questions.some((q) => q.id === questionId)
}

function startRetry(note: MistakeNote): void {
  activeRetryNoteId.value = note.id
  retrySelectedIndex.value = null
}

async function submitRetryAnswer(noteId: string): Promise<void> {
  if (retrySelectedIndex.value === null) return
  const selectedText = activeRetryOptions.value[retrySelectedIndex.value] || '-'
  const res = await learningStore.retryMistakeNoteAttempt({
    mistakeId: noteId,
    selectedIndex: retrySelectedIndex.value,
    selectedAnswerText: selectedText,
  })
  if (res) {
    retryFeedbackById.value[noteId] = { isCorrect: res.isCorrect }
    playAnswerFeedback(res.isCorrect)
  }
  activeRetryNoteId.value = null
  retrySelectedIndex.value = null
}

function resolveSubtestCode(subtestId: string): string {
  return learningStore.getSubtestById(subtestId)?.code || subtestId
}
</script>
