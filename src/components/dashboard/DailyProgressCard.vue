<template>
  <div class="ritme-card">
    <div class="ritme-section-header" style="align-items: center;">
      <div>
        <h2 class="ritme-section-title">{{ t('home.dailyProgressTitle') }}</h2>
        <div class="ritme-subtitle" style="margin-top: 2px; font-size: 0.78rem;">
          {{
            t('home.progressOfTarget', {
              current: studyMinutes,
              target: targetMinutes,
            })
          }}
        </div>
      </div>
      <span class="ritme-badge">{{ progressPercentage }}%</span>
    </div>

    <div
      class="ritme-progress-track"
      role="progressbar"
      :aria-valuenow="progressPercentage"
      aria-valuemin="0"
      aria-valuemax="100"
      style="margin-bottom: 10px;"
    >
      <div
        class="ritme-progress-fill"
        :style="{ width: `${progressPercentage}%` }"
      ></div>
    </div>

    <!-- Compact 3-Metric Daily Activity Row -->
    <div class="ritme-summary-grid-3" style="margin-bottom: 12px;">
      <div class="ritme-summary-tile">
        <span class="ritme-subtitle" style="font-size: 0.68rem;">
          {{ t('home.summaryFocusLabel') }}
        </span>
        <div class="ritme-stat-number" style="margin-top: 3px; font-size: 1rem;">
          {{ studyMinutes }}{{ t('focus.minutesShort') }}
        </div>
      </div>

      <div class="ritme-summary-tile">
        <span class="ritme-subtitle" style="font-size: 0.68rem;">
          {{ t('home.summarySessionsLabel') }}
        </span>
        <div class="ritme-stat-number" style="margin-top: 3px; font-size: 1rem;">
          {{ completedSessionsToday }}
        </div>
      </div>

      <div class="ritme-summary-tile">
        <span class="ritme-subtitle" style="font-size: 0.68rem;">
          {{ t('home.summaryHabitsLabel') }}
        </span>
        <div class="ritme-stat-number" style="margin-top: 3px; font-size: 1rem;">
          {{ habitStore.todayCompletedCount }}/{{ habitStore.activeHabits.length }}
        </div>
      </div>
    </div>

    <!-- Energy Mode Switcher & Optional Reflection Trigger (Comfortable Touch Targets) -->
    <div
      style="padding-top: 10px; border-top: 1px solid var(--ritme-border-line); display: flex; flex-direction: column; gap: 10px;"
    >
      <div
        style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: var(--ritme-radius-pill); background: var(--ritme-surface-subtle); border: 1px solid var(--ritme-glass-border);"
      >
        <button
          v-for="mode in (['green', 'yellow', 'red'] as const)"
          :key="mode"
          type="button"
          class="ritme-pill-tab"
          :style="energyPillStyle(mode)"
          @click="selectEnergyMode(mode)"
        >
          <span
            class="ritme-dot"
            :class="
              mode === 'green'
                ? 'ritme-dot-green'
                : mode === 'yellow'
                  ? 'ritme-dot-yellow'
                  : 'ritme-dot-red'
            "
          />
          <span>{{ t(`reflection.energy${capitalize(mode)}Short`) }}</span>
        </button>
      </div>

      <div style="display: flex; justify-content: flex-end;">
        <button
          type="button"
          class="ritme-glass-pill"
          style="min-height: 38px; padding: 0 14px;"
          @click="openReflectionModal"
        >
          <ion-icon
            :icon="
              gamificationStore.todayReflectionCompleted
                ? checkmarkCircleOutline
                : createOutline
            "
            style="font-size: 0.95rem;"
          />
          <span>
            {{
              gamificationStore.todayReflectionCompleted
                ? t('home.reflectionEditTriggerBtn')
                : t('home.reflectionTriggerBtn')
            }}
          </span>
        </button>
      </div>
    </div>

    <!-- Optional Single-Input Reflection Bottom Sheet Modal (PRD 4.3) -->
    <ion-modal
      class="ritme-glass-modal"
      :is-open="showReflectionModal"
      :initial-breakpoint="0.48"
      :breakpoints="[0, 0.48, 0.78]"
      @didDismiss="showReflectionModal = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title style="font-size: 1rem;">
            {{ t('home.reflectionModalTitle') }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="showReflectionModal = false">
              {{ t('reflection.cancelEditBtn') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content :scroll-y="true">
        <div class="ritme-page-container" style="padding-top: 10px;">
          <div class="ritme-card">
            <div style="margin-bottom: 12px;">
              <label
                class="ritme-subtitle"
                for="home-refl-single-input"
                style="display: block; margin-bottom: 6px; font-size: 0.84rem; font-weight: 600; color: var(--ritme-text-primary);"
              >
                {{ t('home.reflectionSingleQuestion') }}
              </label>
              <textarea
                id="home-refl-single-input"
                v-model="achievementInput"
                rows="3"
                :placeholder="t('reflection.achievementPlaceholder')"
                class="ritme-input"
              ></textarea>
            </div>

            <div
              v-if="reflectionError"
              class="ritme-list-item"
              style="margin-bottom: 10px; font-size: 0.8rem; color: var(--ritme-danger); border-color: var(--ritme-danger);"
            >
              {{ reflectionError }}
            </div>

            <ion-button
              expand="block"
              class="ritme-focus-cta"
              style="margin: 0;"
              @click="handleSaveQuickReflection"
            >
              {{
                gamificationStore.todayReflectionCompleted
                  ? t('reflection.updateBtn')
                  : t('reflection.saveBtn')
              }}
            </ion-button>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
import { checkmarkCircleOutline, createOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useFocusStore } from '@/stores/focusStore'
import { useHabitStore } from '@/stores/habitStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { triggerActionHaptic } from '@/services/timer/soundFeedbackService'
import type { EnergyMode } from '@/types'

const { t } = useI18n()
const userStore = useUserStore()
const focusStore = useFocusStore()
const habitStore = useHabitStore()
const gamificationStore = useGamificationStore()

const showReflectionModal = ref(false)
const achievementInput = ref('')
const reflectionError = ref('')

const studyMinutes = computed(() => focusStore.todayStudyMinutes)
const targetMinutes = computed(() =>
  Math.max(1, userStore.effectiveDailyTargetMinutes)
)

const completedSessionsToday = computed(
  () =>
    focusStore.todaySessions.filter((s) => s.status === 'completed').length
)

const progressPercentage = computed(() =>
  Math.min(100, Math.round((studyMinutes.value / targetMinutes.value) * 100))
)

function capitalize(mode: EnergyMode): 'Green' | 'Yellow' | 'Red' {
  if (mode === 'yellow') return 'Yellow'
  if (mode === 'red') return 'Red'
  return 'Green'
}

async function selectEnergyMode(mode: EnergyMode): Promise<void> {
  triggerActionHaptic('light')
  await userStore.setEnergyMode(mode)
}

function openReflectionModal(): void {
  reflectionError.value = ''
  achievementInput.value =
    gamificationStore.todayReflection?.achievement || ''
  showReflectionModal.value = true
}

async function handleSaveQuickReflection(): Promise<void> {
  reflectionError.value = ''
  if (!achievementInput.value.trim()) {
    reflectionError.value = t('reflection.validationError')
    return
  }

  const existing = gamificationStore.todayReflection
  const res = await gamificationStore.saveDailyReflection({
    energyMode: userStore.settings.currentEnergyMode || 'green',
    achievement: achievementInput.value,
    challenge: existing?.challenge || '',
    improvement: existing?.improvement || '',
    nextDayPlan: existing?.nextDayPlan || '',
  })

  if (res.saved) {
    showReflectionModal.value = false
  }
}

function energyPillStyle(mode: EnergyMode): Record<string, string> {
  const isSelected = userStore.settings.currentEnergyMode === mode

  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    minHeight: '36px',
    padding: '0 8px',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: isSelected ? '700' : '500',
    cursor: 'pointer',
    border: isSelected
      ? '1px solid var(--ritme-state-selected-border)'
      : '1px solid transparent',
    background: isSelected ? 'var(--ritme-state-selected-bg)' : 'transparent',
    color: isSelected
      ? 'var(--ritme-text-primary)'
      : 'var(--ritme-text-secondary)',
    whiteSpace: 'nowrap',
  }
}
</script>
