<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title">{{ t('learning.baselineTitle') }}</h2>
        <div class="ritme-subtitle" style="font-size: 0.78rem; margin-top: 2px;">
          {{ t('learning.baselineDesc') }}
        </div>
      </div>

      <ion-button
        v-if="learningStore.diagnosticBaseline && !isEditing"
        size="small"
        fill="clear"
        style="--padding-start: 6px; --padding-end: 6px; font-weight: 600;"
        @click="openEditor"
      >
        {{ t('learning.editBaselineBtn') }}
      </ion-button>
    </div>

    <div style="margin-bottom: 10px;">
      <span
        class="ritme-badge"
        style="background: rgba(229, 174, 84, 0.16); color: var(--ritme-warning);"
      >
        {{ t('learning.baselineBadge') }}
      </span>
    </div>

    <div v-if="learningStore.diagnosticBaseline && !isEditing">
      <div class="ritme-list-item" style="display: block;">
        <div style="font-weight: 700; font-size: 0.95rem;">
          {{
            t('learning.baselineScore', {
              correct: learningStore.diagnosticBaseline.correctCount,
              percent: Math.round(
                (learningStore.diagnosticBaseline.correctCount / 21) * 100
              ),
            })
          }}
        </div>
        <div
          v-if="learningStore.diagnosticBaseline.notes"
          class="ritme-subtitle"
          style="font-size: 0.82rem; margin-top: 4px;"
        >
          {{ learningStore.diagnosticBaseline.notes }}
        </div>
      </div>
    </div>

    <div v-else>
      <div style="margin-bottom: 10px;">
        <label
          class="ritme-subtitle"
          for="baseline-correct-input"
          style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
        >
          {{ t('learning.baselineCorrectLabel') }}
        </label>
        <input
          id="baseline-correct-input"
          v-model.number="correctInput"
          type="number"
          min="0"
          max="21"
          class="ritme-input"
        />
      </div>

      <div style="margin-bottom: 10px;">
        <label
          class="ritme-subtitle"
          for="baseline-notes-input"
          style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
        >
          {{ t('learning.baselineNotesLabel') }}
        </label>
        <input
          id="baseline-notes-input"
          v-model="notesInput"
          type="text"
          :placeholder="t('learning.baselineNotesPlaceholder')"
          class="ritme-input"
        />
      </div>

      <div style="display: flex; gap: 8px;">
        <ion-button
          size="small"
          color="primary"
          style="font-weight: 700;"
          @click="handleSave"
        >
          {{ t('learning.saveBaselineBtn') }}
        </ion-button>
        <ion-button
          v-if="learningStore.diagnosticBaseline"
          size="small"
          fill="outline"
          color="secondary"
          @click="isEditing = false"
        >
          {{ t('learning.cancelBtn') }}
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { IonButton } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'

const { t } = useI18n()
const learningStore = useLearningStore()

const isEditing = ref(false)
const correctInput = ref<number>(0)
const notesInput = ref<string>('')

watch(
  () => learningStore.diagnosticBaseline,
  (val) => {
    if (val) {
      correctInput.value = val.correctCount
      notesInput.value = val.notes
    }
  },
  { immediate: true }
)

function openEditor(): void {
  if (learningStore.diagnosticBaseline) {
    correctInput.value = learningStore.diagnosticBaseline.correctCount
    notesInput.value = learningStore.diagnosticBaseline.notes
  }
  isEditing.value = true
}

async function handleSave(): Promise<void> {
  await learningStore.saveDiagnosticBaseline(correctInput.value, notesInput.value)
  isEditing.value = false
}
</script>
