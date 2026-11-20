<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom" class="ritme-glass-tab-bar">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline" />
          <ion-label>{{ t('nav.home') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="learning" href="/tabs/learning">
          <ion-icon :icon="bookOutline" />
          <ion-label>{{ t('nav.learning') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="focus" href="/tabs/focus">
          <ion-icon :icon="timerOutline" />
          <ion-label>{{ t('nav.focus') }}</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="progress" href="/tabs/progress">
          <ion-icon :icon="statsChartOutline" />
          <ion-label>{{ t('nav.progress') }}</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
} from '@ionic/vue'
import {
  homeOutline,
  timerOutline,
  bookOutline,
  statsChartOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
