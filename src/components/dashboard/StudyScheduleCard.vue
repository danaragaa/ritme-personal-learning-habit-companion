<template>
  <div>
    <!-- Compact Floating Reminder Strip (Kept outside Learning Plan card to prevent bloat) -->
    <div v-if="showStudyReminderBanner" class="ritme-glass-strip">
      <div
        class="ritme-title-row"
        style="min-width: 0; flex: 1; font-size: 0.76rem; font-weight: 600; color: var(--ritme-text-primary); line-height: 1.35;"
      >
        <ion-icon
          :icon="alarmOutline"
          style="font-size: 0.95rem; flex-shrink: 0; color: var(--ritme-text-secondary);"
        />
        <span>
          {{
            t('home.reminderBanner', {
              time: userStore.reminderConfig.morningTime,
            })
          }}
        </span>
      </div>
      <button
        type="button"
        class="ritme-glass-pill"
        @click="handleSnoozeReminder"
      >
        {{
          t('home.snoozeBtn', {
            minutes: userStore.settings.snoozeMinutes || 15,
          })
        }}
      </button>
    </div>

    <div
      v-else-if="lastSnoozedMinutes !== null && userStore.isReminderSnoozed"
      class="ritme-subtitle"
      style="font-size: 0.74rem; color: var(--ritme-text-secondary); margin: 0 2px 10px;"
    >
      {{ t('home.snoozedBannerMsg', { minutes: lastSnoozedMinutes }) }}
    </div>

    <!-- Main Learning Plan Neutral Frosted Card -->
    <div class="ritme-card">
      <div
        class="ritme-section-header"
        style="align-items: center; flex-wrap: nowrap; gap: 8px;"
      >
        <div class="ritme-title-row" style="gap: 6px; min-width: 0; flex: 1;">
          <ion-icon
            :icon="compassOutline"
            style="font-size: 1rem; color: var(--ritme-text-primary); flex-shrink: 0;"
          />
          <h2 class="ritme-section-title" style="font-size: 0.94rem;">
            {{ t('home.planTitle') }}
          </h2>
        </div>

        <button
          type="button"
          class="ritme-glass-pill"
          @click="isEditingSchedule = true"
        >
          {{ t('home.editScheduleBtn') }}
        </button>
      </div>

      <!-- Scheduled Active Plan -->
      <div v-if="scheduledSubtest">
        <div
          style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;"
        >
          <span class="ritme-badge">
            {{ scheduledSubtest.code }} —
            {{
              userStore.settings.language === 'id'
                ? scheduledSubtest.nameId
                : scheduledSubtest.nameEn
            }}
          </span>
          <span class="ritme-subtitle" style="font-size: 0.76rem; font-weight: 600;">
            {{ t('home.planTargetDuration', { minutes: planTargetMinutes }) }}
          </span>
        </div>

        <div v-if="recommendedTopic">
          <div
            style="font-size: 1.05rem; font-weight: 800; color: var(--ritme-text-primary); line-height: 1.3; margin-bottom: 14px;"
          >
            {{ resolveTopicTitle(recommendedTopic) }}
          </div>

          <ion-button
            expand="block"
            class="ritme-focus-cta"
            style="margin: 0;"
            @click="startScheduledFocus"
          >
            <ion-icon slot="start" :icon="playCircleOutline" />
            {{ t('home.startFocusBtn') }}
          </ion-button>
        </div>

        <div v-else>
          <p class="ritme-subtitle" style="margin: 4px 0 10px; font-size: 0.82rem;">
            {{ t('home.noTopicPlanned') }}
          </p>
          <div style="display: flex; gap: 8px;">
            <ion-button
              size="small"
              class="ritme-focus-cta"
              router-link="/tabs/learning"
              style="flex: 1; min-height: 40px; margin: 0;"
            >
              {{ t('home.createPlanBtn') }}
            </ion-button>
            <ion-button
              size="small"
              class="ritme-btn-glass-secondary"
              style="flex: 1; min-height: 40px; margin: 0;"
              @click="startScheduledFocus"
            >
              {{ t('home.startFocusBtn') }}
            </ion-button>
          </div>
        </div>
      </div>

      <!-- Rest Day Empty State -->
      <div v-else>
        <div
          class="ritme-subtitle"
          style="font-size: 0.84rem; color: var(--ritme-text-secondary); font-weight: 600; margin-bottom: 12px;"
        >
          {{ t('home.scheduleRestDay') }}
        </div>
        <ion-button
          size="small"
          class="ritme-btn-glass-secondary"
          style="min-height: 40px; margin: 0;"
          @click="isEditingSchedule = true"
        >
          {{ t('home.createPlanBtn') }}
        </ion-button>
      </div>
    </div>

    <!-- Scrollable Liquid Glass Bottom Sheet Modal for Weekly Subtest Schedule -->
    <ion-modal
      class="ritme-glass-modal"
      :is-open="isEditingSchedule"
      :initial-breakpoint="0.74"
      :breakpoints="[0, 0.74, 0.94]"
      @didDismiss="isEditingSchedule = false"
    >
      <ion-header>
        <ion-toolbar>
          <ion-title style="font-size: 1rem;">
            {{ t('home.weeklyScheduleModalTitle') }}
          </ion-title>
          <ion-buttons slot="end">
            <ion-button @click="isEditingSchedule = false">
              {{ t('home.closeScheduleBtn') }}
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>

      <ion-content :scroll-y="true">
        <div class="ritme-page-container" style="padding-top: 10px;">
          <div class="ritme-card">
            <div
              v-for="dayIdx in [1, 2, 3, 4, 5, 6, 0]"
              :key="dayIdx"
              style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;"
            >
              <span style="font-size: 0.84rem; font-weight: 700; min-width: 72px;">
                {{ t(`days.${dayIdx}`) }}
              </span>

              <span
                v-if="dayIdx === userStore.settings.weeklyRestDay"
                class="ritme-badge"
                style="min-height: 36px; padding: 0 12px; color: var(--ritme-text-secondary);"
              >
                {{ t('habits.restDayBadge') }}
              </span>

              <select
                v-else
                :value="userStore.weeklySchedule[dayIdx]"
                class="ritme-input"
                style="padding: 8px 10px; font-size: 0.84rem; flex: 1; min-height: 42px;"
                @change="onDayScheduleChange(dayIdx, $event)"
              >
                <option
                  v-for="subtest in learningStore.sortedSubtests"
                  :key="subtest.id"
                  :value="subtest.id"
                >
                  {{ subtest.code }} —
                  {{
                    userStore.settings.language === 'id'
                      ? subtest.nameId
                      : subtest.nameEn
                  }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </ion-content>
    </ion-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
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
import { alarmOutline, compassOutline, playCircleOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useLearningStore } from '@/stores/learningStore'
import { useFocusStore } from '@/stores/focusStore'
import { triggerActionHaptic } from '@/services/timer/soundFeedbackService'
import type { LearningTopic } from '@/types'

const SEED_TOPIC_TITLES: Record<string, string> = {
  topic_pu_1: 'Penalaran Induktif & Deduktif',
  topic_pu_2: 'Penalaran Kuantitatif & Pola Bilangan',
  topic_ppu_1: 'Makna Kata, Sinonim & Kepaduan Paragraf',
  topic_pbm_1: 'Ejaan (EYD V), Tanda Baca & Kalimat Efektif',
  topic_pk_1: 'Aljabar & Aritmetika Dasar',
  topic_pk_2: 'Geometri, Fungsi & Peluang Dasar',
  topic_lbi_1: 'Ide Pokok & Simpulan Bacaan',
  topic_lbe_1: 'Main Idea, Inference & Vocabulary in Context',
  topic_pm_1: 'Pemodelan Matematika Kontekstual',
}

const { t, te } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const learningStore = useLearningStore()
const focusStore = useFocusStore()

const isEditingSchedule = ref(false)
const lastSnoozedMinutes = ref<number | null>(null)

const scheduledSubtest = computed(() => {
  const id = userStore.todayScheduledSubtestId
  if (id === 'rest') return null
  return learningStore.getSubtestById(id) || learningStore.sortedSubtests[0] || null
})

// Single consistent topic source from scheduled subtest (no Adventure/Chapter logic)
const recommendedTopic = computed(() => {
  if (!scheduledSubtest.value) return null
  const topics = learningStore.getTopicsBySubtest(scheduledSubtest.value.id)
  if (topics.length === 0) return null
  return (
    topics.find((item) => item.status === 'learning') ||
    topics.find((item) => item.status === 'not_started') ||
    topics[0]
  )
})

function resolveTopicTitle(topic: LearningTopic): string {
  const seedTitle = SEED_TOPIC_TITLES[topic.id]
  const key = `defaultTopics.${topic.id}`
  if (seedTitle && topic.title === seedTitle && te(key)) {
    return t(key)
  }
  return topic.title
}

const planTargetMinutes = computed(() => {
  if (focusStore.focusMode === 'pomodoro') {
    return Math.min(focusStore.pomodoroFocusMinutes, userStore.effectiveDailyTargetMinutes)
  }
  const base = userStore.settings.currentEnergyMode === 'red' ? 20 : 30
  return Math.max(15, Math.min(base, userStore.effectiveDailyTargetMinutes))
})

const showStudyReminderBanner = computed(() => {
  return (
    userStore.reminderConfig.enabled &&
    !userStore.isReminderSnoozed &&
    !focusStore.hasStartedFocusToday &&
    scheduledSubtest.value !== null
  )
})

async function handleSnoozeReminder(): Promise<void> {
  triggerActionHaptic('light')
  lastSnoozedMinutes.value = await userStore.snoozeStudyReminder()
}

async function onDayScheduleChange(
  dayIdx: number,
  event: Event
): Promise<void> {
  const select = event.target as HTMLSelectElement
  await userStore.setDaySubtestSchedule(dayIdx, select.value)
}

function startScheduledFocus(): void {
  triggerActionHaptic('light')
  if (scheduledSubtest.value && focusStore.timerStatus === 'idle') {
    focusStore.selectedSubjectId = scheduledSubtest.value.id
    if (recommendedTopic.value) {
      focusStore.selectedTopicId = recommendedTopic.value.title
    }
    focusStore.customTopicTitle = ''
    if (focusStore.focusMode === 'free') {
      focusStore.setDurationMinutes(planTargetMinutes.value)
    }
  }
  router.push('/tabs/focus')
}
</script>
