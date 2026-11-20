<template>
  <div class="ritme-card">
    <div class="ritme-section-header" style="align-items: center;">
      <h2 class="ritme-section-title">{{ t('home.todaysQuests') }}</h2>
      <span
        class="ritme-badge"
        :class="{
          'ritme-badge-success':
            activeTabSummary.total > 0 &&
            activeTabSummary.done === activeTabSummary.total,
        }"
      >
        {{
          t('home.questsCompleted', {
            done: activeTabSummary.done,
            total: activeTabSummary.total,
          })
        }}
      </span>
    </div>

    <!-- Quest 2.0 Category Tabs -->
    <div
      class="ritme-pill-strip"
      style="margin-bottom: 12px;"
    >
      <button
        v-for="tab in questTabs"
        :key="tab.key"
        type="button"
        class="ritme-btn-outline"
        style="height: 30px; padding: 0 11px; font-size: 0.74rem; white-space: nowrap;"
        :style="{
          background:
            activeTab === tab.key
              ? 'rgba(139, 124, 255, 0.2)'
              : 'var(--ritme-bg-elevated)',
          borderColor:
            activeTab === tab.key
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-border-line)',
          color:
            activeTab === tab.key
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-text-secondary)',
        }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Daily / Weekly / Main & Side Quests -->
    <div v-if="activeTab !== 'custom'">
      <!-- Optional Weekly Goal Editor (PRD Phase 6: Customizable Weekly Goals) -->
      <div v-if="activeTab === 'weekly'" style="margin-bottom: 10px;">
        <div style="display: flex; justify-content: flex-end;">
          <button
            type="button"
            class="ritme-btn-outline"
            style="height: 28px; padding: 0 10px; font-size: 0.72rem;"
            @click="showWeeklyEditor = !showWeeklyEditor"
          >
            {{
              showWeeklyEditor
                ? t('learning.cancelBtn')
                : t('quests.editWeeklyGoalsBtn')
            }}
          </button>
        </div>

        <div
          v-if="showWeeklyEditor"
          style="margin-top: 8px; padding: 10px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line);"
        >
          <div class="ritme-grid-3" style="margin-bottom: 8px;">
            <div>
              <label class="ritme-label">{{ t('quests.weeklyGoalMinsLabel') }}</label>
              <input
                v-model.number="weeklyMinsInput"
                type="number"
                min="30"
                max="600"
                class="ritme-input"
              />
            </div>
            <div>
              <label class="ritme-label">{{ t('quests.weeklyGoalQsLabel') }}</label>
              <input
                v-model.number="weeklyQsInput"
                type="number"
                min="1"
                max="100"
                class="ritme-input"
              />
            </div>
            <div>
              <label class="ritme-label">{{ t('quests.weeklyGoalDaysLabel') }}</label>
              <input
                v-model.number="weeklyDaysInput"
                type="number"
                min="1"
                max="7"
                class="ritme-input"
              />
            </div>
          </div>
          <button
            type="button"
            class="ritme-btn-primary"
            style="height: 34px; font-size: 0.78rem;"
            @click="saveWeeklyGoals"
          >
            {{ t('quests.saveWeeklyGoalsBtn') }}
          </button>
        </div>
      </div>

      <div
        v-for="quest in displayedSystemQuests"
        :key="quest.id"
        class="ritme-list-item"
        :class="{ 'is-completed': quest.completed }"
      >
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <ion-icon
            :icon="quest.completed ? checkmarkCircle : ellipseOutline"
            :style="{
              fontSize: '1.35rem',
              flexShrink: 0,
              color: quest.completed
                ? 'var(--ritme-accent-secondary)'
                : 'var(--ritme-text-secondary)',
            }"
          />
          <div style="min-width: 0;">
            <div
              :style="{
                fontWeight: 600,
                fontSize: '0.88rem',
                color: quest.completed
                  ? 'var(--ritme-text-secondary)'
                  : 'var(--ritme-text-primary)',
                textDecoration: quest.completed ? 'line-through' : 'none',
              }"
            >
              {{ t(quest.titleKey, quest.titleParams || {}) }}
            </div>
            <div class="ritme-subtitle" style="font-size: 0.76rem; margin-top: 2px;">
              {{ t(quest.descKey) }}
            </div>
            <div
              v-if="quest.targetProgress !== undefined"
              style="font-size: 0.72rem; font-weight: 700; margin-top: 4px;"
              :style="{
                color: quest.completed
                  ? 'var(--ritme-accent-secondary)'
                  : 'var(--ritme-accent-primary)',
              }"
            >
              {{
                t(`quests.progressUnit.${quest.progressUnit || 'steps'}`, {
                  current: quest.currentProgress ?? 0,
                  target: quest.targetProgress,
                })
              }}
            </div>
          </div>
        </div>

        <div
          style="display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; gap: 3px;"
        >
          <span class="ritme-badge ritme-badge-gold">
            +{{ quest.xpReward }} XP
          </span>
          <span
            style="font-size: 0.7rem; font-weight: 700;"
            :style="{
              color: quest.completed
                ? 'var(--ritme-accent-secondary)'
                : 'var(--ritme-text-secondary)',
            }"
          >
            {{ quest.completed ? t('home.questDone') : t('home.questPending') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Custom Quests Tab -->
    <div v-else>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 10px;">
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 30px; padding: 0 11px; font-size: 0.74rem;"
          @click="showAddCustom = !showAddCustom"
        >
          {{ showAddCustom ? t('learning.cancelBtn') : t('quests.addCustomBtn') }}
        </button>
      </div>

      <div
        v-if="showAddCustom"
        style="padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line); margin-bottom: 12px;"
      >
        <div class="ritme-form-group">
          <input
            v-model="customTitle"
            type="text"
            class="ritme-input"
            :placeholder="t('quests.customTitlePlaceholder')"
          />
        </div>
        <div class="ritme-form-group">
          <input
            v-model="customDesc"
            type="text"
            class="ritme-input"
            :placeholder="t('quests.customDescPlaceholder')"
          />
        </div>
        <div class="ritme-grid-2" style="margin-bottom: 10px;">
          <div>
            <label class="ritme-label">{{ t('quests.customTargetLabel') }}</label>
            <input
              v-model.number="customTarget"
              type="number"
              min="1"
              max="20"
              class="ritme-input"
            />
          </div>
          <div>
            <label class="ritme-label">{{ t('quests.customXpLabel') }}</label>
            <input
              v-model.number="customXp"
              type="number"
              min="5"
              max="30"
              class="ritme-input"
            />
          </div>
        </div>
        <button
          type="button"
          class="ritme-btn-primary"
          style="height: 38px; font-size: 0.84rem;"
          @click="handleAddCustomQuest"
        >
          {{ t('quests.saveCustomBtn') }}
        </button>
      </div>

      <p
        v-if="gamificationStore.customQuests.length === 0"
        class="ritme-subtitle"
        style="text-align: center; padding: 10px 0;"
      >
        {{ t('quests.emptyCustomQuests') }}
      </p>

      <div
        v-for="cq in gamificationStore.customQuests"
        :key="cq.id"
        class="ritme-list-item"
        :class="{ 'is-completed': cq.completed }"
      >
        <div style="min-width: 0; flex: 1;">
          <div
            :style="{
              fontWeight: 600,
              fontSize: '0.88rem',
              color: cq.completed
                ? 'var(--ritme-text-secondary)'
                : 'var(--ritme-text-primary)',
              textDecoration: cq.completed ? 'line-through' : 'none',
            }"
          >
            {{ cq.title }}
          </div>
          <div
            v-if="cq.description"
            class="ritme-subtitle"
            style="font-size: 0.76rem; margin-top: 2px;"
          >
            {{ cq.description }}
          </div>
          <div
            style="font-size: 0.72rem; font-weight: 700; color: var(--ritme-accent-secondary); margin-top: 4px;"
          >
            {{
              t('quests.customProgress', {
                current: cq.currentCount,
                target: cq.targetCount,
              })
            }}
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <span class="ritme-badge ritme-badge-gold">+{{ cq.xpReward }} XP</span>
          <button
            v-if="!cq.completed"
            type="button"
            class="ritme-btn-outline"
            style="height: 28px; padding: 0 9px; font-size: 0.72rem; color: var(--ritme-accent-secondary);"
            @click="gamificationStore.incrementCustomQuestProgress(cq.id)"
          >
            {{ t('quests.stepBtn') }}
          </button>
          <button
            type="button"
            class="ritme-btn-outline"
            style="height: 28px; padding: 0 8px; font-size: 0.72rem; color: var(--ritme-danger);"
            @click="gamificationStore.deleteCustomQuest(cq.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IonIcon } from '@ionic/vue'
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useUserStore } from '@/stores/userStore'

const { t } = useI18n()
const gamificationStore = useGamificationStore()
const userStore = useUserStore()

const activeTab = ref<'daily' | 'weekly' | 'main' | 'custom'>('daily')
const showAddCustom = ref(false)
const showWeeklyEditor = ref(false)
const weeklyMinsInput = ref(userStore.settings.weeklyFocusTargetMinutes || 120)
const weeklyQsInput = ref(userStore.settings.weeklyPracticeTargetQuestions || 5)
const weeklyDaysInput = ref(userStore.settings.weeklyStreakTargetDays || 4)
const customTitle = ref('')
const customDesc = ref('')
const customTarget = ref(1)
const customXp = ref(10)

watch(
  () => userStore.settings,
  (s) => {
    weeklyMinsInput.value = s.weeklyFocusTargetMinutes || 120
    weeklyQsInput.value = s.weeklyPracticeTargetQuestions || 5
    weeklyDaysInput.value = s.weeklyStreakTargetDays || 4
  },
  { deep: true }
)

async function saveWeeklyGoals(): Promise<void> {
  const mins = Math.max(30, Math.min(600, Math.round(Number(weeklyMinsInput.value) || 120)))
  const qs = Math.max(1, Math.min(100, Math.round(Number(weeklyQsInput.value) || 5)))
  const days = Math.max(1, Math.min(7, Math.round(Number(weeklyDaysInput.value) || 4)))
  await userStore.updateSettings({
    weeklyFocusTargetMinutes: mins,
    weeklyPracticeTargetQuestions: qs,
    weeklyStreakTargetDays: days,
  })
  await gamificationStore.syncAllQuestRewards()
  showWeeklyEditor.value = false
}

const questTabs = computed(() => [
  { key: 'daily' as const, label: t('quests.tabDaily') },
  { key: 'weekly' as const, label: t('quests.tabWeekly') },
  { key: 'main' as const, label: t('quests.tabMain') },
  { key: 'custom' as const, label: t('quests.tabCustom') },
])

const displayedSystemQuests = computed(() => {
  if (activeTab.value === 'weekly') {
    return gamificationStore.weeklyQuests
  }
  if (activeTab.value === 'main') {
    return [...gamificationStore.mainQuests, ...gamificationStore.sideQuests]
  }
  return gamificationStore.todayQuests
})

const activeTabSummary = computed(() => {
  if (activeTab.value === 'custom') {
    const list = gamificationStore.customQuests
    return {
      done: list.filter((q) => q.completed).length,
      total: list.length,
    }
  }
  const list = displayedSystemQuests.value
  return {
    done: list.filter((q) => q.completed).length,
    total: list.length,
  }
})

async function handleAddCustomQuest() {
  if (!customTitle.value.trim()) return
  await gamificationStore.addCustomQuest({
    title: customTitle.value,
    description: customDesc.value,
    targetCount: customTarget.value,
    xpReward: customXp.value,
  })
  customTitle.value = ''
  customDesc.value = ''
  customTarget.value = 1
  customXp.value = 10
  showAddCustom.value = false
}
</script>
