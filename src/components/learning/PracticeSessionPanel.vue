<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title ritme-title-row">
          <ion-icon :icon="documentTextOutline" style="color: var(--ritme-accent-primary);" />
          <span>{{ t('learning.questionEngineTitle') }}</span>
        </h2>
        <p class="ritme-subtitle" style="margin-top: 2px;">
          {{ t('learning.questionEngineSubtitle') }}
        </p>
      </div>
      <span
        v-if="!sessionSummary && filteredQuestions.length > 0"
        class="ritme-badge ritme-badge-cyan"
      >
        {{ currentQuestionIndex + 1 }} / {{ filteredQuestions.length }}
      </span>
    </div>

    <!-- Active Chapter / Topic Scope Pill + Reset -->
    <div
      v-if="chapterFilter || topicFilter"
      style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: var(--ritme-radius-md); background: rgba(139, 124, 255, 0.12); border: 1px solid var(--ritme-accent-primary); margin-bottom: 10px; flex-wrap: wrap;"
    >
      <span
        class="ritme-title-row"
        style="font-size: 0.76rem; font-weight: 700; color: var(--ritme-accent-primary);"
      >
        <ion-icon :icon="locateOutline" style="font-size: 0.9rem;" />
        <span>{{ activeScopeLabel }}</span>
      </span>
      <button
        type="button"
        class="ritme-btn-outline"
        style="height: 26px; padding: 0 9px; font-size: 0.7rem;"
        @click="$emit('clear-scope-filters')"
      >
        {{ t('learning.clearFilterBtn') }}
      </button>
    </div>

    <!-- Filter by Subtest -->
    <div
      class="ritme-pill-strip"
      style="margin-bottom: 12px;"
    >
      <button
        type="button"
        class="ritme-btn-outline"
        style="height: 28px; padding: 0 10px; font-size: 0.72rem; white-space: nowrap;"
        :style="{
          borderColor:
            subtestFilter === 'all' && !chapterFilter && !topicFilter
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-border-line)',
          color:
            subtestFilter === 'all' && !chapterFilter && !topicFilter
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-text-secondary)',
        }"
        @click="selectSubtest('all')"
      >
        {{
          t('learning.allQuestionsFilter', {
            count: learningStore.unlockedQuestions.length,
          })
        }}
      </button>
      <button
        v-for="sub in learningStore.sortedSubtests"
        :key="sub.id"
        type="button"
        class="ritme-btn-outline"
        style="height: 28px; padding: 0 10px; font-size: 0.72rem; white-space: nowrap;"
        :style="{
          borderColor:
            subtestFilter === sub.id && !chapterFilter && !topicFilter
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-border-line)',
          color:
            subtestFilter === sub.id && !chapterFilter && !topicFilter
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-text-secondary)',
        }"
        @click="selectSubtest(sub.id)"
      >
        {{ sub.code }}
      </button>
    </div>

    <!-- PRACTICE SESSION SUMMARY VIEW (PRD 3.0 Section 9.5) -->
    <div v-if="sessionSummary">
      <div
        style="padding: 14px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-gold-border); margin-bottom: 12px;"
      >
        <div
          style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 6px;"
        >
          <strong
            class="ritme-title-row"
            style="font-size: 0.96rem; color: var(--ritme-gold);"
          >
            <ion-icon :icon="statsChartOutline" style="font-size: 1.05rem;" />
            <span>{{ t('learning.sessionSummaryTitle') }}</span>
          </strong>
          <span class="ritme-badge ritme-badge-cyan">
            {{ sessionSummary.accuracyPercent }}%
          </span>
        </div>

        <div style="font-size: 0.82rem; font-weight: 600; margin-bottom: 4px;">
          {{
            t('learning.sessionStatsRow', {
              attempted: sessionSummary.attemptedCount,
              total: sessionSummary.totalQuestions,
              correct: sessionSummary.correctCount,
              incorrect: sessionSummary.incorrectCount,
              accuracy: sessionSummary.accuracyPercent,
            })
          }}
        </div>
        <div
          class="ritme-subtitle ritme-title-row"
          style="font-size: 0.76rem; margin-bottom: 10px;"
        >
          <ion-icon :icon="timeOutline" style="font-size: 0.85rem;" />
          <span>
            {{
              t('learning.sessionDurationRow', {
                seconds: sessionSummary.timeSpentSeconds,
              })
            }}
          </span>
        </div>

        <!-- Weak Topics Identification -->
        <div
          style="padding: 9px 10px; border-radius: 8px; background: var(--ritme-bg-primary); border: 1px solid var(--ritme-border-line); margin-bottom: 10px;"
        >
          <div style="font-size: 0.76rem; font-weight: 700; margin-bottom: 4px;">
            {{ t('learning.weakTopicsLabel') }}
          </div>
          <div
            v-if="sessionSummary.weakTopicTitles.length === 0"
            style="font-size: 0.76rem; color: var(--ritme-accent-secondary);"
          >
            {{ t('learning.noWeakTopicsLabel') }}
          </div>
          <div v-else style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span
              v-for="wt in sessionSummary.weakTopicTitles"
              :key="wt"
              class="ritme-badge"
              style="background: var(--ritme-warning-soft); color: var(--ritme-warning);"
            >
              {{ wt }}
            </span>
          </div>
        </div>

        <!-- Answer List Breakdown -->
        <div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px;">
          {{ t('learning.answerListTitle') }}
        </div>
        <div
          v-for="(row, rIdx) in sessionSummary.rows"
          :key="row.question.id"
          style="padding: 8px 10px; border-radius: 8px; background: var(--ritme-bg-primary); border: 1px solid var(--ritme-border-line); margin-bottom: 6px; font-size: 0.78rem;"
        >
          <div
            style="display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 4px;"
          >
            <strong>#{{ rIdx + 1 }} • {{ resolveSubtestCode(row.question.subtestId) }}</strong>
            <span
              class="ritme-badge"
              :style="{
                color:
                  row.selectedIndex === null
                    ? 'var(--ritme-text-secondary)'
                    : row.isCorrect
                      ? 'var(--ritme-accent-secondary)'
                      : 'var(--ritme-danger)',
              }"
            >
              <ion-icon
                v-if="row.selectedIndex !== null"
                :icon="row.isCorrect ? checkmarkOutline : closeOutline"
                style="font-size: 0.85rem;"
              />
              <span v-else>{{ t('learning.unansweredLabel') }}</span>
            </span>
          </div>
          <div class="ritme-subtitle" style="font-size: 0.74rem;">
            {{ resolveQuestionText(row.question).slice(0, 110) }}...
          </div>
          <div
            class="ritme-title-row"
            style="margin-top: 4px; color: var(--ritme-text-secondary); font-size: 0.74rem; align-items: flex-start;"
          >
            <ion-icon :icon="bulbOutline" style="font-size: 0.85rem; margin-top: 2px; color: var(--ritme-gold); flex-shrink: 0;" />
            <span>{{ resolveExplanationText(row.question) }}</span>
          </div>
        </div>
      </div>

      <ion-button
        expand="block"
        color="primary"
        style="font-weight: 700;"
        @click="resetFullSession"
      >
        <ion-icon slot="start" :icon="refreshOutline" />
        {{ t('learning.restartSessionBtn') }}
      </ion-button>
    </div>

    <!-- ACTIVE QUESTION VIEW -->
    <div v-else-if="currentQuestion">
      <!-- Interactive Question Stepper Strip -->
      <div
        v-if="filteredQuestions.length > 1"
        style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;"
      >
        <button
          v-for="(q, qIdx) in filteredQuestions"
          :key="q.id"
          type="button"
          class="ritme-step-chip"
          :style="stepChipStyle(q.id, qIdx)"
          @click="jumpToQuestion(qIdx)"
        >
          {{ qIdx + 1 }}
        </button>
      </div>

      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;"
      >
        <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          <span class="ritme-badge">
            {{ resolveSubtestCode(currentQuestion.subtestId) }}
          </span>
          <span class="ritme-badge ritme-badge-gold" style="text-transform: uppercase;">
            {{ currentQuestion.difficulty }}
          </span>
        </div>
        <span
          v-if="currentTopicTitle"
          class="ritme-subtitle"
          style="font-size: 0.72rem; font-weight: 600;"
        >
          {{ t('learning.conceptTestedLabel') }} {{ currentTopicTitle }}
        </span>
      </div>

      <!-- Question Text -->
      <div
        style="padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line); font-size: 0.9rem; line-height: 1.55; white-space: pre-line; margin-bottom: 12px;"
      >
        {{ resolveQuestionText(currentQuestion) }}
      </div>

      <!-- Multiple-Choice Options A..E -->
      <div>
        <button
          v-for="(opt, idx) in currentQuestionOptions"
          :key="idx"
          type="button"
          style="width: 100%; text-align: left; padding: 11px 12px; border-radius: var(--ritme-radius-md); margin-bottom: 8px; display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 0.85rem; transition: all 0.15s ease;"
          :style="optionButtonStyle(idx)"
          @click="selectOption(idx)"
        >
          <span style="font-weight: 800; color: var(--ritme-accent-primary); flex-shrink: 0;">
            {{ ['A', 'B', 'C', 'D', 'E'][idx] }}.
          </span>
          <span style="color: var(--ritme-text-primary); line-height: 1.4;">
            {{ opt }}
          </span>
        </button>
      </div>

      <!-- Check Answer & Navigation Controls -->
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap;"
      >
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 36px; padding: 0 12px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px;"
          :disabled="currentQuestionIndex <= 0"
          @click="prevQuestion"
        >
          <ion-icon :icon="chevronBackOutline" />
          {{ t('learning.prevQuestionBtn') }}
        </button>

        <ion-button
          v-if="!answerChecked"
          size="small"
          color="primary"
          :disabled="selectedOptionIndex === null"
          style="font-weight: 700;"
          @click="handleCheckAnswer"
        >
          <ion-icon slot="start" :icon="checkmarkOutline" />
          {{ t('learning.checkAnswerBtn') }}
        </ion-button>

        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 36px; padding: 0 12px; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 4px;"
          :disabled="currentQuestionIndex >= filteredQuestions.length - 1"
          @click="nextQuestion"
        >
          {{ t('learning.nextQuestionBtn') }}
          <ion-icon :icon="chevronForwardOutline" />
        </button>
      </div>

      <!-- Finish Practice Session Summary Trigger -->
      <div
        v-if="Object.keys(sessionRecords).length > 0"
        style="margin-top: 10px;"
      >
        <button
          type="button"
          class="ritme-btn-outline"
          style="width: 100%; height: 36px; font-size: 0.78rem; color: var(--ritme-accent-secondary); border-color: var(--ritme-accent-secondary); display: inline-flex; align-items: center; justify-content: center; gap: 6px;"
          @click="finishPracticeSession"
        >
          <ion-icon :icon="statsChartOutline" style="font-size: 0.95rem;" />
          {{ t('learning.finishPracticeSessionBtn') }}
        </button>
      </div>

      <!-- Instant Feedback & Explanation (Section 9.6) -->
      <div
        v-if="answerChecked"
        style="margin-top: 14px; padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-highlight);"
      >
        <div
          class="ritme-title-row"
          style="font-weight: 800; font-size: 0.88rem; margin-bottom: 8px;"
          :style="{
            color:
              selectedOptionIndex === currentQuestion.correctIndex
                ? 'var(--ritme-accent-secondary)'
                : 'var(--ritme-warning)',
          }"
        >
          <ion-icon
            :icon="
              selectedOptionIndex === currentQuestion.correctIndex
                ? checkmarkCircleOutline
                : closeCircleOutline
            "
            style="font-size: 1.05rem; flex-shrink: 0;"
          />
          <span>
            {{
              selectedOptionIndex === currentQuestion.correctIndex
                ? t('learning.correctBanner')
                : t('learning.incorrectBanner')
            }}
          </span>
        </div>

        <div
          v-if="currentTopicTitle"
          class="ritme-subtitle"
          style="font-size: 0.76rem; margin-bottom: 6px;"
        >
          <strong>{{ t('learning.conceptTestedLabel') }}</strong>
          {{ currentTopicTitle }}
        </div>

        <div
          class="ritme-title-row"
          style="font-weight: 700; font-size: 0.8rem; color: var(--ritme-gold); margin-bottom: 4px;"
        >
          <ion-icon :icon="bulbOutline" style="font-size: 0.92rem;" />
          <span>{{ t('learning.explanationTitle') }}</span>
        </div>
        <div
          style="font-size: 0.83rem; line-height: 1.5; color: var(--ritme-text-secondary); white-space: pre-line; margin-bottom: 12px;"
        >
          {{ resolveExplanationText(currentQuestion) }}
        </div>

        <!-- Save to Mistake Notebook Form -->
        <div style="padding-top: 10px; border-top: 1px solid var(--ritme-border-line);">
          <div
            v-if="savedMistakeForCurrent"
            class="ritme-badge ritme-badge-cyan ritme-title-row"
            style="gap: 4px;"
          >
            <ion-icon :icon="checkmarkOutline" style="font-size: 0.85rem;" />
            {{ t('learning.savedToMistakeBadge') }}
          </div>
          <div v-else>
            <div class="ritme-grid-2" style="margin-bottom: 8px;">
              <div>
                <label class="ritme-label">{{ t('learning.errorCategoryLabel') }}</label>
                <select v-model="mistakeCategoryInput" class="ritme-input">
                  <option
                    v-for="cat in errorCategories"
                    :key="cat"
                    :value="cat"
                  >
                    {{ t(`learning.errorCategories.${cat}`) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="ritme-label">{{ t('learning.topicNotesLabel') }}</label>
                <input
                  v-model="mistakePersonalNoteInput"
                  type="text"
                  class="ritme-input"
                  :placeholder="t('learning.personalNotePlaceholder')"
                />
              </div>
            </div>
            <button
              type="button"
              class="ritme-btn-outline"
              style="height: 34px; padding: 0 12px; font-size: 0.78rem; color: var(--ritme-gold); border-color: var(--ritme-gold-border); display: inline-flex; align-items: center; gap: 5px;"
              @click="handleSaveToMistakeNotebook"
            >
              <ion-icon :icon="bookmarkOutline" style="font-size: 0.9rem;" />
              {{ t('learning.saveToMistakeBtn') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="ritme-subtitle" style="text-align: center; padding: 12px 0;">
      {{ t('learning.noUnlockedQuestions') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import {
  bookmarkOutline,
  bulbOutline,
  checkmarkCircleOutline,
  checkmarkOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeCircleOutline,
  closeOutline,
  documentTextOutline,
  locateOutline,
  refreshOutline,
  statsChartOutline,
  timeOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import { playAnswerFeedback } from '@/services/timer/soundFeedbackService'
import type { MistakeErrorCategory, PracticeQuestion } from '@/types'

const props = defineProps<{
  subtestFilter: string
  chapterFilter: string | null
  topicFilter: string | null
}>()

const emit = defineEmits<{
  (e: 'update:subtestFilter', value: string): void
  (e: 'clear-scope-filters'): void
}>()

const { t } = useI18n()
const learningStore = useLearningStore()
const userStore = useUserStore()

const currentQuestionIndex = ref(0)
const selectedOptionIndex = ref<number | null>(null)
const answerChecked = ref(false)
const savedMistakeForCurrent = ref(false)
const mistakeCategoryInput = ref<MistakeErrorCategory>('concept_not_understood')
const mistakePersonalNoteInput = ref('')

// Practice Session State
const sessionStartMs = ref(Date.now())
const sessionRecords = ref<
  Record<string, { selectedIndex: number; isCorrect: boolean }>
>({})
const savedMistakeQuestionIds = ref<Set<string>>(new Set())
const sessionSummary = ref<{
  totalQuestions: number
  attemptedCount: number
  correctCount: number
  incorrectCount: number
  accuracyPercent: number
  timeSpentSeconds: number
  weakTopicTitles: string[]
  rows: Array<{
    question: PracticeQuestion
    selectedIndex: number | null
    isCorrect: boolean
  }>
} | null>(null)

const errorCategories: MistakeErrorCategory[] = [
  'concept_not_understood',
  'misread_question',
  'calculation_error',
  'logic_error',
  'careless_mistake',
  'time_pressure',
  'unknown',
]

const filteredQuestions = computed(() => {
  const bySubAndChap = learningStore.getQuestionsBySubtest(
    props.chapterFilter || props.topicFilter ? 'all' : props.subtestFilter,
    props.chapterFilter || undefined
  )
  if (props.topicFilter) {
    const byTopic = bySubAndChap.filter((q) => q.topicId === props.topicFilter)
    if (byTopic.length > 0) return byTopic
    const topicObj = learningStore.getTopicById(props.topicFilter)
    if (topicObj) {
      return learningStore.getQuestionsBySubtest(topicObj.subtestId)
    }
  }
  return bySubAndChap
})

const activeScopeLabel = computed(() => {
  if (props.topicFilter) {
    const topicObj = learningStore.getTopicById(props.topicFilter)
    return t('learning.practiceScopeTopic', {
      title: topicObj?.title || props.topicFilter,
    })
  }
  if (props.chapterFilter) {
    const chap = learningStore.chapters.find((c) => c.id === props.chapterFilter)
    const title = chap
      ? userStore.settings.language === 'id'
        ? chap.titleId
        : chap.titleEn
      : props.chapterFilter
    return t('learning.practiceScopeChapter', { title })
  }
  return ''
})

const currentQuestion = computed<PracticeQuestion | null>(
  () => filteredQuestions.value[currentQuestionIndex.value] || null
)

const currentTopicTitle = computed(() => {
  if (!currentQuestion.value) return ''
  return learningStore.getTopicById(currentQuestion.value.topicId)?.title || ''
})

const currentQuestionOptions = computed(() => {
  if (!currentQuestion.value) return []
  return userStore.settings.language === 'id'
    ? currentQuestion.value.optionsId
    : currentQuestion.value.optionsEn
})

watch(
  () => [props.subtestFilter, props.chapterFilter, props.topicFilter],
  () => {
    resetFullSession()
  }
)

function loadExistingQuestionRecord(): void {
  const q = currentQuestion.value
  if (!q) {
    selectedOptionIndex.value = null
    answerChecked.value = false
    savedMistakeForCurrent.value = false
    return
  }
  const existing = sessionRecords.value[q.id]
  if (existing) {
    selectedOptionIndex.value = existing.selectedIndex
    answerChecked.value = true
  } else {
    selectedOptionIndex.value = null
    answerChecked.value = false
  }
  savedMistakeForCurrent.value = savedMistakeQuestionIds.value.has(q.id)
  mistakePersonalNoteInput.value = ''
}

function resetFullSession(): void {
  currentQuestionIndex.value = 0
  sessionStartMs.value = Date.now()
  sessionRecords.value = {}
  savedMistakeQuestionIds.value = new Set()
  sessionSummary.value = null
  loadExistingQuestionRecord()
}

function selectSubtest(subtestId: string): void {
  emit('clear-scope-filters')
  emit('update:subtestFilter', subtestId)
}

function selectOption(idx: number): void {
  if (answerChecked.value) return
  selectedOptionIndex.value = idx
}

function optionButtonStyle(idx: number): Record<string, string> {
  if (!answerChecked.value) {
    return {
      background:
        selectedOptionIndex.value === idx
          ? 'rgba(139, 124, 255, 0.2)'
          : 'var(--ritme-bg-elevated)',
      border:
        selectedOptionIndex.value === idx
          ? '1px solid var(--ritme-accent-primary)'
          : '1px solid var(--ritme-border-line)',
    }
  }
  const isCorrectOption = idx === currentQuestion.value?.correctIndex
  const isSelected = idx === selectedOptionIndex.value
  if (isCorrectOption) {
    return {
      background: 'rgba(89, 203, 232, 0.18)',
      border: '1px solid var(--ritme-accent-secondary)',
    }
  }
  if (isSelected && !isCorrectOption) {
    return {
      background: 'rgba(255, 107, 122, 0.16)',
      border: '1px solid var(--ritme-danger)',
    }
  }
  return {
    background: 'var(--ritme-bg-elevated)',
    border: '1px solid var(--ritme-border-line)',
    opacity: '0.7',
  }
}

async function handleCheckAnswer(): Promise<void> {
  if (!currentQuestion.value || selectedOptionIndex.value === null) return
  const res = await learningStore.submitQuestionAttempt({
    questionId: currentQuestion.value.id,
    selectedIndex: selectedOptionIndex.value,
  })
  sessionRecords.value[currentQuestion.value.id] = {
    selectedIndex: selectedOptionIndex.value,
    isCorrect: res.isCorrect,
  }
  playAnswerFeedback(res.isCorrect)
  answerChecked.value = true
}

function prevQuestion(): void {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    loadExistingQuestionRecord()
  }
}

function nextQuestion(): void {
  if (currentQuestionIndex.value < filteredQuestions.value.length - 1) {
    currentQuestionIndex.value++
    loadExistingQuestionRecord()
  }
}

function jumpToQuestion(idx: number): void {
  if (idx >= 0 && idx < filteredQuestions.value.length) {
    currentQuestionIndex.value = idx
    loadExistingQuestionRecord()
  }
}

function stepChipStyle(qId: string, idx: number): Record<string, string> {
  const isCurrent = idx === currentQuestionIndex.value
  const rec = sessionRecords.value[qId]
  if (rec) {
    return {
      borderColor: rec.isCorrect
        ? 'var(--ritme-accent-secondary)'
        : 'var(--ritme-danger)',
      background: rec.isCorrect
        ? 'rgba(89, 203, 232, 0.16)'
        : 'rgba(255, 114, 133, 0.16)',
      color: rec.isCorrect
        ? 'var(--ritme-accent-secondary)'
        : 'var(--ritme-danger)',
      boxShadow: isCurrent ? '0 0 0 2px var(--ritme-accent-primary)' : 'none',
    }
  }
  if (isCurrent) {
    return {
      borderColor: 'var(--ritme-accent-primary)',
      background: 'rgba(139, 124, 255, 0.2)',
      color: 'var(--ritme-accent-primary)',
    }
  }
  return {}
}

function finishPracticeSession(): void {
  const qs = filteredQuestions.value
  let attemptedCount = 0
  let correctCount = 0
  const weakTopicTitleSet = new Set<string>()

  const rows = qs.map((q) => {
    const rec = sessionRecords.value[q.id]
    if (rec) {
      attemptedCount++
      if (rec.isCorrect) {
        correctCount++
      } else {
        const title = learningStore.getTopicById(q.topicId)?.title
        if (title) weakTopicTitleSet.add(title)
      }
      return {
        question: q,
        selectedIndex: rec.selectedIndex,
        isCorrect: rec.isCorrect,
      }
    }
    return {
      question: q,
      selectedIndex: null,
      isCorrect: false,
    }
  })

  const incorrectCount = Math.max(0, attemptedCount - correctCount)
  // PRD 3.0 Section 9.5 formula: Correct / Attempted * 100%
  const accuracyPercent =
    attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0

  sessionSummary.value = {
    totalQuestions: qs.length,
    attemptedCount,
    correctCount,
    incorrectCount,
    accuracyPercent,
    timeSpentSeconds: Math.max(
      1,
      Math.round((Date.now() - sessionStartMs.value) / 1000)
    ),
    weakTopicTitles: Array.from(weakTopicTitleSet),
    rows,
  }
}

async function handleSaveToMistakeNotebook(): Promise<void> {
  if (!currentQuestion.value || selectedOptionIndex.value === null) return
  const opts = currentQuestionOptions.value
  const userAns = opts[selectedOptionIndex.value] || '-'
  const correctAns = opts[currentQuestion.value.correctIndex] || '-'
  const qText = resolveQuestionText(currentQuestion.value)
  const expl = resolveExplanationText(currentQuestion.value)

  await learningStore.saveMistakeNote({
    questionId: currentQuestion.value.id,
    subtestId: currentQuestion.value.subtestId,
    topicId: currentQuestion.value.topicId,
    questionPreview: qText.slice(0, 140) + (qText.length > 140 ? '...' : ''),
    userAnswer: userAns,
    correctAnswer: correctAns,
    explanation: expl,
    errorCategory: mistakeCategoryInput.value,
    personalNote: mistakePersonalNoteInput.value,
  })
  savedMistakeQuestionIds.value.add(currentQuestion.value.id)
  savedMistakeForCurrent.value = true
}

function resolveQuestionText(q: PracticeQuestion): string {
  return userStore.settings.language === 'id'
    ? q.questionIdText
    : q.questionEnText
}

function resolveExplanationText(q: PracticeQuestion): string {
  return userStore.settings.language === 'id'
    ? q.explanationId
    : q.explanationEn
}

function resolveSubtestCode(subtestId: string): string {
  return learningStore.getSubtestById(subtestId)?.code || subtestId
}
</script>
