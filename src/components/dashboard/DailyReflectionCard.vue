<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title">{{ t('reflection.title') }}</h2>
        <div class="ritme-subtitle" style="font-size: 0.8rem; margin-top: 2px;">
          {{ t('reflection.subtitle') }}
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 6px;">
        <span
          class="ritme-badge"
          :class="
            gamificationStore.todayReflectionCompleted
              ? 'ritme-badge-success'
              : 'ritme-badge-gold'
          "
        >
          {{
            gamificationStore.todayReflectionCompleted
              ? t('reflection.completedBadge')
              : t('reflection.rewardBadge')
          }}
        </span>
        <ion-button
          v-if="gamificationStore.todayReflectionCompleted && !isEditing"
          size="small"
          fill="clear"
          style="--padding-start: 6px; --padding-end: 6px; font-weight: 600;"
          @click="openEditor"
        >
          {{ t('reflection.editBtn') }}
        </ion-button>
      </div>
    </div>

    <!-- Energy Mode Selector -->
    <div style="margin-bottom: 12px;">
      <div class="ritme-subtitle" style="font-size: 0.8rem; margin-bottom: 6px;">
        {{ t('reflection.energyLabel') }}
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <ion-button
          size="small"
          color="success"
          :fill="selectedEnergyMode === 'green' ? 'solid' : 'outline'"
          @click="selectEnergyMode('green')"
        >
          {{ t('reflection.energyGreenShort') }}
        </ion-button>
        <ion-button
          size="small"
          color="warning"
          :fill="selectedEnergyMode === 'yellow' ? 'solid' : 'outline'"
          @click="selectEnergyMode('yellow')"
        >
          {{ t('reflection.energyYellowShort') }}
        </ion-button>
        <ion-button
          size="small"
          color="danger"
          :fill="selectedEnergyMode === 'red' ? 'solid' : 'outline'"
          @click="selectEnergyMode('red')"
        >
          {{ t('reflection.energyRedShort') }}
        </ion-button>
      </div>
      <div class="ritme-subtitle" style="font-size: 0.78rem; margin-top: 6px;">
        {{ t(`energy.${selectedEnergyMode}`) }}
      </div>
    </div>

    <!-- Feedback Message -->
    <div
      v-if="feedbackMessage"
      class="ritme-list-item is-completed"
      style="margin-bottom: 12px; font-size: 0.84rem; color: var(--ritme-accent-primary); font-weight: 600;"
    >
      {{ feedbackMessage }}
    </div>

    <!-- Error Message -->
    <div
      v-if="errorMessage"
      class="ritme-list-item"
      style="margin-bottom: 12px; font-size: 0.84rem; color: var(--ritme-danger); border-color: rgba(227, 108, 108, 0.35);"
    >
      {{ errorMessage }}
    </div>

    <!-- Saved Summary View -->
    <div
      v-if="
        gamificationStore.todayReflectionCompleted &&
        gamificationStore.todayReflection &&
        !isEditing
      "
    >
      <div
        v-if="gamificationStore.todayReflection.achievement"
        class="ritme-list-item"
        style="display: block;"
      >
        <div class="ritme-subtitle" style="font-size: 0.76rem;">
          {{ t('reflection.achievementLabel') }}
        </div>
        <div style="font-size: 0.9rem; margin-top: 3px;">
          {{ gamificationStore.todayReflection.achievement }}
        </div>
      </div>

      <div
        v-if="gamificationStore.todayReflection.challenge"
        class="ritme-list-item"
        style="display: block;"
      >
        <div class="ritme-subtitle" style="font-size: 0.76rem;">
          {{ t('reflection.challengeLabel') }}
        </div>
        <div style="font-size: 0.9rem; margin-top: 3px;">
          {{ gamificationStore.todayReflection.challenge }}
        </div>
      </div>

      <div
        v-if="gamificationStore.todayReflection.improvement"
        class="ritme-list-item"
        style="display: block;"
      >
        <div class="ritme-subtitle" style="font-size: 0.76rem;">
          {{ t('reflection.improvementLabel') }}
        </div>
        <div style="font-size: 0.9rem; margin-top: 3px;">
          {{ gamificationStore.todayReflection.improvement }}
        </div>
      </div>

      <div
        v-if="gamificationStore.todayReflection.nextDayPlan"
        class="ritme-list-item"
        style="display: block;"
      >
        <div class="ritme-subtitle" style="font-size: 0.76rem;">
          {{ t('reflection.nextDayPlanLabel') }}
        </div>
        <div style="font-size: 0.9rem; margin-top: 3px;">
          {{ gamificationStore.todayReflection.nextDayPlan }}
        </div>
      </div>
    </div>

    <!-- Reflection Input Form -->
    <div v-else>
      <div style="margin-bottom: 10px;">
        <label
          class="ritme-subtitle"
          for="refl-achievement"
          style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
        >
          {{ t('reflection.achievementLabel') }}
        </label>
        <textarea
          id="refl-achievement"
          v-model="achievementInput"
          rows="2"
          :placeholder="t('reflection.achievementPlaceholder')"
          class="ritme-input"
        ></textarea>
      </div>

      <div style="margin-bottom: 10px;">
        <label
          class="ritme-subtitle"
          for="refl-challenge"
          style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
        >
          {{ t('reflection.challengeLabel') }}
        </label>
        <textarea
          id="refl-challenge"
          v-model="challengeInput"
          rows="2"
          :placeholder="t('reflection.challengePlaceholder')"
          class="ritme-input"
        ></textarea>
      </div>

      <div style="margin-bottom: 10px;">
        <label
          class="ritme-subtitle"
          for="refl-improvement"
          style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
        >
          {{ t('reflection.improvementLabel') }}
        </label>
        <textarea
          id="refl-improvement"
          v-model="improvementInput"
          rows="2"
          :placeholder="t('reflection.improvementPlaceholder')"
          class="ritme-input"
        ></textarea>
      </div>

      <div style="margin-bottom: 12px;">
        <label
          class="ritme-subtitle"
          for="refl-next-plan"
          style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
        >
          {{ t('reflection.nextDayPlanLabel') }}
        </label>
        <textarea
          id="refl-next-plan"
          v-model="nextDayPlanInput"
          rows="2"
          :placeholder="t('reflection.nextDayPlanPlaceholder')"
          class="ritme-input"
        ></textarea>
      </div>

      <div style="display: flex; gap: 8px;">
        <ion-button
          expand="block"
          color="primary"
          style="flex: 1; font-weight: 700;"
          @click="handleSaveReflection"
        >
          {{
            gamificationStore.todayReflectionCompleted
              ? t('reflection.updateBtn')
              : t('reflection.saveBtn')
          }}
        </ion-button>

        <ion-button
          v-if="gamificationStore.todayReflectionCompleted && isEditing"
          fill="outline"
          color="secondary"
          @click="isEditing = false"
        >
          {{ t('reflection.cancelEditBtn') }}
        </ion-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { IonButton } from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'
import type { EnergyMode } from '@/types'

const { t } = useI18n()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

const selectedEnergyMode = ref<EnergyMode>(
  userStore.settings.currentEnergyMode || 'green'
)
const achievementInput = ref('')
const challengeInput = ref('')
const improvementInput = ref('')
const nextDayPlanInput = ref('')
const isEditing = ref(false)
const feedbackMessage = ref('')
const errorMessage = ref('')

function syncFormFromStore(): void {
  const existing = gamificationStore.todayReflection
  if (existing) {
    selectedEnergyMode.value = existing.energyMode
    achievementInput.value = existing.achievement
    challengeInput.value = existing.challenge
    improvementInput.value = existing.improvement
    nextDayPlanInput.value = existing.nextDayPlan
  } else {
    selectedEnergyMode.value = userStore.settings.currentEnergyMode || 'green'
  }
}

watch(
  () => gamificationStore.todayReflection,
  () => {
    syncFormFromStore()
  },
  { immediate: true }
)

watch(
  () => userStore.settings.currentEnergyMode,
  (mode) => {
    if (!gamificationStore.todayReflection) {
      selectedEnergyMode.value = mode
    }
  }
)

async function selectEnergyMode(mode: EnergyMode): Promise<void> {
  selectedEnergyMode.value = mode
  await userStore.setEnergyMode(mode)
}

function openEditor(): void {
  syncFormFromStore()
  feedbackMessage.value = ''
  errorMessage.value = ''
  isEditing.value = true
}

async function handleSaveReflection(): Promise<void> {
  feedbackMessage.value = ''
  errorMessage.value = ''

  if (
    !achievementInput.value.trim() &&
    !challengeInput.value.trim() &&
    !improvementInput.value.trim() &&
    !nextDayPlanInput.value.trim()
  ) {
    errorMessage.value = t('reflection.validationError')
    return
  }

  const res = await gamificationStore.saveDailyReflection({
    energyMode: selectedEnergyMode.value,
    achievement: achievementInput.value,
    challenge: challengeInput.value,
    improvement: improvementInput.value,
    nextDayPlan: nextDayPlanInput.value,
  })

  if (res.saved) {
    isEditing.value = false
    feedbackMessage.value =
      res.xpEarned > 0
        ? t('reflection.savedSuccessXp')
        : t('reflection.savedSuccessUpdate')
  }
}
</script>
