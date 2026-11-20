<template>
  <div
    v-if="visibleCelebration"
    :key="visibleCelebration.id"
    role="status"
    aria-live="polite"
    class="ritme-xp-overlay"
  >
    <!-- Lightweight Level-Up Toast (Neutral Monochrome Liquid Glass) -->
    <div
      v-if="visibleCelebration.kind === 'level_up'"
      class="ritme-xp-toast ritme-xp-toast-level"
    >
      <span class="ritme-xp-toast-icon" aria-hidden="true">
        <ion-icon :icon="arrowUpCircleOutline" style="font-size: 1.15rem;" />
      </span>

      <div class="ritme-xp-toast-body">
        <div class="ritme-xp-toast-title">
          {{ t('gamification.levelUpTitle') }}
        </div>
        <div class="ritme-xp-toast-sub">
          {{
            t('gamification.levelUpTransition', {
              prev: resolvedPrevLevel,
              next: visibleCelebration.newLevel ?? 2,
            })
          }}
        </div>
      </div>

      <span
        v-if="(visibleCelebration.xpAmount || 0) > 0"
        class="ritme-badge ritme-glass-chip"
        style="flex-shrink: 0;"
      >
        +{{ visibleCelebration.xpAmount }} XP
      </span>
    </div>

    <!-- Lightweight Floating XP Pill -->
    <div
      v-else
      class="ritme-xp-toast ritme-xp-toast-xp"
    >
      <ion-icon :icon="flashOutline" style="font-size: 0.96rem;" />
      <span>
        {{
          t('gamification.xpEarnedPill', {
            amount: visibleCelebration.xpAmount ?? 0,
          })
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { arrowUpCircleOutline, flashOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '@/stores/gamificationStore'

const { t } = useI18n()
const gamificationStore = useGamificationStore()

// Strictly permit only lightweight 'xp' and 'level_up' feedback (TASK 07)
const visibleCelebration = computed(() => {
  const active = gamificationStore.activeCelebration
  if (!active) return null
  if (active.kind === 'xp' || active.kind === 'level_up') return active
  return null
})

const resolvedPrevLevel = computed(() => {
  const active = visibleCelebration.value
  if (!active) return 1
  if (typeof active.previousLevel === 'number' && active.previousLevel >= 1) {
    return active.previousLevel
  }
  return Math.max(1, (active.newLevel ?? 2) - 1)
})
</script>

<style scoped>
.ritme-xp-overlay {
  position: fixed;
  top: calc(env(safe-area-inset-top, 0px) + 64px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  max-width: min(92vw, 340px);
  animation: ritme-toast-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.ritme-xp-toast {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--ritme-radius-pill);
  background: var(--ritme-modal-glass-bg);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset), var(--ritme-glass-shadow);
  backdrop-filter: blur(var(--ritme-blur-modal)) saturate(var(--ritme-glass-saturate));
  -webkit-backdrop-filter: blur(var(--ritme-blur-modal)) saturate(var(--ritme-glass-saturate));
  color: var(--ritme-text-primary);
}

.ritme-xp-toast-xp {
  padding: 8px 15px;
  font-size: 0.82rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.ritme-xp-toast-level {
  padding: 9px 14px;
  gap: 10px;
}

.ritme-xp-toast-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--ritme-glass-surface-strong);
  border: 1px solid var(--ritme-glass-border);
  color: var(--ritme-text-primary);
  flex-shrink: 0;
}

.ritme-xp-toast-body {
  min-width: 0;
}

.ritme-xp-toast-title {
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--ritme-text-primary);
}

.ritme-xp-toast-sub {
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--ritme-text-secondary);
  font-variant-numeric: tabular-nums;
  margin-top: 1px;
}

@keyframes ritme-toast-in {
  from {
    opacity: 0;
    transform: translate(-50%, -8px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}
</style>
