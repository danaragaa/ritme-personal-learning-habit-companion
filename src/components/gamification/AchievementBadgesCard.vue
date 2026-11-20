<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <h2 class="ritme-section-title">{{ t('progress.achievementsTitle') }}</h2>
      <span class="ritme-badge ritme-badge-gold ritme-title-row" style="gap: 4px;">
        <ion-icon :icon="trophyOutline" style="font-size: 0.85rem;" />
        {{
          t('progress.achievementsCount', {
            unlocked: gamificationStore.unlockedAchievementsCount,
            total: gamificationStore.achievementsWithProgress.length,
          })
        }}
      </span>
    </div>

    <div>
      <div
        v-for="ach in gamificationStore.achievementsWithProgress"
        :key="ach.id"
        class="ritme-list-item"
        :class="{ 'is-completed': ach.unlocked }"
        style="display: block;"
      >
        <div
          style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;"
        >
          <div style="display: flex; align-items: flex-start; gap: 10px; min-width: 0;">
            <ion-icon
              :icon="ach.unlocked ? trophy : lockClosedOutline"
              :style="{
                fontSize: '1.4rem',
                marginTop: '2px',
                flexShrink: 0,
                color: ach.unlocked
                  ? 'var(--ritme-gold)'
                  : 'var(--ritme-text-secondary)',
              }"
            />
            <div style="min-width: 0;">
              <div
                style="font-weight: 700; font-size: 0.92rem;"
                :style="{
                  color: ach.unlocked
                    ? 'var(--ritme-text-primary)'
                    : 'var(--ritme-text-secondary)',
                }"
              >
                {{ t(ach.title) }}
              </div>
              <div class="ritme-subtitle" style="font-size: 0.78rem; margin-top: 2px;">
                {{ t(ach.description) }}
              </div>
              <div
                v-if="ach.unlocked && ach.unlockedAt"
                class="ritme-subtitle"
                style="font-size: 0.72rem; margin-top: 4px; color: var(--ritme-accent-primary);"
              >
                {{
                  t('progress.unlockedOn', {
                    date: formatUnlockDate(ach.unlockedAt),
                  })
                }}
              </div>
            </div>
          </div>

          <span
            class="ritme-badge"
            :class="{ 'ritme-badge-gold': ach.unlocked }"
            style="flex-shrink: 0;"
            :style="
              !ach.unlocked
                ? {
                    background: 'var(--ritme-surface-subtle)',
                    color: 'var(--ritme-text-secondary)',
                  }
                : {}
            "
          >
            {{
              ach.unlocked
                ? t('progress.unlockedBadge')
                : `${ach.currentValue}/${ach.targetValue}`
            }}
          </span>
        </div>

        <div class="ritme-progress-track" style="height: 6px; margin-top: 8px;">
          <div
            class="ritme-progress-fill"
            :class="{ 'ritme-progress-fill-gold': ach.unlocked }"
            :style="{ width: `${ach.progressPercent}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { trophy, trophyOutline, lockClosedOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'

const { t } = useI18n()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

function formatUnlockDate(isoString: string): string {
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
