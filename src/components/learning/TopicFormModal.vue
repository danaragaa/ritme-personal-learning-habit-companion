<template>
  <ion-modal
    class="ritme-glass-modal"
    :is-open="isOpen"
    :initial-breakpoint="0.88"
    :breakpoints="[0, 0.88, 0.96]"
    @didDismiss="emitClose"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title style="font-size: 1rem;">
          {{
            editingTopic
              ? t('learning.editTopicTitle')
              : t('learning.newTopicTitle')
          }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="emitClose">
            {{ t('learning.tracker.closeModalBtn') }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :scroll-y="true">
      <div class="ritme-page-container" style="padding-top: 10px;">
        <div class="ritme-card">
          <!-- Subtest (Required) -->
          <div style="margin-bottom: 12px;">
            <label class="ritme-form-label" for="tracker-topic-subtest">
              {{ t('learning.tracker.formSubtestLabel') }}
            </label>
            <select
              id="tracker-topic-subtest"
              v-model="formSubtestId"
              class="ritme-input ritme-select-themed"
            >
              <option
                v-for="subtest in subtests"
                :key="subtest.id"
                :value="subtest.id"
              >
                {{ subtest.code }} —
                {{ language === 'id' ? subtest.nameId : subtest.nameEn }}
              </option>
            </select>
            <div v-if="subtestError" class="ritme-form-error">
              {{ subtestError }}
            </div>
          </div>

          <!-- Topic Title (Required) -->
          <div style="margin-bottom: 12px;">
            <label class="ritme-form-label" for="tracker-topic-title">
              {{ t('learning.tracker.formTitleLabel') }}
            </label>
            <input
              id="tracker-topic-title"
              v-model="formTitle"
              type="text"
              :placeholder="t('learning.tracker.formTitlePlaceholder')"
              class="ritme-input ritme-input-themed"
            />
            <div v-if="titleError" class="ritme-form-error">
              {{ titleError }}
            </div>
          </div>

          <!-- 3-State Status (Optional, Default: Belum Dimulai) -->
          <div style="margin-bottom: 12px;">
            <label class="ritme-form-label" for="tracker-topic-status">
              {{ t('learning.tracker.formStatusLabel') }}
            </label>
            <select
              id="tracker-topic-status"
              v-model="formUiStatus"
              class="ritme-input ritme-select-themed"
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
          </div>

          <!-- External Source Name & Target Duration -->
          <div
            style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 10px; margin-bottom: 12px;"
          >
            <div>
              <label class="ritme-form-label" for="tracker-topic-source-name">
                {{ t('learning.tracker.formSourceNameLabel') }}
              </label>
              <input
                id="tracker-topic-source-name"
                v-model="formSourceName"
                type="text"
                :placeholder="t('learning.tracker.formSourceNamePlaceholder')"
                class="ritme-input ritme-input-themed"
              />
            </div>

            <div>
              <label class="ritme-form-label" for="tracker-topic-duration">
                {{ t('learning.tracker.formDurationLabel') }}
              </label>
              <input
                id="tracker-topic-duration"
                v-model="formDuration"
                type="number"
                min="1"
                max="600"
                :placeholder="t('learning.tracker.formDurationPlaceholder')"
                class="ritme-input ritme-input-themed"
              />
            </div>
          </div>

          <!-- External Source URL (Optional, HTTP/HTTPS Validated) -->
          <div style="margin-bottom: 12px;">
            <label class="ritme-form-label" for="tracker-topic-source-url">
              {{ t('learning.tracker.formSourceUrlLabel') }}
            </label>
            <input
              id="tracker-topic-source-url"
              v-model="formSourceUrl"
              type="url"
              inputmode="url"
              :placeholder="t('learning.tracker.formSourceUrlPlaceholder')"
              class="ritme-input ritme-input-themed"
            />
            <div v-if="urlError" class="ritme-form-error">
              {{ urlError }}
            </div>
          </div>

          <!-- Notes (Optional) -->
          <div style="margin-bottom: 14px;">
            <label class="ritme-form-label" for="tracker-topic-notes">
              {{ t('learning.tracker.formNotesLabel') }}
            </label>
            <textarea
              id="tracker-topic-notes"
              v-model="formNotes"
              rows="2"
              :placeholder="t('learning.tracker.formNotesPlaceholder')"
              class="ritme-input ritme-input-themed"
            ></textarea>
          </div>

          <!-- Delete Confirmation Box (Edit Mode Only) -->
          <div
            v-if="editingTopic && confirmingDelete"
            class="ritme-list-item"
            style="margin-bottom: 12px; border-color: var(--ritme-danger);"
          >
            <span
              style="font-size: 0.82rem; color: var(--ritme-danger); font-weight: 600;"
            >
              {{ t('learning.confirmDeleteMsg') }}
            </span>
            <div style="display: flex; gap: 6px; flex-shrink: 0;">
              <button
                type="button"
                class="ritme-glass-pill"
                style="border-color: var(--ritme-danger); color: var(--ritme-danger);"
                @click="handleDelete"
              >
                {{ t('learning.confirmDeleteYes') }}
              </button>
              <button
                type="button"
                class="ritme-glass-pill"
                @click="confirmingDelete = false"
              >
                {{ t('learning.cancelBtn') }}
              </button>
            </div>
          </div>

          <!-- Primary & Secondary Actions -->
          <ion-button
            expand="block"
            class="ritme-focus-cta"
            style="margin: 0 0 10px;"
            @click="handleSubmit"
          >
            {{ t('learning.saveTopicBtn') }}
          </ion-button>

          <div
            style="display: flex; justify-content: space-between; align-items: center; gap: 8px;"
          >
            <button
              type="button"
              class="ritme-glass-pill"
              @click="emitClose"
            >
              {{ t('learning.cancelBtn') }}
            </button>

            <button
              v-if="editingTopic && !confirmingDelete"
              type="button"
              class="ritme-glass-pill"
              style="color: var(--ritme-danger);"
              @click="confirmingDelete = true"
            >
              <ion-icon :icon="trashOutline" style="font-size: 0.9rem;" />
              {{ t('learning.deleteBtn') }}
            </button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { trashOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import {
  mapTopicStatusToUi,
  SEED_TOPIC_TITLES,
  validateExternalUrl,
  type LearningUiStatus,
} from '@/services/learning/learningTrackerService'
import type { AppLanguage, LearningTopic, SubtestCategory } from '@/types'

export interface TopicFormSubmitPayload {
  subtestId: string
  title: string
  uiStatus: LearningUiStatus
  sourceName: string
  sourceUrl: string
  targetDurationMinutes: number | null
  notes: string
}

const props = defineProps<{
  isOpen: boolean
  editingTopic: LearningTopic | null
  defaultSubtestId: string
  subtests: SubtestCategory[]
  language: AppLanguage
}>()

const emit = defineEmits<{
  close: []
  save: [payload: TopicFormSubmitPayload]
  delete: [topicId: string]
}>()

const { t, te } = useI18n()

const formSubtestId = ref('')
const formTitle = ref('')
const formUiStatus = ref<LearningUiStatus>('not_started')
const formSourceName = ref('')
const formSourceUrl = ref('')
const formDuration = ref<string>('')
const formNotes = ref('')

const titleError = ref('')
const subtestError = ref('')
const urlError = ref('')
const confirmingDelete = ref(false)

function resolveDisplayTitle(topic: LearningTopic): string {
  const seedTitle = SEED_TOPIC_TITLES[topic.id]
  const key = `defaultTopics.${topic.id}`
  if (seedTitle && topic.title === seedTitle && te(key)) {
    return t(key)
  }
  return topic.title
}

watch(
  () => [props.isOpen, props.editingTopic, props.defaultSubtestId] as const,
  ([open, topic, defSubtest]) => {
    if (!open) return
    titleError.value = ''
    subtestError.value = ''
    urlError.value = ''
    confirmingDelete.value = false

    if (topic) {
      formSubtestId.value = topic.subtestId
      formTitle.value = resolveDisplayTitle(topic)
      formUiStatus.value = mapTopicStatusToUi(topic.status)
      formSourceName.value = topic.sourceName || ''
      formSourceUrl.value = topic.sourceUrl || ''
      formDuration.value =
        topic.targetDurationMinutes && topic.targetDurationMinutes > 0
          ? String(topic.targetDurationMinutes)
          : ''
      formNotes.value = topic.notes || ''
    } else {
      formSubtestId.value =
        defSubtest || props.subtests[0]?.id || 'subtest_pu'
      formTitle.value = ''
      formUiStatus.value = 'not_started'
      formSourceName.value = ''
      formSourceUrl.value = ''
      formDuration.value = ''
      formNotes.value = ''
    }
  },
  { immediate: true }
)

function emitClose(): void {
  emit('close')
}

function handleSubmit(): void {
  titleError.value = ''
  subtestError.value = ''
  urlError.value = ''

  const cleanTitle = formTitle.value.trim()
  if (!cleanTitle) {
    titleError.value = t('learning.tracker.titleRequiredError')
  }
  if (!formSubtestId.value) {
    subtestError.value = t('learning.tracker.subtestRequiredError')
  }

  const urlCheck = validateExternalUrl(formSourceUrl.value)
  if (!urlCheck.valid) {
    urlError.value = t(urlCheck.errorKey || 'learning.tracker.urlInvalidFormat')
  }

  if (titleError.value || subtestError.value || urlError.value) {
    return
  }

  const parsedDuration = Number(formDuration.value)
  const cleanDuration =
    formDuration.value !== '' &&
    Number.isFinite(parsedDuration) &&
    parsedDuration > 0
      ? Math.max(1, Math.min(600, Math.round(parsedDuration)))
      : null

  emit('save', {
    subtestId: formSubtestId.value,
    title: cleanTitle,
    uiStatus: formUiStatus.value,
    sourceName: formSourceName.value.trim(),
    sourceUrl: urlCheck.normalizedUrl,
    targetDurationMinutes: cleanDuration,
    notes: formNotes.value.trim(),
  })
}

function handleDelete(): void {
  if (!props.editingTopic) return
  emit('delete', props.editingTopic.id)
}
</script>

<style scoped>
.ritme-form-label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ritme-text-secondary);
}

.ritme-form-error {
  margin-top: 5px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ritme-danger);
}

.ritme-select-themed option {
  background-color: var(--ritme-bg-secondary);
  color: var(--ritme-text-primary);
}
</style>
