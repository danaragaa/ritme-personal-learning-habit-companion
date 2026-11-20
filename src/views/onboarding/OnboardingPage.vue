<template>
  <ion-page>
    <ion-content>
      <div class="ritme-onboarding-shell">
        <div class="ritme-onboarding-hero">
          <div class="ritme-wordmark ritme-onboarding-wordmark">
            {{ t('app.name') }}
          </div>
          <span class="ritme-badge ritme-onboarding-badge">
            {{ t('onboarding.minimal.badge') }}
          </span>
          <h1 class="ritme-onboarding-title">
            {{ t('onboarding.title') }}
          </h1>
          <p class="ritme-subtitle ritme-onboarding-subtitle">
            {{ t('onboarding.minimal.subtitle') }}
          </p>
        </div>

        <div class="ritme-card ritme-onboarding-pillars">
          <div class="ritme-pillar-row">
            <span class="ritme-icon-badge" aria-hidden="true">
              <ion-icon :icon="checkboxOutline" />
            </span>
            <span class="ritme-pillar-text">
              {{ t('onboarding.minimal.pillarHabits') }}
            </span>
          </div>
          <div class="ritme-pillar-row">
            <span class="ritme-icon-badge" aria-hidden="true">
              <ion-icon :icon="bookOutline" />
            </span>
            <span class="ritme-pillar-text">
              {{ t('onboarding.minimal.pillarLearning') }}
            </span>
          </div>
          <div class="ritme-pillar-row">
            <span class="ritme-icon-badge" aria-hidden="true">
              <ion-icon :icon="timerOutline" />
            </span>
            <span class="ritme-pillar-text">
              {{ t('onboarding.minimal.pillarFocus') }}
            </span>
          </div>
        </div>

        <div class="ritme-card ritme-onboarding-form">
          <div class="ritme-field-group">
            <label class="ritme-field-label" for="onboarding-display-name">
              {{ t('onboarding.displayNameLabel') }}
            </label>
            <input
              id="onboarding-display-name"
              v-model="displayName"
              type="text"
              autocomplete="name"
              class="ritme-input"
              :placeholder="t('onboarding.minimal.displayNamePlaceholder')"
            />
          </div>

          <div class="ritme-field-group">
            <span class="ritme-field-label">
              {{ t('onboarding.languageLabel') }}
            </span>
            <div
              class="ritme-segment-track"
              role="radiogroup"
              :aria-label="t('onboarding.languageLabel')"
            >
              <button
                type="button"
                role="radio"
                class="ritme-segment-btn"
                :class="{ 'is-active': language === 'id' }"
                :aria-checked="language === 'id'"
                @click="selectLanguage('id')"
              >
                <ion-icon
                  v-if="language === 'id'"
                  :icon="checkmarkOutline"
                  aria-hidden="true"
                />
                <span>Bahasa Indonesia</span>
              </button>
              <button
                type="button"
                role="radio"
                class="ritme-segment-btn"
                :class="{ 'is-active': language === 'en' }"
                :aria-checked="language === 'en'"
                @click="selectLanguage('en')"
              >
                <ion-icon
                  v-if="language === 'en'"
                  :icon="checkmarkOutline"
                  aria-hidden="true"
                />
                <span>English</span>
              </button>
            </div>
          </div>

          <div class="ritme-field-group ritme-field-group--last">
            <span class="ritme-field-label">
              {{ t('onboarding.minimal.themeLabel') }}
            </span>
            <div
              class="ritme-segment-track"
              role="radiogroup"
              :aria-label="t('onboarding.minimal.themeLabel')"
            >
              <button
                type="button"
                role="radio"
                class="ritme-segment-btn"
                :class="{ 'is-active': theme === 'dark' }"
                :aria-checked="theme === 'dark'"
                @click="selectTheme('dark')"
              >
                <ion-icon :icon="moonOutline" aria-hidden="true" />
                <span>{{ t('onboarding.minimal.themeDark') }}</span>
              </button>
              <button
                type="button"
                role="radio"
                class="ritme-segment-btn"
                :class="{ 'is-active': theme === 'light' }"
                :aria-checked="theme === 'light'"
                @click="selectTheme('light')"
              >
                <ion-icon :icon="sunnyOutline" aria-hidden="true" />
                <span>{{ t('onboarding.minimal.themeLight') }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="ritme-onboarding-actions">
          <button
            type="button"
            class="ritme-btn-primary ritme-start-cta"
            :disabled="isSubmitting"
            @click="handleStart"
          >
            <span>{{ t('onboarding.minimal.startBtn') }}</span>
            <ion-icon :icon="arrowForwardOutline" aria-hidden="true" />
          </button>
          <p class="ritme-subtitle ritme-onboarding-hint">
            {{ t('onboarding.minimal.footerHint') }}
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { IonPage, IonContent, IonIcon } from '@ionic/vue'
import {
  arrowForwardOutline,
  bookOutline,
  checkboxOutline,
  checkmarkOutline,
  moonOutline,
  sunnyOutline,
  timerOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import type { AppLanguage, AppTheme } from '@/types'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const displayName = ref('')
const language = ref<AppLanguage>('id')
const theme = ref<AppTheme>('dark')
const isSubmitting = ref(false)

onMounted(async () => {
  await userStore.initUserStore()
  displayName.value = userStore.settings.displayName || ''
  language.value = userStore.settings.language || 'id'
  theme.value = userStore.settings.theme || 'dark'
})

async function selectLanguage(nextLang: AppLanguage): Promise<void> {
  language.value = nextLang
  await userStore.updateSettings({ language: nextLang })
}

async function selectTheme(nextTheme: AppTheme): Promise<void> {
  theme.value = nextTheme
  await userStore.updateSettings({ theme: nextTheme })
}

async function handleStart(): Promise<void> {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await userStore.updateSettings({
      displayName: displayName.value.trim(),
      language: language.value,
      theme: theme.value,
      onboardingCompleted: true,
    })
    await router.replace('/tabs/home')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.ritme-onboarding-shell {
  max-width: 520px;
  min-height: 100%;
  margin: 0 auto;
  padding: calc(var(--ion-safe-area-top, 0px) + 28px) var(--ritme-space-lg)
    calc(var(--ion-safe-area-bottom, 0px) + 32px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--ritme-space-md);
}

.ritme-onboarding-hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.ritme-onboarding-wordmark {
  font-size: 1.45rem;
  letter-spacing: 0.12em;
}

.ritme-onboarding-badge {
  font-size: var(--ritme-font-caption);
  letter-spacing: 0.015em;
}

.ritme-onboarding-title {
  margin: 2px 0 0;
  font-size: var(--ritme-font-title);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ritme-text-primary);
}

.ritme-onboarding-subtitle {
  margin: 0;
  max-width: 34ch;
  font-size: var(--ritme-font-sub);
  line-height: 1.45;
}

.ritme-onboarding-pillars {
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ritme-pillar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ritme-pillar-text {
  font-size: var(--ritme-font-body);
  line-height: 1.4;
  color: var(--ritme-text-secondary);
}

.ritme-onboarding-form {
  margin-bottom: 0;
}

.ritme-field-group {
  margin-bottom: 14px;
}

.ritme-field-group--last {
  margin-bottom: 0;
}

.ritme-field-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ritme-text-secondary);
  margin-bottom: 6px;
}

.ritme-segment-track {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 4px;
  border-radius: var(--ritme-radius-pill);
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
}

.ritme-segment-btn {
  min-height: 38px;
  padding: 0 10px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--ritme-text-secondary);
  font-family: var(--ion-font-family);
  font-size: 0.8rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition:
    background-color var(--ritme-motion-fast),
    border-color var(--ritme-motion-fast),
    color var(--ritme-motion-fast),
    transform var(--ritme-motion-fast);
}

.ritme-segment-btn.is-active {
  background: var(--ritme-state-selected-bg);
  border-color: var(--ritme-state-selected-border);
  color: var(--ritme-text-primary);
  box-shadow: var(--ritme-glass-inset);
  font-weight: 700;
}

.ritme-segment-btn:active {
  transform: scale(0.98);
}

.ritme-onboarding-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
}

.ritme-start-cta {
  width: 100%;
  min-height: 46px;
  font-size: 0.9rem;
}

.ritme-start-cta:disabled {
  opacity: 0.6;
  cursor: default;
}

.ritme-onboarding-hint {
  margin: 0;
  font-size: var(--ritme-font-caption);
  text-align: center;
}
</style>
