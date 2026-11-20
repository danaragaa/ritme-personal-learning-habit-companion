<template>
  <ion-page>
    <ion-header class="ritme-floating-header">
      <ion-toolbar>
        <ion-title class="ritme-wordmark-title">
          <img
            :src="homeBrandLogo"
            :alt="t('app.name')"
            class="ritme-appbar-brand-logo"
            decoding="async"
            draggable="false"
          />
        </ion-title>
        <ion-buttons slot="end">
          <ion-button
            router-link="/settings"
            class="ritme-appbar-icon-btn"
            :aria-label="t('nav.settings')"
          >
            <span class="ritme-appbar-icon-pill" aria-hidden="true">
              <ion-icon :icon="settingsOutline" />
            </span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-page-container">
        <!-- A. Compact Header (No wrapping conflict between long date & Level badge on 360px) -->
        <header style="padding: 2px 2px 14px;">
          <div
            style="display: flex; justify-content: space-between; align-items: center; gap: 10px;"
          >
            <h1
              style="margin: 0; font-size: 1.22rem; font-weight: 800; line-height: 1.25; color: var(--ritme-text-primary); min-width: 0; flex: 1;"
            >
              {{ timeGreeting }}
            </h1>

            <ion-button
              fill="clear"
              size="small"
              router-link="/tabs/progress"
              style="--padding-start: 0; --padding-end: 0; margin: 0; min-height: 36px; flex-shrink: 0;"
            >
              <span
                class="ritme-badge ritme-glass-chip ritme-title-row"
                style="gap: 5px; padding: 6px 12px;"
              >
                <ion-icon :icon="flashOutline" style="font-size: 0.82rem;" />
                {{
                  t('home.compactLevelXp', {
                    level: gamificationStore.currentLevel,
                    xp: gamificationStore.totalXP,
                  })
                }}
              </span>
            </ion-button>
          </div>

          <p class="ritme-subtitle" style="margin: 4px 0 0; font-size: 0.8rem;">
            {{ formattedToday }}
          </p>
        </header>

        <!-- B. Today's Learning Plan (Single Consistent Source) -->
        <StudyScheduleCard />

        <!-- C. Today's Habits (Max 5 Active Habits + 1-Tap Toggle + Manage Access) -->
        <DailyHabitsCard />

        <!-- D. Daily Progress Summary (+ Optional Reflection Modal) -->
        <DailyProgressCard />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
} from '@ionic/vue'
import { flashOutline, settingsOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { formatDisplayDate } from '@/utils/date'
import StudyScheduleCard from '@/components/dashboard/StudyScheduleCard.vue'
import DailyHabitsCard from '@/components/dashboard/DailyHabitsCard.vue'
import DailyProgressCard from '@/components/dashboard/DailyProgressCard.vue'
import ritmeLogoWhite from '@/assets/brand/ritme-logo-horizontal-white.svg'
import ritmeLogoBlack from '@/assets/brand/ritme-logo-horizontal-black.svg'

const { t } = useI18n()
const userStore = useUserStore()
const gamificationStore = useGamificationStore()

const homeBrandLogo = computed(() =>
  userStore.settings.theme === 'light' ? ritmeLogoBlack : ritmeLogoWhite
)

const displayUserName = computed(
  () => userStore.settings.displayName?.trim() || t('home.defaultUser')
)

const timeGreeting = computed(() => {
  const hour = new Date().getHours()
  const name = displayUserName.value
  if (hour >= 4 && hour < 11) return t('home.greetingMorning', { name })
  if (hour >= 11 && hour < 15) return t('home.greetingAfternoon', { name })
  if (hour >= 15 && hour < 19) return t('home.greetingEvening', { name })
  return t('home.greetingNight', { name })
})

const formattedToday = computed(() =>
  formatDisplayDate(new Date(), userStore.settings.language)
)
</script>
