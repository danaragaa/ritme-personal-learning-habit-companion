<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title ritme-title-row">
          <ion-icon :icon="ribbonOutline" style="color: var(--ritme-gold);" />
          <span>{{ t('progress.titlesRelicsTitle') }}</span>
        </h2>
        <p class="ritme-subtitle" style="margin-top: 2px;">
          {{ t('progress.titlesRelicsSubtitle') }}
        </p>
      </div>
      <span class="ritme-badge ritme-badge-gold">
        {{ unlockedRelicsCount }}/7
      </span>
    </div>

    <!-- Interactive Equipable Titles -->
    <div style="margin-bottom: 14px;">
      <div
        class="ritme-subtitle"
        style="font-size: 0.76rem; font-weight: 700; margin-bottom: 8px;"
      >
        {{ t('progress.equipTitleLabel') }}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 8px;">
        <button
          v-for="item in gamificationStore.adventurerTitles"
          :key="item.id"
          type="button"
          class="ritme-pill-tab"
          :disabled="!item.unlocked"
          style="text-align: left; padding: 9px 10px; border-radius: var(--ritme-radius-md); cursor: pointer;"
          :style="{
            background: isEquipped(item.id)
              ? 'var(--ritme-gold-soft)'
              : item.unlocked
                ? 'var(--ritme-bg-elevated)'
                : 'var(--ritme-surface-subtle)',
            border: isEquipped(item.id)
              ? '1px solid var(--ritme-gold-border)'
              : '1px solid var(--ritme-border-line)',
            opacity: item.unlocked ? 1 : 0.62,
          }"
          @click="handleEquip(item.id)"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; margin-bottom: 3px;">
            <span
              style="font-size: 0.78rem; font-weight: 800;"
              :style="{
                color: isEquipped(item.id)
                  ? 'var(--ritme-gold)'
                  : 'var(--ritme-text-primary)',
              }"
            >
              {{ t(item.titleKey) }}
            </span>
            <ion-icon
              :icon="
                isEquipped(item.id)
                  ? checkmarkCircle
                  : item.unlocked
                    ? ribbonOutline
                    : lockClosedOutline
              "
              :style="{
                fontSize: '0.88rem',
                flexShrink: 0,
                color: isEquipped(item.id)
                  ? 'var(--ritme-gold)'
                  : 'var(--ritme-text-secondary)',
              }"
            />
          </div>
          <div class="ritme-subtitle" style="font-size: 0.68rem;">
            {{ t(item.conditionKey) }}
          </div>
        </button>
      </div>
    </div>

    <!-- Phase 6 Cosmetic Avatar Frames -->
    <div style="margin-bottom: 14px; padding-top: 10px; border-top: 1px solid var(--ritme-border-line);">
      <div
        class="ritme-subtitle"
        style="font-size: 0.76rem; font-weight: 700; margin-bottom: 8px;"
      >
        {{ t('progress.avatarFramesLabel') }}
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 8px;">
        <button
          v-for="frame in gamificationStore.avatarFrames"
          :key="frame.id"
          type="button"
          class="ritme-pill-tab"
          :disabled="!frame.unlocked"
          style="display: flex; align-items: center; gap: 8px; text-align: left; padding: 8px 10px; border-radius: var(--ritme-radius-md); cursor: pointer;"
          :style="{
            background:
              gamificationStore.equippedFrameId === frame.id
                ? 'var(--ritme-accent-soft)'
                : frame.unlocked
                  ? 'var(--ritme-bg-elevated)'
                  : 'var(--ritme-surface-subtle)',
            border:
              gamificationStore.equippedFrameId === frame.id
                ? '1px solid var(--ritme-accent-primary)'
                : '1px solid var(--ritme-border-line)',
            opacity: frame.unlocked ? 1 : 0.62,
          }"
          @click="handleEquipFrame(frame.id)"
        >
          <span
            class="ritme-avatar-core"
            :class="`ritme-frame-${frame.id}`"
            style="width: 26px; height: 26px; font-size: 0.72rem; flex-shrink: 0;"
          >
            {{ (userStore.settings.displayName || 'R').trim().charAt(0).toUpperCase() || 'R' }}
          </span>
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 0.75rem; font-weight: 800; color: var(--ritme-text-primary);">
              {{ t(frame.titleKey) }}
            </div>
            <div class="ritme-subtitle" style="font-size: 0.64rem;">
              {{ t(frame.conditionKey) }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- 7 Realm Relics Collectibles -->
    <div style="padding-top: 10px; border-top: 1px solid var(--ritme-border-line);">
      <div
        class="ritme-subtitle"
        style="font-size: 0.76rem; font-weight: 700; margin-bottom: 8px;"
      >
        {{ t('progress.realmRelicsLabel') }}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); gap: 8px;">
        <div
          v-for="relic in gamificationStore.realmRelics"
          :key="relic.subtestId"
          style="display: flex; align-items: center; gap: 8px; padding: 8px 9px; border-radius: 10px;"
          :style="{
            background: relic.unlocked
              ? 'var(--ritme-gold-soft)'
              : 'var(--ritme-bg-elevated)',
            border: relic.unlocked
              ? '1px solid var(--ritme-gold-border)'
              : '1px solid var(--ritme-border-line)',
            opacity: relic.unlocked ? 1 : 0.6,
          }"
        >
          <RealmEmblem
            :subtest-id="relic.subtestId"
            :icon-key="relic.icon"
            :size="18"
            :color="
              relic.unlocked
                ? 'var(--ritme-gold)'
                : 'var(--ritme-text-secondary)'
            "
          />
          <div style="min-width: 0; flex: 1;">
            <div style="font-size: 0.72rem; font-weight: 800; color: var(--ritme-text-primary);">
              {{ relic.code }}
            </div>
            <div class="ritme-subtitle" style="font-size: 0.64rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{
                relic.unlocked
                  ? t('progress.unlockedBadge')
                  : t('progress.lockedBadge')
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IonIcon } from '@ionic/vue'
import { checkmarkCircle, lockClosedOutline, ribbonOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'
import { triggerActionHaptic } from '@/services/timer/soundFeedbackService'
import RealmEmblem from '@/components/ui/RealmEmblem.vue'

const { t } = useI18n()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

const unlockedRelicsCount = computed(
  () => gamificationStore.realmRelics.filter((r) => r.unlocked).length
)

function isEquipped(titleId: string): boolean {
  const current = userStore.settings.selectedTitleId || 'default'
  if (current === titleId) return true
  if (titleId === 'default' && !gamificationStore.equippedTitleKey) return true
  return false
}

async function handleEquip(titleId: string): Promise<void> {
  triggerActionHaptic('light')
  await gamificationStore.equipTitle(titleId)
}

async function handleEquipFrame(frameId: string): Promise<void> {
  triggerActionHaptic('light')
  await gamificationStore.equipFrame(frameId)
}
</script>
