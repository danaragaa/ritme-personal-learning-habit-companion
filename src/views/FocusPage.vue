<template>
  <ion-page>
    <ion-header v-if="focusStore.timerStatus === 'idle'" class="ritme-floating-header">
      <ion-toolbar>
        <ion-title>
          {{ t('focus.zen.pageTitle') }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            class="ritme-appbar-action-btn"
            :aria-label="t('focus.zen.historyBtn')"
            @click="showHistoryModal = true"
          >
            <span class="ritme-appbar-action-pill">
              <ion-icon :icon="timeOutline" aria-hidden="true" />
              <span>{{ t('focus.zen.historyBtn') }}</span>
            </span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-page-container">
        <!-- 2. ZEN FOCUS MODE (Shown exclusively when running or paused) -->
        <ZenFocusView
          v-if="focusStore.timerStatus !== 'idle'"
          :timer-status="focusStore.timerStatus"
          :focus-mode="focusStore.focusMode"
          :pomodoro-phase="focusStore.pomodoroPhase"
          :pomodoro-cycle-count="focusStore.pomodoroCycleCount"
          :is-break-phase="focusStore.isBreakPhase"
          :topic-title="activeZenTopicTitle"
          :subtest-code="activeZenSubtestCode"
          :formatted-remaining-time="focusStore.formattedRemainingTime"
          :remaining-seconds="focusStore.remainingSeconds"
          :progress-percent="focusStore.timerProgressPercent"
          @pause="handlePause"
          @resume="handleResume"
          @finish="handleFinish"
          @cancel="handleCancel"
        />

        <!-- 3. SESSION COMPLETION SCREEN (Concise single-screen summary) -->
        <FocusCompletionCard
          v-else-if="focusStore.lastCompletionSummary"
          :summary="focusStore.lastCompletionSummary"
          :resolved-topic-label="
            resolveTopicLabelForSummary(focusStore.lastCompletionSummary.topicLabel)
          "
          :show-start-break-action="
            !focusStore.lastCompletionSummary.isBreak &&
            focusStore.focusMode === 'pomodoro' &&
            focusStore.isBreakPhase
          "
          @done="handleDismissCompletion"
          @start-break="handleStartQueuedBreak"
        />

        <!-- 1. QUICK FOCUS SETUP (Default Idle State) -->
        <div v-else>
          <div class="ritme-page-intro">
            <p class="ritme-page-intro-desc">
              {{ t('focus.zen.setupSubtitle') }}
            </p>
            <span class="ritme-badge ritme-glass-chip">
              {{
                t('focus.zen.historyCountBadge', {
                  count: focusStore.completedSessions.length,
                })
              }}
            </span>
          </div>

          <!-- Main Unified Quick Setup Card -->
          <section class="ritme-card">
            <!-- C. Focus Mode Switcher (Free Focus / Pomodoro) -->
            <div class="ritme-mode-segment" role="tablist">
              <button
                type="button"
                role="tab"
                :aria-selected="focusStore.focusMode === 'free'"
                class="ritme-mode-pill"
                :class="{ 'is-active': focusStore.focusMode === 'free' }"
                @click="selectMode('free')"
              >
                <ion-icon :icon="stopwatchOutline" style="font-size: 0.92rem;" />
                <span>{{ t('focus.zen.modeFreeLabel') }}</span>
              </button>

              <button
                type="button"
                role="tab"
                :aria-selected="focusStore.focusMode === 'pomodoro'"
                class="ritme-mode-pill"
                :class="{ 'is-active': focusStore.focusMode === 'pomodoro' }"
                @click="selectMode('pomodoro')"
              >
                <ion-icon :icon="timerOutline" style="font-size: 0.92rem;" />
                <span>{{ t('focus.zen.modePomodoroLabel') }}</span>
              </button>
            </div>

            <!-- Compact Collapsible Pomodoro Bar (Only when Pomodoro mode selected) -->
            <div v-if="focusStore.focusMode === 'pomodoro'" class="ritme-pomo-strip">
              <div
                style="display: flex; justify-content: space-between; align-items: center; gap: 8px;"
              >
                <span class="ritme-subtitle" style="font-size: 0.74rem; font-weight: 600;">
                  {{
                    t('focus.zen.pomodoroSummary', {
                      focus: focusStore.pomodoroFocusMinutes,
                      short: focusStore.pomodoroShortBreakMinutes,
                      cycle: focusStore.pomodoroCycleCount,
                    })
                  }}
                </span>
                <button
                  type="button"
                  class="ritme-glass-pill"
                  style="min-height: 30px; padding: 0 10px; font-size: 0.72rem;"
                  @click="showPomoConfig = !showPomoConfig"
                >
                  <ion-icon :icon="optionsOutline" style="font-size: 0.85rem;" />
                  {{ t('focus.zen.pomodoroConfigBtn') }}
                </button>
              </div>

              <!-- Break Queued Notice (Allows starting break or skipping back to focus) -->
              <div
                v-if="focusStore.isBreakPhase"
                style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--ritme-border-line);"
              >
                <span
                  style="font-size: 0.76rem; font-weight: 700; color: var(--ritme-text-primary);"
                >
                  {{
                    t('focus.zen.pomodoroBreakQueued', {
                      phase:
                        focusStore.pomodoroPhase === 'long_break'
                          ? t('focus.pomoLongBreak')
                          : t('focus.pomoShortBreak'),
                      minutes: focusStore.selectedDurationMinutes,
                    })
                  }}
                </span>
                <button
                  type="button"
                  class="ritme-glass-pill"
                  style="min-height: 30px; padding: 0 10px; font-size: 0.72rem;"
                  @click="focusStore.selectPomodoroPhase('focus')"
                >
                  {{ t('focus.zen.skipToFocusBtn') }}
                </button>
              </div>

              <!-- Optional On-Demand Pomodoro Settings (Hidden by default) -->
              <div
                v-if="showPomoConfig"
                style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--ritme-border-line);"
              >
                <div class="ritme-summary-grid-3" style="margin-bottom: 10px;">
                  <div>
                    <label class="ritme-field-label" for="pomo-focus-mins">
                      {{ t('focus.pomoFocusMinsLabel') }}
                    </label>
                    <input
                      id="pomo-focus-mins"
                      v-model.number="pomoFocusInput"
                      type="number"
                      min="5"
                      max="120"
                      class="ritme-input ritme-input-themed"
                      style="min-height: 38px; padding: 6px 8px; font-size: 0.82rem;"
                    />
                  </div>
                  <div>
                    <label class="ritme-field-label" for="pomo-short-mins">
                      {{ t('focus.pomoShortMinsLabel') }}
                    </label>
                    <input
                      id="pomo-short-mins"
                      v-model.number="pomoShortInput"
                      type="number"
                      min="1"
                      max="30"
                      class="ritme-input ritme-input-themed"
                      style="min-height: 38px; padding: 6px 8px; font-size: 0.82rem;"
                    />
                  </div>
                  <div>
                    <label class="ritme-field-label" for="pomo-long-mins">
                      {{ t('focus.pomoLongMinsLabel') }}
                    </label>
                    <input
                      id="pomo-long-mins"
                      v-model.number="pomoLongInput"
                      type="number"
                      min="5"
                      max="60"
                      class="ritme-input ritme-input-themed"
                      style="min-height: 38px; padding: 6px 8px; font-size: 0.82rem;"
                    />
                  </div>
                </div>

                <label
                  style="display: flex; align-items: center; gap: 8px; font-size: 0.76rem; color: var(--ritme-text-secondary); margin-bottom: 10px; cursor: pointer;"
                >
                  <input
                    type="checkbox"
                    :checked="focusStore.autoStartBreak"
                    style="accent-color: var(--ritme-text-primary);"
                    @change="onAutoBreakToggle"
                  />
                  <span>{{ t('focus.autoBreakLabel') }}</span>
                </label>

                <button
                  type="button"
                  class="ritme-glass-pill"
                  style="width: 100%; min-height: 36px;"
                  @click="savePomodoroDurations"
                >
                  {{ t('focus.savePomoBtn') }}
                </button>
              </div>
            </div>

            <!-- A. Topic Selection (From Learning Tracker, Optional / Free Focus Supported) -->
            <div v-if="!focusStore.isBreakPhase" style="margin-bottom: 14px;">
              <label class="ritme-field-label" for="focus-topic-selector">
                {{ t('focus.zen.topicFieldLabel') }}
              </label>
              <select
                id="focus-topic-selector"
                :value="selectedTrackerTopicId"
                class="ritme-input ritme-select-themed"
                @change="onTopicSelectionChange"
              >
                <option value="">
                  {{ t('focus.zen.freeFocusOption') }}
                </option>
                <option
                  v-for="topic in sortedTrackerTopics"
                  :key="topic.id"
                  :value="topic.id"
                >
                  [{{ resolveSubtestCode(topic.subtestId) }}]
                  {{ resolveTopicTitle(topic) }}
                </option>
              </select>
            </div>

            <!-- B. Duration Presets (15 / 25 / 45 / Custom; Default 25m) -->
            <div v-if="!focusStore.isBreakPhase" style="margin-bottom: 16px;">
              <div class="ritme-field-label">
                {{ t('focus.zen.durationFieldLabel') }}
              </div>
              <div class="ritme-duration-grid">
                <button
                  v-for="preset in DURATION_PRESETS"
                  :key="preset"
                  type="button"
                  class="ritme-duration-pill"
                  :class="{
                    'is-active':
                      !showCustomInput &&
                      focusStore.selectedDurationMinutes === preset,
                  }"
                  @click="selectDurationPreset(preset)"
                >
                  {{ t('focus.zen.presetShort', { minutes: preset }) }}
                </button>

                <button
                  type="button"
                  class="ritme-duration-pill"
                  :class="{ 'is-active': showCustomInput || isCustomActive }"
                  @click="openCustomDuration"
                >
                  {{
                    isCustomActive && !showCustomInput
                      ? t('focus.zen.presetShort', {
                          minutes: focusStore.selectedDurationMinutes,
                        })
                      : t('focus.zen.customPill')
                  }}
                </button>
              </div>

              <!-- Compact Inline Custom Duration Input -->
              <div v-if="showCustomInput" style="margin-top: 10px;">
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input
                    id="focus-custom-duration"
                    v-model="customMinutesText"
                    type="number"
                    min="1"
                    max="180"
                    inputmode="numeric"
                    :placeholder="t('focus.zen.customInputPlaceholder')"
                    class="ritme-input ritme-input-themed"
                    style="flex: 1;"
                    @input="validateAndSyncCustomDuration"
                  />
                  <button
                    type="button"
                    class="ritme-glass-pill"
                    style="min-height: 42px; padding: 0 14px;"
                    @click="applyCustomDuration"
                  >
                    {{ t('focus.applyCustom') }}
                  </button>
                </div>
                <div v-if="customDurationError" class="ritme-field-error">
                  {{ customDurationError }}
                </div>
              </div>
            </div>

            <!-- Clean Timer Preview + Single Primary Start CTA -->
            <div class="ritme-setup-preview">
              <div class="ritme-timer-display" style="font-size: 2.55rem; line-height: 1.1;">
                {{ focusStore.formattedRemainingTime }}
              </div>
            </div>

            <ion-button
              expand="block"
              class="ritme-focus-cta"
              style="margin: 0;"
              @click="handleStartSession"
            >
              <ion-icon slot="start" :icon="playOutline" />
              {{
                focusStore.isBreakPhase
                  ? t('focus.startBreakBtn')
                  : t('focus.startBtn')
              }}
            </ion-button>
          </section>

          <!-- D. Optional Collapsible Preparation Checklist (Hidden by default) -->
          <div style="margin-top: 4px;">
            <button
              type="button"
              class="ritme-prep-toggle"
              :aria-expanded="showPrepChecklist"
              @click="showPrepChecklist = !showPrepChecklist"
            >
              <span class="ritme-title-row" style="gap: 8px;">
                <ion-icon :icon="checkboxOutline" style="font-size: 0.96rem;" />
                <span>{{ t('focus.zen.prepOptionalToggle') }}</span>
              </span>
              <ion-icon
                :icon="showPrepChecklist ? chevronUpOutline : chevronDownOutline"
                style="font-size: 0.96rem;"
              />
            </button>

            <div v-if="showPrepChecklist" style="margin-top: 8px;">
              <PreparationChecklistCard />
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Session History Bottom Sheet Modal -->
      <FocusHistoryModal
        :is-open="showHistoryModal"
        :sessions="focusStore.completedSessions"
        :subtests="learningStore.sortedSubtests"
        :topics="learningStore.topics"
        :language="userStore.settings.language"
        @close="showHistoryModal = false"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import {
  checkboxOutline,
  chevronDownOutline,
  chevronUpOutline,
  optionsOutline,
  playOutline,
  stopwatchOutline,
  timeOutline,
  timerOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useFocusStore } from '@/stores/focusStore'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import {
  mapTopicStatusToUi,
  SEED_TOPIC_TITLES,
  sortLearningTopicsForTracker,
} from '@/services/learning/learningTrackerService'
import { triggerActionHaptic } from '@/services/timer/soundFeedbackService'
import ZenFocusView from '@/components/focus/ZenFocusView.vue'
import FocusCompletionCard from '@/components/focus/FocusCompletionCard.vue'
import FocusHistoryModal from '@/components/focus/FocusHistoryModal.vue'
import PreparationChecklistCard from '@/components/focus/PreparationChecklistCard.vue'
import type { FocusMode, LearningTopic } from '@/types'

const DURATION_PRESETS = [15, 25, 45] as const

const { t, te } = useI18n()
const focusStore = useFocusStore()
const learningStore = useLearningStore()
const userStore = useUserStore()

const showHistoryModal = ref(false)
const showPomoConfig = ref(false)
const showPrepChecklist = ref(false)
const showCustomInput = ref(false)
const customMinutesText = ref<string>(String(focusStore.selectedDurationMinutes))
const customDurationError = ref<string>('')
const userExplicitlySelectedTopic = ref(false)

const pomoFocusInput = ref<number>(focusStore.pomodoroFocusMinutes)
const pomoShortInput = ref<number>(focusStore.pomodoroShortBreakMinutes)
const pomoLongInput = ref<number>(focusStore.pomodoroLongBreakMinutes)

const sortedTrackerTopics = computed(() =>
  sortLearningTopicsForTracker(learningStore.topics)
)

const isCustomActive = computed(
  () =>
    !DURATION_PRESETS.includes(
      focusStore.selectedDurationMinutes as (typeof DURATION_PRESETS)[number]
    )
)

// Find matching LearningTopic for focusStore's prefilled/current topic
function findMatchedTrackerTopic(rawTopic: string, subjectId: string): LearningTopic | undefined {
  const clean = rawTopic.trim()
  if (!clean) return undefined
  return (
    learningStore.topics.find((item) => item.id === clean) ||
    learningStore.topics.find(
      (item) => item.subtestId === subjectId && item.title === clean
    ) ||
    learningStore.topics.find((item) => item.title === clean)
  )
}

const selectedTrackerTopicId = computed(() => {
  const matched = findMatchedTrackerTopic(
    focusStore.selectedTopicId,
    focusStore.selectedSubjectId
  )
  return matched ? matched.id : ''
})

// Smart initial topic selection:
// 1. Respect Home Today's Learning Plan prefill (already set on focusStore)
// 2. Otherwise default to the currently active 'learning' topic from Learning Tracker
// 3. Otherwise keep Free Focus ('') without forcing a topic
watch(
  () => [learningStore.isLoaded, focusStore.isLoaded, learningStore.topics.length] as const,
  ([learningReady, focusReady]) => {
    if (!learningReady || !focusReady) return
    if (focusStore.timerStatus !== 'idle') return
    if (userExplicitlySelectedTopic.value) return
    if (focusStore.selectedTopicId.trim() || focusStore.customTopicTitle.trim()) return

    const activeLearningTopic = sortedTrackerTopics.value.find(
      (item) => mapTopicStatusToUi(item.status) === 'learning'
    )
    if (activeLearningTopic) {
      focusStore.selectedSubjectId = activeLearningTopic.subtestId
      focusStore.selectedTopicId = activeLearningTopic.title
      focusStore.customTopicTitle = ''
    }
  },
  { immediate: true }
)

watch(
  () => focusStore.selectedDurationMinutes,
  (val) => {
    if (!showCustomInput.value) {
      customMinutesText.value = String(val)
    }
  }
)

watch(
  () => [
    focusStore.pomodoroFocusMinutes,
    focusStore.pomodoroShortBreakMinutes,
    focusStore.pomodoroLongBreakMinutes,
  ],
  ([f, s, l]) => {
    pomoFocusInput.value = f
    pomoShortInput.value = s
    pomoLongInput.value = l
  }
)

function resolveSubtestCode(subtestId: string): string {
  if (!subtestId) return ''
  return learningStore.getSubtestById(subtestId)?.code || ''
}

function resolveTopicTitle(topic: LearningTopic): string {
  const seedTitle = SEED_TOPIC_TITLES[topic.id]
  const key = `defaultTopics.${topic.id}`
  if (seedTitle && topic.title === seedTitle && te(key)) {
    return t(key)
  }
  return topic.title
}

function resolveTopicLabelForSummary(rawLabel: string): string {
  const clean = (rawLabel || '').trim()
  if (!clean) return t('focus.zen.freeFocusTitle')
  const matched = findMatchedTrackerTopic(clean, focusStore.selectedSubjectId)
  if (matched) return resolveTopicTitle(matched)
  for (const [id, seedTitle] of Object.entries(SEED_TOPIC_TITLES)) {
    if (clean === id || clean === seedTitle) {
      const key = `defaultTopics.${id}`
      if (te(key)) return t(key)
    }
  }
  return clean
}

const activeZenTopicTitle = computed(() => {
  const raw =
    focusStore.timerState?.customTopicTitle?.trim() ||
    focusStore.timerState?.topicId?.trim() ||
    focusStore.customTopicTitle.trim() ||
    focusStore.selectedTopicId.trim()
  if (!raw) return ''
  return resolveTopicLabelForSummary(raw)
})

const activeZenSubtestCode = computed(() => {
  const subId =
    focusStore.timerState?.subjectId ?? focusStore.selectedSubjectId
  return resolveSubtestCode(subId)
})

function onTopicSelectionChange(event: Event): void {
  const select = event.target as HTMLSelectElement
  const topicId = select.value
  userExplicitlySelectedTopic.value = true

  if (!topicId) {
    focusStore.selectedSubjectId = ''
    focusStore.selectedTopicId = ''
    focusStore.customTopicTitle = ''
    return
  }

  const matched = learningStore.getTopicById(topicId)
  if (matched) {
    focusStore.selectedSubjectId = matched.subtestId
    focusStore.selectedTopicId = matched.title
    focusStore.customTopicTitle = ''
  }
}

function selectMode(mode: FocusMode): void {
  if (focusStore.focusMode === mode) return
  triggerActionHaptic('light')
  showCustomInput.value = false
  customDurationError.value = ''
  focusStore.setFocusMode(mode)
}

function selectDurationPreset(minutes: number): void {
  triggerActionHaptic('light')
  showCustomInput.value = false
  customDurationError.value = ''
  customMinutesText.value = String(minutes)
  focusStore.setDurationMinutes(minutes)
}

function openCustomDuration(): void {
  triggerActionHaptic('light')
  customMinutesText.value = String(focusStore.selectedDurationMinutes)
  customDurationError.value = ''
  showCustomInput.value = !showCustomInput.value
}

function parseCustomDuration(): number | null {
  const raw = String(customMinutesText.value).trim()
  if (!raw) return null
  const num = Number(raw)
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1 || num > 180) {
    return null
  }
  return num
}

function validateAndSyncCustomDuration(): void {
  const parsed = parseCustomDuration()
  if (parsed === null) {
    customDurationError.value = t('focus.zen.customInvalidError')
    return
  }
  customDurationError.value = ''
  focusStore.setDurationMinutes(parsed)
}

function applyCustomDuration(): void {
  const parsed = parseCustomDuration()
  if (parsed === null) {
    customDurationError.value = t('focus.zen.customInvalidError')
    return
  }
  customDurationError.value = ''
  focusStore.setDurationMinutes(parsed)
  showCustomInput.value = false
}

function onAutoBreakToggle(event: Event): void {
  const input = event.target as HTMLInputElement
  focusStore.setAutoStartBreak(Boolean(input.checked))
}

function savePomodoroDurations(): void {
  focusStore.updatePomodoroDurations({
    focusMinutes: pomoFocusInput.value,
    shortBreakMinutes: pomoShortInput.value,
    longBreakMinutes: pomoLongInput.value,
  })
  showPomoConfig.value = false
}

async function handleStartSession(): Promise<void> {
  if (showCustomInput.value) {
    const parsed = parseCustomDuration()
    if (parsed === null) {
      customDurationError.value = t('focus.zen.customInvalidError')
      return
    }
    focusStore.setDurationMinutes(parsed)
    showCustomInput.value = false
  }
  customDurationError.value = ''
  await focusStore.startSession()
}

async function handlePause(): Promise<void> {
  triggerActionHaptic('light')
  await focusStore.pauseSession()
}

async function handleResume(): Promise<void> {
  triggerActionHaptic('light')
  await focusStore.resumeSession()
}

async function handleFinish(): Promise<void> {
  await focusStore.finishSession()
}

async function handleCancel(): Promise<void> {
  triggerActionHaptic('light')
  await focusStore.cancelSession()
}

function handleDismissCompletion(): void {
  triggerActionHaptic('light')
  focusStore.clearCompletionSummary()
}

async function handleStartQueuedBreak(): Promise<void> {
  focusStore.clearCompletionSummary()
  await focusStore.startSession()
}
</script>

<style scoped>
.ritme-mode-segment {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  margin-bottom: 14px;
  border-radius: var(--ritme-radius-pill);
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-glass-border);
}

.ritme-mode-pill {
  min-height: 38px;
  padding: 0 10px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--ritme-text-secondary);
  font-family: var(--ion-font-family);
  font-size: 0.78rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: background-color var(--ritme-motion-fast), border-color var(--ritme-motion-fast), color var(--ritme-motion-fast), transform var(--ritme-motion-fast);
}

.ritme-mode-pill.is-active {
  background: var(--ritme-state-selected-bg);
  border-color: var(--ritme-state-selected-border);
  color: var(--ritme-text-primary);
  font-weight: 700;
}

.ritme-mode-pill:active {
  transform: scale(0.97);
}

.ritme-pomo-strip {
  padding: 10px 12px;
  margin-bottom: 14px;
  border-radius: var(--ritme-radius-md);
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
}

.ritme-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--ritme-text-secondary);
}

.ritme-field-error {
  margin-top: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ritme-danger);
}

.ritme-duration-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.ritme-duration-pill {
  min-height: 40px;
  padding: 0 6px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid var(--ritme-input-border);
  background: var(--ritme-surface-subtle);
  color: var(--ritme-text-secondary);
  font-family: var(--ion-font-family);
  font-size: 0.76rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--ritme-motion-fast), border-color var(--ritme-motion-fast), color var(--ritme-motion-fast), transform var(--ritme-motion-fast);
}

.ritme-duration-pill.is-active {
  background: var(--ritme-btn-primary-bg);
  border-color: var(--ritme-btn-primary-border);
  color: var(--ritme-btn-primary-text);
  font-weight: 700;
}

.ritme-duration-pill:active {
  transform: scale(0.96);
}

.ritme-setup-preview {
  text-align: center;
  padding: 10px 0 14px;
}

.ritme-prep-toggle {
  width: 100%;
  min-height: 44px;
  padding: 0 14px;
  border-radius: var(--ritme-radius-md);
  background: var(--ritme-glass-surface);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
  color: var(--ritme-text-secondary);
  font-family: var(--ion-font-family);
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.ritme-select-themed option {
  background-color: var(--ritme-bg-secondary);
  color: var(--ritme-text-primary);
}
</style>
