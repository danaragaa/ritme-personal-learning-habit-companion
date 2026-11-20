<template>
  <ion-app class="ritme-app-canvas">
    <GamificationFeedbackOverlay />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'
import { useUserStore } from '@/stores/userStore'
import { useHabitStore } from '@/stores/habitStore'
import { useFocusStore } from '@/stores/focusStore'
import { useLearningStore } from '@/stores/learningStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import {
  initNotificationChannels,
  syncAdaptiveNotifications,
} from '@/services/notifications/localNotificationService'
import GamificationFeedbackOverlay from '@/components/gamification/GamificationFeedbackOverlay.vue'

const userStore = useUserStore()
const habitStore = useHabitStore()
const focusStore = useFocusStore()
const learningStore = useLearningStore()
const gamificationStore = useGamificationStore()

onMounted(async () => {
  try {
    await Promise.all([
      userStore.initUserStore(),
      habitStore.initHabitStore(),
      focusStore.initFocusStore(),
      learningStore.initLearningStore(),
      gamificationStore.initGamificationStore(),
    ])
    await initNotificationChannels()
    await syncAdaptiveNotifications({
      settings: userStore.settings,
      reminderConfig: userStore.reminderConfig,
      dueReviewsCount: learningStore.smartReviewQueue.length,
      incompleteTodayQuestsCount: gamificationStore.todayQuests.filter(
        (q) => !q.completed
      ).length,
      currentStreak: habitStore.currentStreak,
    })
  } catch (err) {
    console.error('[RITME] Application store initialization error:', err)
  }
})
</script>
