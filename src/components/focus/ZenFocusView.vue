<template>
  <div class="ritme-zen-shell">
    <!-- Status & Mode/Phase Indicator (Minimal, Monochrome) -->
    <div class="ritme-zen-status-row">
      <span class="ritme-badge ritme-glass-chip">
        <ion-icon :icon="statusIcon" style="font-size: 0.82rem;" />
        {{ statusLabel }}
      </span>
      <span
        v-if="focusMode === 'pomodoro'"
        class="ritme-badge"
        style="color: var(--ritme-text-secondary);"
      >
        {{ pomodoroMetaLabel }}
      </span>
    </div>

    <!-- Topic Title or Free Focus / Break Title -->
    <div class="ritme-zen-heading">
      <div
        v-if="!isBreakPhase && subtestCode"
        class="ritme-subtitle"
        style="font-size: 0.74rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 4px;"
      >
        {{ subtestCode }}
      </div>
      <h1 class="ritme-zen-topic">{{ displayTitle }}</h1>
    </div>

    <!-- Centered Circular Progress Ring + Large Countdown Timer -->
    <div
      class="ritme-zen-ring-wrap"
      :class="{ 'ritme-timer-running': timerStatus === 'running' }"
    >
      <svg
        width="236"
        height="236"
        viewBox="0 0 236 236"
        class="ritme-zen-ring-svg"
        aria-hidden="true"
      >
        <circle
          cx="118"
          cy="118"
          :r="ringRadius"
          fill="none"
          class="ritme-zen-ring-track"
          stroke-width="7"
        />
        <circle
          cx="118"
          cy="118"
          :r="ringRadius"
          fill="none"
          class="ritme-zen-ring-progress"
          stroke-width="7"
          stroke-linecap="round"
          :stroke-dasharray="ringCircumference"
          :stroke-dashoffset="ringDashOffset"
        />
      </svg>

      <div class="ritme-zen-time-core">
        <div class="ritme-timer-display ritme-zen-time-text">
          {{ formattedRemainingTime }}
        </div>
      </div>
    </div>

    <!-- Touch-Friendly Zen Controls (Pause/Resume, Finish, Cancel) -->
    <div class="ritme-zen-controls">
      <div class="ritme-zen-primary-row">
        <button
          v-if="timerStatus === 'running'"
          type="button"
          class="ritme-zen-btn ritme-zen-btn-glass"
          @click="$emit('pause')"
        >
          <ion-icon :icon="pauseOutline" style="font-size: 1.05rem;" />
          <span>{{ t('focus.pauseBtn') }}</span>
        </button>

        <button
          v-else
          type="button"
          class="ritme-zen-btn ritme-zen-btn-primary"
          @click="$emit('resume')"
        >
          <ion-icon :icon="playOutline" style="font-size: 1.05rem;" />
          <span>{{ t('focus.resumeBtn') }}</span>
        </button>

        <button
          type="button"
          class="ritme-zen-btn"
          :class="
            remainingSeconds === 0
              ? 'ritme-zen-btn-primary'
              : 'ritme-zen-btn-glass'
          "
          @click="$emit('finish')"
        >
          <ion-icon :icon="checkmarkDoneOutline" style="font-size: 1.05rem;" />
          <span>
            {{
              isBreakPhase
                ? t('focus.finishBreakBtn')
                : t('focus.zen.finishShortBtn')
            }}
          </span>
        </button>
      </div>

      <!-- 2-Tap Cancel Confirmation (Prevents Accidental Cancel) -->
      <div
        v-if="confirmingCancel"
        class="ritme-zen-cancel-confirm"
        role="alert"
      >
        <div
          style="font-size: 0.8rem; font-weight: 600; color: var(--ritme-text-primary); margin-bottom: 10px; line-height: 1.35;"
        >
          {{ t('focus.confirmCancelMsg') }}
        </div>
        <div style="display: flex; gap: 8px;">
          <button
            type="button"
            class="ritme-glass-pill"
            style="flex: 1; min-height: 40px; border-color: var(--ritme-danger); color: var(--ritme-danger);"
            @click="confirmCancel"
          >
            {{ t('focus.confirmCancelYes') }}
          </button>
          <button
            type="button"
            class="ritme-glass-pill"
            style="flex: 1; min-height: 40px;"
            @click="confirmingCancel = false"
          >
            {{ t('focus.confirmCancelNo') }}
          </button>
        </div>
      </div>

      <button
        v-else
        type="button"
        class="ritme-zen-cancel-link"
        @click="confirmingCancel = true"
      >
        <ion-icon :icon="closeCircleOutline" style="font-size: 0.95rem;" />
        <span>{{ t('focus.cancelBtn') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  cafeOutline,
  checkmarkDoneOutline,
  closeCircleOutline,
  pauseOutline,
  playOutline,
  timerOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import type { FocusMode, PomodoroPhase } from '@/types'

const props = defineProps<{
  timerStatus: 'running' | 'paused'
  focusMode: FocusMode
  pomodoroPhase: PomodoroPhase
  pomodoroCycleCount: number
  isBreakPhase: boolean
  topicTitle: string
  subtestCode: string
  formattedRemainingTime: string
  remainingSeconds: number
  progressPercent: number
}>()

const emit = defineEmits<{
  pause: []
  resume: []
  finish: []
  cancel: []
}>()

const { t } = useI18n()
const confirmingCancel = ref(false)

const ringRadius = 104
const ringCircumference = 2 * Math.PI * ringRadius
const ringDashOffset = computed(
  () => ringCircumference * (1 - Math.max(0, Math.min(100, props.progressPercent)) / 100)
)

const statusIcon = computed(() => {
  if (props.timerStatus === 'paused') return pauseOutline
  if (props.isBreakPhase) return cafeOutline
  return timerOutline
})

const statusLabel = computed(() => {
  if (props.timerStatus === 'paused') return t('focus.statusPaused')
  if (props.isBreakPhase) return t('focus.statusBreaking')
  return t('focus.statusRunning')
})

const pomodoroMetaLabel = computed(() => {
  const cycleText = t('focus.pomoCycleLabel', { cycle: props.pomodoroCycleCount })
  return `${t('focus.zen.modePomodoroLabel')} • ${cycleText}`
})

const displayTitle = computed(() => {
  if (props.isBreakPhase) {
    return props.pomodoroPhase === 'long_break'
      ? t('focus.pomoLongBreak')
      : t('focus.pomoShortBreak')
  }
  return props.topicTitle.trim() || t('focus.zen.freeFocusTitle')
})

function confirmCancel(): void {
  confirmingCancel.value = false
  emit('cancel')
}
</script>

<style scoped>
.ritme-zen-shell {
  min-height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: calc(var(--ion-safe-area-top, 0px) + 20px) 6px 18px;
}

.ritme-zen-status-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.ritme-zen-heading {
  max-width: 310px;
  margin-bottom: 22px;
}

.ritme-zen-topic {
  margin: 0;
  font-size: 1.12rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--ritme-text-primary);
  word-break: normal;
  overflow-wrap: break-word;
}

.ritme-zen-ring-wrap {
  position: relative;
  width: 236px;
  height: 236px;
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ritme-zen-ring-svg {
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
}

.ritme-zen-ring-track {
  stroke: var(--ritme-ring-track);
}

.ritme-zen-ring-progress {
  stroke: var(--ritme-text-primary);
  transition: stroke-dashoffset 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ritme-zen-time-core {
  position: relative;
  z-index: 1;
}

.ritme-zen-time-text {
  font-size: 3.1rem;
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.ritme-zen-controls {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.ritme-zen-primary-row {
  width: 100%;
  display: flex;
  gap: 10px;
}

.ritme-zen-btn {
  flex: 1;
  min-height: 48px;
  padding: 0 14px;
  border-radius: var(--ritme-radius-pill);
  font-family: var(--ion-font-family);
  font-size: 0.86rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: transform var(--ritme-motion-fast), opacity var(--ritme-motion-fast), background-color var(--ritme-motion-fast);
}

.ritme-zen-btn:active {
  opacity: 0.86;
  transform: scale(0.97);
}

.ritme-zen-btn-primary {
  background: var(--ritme-btn-primary-bg);
  color: var(--ritme-btn-primary-text);
  border: 1px solid var(--ritme-btn-primary-border);
  box-shadow: var(--ritme-btn-primary-shadow);
}

.ritme-zen-btn-glass {
  background: var(--ritme-glass-surface-strong);
  color: var(--ritme-text-primary);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
}

.ritme-zen-cancel-link {
  min-height: 40px;
  padding: 0 16px;
  border-radius: var(--ritme-radius-pill);
  background: transparent;
  border: 1px solid transparent;
  color: var(--ritme-text-secondary);
  font-family: var(--ion-font-family);
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: color var(--ritme-motion-fast), opacity var(--ritme-motion-fast);
}

.ritme-zen-cancel-link:active {
  opacity: 0.75;
}

.ritme-zen-cancel-confirm {
  width: 100%;
  padding: 12px 14px;
  border-radius: var(--ritme-radius-md);
  background: var(--ritme-glass-surface);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-shadow), var(--ritme-glass-inset);
  text-align: left;
}
</style>
