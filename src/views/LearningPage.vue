<template>
  <ion-page>
    <ion-header class="ritme-floating-header">
      <ion-toolbar>
        <ion-title>{{ t('learning.tracker.pageTitle') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-page-container">
        <!-- A. Supporting Subtitle & Progress Chip (No Duplicate Page H1) -->
        <div class="ritme-page-intro">
          <p class="ritme-page-intro-desc">
            {{ t('learning.tracker.pageDesc') }}
          </p>

          <span
            class="ritme-badge ritme-glass-chip"
            style="padding: 6px 12px;"
          >
            {{
              t('learning.tracker.progressBadge', {
                completed: overallCounts.completed,
                total: overallCounts.total,
              })
            }}
          </span>
        </div>

        <!-- XP / URL Feedback Strip (Shown only on completion XP or link error/copy) -->
        <div
          v-if="xpBannerMessage"
          class="ritme-glass-strip"
          role="status"
          aria-live="polite"
        >
          <div
            class="ritme-title-row"
            style="font-size: 0.8rem; font-weight: 700; color: var(--ritme-text-primary);"
          >
            <ion-icon :icon="flashOutline" style="font-size: 0.98rem; flex-shrink: 0;" />
            <span>{{ xpBannerMessage }}</span>
          </div>
        </div>

        <div
          v-if="urlFeedbackMessage"
          class="ritme-glass-strip"
          role="status"
          aria-live="polite"
        >
          <div
            class="ritme-title-row"
            style="min-width: 0; flex: 1; font-size: 0.78rem; font-weight: 600; color: var(--ritme-text-primary);"
          >
            <ion-icon :icon="alertCircleOutline" style="font-size: 0.98rem; flex-shrink: 0;" />
            <span>{{ urlFeedbackMessage }}</span>
          </div>
          <button
            v-if="failedExternalUrl"
            type="button"
            class="ritme-glass-pill"
            @click="copyFailedUrl"
          >
            <ion-icon :icon="copyOutline" style="font-size: 0.86rem;" />
            {{ t('learning.tracker.copyUrlBtn') }}
          </button>
        </div>

        <!-- B. Currently Learning (Max 1 Active Topic) -->
        <section class="ritme-card">
          <div
            class="ritme-section-header"
            style="align-items: center; gap: 8px; margin-bottom: 10px;"
          >
            <div class="ritme-title-row" style="gap: 6px; min-width: 0;">
              <ion-icon
                :icon="bookOutline"
                style="font-size: 1rem; color: var(--ritme-text-primary); flex-shrink: 0;"
              />
              <h2
                class="ritme-section-title"
                style="font-size: 0.94rem; white-space: nowrap;"
              >
                {{ t('learning.tracker.currentlyLearningHeading') }}
              </h2>
            </div>

            <span
              v-if="currentlyLearningTopic && currentlyLearningTopic.targetDurationMinutes"
              class="ritme-subtitle"
              style="font-size: 0.76rem; font-weight: 600; white-space: nowrap;"
            >
              {{
                t('learning.tracker.durationTag', {
                  minutes: currentlyLearningTopic.targetDurationMinutes,
                })
              }}
            </span>
          </div>

          <div v-if="currentlyLearningTopic">
            <div style="margin-bottom: 8px;">
              <span
                class="ritme-badge"
                style="white-space: normal; text-align: left; max-width: 100%;"
              >
                {{ resolveSubtestLabel(currentlyLearningTopic.subtestId) }}
              </span>
            </div>

            <div
              style="font-size: 1.04rem; font-weight: 800; line-height: 1.32; color: var(--ritme-text-primary); margin-bottom: 6px;"
            >
              {{ resolveTopicTitle(currentlyLearningTopic) }}
            </div>

            <div
              v-if="currentlyLearningTopic.sourceName"
              class="ritme-subtitle"
              style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 0.78rem; margin-bottom: 12px;"
            >
              <ion-icon :icon="linkOutline" style="font-size: 0.88rem; flex-shrink: 0;" />
              <span>{{ currentlyLearningTopic.sourceName }}</span>
            </div>

            <div v-if="hasValidUrl(currentlyLearningTopic.sourceUrl)">
              <ion-button
                expand="block"
                class="ritme-focus-cta"
                style="margin: 0;"
                @click="handleOpenSource(currentlyLearningTopic.sourceUrl)"
              >
                <ion-icon slot="start" :icon="openOutline" />
                {{ t('learning.tracker.openSourceBtn') }}
              </ion-button>
            </div>

            <div
              v-else
              style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 4px;"
            >
              <span class="ritme-subtitle" style="font-size: 0.78rem;">
                {{ t('learning.tracker.noSourceHint') }}
              </span>
              <button
                type="button"
                class="ritme-glass-pill"
                @click="openEditTopicForm(currentlyLearningTopic)"
              >
                {{ t('learning.tracker.addSourceQuickBtn') }}
              </button>
            </div>
          </div>

          <!-- Empty State when no topic is Currently Learning -->
          <div v-else>
            <p class="ritme-subtitle" style="margin: 0 0 12px; font-size: 0.82rem;">
              {{ t('learning.tracker.currentlyLearningEmpty') }}
            </p>
            <button
              type="button"
              class="ritme-glass-pill"
              @click="openNewTopicForm"
            >
              <ion-icon :icon="addOutline" style="font-size: 0.95rem;" />
              {{ t('learning.tracker.startAddingCta') }}
            </button>
          </div>
        </section>

        <!-- C. Single UTBK Subtest Selector (All 7 Categories + Count) -->
        <section class="ritme-card">
          <div
            class="ritme-section-header"
            style="align-items: center; margin-bottom: 8px;"
          >
            <label
              for="learning-subtest-selector"
              class="ritme-section-title"
              style="font-size: 0.92rem;"
            >
              {{ t('learning.tracker.subtestSelectorLabel') }}
            </label>
            <span class="ritme-badge">
              {{
                t('learning.tracker.subtestTopicCount', {
                  count: displayedTopics.length,
                })
              }}
            </span>
          </div>

          <select
            id="learning-subtest-selector"
            v-model="selectedSubtestId"
            class="ritme-input ritme-select-themed"
          >
            <option
              v-for="subtest in learningStore.sortedSubtests"
              :key="subtest.id"
              :value="subtest.id"
            >
              {{ subtest.code }} —
              {{
                userStore.settings.language === 'id'
                  ? subtest.nameId
                  : subtest.nameEn
              }}
              ({{ getSubtestTopicCount(subtest.id) }})
            </option>
          </select>
        </section>

        <!-- D & E. Filtered Topic List (3 Statuses Only) + Add Topic Action -->
        <section class="ritme-card">
          <div
            class="ritme-section-header"
            style="align-items: center; flex-wrap: nowrap; gap: 8px; margin-bottom: 12px;"
          >
            <div style="min-width: 0; flex: 1;">
              <h2 class="ritme-section-title" style="font-size: 0.95rem;">
                {{ t('learning.tracker.topicListHeading') }}
                <span
                  v-if="activeSubtest"
                  style="color: var(--ritme-text-secondary); font-weight: 600;"
                >
                  ({{ activeSubtest.code }})
                </span>
              </h2>
            </div>

            <button
              type="button"
              class="ritme-add-topic-cta"
              @click="openNewTopicForm"
            >
              {{ t('learning.addTopicBtn') }}
            </button>
          </div>

          <!-- Empty State for Selected Subtest -->
          <div
            v-if="displayedTopics.length === 0"
            class="ritme-list-item"
            style="display: block; text-align: center; padding: 18px 14px;"
          >
            <p class="ritme-subtitle" style="margin: 0 0 12px; font-size: 0.84rem;">
              {{ t('learning.tracker.emptySubtestList') }}
            </p>
            <button
              type="button"
              class="ritme-glass-pill"
              @click="openNewTopicForm"
            >
              <ion-icon :icon="addOutline" style="font-size: 0.95rem;" />
              {{ t('learning.addTopicBtn') }}
            </button>
          </div>

          <!-- Logically Sorted Topic List -->
          <div v-else>
            <div
              v-for="topic in displayedTopics"
              :key="topic.id"
              class="ritme-list-item"
              :class="{ 'is-completed': isUiCompleted(topic.status) }"
              style="display: block; padding: 12px;"
            >
              <!-- Row 1: Status Pill + Edit Action (Prevents crushing Title on 360px) -->
              <div
                style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;"
              >
                <span
                  class="ritme-badge"
                  :style="uiStatusBadgeStyle(topic.status)"
                >
                  <ion-icon
                    :icon="uiStatusIcon(topic.status)"
                    style="font-size: 0.78rem;"
                  />
                  {{
                    t(
                      `learning.tracker.statuses.${mapTopicStatusToUi(topic.status)}`
                    )
                  }}
                </span>

                <button
                  type="button"
                  class="ritme-icon-btn"
                  style="min-width: 36px; min-height: 36px;"
                  :aria-label="t('learning.tracker.editAria')"
                  @click="openEditTopicForm(topic)"
                >
                  <ion-icon :icon="createOutline" />
                </button>
              </div>

              <!-- Row 2: Full-Width Topic Title & Source/Duration Metadata -->
              <div
                style="font-weight: 700; font-size: 0.94rem; line-height: 1.35; color: var(--ritme-text-primary); word-break: normal; overflow-wrap: break-word;"
              >
                {{ resolveTopicTitle(topic) }}
              </div>

              <div
                v-if="topic.sourceName || topic.targetDurationMinutes"
                class="ritme-subtitle"
                style="display: flex; align-items: center; gap: 4px 10px; flex-wrap: wrap; font-size: 0.76rem; margin-top: 5px;"
              >
                <span
                  v-if="topic.sourceName"
                  style="display: inline-flex; align-items: center; gap: 5px;"
                >
                  <ion-icon :icon="linkOutline" style="font-size: 0.84rem; flex-shrink: 0;" />
                  <span>{{ topic.sourceName }}</span>
                </span>
                <span v-if="topic.targetDurationMinutes">
                  {{ topic.sourceName ? '• ' : ''
                  }}{{
                    t('learning.tracker.durationTag', {
                      minutes: topic.targetDurationMinutes,
                    })
                  }}
                </span>
              </div>

              <!-- Row 3: Optional Notes & Completion Date -->
              <div
                v-if="topic.notes || (isUiCompleted(topic.status) && topic.completedAt)"
                class="ritme-subtitle"
                style="font-size: 0.76rem; margin-top: 6px; line-height: 1.4;"
              >
                <div v-if="topic.notes">{{ topic.notes }}</div>
                <div
                  v-if="isUiCompleted(topic.status) && topic.completedAt"
                  style="font-size: 0.72rem; margin-top: 3px; color: var(--ritme-text-muted);"
                >
                  {{
                    t('learning.tracker.completedDateLabel', {
                      date: formatShortDate(topic.completedAt),
                    })
                  }}
                </div>
              </div>

              <!-- Row 4: Quick Status Change & External Source Action -->
              <div
                style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--ritme-border-line);"
              >
                <select
                  :value="mapTopicStatusToUi(topic.status)"
                  :aria-label="t('learning.tracker.statusSelectAria')"
                  class="ritme-status-select ritme-select-themed"
                  @change="onTopicUiStatusChange(topic.id, $event)"
                >
                  <option value="not_started">
                    {{ t('learning.tracker.statuses.not_started') }}
                  </option>
                  <option value="learning">
                    {{ t('learning.tracker.statuses.learning') }}
                  </option>
                  <option value="completed">
                    {{ t('learning.tracker.statuses.completed') }}
                  </option>
                </select>

                <button
                  v-if="hasValidUrl(topic.sourceUrl)"
                  type="button"
                  class="ritme-glass-pill"
                  @click="handleOpenSource(topic.sourceUrl)"
                >
                  <ion-icon :icon="openOutline" style="font-size: 0.86rem;" />
                  {{ t('learning.tracker.openSourceBtn') }}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- E. Add / Edit Topic Bottom Sheet Modal -->
      <TopicFormModal
        :is-open="showTopicModal"
        :editing-topic="editingTopic"
        :default-subtest-id="selectedSubtestId"
        :subtests="learningStore.sortedSubtests"
        :language="userStore.settings.language"
        @close="closeTopicModal"
        @save="handleSaveTopicModal"
        @delete="handleDeleteTopicModal"
      />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import {
  addOutline,
  alertCircleOutline,
  bookOutline,
  checkmarkCircleOutline,
  copyOutline,
  createOutline,
  ellipseOutline,
  flashOutline,
  linkOutline,
  openOutline,
  playOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import {
  mapTopicStatusToUi,
  mapUiStatusToStorage,
  openExternalLearningUrl,
  SEED_TOPIC_TITLES,
  sortLearningTopicsForTracker,
  validateExternalUrl,
  type LearningUiStatus,
} from '@/services/learning/learningTrackerService'
import { triggerActionHaptic } from '@/services/timer/soundFeedbackService'
import TopicFormModal, {
  type TopicFormSubmitPayload,
} from '@/components/learning/TopicFormModal.vue'
import type { LearningTopic, TopicStatus } from '@/types'

const { t, te } = useI18n()
const route = useRoute()
const learningStore = useLearningStore()
const userStore = useUserStore()

const selectedSubtestId = ref<string>('subtest_pu')
const showTopicModal = ref(false)
const editingTopic = ref<LearningTopic | null>(null)
const xpBannerMessage = ref('')
const urlFeedbackMessage = ref('')
const failedExternalUrl = ref('')

watch(
  () => route.query.subtestId,
  (subtestParam) => {
    if (
      typeof subtestParam === 'string' &&
      learningStore.sortedSubtests.some((s) => s.id === subtestParam)
    ) {
      selectedSubtestId.value = subtestParam
    }
  },
  { immediate: true }
)

watch(
  () => learningStore.sortedSubtests,
  (list) => {
    if (
      list.length > 0 &&
      !list.some((subtest) => subtest.id === selectedSubtestId.value)
    ) {
      selectedSubtestId.value = list[0].id
    }
  },
  { immediate: true }
)

const overallCounts = computed(() => {
  const all = learningStore.topics
  const completed = all.filter(
    (topic) => mapTopicStatusToUi(topic.status) === 'completed'
  ).length
  return {
    completed,
    total: all.length,
  }
})

const currentlyLearningTopic = computed<LearningTopic | null>(() => {
  const activeList = learningStore.topics
    .filter((topic) => mapTopicStatusToUi(topic.status) === 'learning')
    .slice()
    .sort((a, b) => {
      const timeA = a.lastStudiedAt || a.statusUpdatedAt || ''
      const timeB = b.lastStudiedAt || b.statusUpdatedAt || ''
      return timeB.localeCompare(timeA)
    })
  return activeList[0] || null
})

const activeSubtest = computed(() =>
  learningStore.getSubtestById(selectedSubtestId.value)
)

const displayedTopics = computed(() =>
  sortLearningTopicsForTracker(
    learningStore.getTopicsBySubtest(selectedSubtestId.value)
  )
)

function getSubtestTopicCount(subtestId: string): number {
  return learningStore.getTopicsBySubtest(subtestId).length
}

function resolveSubtestLabel(subtestId: string): string {
  const sub = learningStore.getSubtestById(subtestId)
  if (!sub) return subtestId
  return `${sub.code} — ${
    userStore.settings.language === 'id' ? sub.nameId : sub.nameEn
  }`
}

function resolveTopicTitle(topic: LearningTopic): string {
  const seedTitle = SEED_TOPIC_TITLES[topic.id]
  const key = `defaultTopics.${topic.id}`
  if (seedTitle && topic.title === seedTitle && te(key)) {
    return t(key)
  }
  return topic.title
}

function isUiCompleted(status: TopicStatus): boolean {
  return mapTopicStatusToUi(status) === 'completed'
}

function uiStatusIcon(status: TopicStatus): string {
  const ui = mapTopicStatusToUi(status)
  if (ui === 'completed') return checkmarkCircleOutline
  if (ui === 'learning') return playOutline
  return ellipseOutline
}

function uiStatusBadgeStyle(status: TopicStatus): Record<string, string> {
  const ui = mapTopicStatusToUi(status)
  if (ui === 'learning') {
    return {
      background: 'var(--ritme-btn-primary-bg)',
      color: 'var(--ritme-btn-primary-text)',
      borderColor: 'var(--ritme-btn-primary-border)',
    }
  }
  if (ui === 'completed') {
    return {
      background: 'var(--ritme-glass-surface-strong)',
      color: 'var(--ritme-text-primary)',
    }
  }
  return {
    background: 'var(--ritme-surface-subtle)',
    color: 'var(--ritme-text-secondary)',
  }
}

function hasValidUrl(url?: string): boolean {
  if (!url || !url.trim()) return false
  return validateExternalUrl(url).valid
}

async function handleOpenSource(rawUrl?: string): Promise<void> {
  urlFeedbackMessage.value = ''
  failedExternalUrl.value = ''
  if (!rawUrl || !rawUrl.trim()) return

  triggerActionHaptic('light')
  const result = await openExternalLearningUrl(rawUrl)
  if (!result.ok) {
    urlFeedbackMessage.value = t(
      result.errorKey || 'learning.tracker.urlOpenFailed'
    )
    failedExternalUrl.value = result.normalizedUrl || ''
  }
}

async function copyFailedUrl(): Promise<void> {
  if (!failedExternalUrl.value) return
  try {
    await navigator.clipboard.writeText(failedExternalUrl.value)
    urlFeedbackMessage.value = t('learning.tracker.urlCopiedFeedback')
    failedExternalUrl.value = ''
  } catch {
    urlFeedbackMessage.value = t('learning.tracker.urlOpenFailed')
  }
}

async function onTopicUiStatusChange(
  topicId: string,
  event: Event
): Promise<void> {
  const select = event.target as HTMLSelectElement
  const nextUi = select.value as LearningUiStatus
  xpBannerMessage.value = ''
  triggerActionHaptic('light')

  const xpEarned = await learningStore.updateTopicStatus(
    topicId,
    mapUiStatusToStorage(nextUi)
  )
  if (xpEarned > 0) {
    xpBannerMessage.value = t('learning.tracker.xpCompletedBanner', {
      xp: xpEarned,
    })
  }
}

function openNewTopicForm(): void {
  triggerActionHaptic('light')
  editingTopic.value = null
  showTopicModal.value = true
}

function openEditTopicForm(topic: LearningTopic): void {
  triggerActionHaptic('light')
  editingTopic.value = topic
  showTopicModal.value = true
}

function closeTopicModal(): void {
  showTopicModal.value = false
  editingTopic.value = null
}

async function handleSaveTopicModal(
  payload: TopicFormSubmitPayload
): Promise<void> {
  xpBannerMessage.value = ''
  const targetStorageStatus = mapUiStatusToStorage(payload.uiStatus)

  if (editingTopic.value) {
    const xpEarned = await learningStore.updateTopic(editingTopic.value.id, {
      subtestId: payload.subtestId,
      title: payload.title,
      status: targetStorageStatus,
      sourceName: payload.sourceName,
      sourceUrl: payload.sourceUrl,
      targetDurationMinutes: payload.targetDurationMinutes,
      notes: payload.notes,
    })
    if (xpEarned > 0) {
      xpBannerMessage.value = t('learning.tracker.xpCompletedBanner', {
        xp: xpEarned,
      })
    }
    selectedSubtestId.value = payload.subtestId
  } else {
    const res = await learningStore.addTopic({
      subtestId: payload.subtestId,
      title: payload.title,
      status: targetStorageStatus,
      sourceName: payload.sourceName,
      sourceUrl: payload.sourceUrl,
      targetDurationMinutes: payload.targetDurationMinutes,
      notes: payload.notes,
    })
    if (res.xpEarned > 0) {
      xpBannerMessage.value = t('learning.tracker.xpCompletedBanner', {
        xp: res.xpEarned,
      })
    }
    selectedSubtestId.value = payload.subtestId
  }

  closeTopicModal()
}

async function handleDeleteTopicModal(topicId: string): Promise<void> {
  await learningStore.deleteTopic(topicId)
  closeTopicModal()
}

function formatShortDate(isoString: string): string {
  return new Intl.DateTimeFormat(
    userStore.settings.language === 'id' ? 'id-ID' : 'en-US',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  ).format(new Date(isoString))
}
</script>

<style scoped>
.ritme-add-topic-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: var(--ritme-radius-pill);
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  background: var(--ritme-btn-primary-bg);
  color: var(--ritme-btn-primary-text);
  border: 1px solid var(--ritme-btn-primary-border);
  box-shadow: var(--ritme-btn-primary-shadow);
  cursor: pointer;
  transition: transform var(--ritme-motion-fast), opacity var(--ritme-motion-fast);
}

.ritme-add-topic-cta:active {
  opacity: 0.88;
  transform: scale(0.96);
}

.ritme-status-select {
  height: 36px;
  min-height: 36px;
  padding: 0 12px;
  line-height: 34px;
  box-sizing: border-box;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid var(--ritme-input-border);
  background: var(--ritme-glass-surface-strong);
  color: var(--ritme-text-primary);
  font-family: var(--ion-font-family);
  font-size: 0.75rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
}

.ritme-select-themed option {
  background-color: var(--ritme-bg-secondary);
  color: var(--ritme-text-primary);
}
</style>
