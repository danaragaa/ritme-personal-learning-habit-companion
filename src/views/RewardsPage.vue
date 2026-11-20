<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" />
        </ion-buttons>
        <ion-title>{{ t('rewards.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-page-container">
        <!-- Available XP Balance Card (Aurora Quest Hero + Gold Token) -->
        <div class="ritme-card ritme-hero-card">
          <div class="ritme-section-header" style="align-items: center;">
            <div>
              <div class="ritme-subtitle">{{ t('rewards.availableBalance') }}</div>
              <div
                class="ritme-title-row"
                style="font-size: 1.85rem; font-weight: 800; color: var(--ritme-gold); margin-top: 4px;"
              >
                <ion-icon :icon="flashOutline" style="font-size: 1.45rem;" />
                <span>{{ gamificationStore.availableXP }} XP</span>
              </div>
            </div>
            <span class="ritme-badge ritme-badge-gold">
              {{ t('home.level', { level: gamificationStore.currentLevel }) }}
            </span>
          </div>

          <div class="ritme-subtitle" style="font-size: 0.8rem; margin-bottom: 6px;">
            {{
              t('rewards.earnedAndSpent', {
                earned: gamificationStore.totalXP,
                spent: gamificationStore.totalSpentXP,
              })
            }}
          </div>
          <div class="ritme-subtitle" style="font-size: 0.76rem;">
            {{ t('rewards.commitmentNote') }}
          </div>
        </div>

        <!-- Redemption Feedback Banner -->
        <div
          v-if="redeemBannerMessage"
          class="ritme-card ritme-title-row"
          style="width: 100%; border-color: var(--ritme-gold-border); color: var(--ritme-gold); font-weight: 700; font-size: 0.88rem;"
        >
          <ion-icon :icon="giftOutline" style="font-size: 1.05rem; flex-shrink: 0;" />
          <span>{{ redeemBannerMessage }}</span>
        </div>

        <!-- Add / Edit Personal Reward Form Card -->
        <div
          v-if="showRewardForm"
          class="ritme-card"
          style="border-color: var(--ritme-accent-primary);"
        >
          <h2 class="ritme-section-title" style="margin-bottom: 12px;">
            {{
              editingRewardId
                ? t('rewards.editRewardTitle')
                : t('rewards.newRewardTitle')
            }}
          </h2>

          <div style="margin-bottom: 10px;">
            <label
              class="ritme-subtitle"
              for="reward-title-input"
              style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
            >
              {{ t('rewards.titleLabel') }}
            </label>
            <input
              id="reward-title-input"
              v-model="formTitle"
              type="text"
              :placeholder="t('rewards.titlePlaceholder')"
              class="ritme-input"
            />
          </div>

          <div style="margin-bottom: 10px;">
            <label
              class="ritme-subtitle"
              for="reward-desc-input"
              style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
            >
              {{ t('rewards.descLabel') }}
            </label>
            <input
              id="reward-desc-input"
              v-model="formDescription"
              type="text"
              :placeholder="t('rewards.descPlaceholder')"
              class="ritme-input"
            />
          </div>

          <div style="margin-bottom: 12px;">
            <label
              class="ritme-subtitle"
              for="reward-cost-input"
              style="display: block; margin-bottom: 4px; font-size: 0.8rem;"
            >
              {{ t('rewards.costLabel') }}
            </label>
            <input
              id="reward-cost-input"
              v-model.number="formXpCost"
              type="number"
              min="5"
              max="5000"
              step="5"
              class="ritme-input"
            />
          </div>

          <!-- Delete Confirmation Box -->
          <div
            v-if="confirmingDeleteId === editingRewardId && editingRewardId"
            class="ritme-list-item"
            style="margin-bottom: 10px; border-color: var(--ritme-danger);"
          >
            <span
              style="font-size: 0.84rem; color: var(--ritme-danger); font-weight: 600;"
            >
              {{ t('rewards.confirmDeleteMsg') }}
            </span>
            <div style="display: flex; gap: 6px;">
              <ion-button
                size="small"
                color="danger"
                @click="handleDeleteConfirmed(editingRewardId)"
              >
                {{ t('rewards.confirmDeleteYes') }}
              </ion-button>
              <ion-button
                size="small"
                fill="outline"
                @click="confirmingDeleteId = null"
              >
                {{ t('rewards.cancelBtn') }}
              </ion-button>
            </div>
          </div>

          <div
            style="display: flex; justify-content: space-between; gap: 8px; flex-wrap: wrap;"
          >
            <div style="display: flex; gap: 8px;">
              <ion-button
                size="small"
                color="primary"
                style="font-weight: 700;"
                @click="handleSaveRewardForm"
              >
                {{ t('rewards.saveBtn') }}
              </ion-button>
              <ion-button
                size="small"
                fill="outline"
                color="secondary"
                @click="closeRewardForm"
              >
                {{ t('rewards.cancelBtn') }}
              </ion-button>
            </div>

            <ion-button
              v-if="editingRewardId && confirmingDeleteId !== editingRewardId"
              size="small"
              fill="clear"
              color="danger"
              @click="confirmingDeleteId = editingRewardId"
            >
              <ion-icon slot="start" :icon="trashOutline" />
              {{ t('rewards.deleteBtn') }}
            </ion-button>
          </div>
        </div>

        <!-- Available Rewards List Card -->
        <div class="ritme-card">
          <div class="ritme-section-header" style="align-items: center;">
            <h2 class="ritme-section-title">{{ t('rewards.storeTitle') }}</h2>
            <ion-button
              size="small"
              color="primary"
              style="font-weight: 700; margin: 0;"
              @click="openNewRewardForm"
            >
              {{ t('rewards.addRewardBtn') }}
            </ion-button>
          </div>

          <div
            v-if="gamificationStore.activeRewards.length === 0"
            class="ritme-subtitle"
          >
            {{ t('rewards.emptyRewards') }}
          </div>

          <div v-else>
            <div
              v-for="reward in gamificationStore.activeRewards"
              :key="reward.id"
              class="ritme-list-item"
              style="display: block;"
            >
              <div
                style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;"
              >
                <div style="min-width: 0; flex: 1;">
                  <div
                    style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;"
                  >
                    <span style="font-weight: 700; font-size: 0.92rem;">
                      {{ resolveRewardText(reward.title) }}
                    </span>
                    <span class="ritme-badge ritme-badge-gold">
                      {{ reward.xpCost }} XP
                    </span>
                  </div>
                  <div
                    v-if="reward.description"
                    class="ritme-subtitle"
                    style="font-size: 0.78rem; margin-top: 3px;"
                  >
                    {{ resolveRewardText(reward.description) }}
                  </div>
                </div>

                <div
                  style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;"
                >
                  <ion-button
                    size="small"
                    color="primary"
                    :disabled="gamificationStore.availableXP < reward.xpCost"
                    style="font-weight: 700; margin: 0;"
                    @click="requestRedeemConfirmation(reward.id)"
                  >
                    {{
                      gamificationStore.availableXP >= reward.xpCost
                        ? t('rewards.redeemBtn')
                        : t('rewards.needMoreXp', {
                            missing:
                              reward.xpCost - gamificationStore.availableXP,
                          })
                    }}
                  </ion-button>
                  <button
                    type="button"
                    class="ritme-icon-btn"
                    aria-label="Edit Reward"
                    @click="openEditRewardForm(reward)"
                  >
                    <ion-icon :icon="createOutline" />
                  </button>
                </div>
              </div>

              <!-- Redeem Confirmation Box (PRD 2.0 Section 5.6 F) -->
              <div
                v-if="confirmingRedeemId === reward.id"
                style="margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--ritme-border); display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap;"
              >
                <span
                  style="font-size: 0.8rem; font-weight: 700; color: var(--ritme-gold);"
                >
                  {{
                    t('rewards.confirmRedeemMsg', {
                      title: resolveRewardText(reward.title),
                      cost: reward.xpCost,
                    })
                  }}
                </span>
                <div style="display: flex; gap: 6px;">
                  <ion-button
                    size="small"
                    color="primary"
                    style="font-weight: 700; margin: 0;"
                    @click="handleRedeemConfirmed(reward)"
                  >
                    {{ t('rewards.confirmRedeemYes') }}
                  </ion-button>
                  <ion-button
                    size="small"
                    fill="outline"
                    color="secondary"
                    style="margin: 0;"
                    @click="confirmingRedeemId = null"
                  >
                    {{ t('rewards.cancelBtn') }}
                  </ion-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reward Redemption History Card -->
        <div class="ritme-card">
          <div class="ritme-section-header" style="align-items: center;">
            <h2 class="ritme-section-title">{{ t('rewards.historyTitle') }}</h2>
            <span class="ritme-badge">
              {{ gamificationStore.sortedRedemptions.length }}
            </span>
          </div>

          <div
            v-if="gamificationStore.sortedRedemptions.length === 0"
            class="ritme-subtitle"
          >
            {{ t('rewards.historyEmpty') }}
          </div>

          <div v-else>
            <div
              v-for="item in gamificationStore.sortedRedemptions"
              :key="item.id"
              class="ritme-list-item"
            >
              <div style="min-width: 0;">
                <div style="font-weight: 600; font-size: 0.88rem;">
                  {{ resolveRewardText(item.title) }}
                </div>
                <div class="ritme-subtitle" style="font-size: 0.75rem; margin-top: 2px;">
                  {{ formatRedemptionTime(item.redeemedAt) }}
                </div>
              </div>
              <span class="ritme-badge ritme-badge-gold" style="flex-shrink: 0;">
                -{{ item.xpCost }} XP
              </span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/vue'
import { createOutline, flashOutline, giftOutline, trashOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'
import type { PersonalReward } from '@/types'

const { t, te } = useI18n()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

const showRewardForm = ref(false)
const editingRewardId = ref<string | null>(null)
const confirmingDeleteId = ref<string | null>(null)
const confirmingRedeemId = ref<string | null>(null)
const formTitle = ref('')
const formDescription = ref('')
const formXpCost = ref<number>(30)
const redeemBannerMessage = ref('')

function resolveRewardText(keyOrText: string): string {
  return te(keyOrText) ? t(keyOrText) : keyOrText
}

function openNewRewardForm(): void {
  editingRewardId.value = null
  confirmingDeleteId.value = null
  formTitle.value = ''
  formDescription.value = ''
  formXpCost.value = 30
  showRewardForm.value = true
}

function openEditRewardForm(reward: PersonalReward): void {
  editingRewardId.value = reward.id
  confirmingDeleteId.value = null
  formTitle.value = resolveRewardText(reward.title)
  formDescription.value = resolveRewardText(reward.description)
  formXpCost.value = reward.xpCost
  showRewardForm.value = true
}

function closeRewardForm(): void {
  showRewardForm.value = false
  editingRewardId.value = null
  confirmingDeleteId.value = null
}

async function handleSaveRewardForm(): Promise<void> {
  if (!formTitle.value.trim()) return

  if (editingRewardId.value) {
    await gamificationStore.updatePersonalReward(editingRewardId.value, {
      title: formTitle.value,
      description: formDescription.value,
      xpCost: formXpCost.value,
    })
  } else {
    await gamificationStore.addPersonalReward({
      title: formTitle.value,
      description: formDescription.value,
      xpCost: formXpCost.value,
    })
  }

  closeRewardForm()
}

async function handleDeleteConfirmed(rewardId: string): Promise<void> {
  await gamificationStore.deletePersonalReward(rewardId)
  closeRewardForm()
}

function requestRedeemConfirmation(rewardId: string): void {
  redeemBannerMessage.value = ''
  confirmingRedeemId.value =
    confirmingRedeemId.value === rewardId ? null : rewardId
}

async function handleRedeemConfirmed(reward: PersonalReward): Promise<void> {
  confirmingRedeemId.value = null
  redeemBannerMessage.value = ''
  const localizedTitle = resolveRewardText(reward.title)
  const record = await gamificationStore.redeemReward(
    reward.id,
    localizedTitle
  )
  if (record) {
    redeemBannerMessage.value = t('rewards.redeemedSuccess', {
      title: localizedTitle,
      cost: record.xpCost,
    })
  }
}

function formatRedemptionTime(isoString: string): string {
  return new Intl.DateTimeFormat(
    userStore.settings.language === 'id' ? 'id-ID' : 'en-US',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(new Date(isoString))
}
</script>
