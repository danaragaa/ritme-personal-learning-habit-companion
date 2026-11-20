<template>
  <div class="ritme-completion-shell">
    <section class="ritme-card ritme-completion-card">
      <div class="ritme-completion-icon">
        <ion-icon :icon="checkmarkCircleOutline" style="font-size: 1.75rem;" />
      </div>

      <span class="ritme-badge ritme-glass-chip" style="margin-bottom: 8px;">
        {{ t('focus.zen.completionStatusBadge') }}
      </span>

      <h1 class="ritme-completion-title">
        {{
          summary.isBreak
            ? t('focus.breakCompletionTitle')
            : t('focus.completionTitle')
        }}
      </h1>

      <div class="ritme-completion-duration">
        {{ formattedActualDuration }}
      </div>

      <!-- Concise Summary Details -->
      <div class="ritme-completion-rows">
        <div v-if="!summary.isBreak" class="ritme-list-item ritme-completion-row">
          <span class="ritme-subtitle" style="font-size: 0.78rem;">
            {{ t('focus.zen.completionTopicLabel') }}
          </span>
          <span class="ritme-completion-val">{{ displayTopic }}</span>
        </div>

        <div class="ritme-list-item ritme-completion-row">
          <span class="ritme-subtitle" style="font-size: 0.78rem;">
            {{ t('focus.zen.completionModeLabel') }}
          </span>
          <span class="ritme-completion-val">{{ modeLabel }}</span>
        </div>

        <div
          v-if="!summary.isBreak && summary.xpEarned > 0"
          class="ritme-list-item ritme-completion-row"
        >
          <span class="ritme-subtitle" style="font-size: 0.78rem;">
            {{ t('focus.zen.completionXpLabel') }}
          </span>
          <span class="ritme-badge ritme-glass-chip">
            <ion-icon :icon="flashOutline" style="font-size: 0.8rem;" />
            +{{ summary.xpEarned }} XP
          </span>
        </div>
      </div>

      <!-- Primary & Optional Break CTA -->
      <ion-button
        expand="block"
        class="ritme-focus-cta"
        style="margin: 0;"
        @click="$emit('done')"
      >
        {{ t('focus.zen.completionDoneBtn') }}
      </ion-button>

      <button
        v-if="showStartBreakAction"
        type="button"
        class="ritme-glass-pill"
        style="width: 100%; min-height: 42px; margin-top: 10px;"
        @click="$emit('start-break')"
      >
        <ion-icon :icon="cafeOutline" style="font-size: 0.95rem;" />
        {{ t('focus.zen.completionStartBreakBtn') }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import {
  cafeOutline,
  checkmarkCircleOutline,
  flashOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import type { FocusCompletionSummary } from '@/stores/focusStore'

const props = defineProps<{
  summary: FocusCompletionSummary
  resolvedTopicLabel: string
  showStartBreakAction: boolean
}>()

defineEmits<{
  done: []
  'start-break': []
}>()

const { t } = useI18n()

const formattedActualDuration = computed(() => {
  if (props.summary.durationMinutes > 0) {
    return t('focus.zen.completionMinutesValue', {
      minutes: props.summary.durationMinutes,
    })
  }
  if (props.summary.effectiveSeconds > 0) {
    return t('focus.zen.completionUnderMinute', {
      seconds: props.summary.effectiveSeconds,
    })
  }
  return t('focus.zen.completionMinutesValue', { minutes: 0 })
})

const displayTopic = computed(
  () => props.resolvedTopicLabel.trim() || t('focus.zen.freeFocusTitle')
)

const modeLabel = computed(() =>
  props.summary.focusMode === 'pomodoro'
    ? t('focus.zen.modePomodoroLabel')
    : t('focus.zen.modeFreeLabel')
)
</script>

<style scoped>
.ritme-completion-shell {
  min-height: calc(100vh - 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
}

.ritme-completion-card {
  width: 100%;
  text-align: center;
  padding: 24px 18px;
}

.ritme-completion-icon {
  width: 54px;
  height: 54px;
  margin: 0 auto 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ritme-glass-surface-strong);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
  color: var(--ritme-text-primary);
}

.ritme-completion-title {
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--ritme-text-primary);
}

.ritme-completion-duration {
  font-variant-numeric: tabular-nums;
  font-size: 1.85rem;
  font-weight: 800;
  color: var(--ritme-text-primary);
  margin-bottom: 18px;
}

.ritme-completion-rows {
  text-align: left;
  margin-bottom: 18px;
}

.ritme-completion-row {
  min-height: 44px;
  padding: 10px 12px;
  gap: 12px;
}

.ritme-completion-val {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--ritme-text-primary);
  text-align: right;
  min-width: 0;
  overflow-wrap: break-word;
}
</style>
