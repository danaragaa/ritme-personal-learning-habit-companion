<template>
  <ion-page>
    <ion-header class="ritme-floating-header">
      <ion-toolbar class="ritme-toolbar-has-back">
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/home" text="" />
        </ion-buttons>
        <ion-title>{{ t('settings.title') }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-page-container">
        <!-- Supporting Subtitle (No Duplicate Page H1) -->
        <div class="ritme-page-intro">
          <p class="ritme-page-intro-desc">
            {{ t('settings.minimal.headerSubtitle') }}
          </p>
        </div>

        <!-- Concise Feedback Banner -->
        <div
          v-if="statusMessage"
          role="status"
          class="ritme-feedback-banner"
          :class="{ 'is-error': isStatusError }"
        >
          <span>{{ statusMessage }}</span>
          <button
            type="button"
            class="ritme-feedback-dismiss"
            :aria-label="t('reflection.cancelEditBtn')"
            @click="statusMessage = ''"
          >
            <ion-icon :icon="closeOutline" style="font-size: 1rem;" />
          </button>
        </div>

        <!-- ================================================================
             GROUP 1: GENERAL
             ================================================================ -->
        <section class="ritme-card ritme-settings-group">
          <div class="ritme-group-head">
            <ion-icon :icon="personOutline" class="ritme-group-icon" />
            <h2 class="ritme-section-title">
              {{ t('settings.minimal.groupGeneral') }}
            </h2>
          </div>

          <!-- A. Profile (Display Name) -->
          <div class="ritme-setting-block">
            <label class="ritme-field-label" for="settings-display-name">
              {{ t('settings.minimal.profileNameLabel') }}
            </label>
            <div class="ritme-inline-row">
              <input
                id="settings-display-name"
                v-model="displayNameInput"
                type="text"
                maxlength="40"
                :placeholder="t('settings.minimal.profileNamePlaceholder')"
                class="ritme-input ritme-input-themed"
                style="flex: 1;"
                @keyup.enter="handleSaveProfileName"
              />
              <button
                type="button"
                class="ritme-glass-pill ritme-save-inline-btn"
                @click="handleSaveProfileName"
              >
                {{ t('settings.minimal.saveBtn') }}
              </button>
            </div>
          </div>

          <!-- B. Language -->
          <div class="ritme-setting-block">
            <div class="ritme-field-label">
              {{ t('settings.language') }}
            </div>
            <div class="ritme-segment-2" role="radiogroup" :aria-label="t('settings.language')">
              <button
                type="button"
                role="radio"
                :aria-checked="userStore.settings.language === 'id'"
                class="ritme-segment-btn"
                :class="{ 'is-active': userStore.settings.language === 'id' }"
                @click="handleLanguageChange('id')"
              >
                Bahasa Indonesia
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="userStore.settings.language === 'en'"
                class="ritme-segment-btn"
                :class="{ 'is-active': userStore.settings.language === 'en' }"
                @click="handleLanguageChange('en')"
              >
                English
              </button>
            </div>
          </div>

          <!-- C. Theme -->
          <div class="ritme-setting-block">
            <div class="ritme-field-label">
              {{ t('settings.theme') }}
            </div>
            <div class="ritme-segment-2" role="radiogroup" :aria-label="t('settings.theme')">
              <button
                type="button"
                role="radio"
                :aria-checked="userStore.settings.theme === 'dark'"
                class="ritme-segment-btn"
                :class="{ 'is-active': userStore.settings.theme === 'dark' }"
                @click="handleThemeChange('dark')"
              >
                <ion-icon
                  :icon="moonOutline"
                  class="ritme-segment-icon"
                  aria-hidden="true"
                />
                <span>{{ t('settings.minimal.themeDark') }}</span>
              </button>
              <button
                type="button"
                role="radio"
                :aria-checked="userStore.settings.theme === 'light'"
                class="ritme-segment-btn"
                :class="{ 'is-active': userStore.settings.theme === 'light' }"
                @click="handleThemeChange('light')"
              >
                <ion-icon
                  :icon="sunnyOutline"
                  class="ritme-segment-icon"
                  aria-hidden="true"
                />
                <span>{{ t('settings.minimal.themeLight') }}</span>
              </button>
            </div>
          </div>

          <!-- D. Daily Focus Target -->
          <div class="ritme-setting-block">
            <div class="ritme-label-row">
              <label class="ritme-field-label" for="settings-daily-target" style="margin-bottom: 0;">
                {{ t('settings.minimal.dailyFocusTargetLabel') }}
              </label>
              <span class="ritme-badge ritme-glass-chip">
                {{ userStore.settings.dailyTargetMinutes }} {{ t('focus.minutesShort') }}
              </span>
            </div>

            <div class="ritme-preset-grid-4">
              <button
                v-for="preset in DAILY_TARGET_PRESETS"
                :key="preset"
                type="button"
                class="ritme-day-pill"
                :class="{
                  'is-active': userStore.settings.dailyTargetMinutes === preset,
                }"
                @click="applyDailyTargetPreset(preset)"
              >
                {{ preset }}m
              </button>
            </div>

            <div class="ritme-inline-row" style="margin-top: 8px;">
              <input
                id="settings-daily-target"
                v-model="dailyTargetInput"
                type="number"
                min="15"
                max="600"
                inputmode="numeric"
                :placeholder="t('settings.minimal.dailyTargetPlaceholder')"
                class="ritme-input ritme-input-themed"
                style="flex: 1;"
                @keyup.enter="handleSaveDailyTarget"
              />
              <button
                type="button"
                class="ritme-glass-pill ritme-save-inline-btn"
                @click="handleSaveDailyTarget"
              >
                {{ t('settings.minimal.applyBtn') }}
              </button>
            </div>
            <p
              v-if="dailyTargetError"
              class="ritme-inline-error"
            >
              {{ dailyTargetError }}
            </p>
          </div>

          <!-- E. Weekly Rest Day -->
          <div class="ritme-setting-block is-last">
            <div class="ritme-label-row">
              <span class="ritme-field-label" style="margin-bottom: 0;">
                {{ t('settings.restDay') }}
              </span>
              <span class="ritme-subtitle" style="font-size: 0.75rem; font-weight: 600;">
                {{ t(`days.${userStore.settings.weeklyRestDay}`) }}
              </span>
            </div>

            <div class="ritme-days-grid">
              <button
                v-for="dayIdx in WEEK_DAYS"
                :key="dayIdx"
                type="button"
                class="ritme-day-pill"
                :class="{
                  'is-active': userStore.settings.weeklyRestDay === dayIdx,
                }"
                @click="handleRestDayChange(dayIdx)"
              >
                {{ t(`days.short${dayIdx}`) }}
              </button>
            </div>
          </div>
        </section>

        <!-- ================================================================
             GROUP 2: REMINDERS & SOUND
             ================================================================ -->
        <section class="ritme-card ritme-settings-group">
          <div class="ritme-group-head">
            <ion-icon :icon="notificationsOutline" class="ritme-group-icon" />
            <h2 class="ritme-section-title">
              {{ t('settings.minimal.groupRemindersSound') }}
            </h2>
          </div>

          <!-- Calm Permission Status Row -->
          <div class="ritme-perm-bar">
            <div class="ritme-perm-info">
              <span class="ritme-perm-title">
                {{ t('settings.notifPermissionLabel') }}
              </span>
              <span class="ritme-badge ritme-glass-chip">
                {{ permissionBadgeText }}
              </span>
            </div>

            <button
              v-if="notifPermState !== 'granted'"
              type="button"
              class="ritme-glass-pill"
              style="min-height: 32px; padding: 0 11px; font-size: 0.73rem; flex-shrink: 0;"
              @click="handleRequestNotifPermission"
            >
              {{ t('settings.minimal.grantPermissionBtn') }}
            </button>
          </div>
          <p
            v-if="notifPermState !== 'granted'"
            class="ritme-subtitle"
            style="margin: -4px 0 12px; font-size: 0.72rem; line-height: 1.4;"
          >
            {{
              notifPermState === 'denied'
                ? t('settings.minimal.permDeniedHint')
                : t('settings.minimal.permPromptHint')
            }}
          </p>

          <!-- A. Study Reminder Toggle + Schedule -->
          <div class="ritme-setting-block">
            <div class="ritme-toggle-row">
              <div class="ritme-toggle-text">
                <div class="ritme-toggle-title">
                  {{ t('settings.minimal.studyReminderTitle') }}
                </div>
                <div class="ritme-subtitle ritme-toggle-sub">
                  {{ t('settings.minimal.studyReminderDesc') }}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="isStudyReminderEnabled"
                :aria-label="t('settings.minimal.studyReminderTitle')"
                class="ritme-switch"
                :class="{ 'is-on': isStudyReminderEnabled }"
                @click="handleToggleStudyReminder(!isStudyReminderEnabled)"
              >
                <span class="ritme-switch-thumb" />
              </button>
            </div>

            <div
              v-if="isStudyReminderEnabled"
              class="ritme-time-grid"
            >
              <div>
                <label class="ritme-field-label" for="rem-morning-time">
                  {{ t('settings.minimal.morningTimeLabel') }}
                </label>
                <input
                  id="rem-morning-time"
                  :value="userStore.reminderConfig.morningTime"
                  type="time"
                  class="ritme-input ritme-input-themed"
                  @change="onMorningTimeChange"
                />
              </div>
              <div>
                <label class="ritme-field-label" for="rem-evening-time">
                  {{ t('settings.minimal.eveningTimeLabel') }}
                </label>
                <input
                  id="rem-evening-time"
                  :value="userStore.reminderConfig.eveningTime"
                  type="time"
                  class="ritme-input ritme-input-themed"
                  @change="onEveningTimeChange"
                />
              </div>
            </div>
          </div>

          <!-- B. Timer Completion Notification -->
          <div class="ritme-setting-block">
            <div class="ritme-toggle-row">
              <div class="ritme-toggle-text">
                <div class="ritme-toggle-title">
                  {{ t('settings.minimal.timerNotifTitle') }}
                </div>
                <div class="ritme-subtitle ritme-toggle-sub">
                  {{ t('settings.minimal.timerNotifDesc') }}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="isTimerNotifEnabled"
                :aria-label="t('settings.minimal.timerNotifTitle')"
                class="ritme-switch"
                :class="{ 'is-on': isTimerNotifEnabled }"
                @click="handleToggleTimerNotif(!isTimerNotifEnabled)"
              >
                <span class="ritme-switch-thumb" />
              </button>
            </div>
          </div>

          <!-- C. Quiet Hours -->
          <div class="ritme-setting-block">
            <div class="ritme-toggle-row">
              <div class="ritme-toggle-text">
                <div class="ritme-toggle-title">
                  {{ t('settings.quietHoursLabel') }}
                </div>
                <div class="ritme-subtitle ritme-toggle-sub">
                  {{ t('settings.minimal.quietHoursDesc') }}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="Boolean(userStore.settings.quietHoursEnabled)"
                :aria-label="t('settings.quietHoursLabel')"
                class="ritme-switch"
                :class="{ 'is-on': Boolean(userStore.settings.quietHoursEnabled) }"
                @click="
                  handleToggleQuietHours(!Boolean(userStore.settings.quietHoursEnabled))
                "
              >
                <span class="ritme-switch-thumb" />
              </button>
            </div>

            <div
              v-if="userStore.settings.quietHoursEnabled"
              class="ritme-time-grid"
            >
              <div>
                <label class="ritme-field-label" for="quiet-start-time">
                  {{ t('settings.quietStartLabel') }}
                </label>
                <input
                  id="quiet-start-time"
                  :value="userStore.settings.quietHoursStart || '22:00'"
                  type="time"
                  class="ritme-input ritme-input-themed"
                  @change="onQuietStartChange"
                />
              </div>
              <div>
                <label class="ritme-field-label" for="quiet-end-time">
                  {{ t('settings.quietEndLabel') }}
                </label>
                <input
                  id="quiet-end-time"
                  :value="userStore.settings.quietHoursEnd || '06:00'"
                  type="time"
                  class="ritme-input ritme-input-themed"
                  @change="onQuietEndChange"
                />
              </div>
            </div>
          </div>

          <!-- D. Sound & Haptics -->
          <div class="ritme-setting-block">
            <div class="ritme-toggle-row" style="margin-bottom: 12px;">
              <div class="ritme-toggle-text">
                <div class="ritme-toggle-title">
                  {{ t('settings.minimal.soundToggleTitle') }}
                </div>
                <div class="ritme-subtitle ritme-toggle-sub">
                  {{ t('settings.minimal.soundToggleDesc') }}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="isSoundEnabled"
                :aria-label="t('settings.minimal.soundToggleTitle')"
                class="ritme-switch"
                :class="{ 'is-on': isSoundEnabled }"
                @click="handleToggleSound(!isSoundEnabled)"
              >
                <span class="ritme-switch-thumb" />
              </button>
            </div>

            <div class="ritme-toggle-row">
              <div class="ritme-toggle-text">
                <div class="ritme-toggle-title">
                  {{ t('settings.minimal.hapticToggleTitle') }}
                </div>
                <div class="ritme-subtitle ritme-toggle-sub">
                  {{ t('settings.minimal.hapticToggleDesc') }}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="isHapticEnabled"
                :aria-label="t('settings.minimal.hapticToggleTitle')"
                class="ritme-switch"
                :class="{ 'is-on': isHapticEnabled }"
                @click="handleToggleHaptic(!isHapticEnabled)"
              >
                <span class="ritme-switch-thumb" />
              </button>
            </div>
          </div>

          <!-- Optional Collapsed Advanced Audio & Snooze Controls -->
          <div class="ritme-setting-block is-last">
            <button
              type="button"
              class="ritme-advanced-trigger"
              :aria-expanded="showAdvancedAudio"
              @click="showAdvancedAudio = !showAdvancedAudio"
            >
              <span>{{ t('settings.minimal.advancedRemindersBtn') }}</span>
              <ion-icon
                :icon="showAdvancedAudio ? chevronUpOutline : chevronDownOutline"
                style="font-size: 0.92rem;"
              />
            </button>

            <div v-if="showAdvancedAudio" class="ritme-advanced-panel">
              <div style="margin-bottom: 12px;">
                <label class="ritme-field-label" for="alarm-tone-select">
                  {{ t('settings.alarmToneLabel') }}
                </label>
                <select
                  id="alarm-tone-select"
                  :value="userStore.settings.alarmTone || 'chime'"
                  class="ritme-input ritme-select-themed"
                  @change="onAlarmToneChange"
                >
                  <option value="chime">{{ t('settings.alarmTones.chime') }}</option>
                  <option value="bell">{{ t('settings.alarmTones.bell') }}</option>
                  <option value="digital">{{ t('settings.alarmTones.digital') }}</option>
                </select>
              </div>

              <div style="margin-bottom: 12px;">
                <label class="ritme-field-label" for="sound-volume-range">
                  {{
                    t('settings.soundVolumeLabel', {
                      vol: userStore.settings.soundVolume ?? 70,
                    })
                  }}
                </label>
                <input
                  id="sound-volume-range"
                  :value="userStore.settings.soundVolume ?? 70"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  style="width: 100%; accent-color: var(--ritme-text-primary);"
                  @input="onVolumeChange"
                />
              </div>

              <div style="margin-bottom: 12px;">
                <div class="ritme-field-label">
                  {{ t('settings.snoozeDurationLabel') }}
                </div>
                <div class="ritme-preset-grid-3">
                  <button
                    v-for="mins in SNOOZE_PRESETS"
                    :key="mins"
                    type="button"
                    class="ritme-day-pill"
                    :class="{
                      'is-active': (userStore.settings.snoozeMinutes || 15) === mins,
                    }"
                    @click="userStore.updateSettings({ snoozeMinutes: mins })"
                  >
                    {{ mins }} {{ t('focus.minutesShort') }}
                  </button>
                </div>
              </div>

              <div class="ritme-action-row-2">
                <button
                  type="button"
                  class="ritme-glass-pill"
                  style="min-height: 36px; font-size: 0.75rem;"
                  @click="playPreviewSound('alarm')"
                >
                  <ion-icon :icon="volumeHighOutline" style="font-size: 0.88rem;" />
                  {{ t('settings.previewAlarmBtn') }}
                </button>
                <button
                  type="button"
                  class="ritme-glass-pill"
                  style="min-height: 36px; font-size: 0.75rem;"
                  @click="handleTestNotification"
                >
                  <ion-icon :icon="notificationsOutline" style="font-size: 0.88rem;" />
                  {{ t('settings.testNotifBtn') }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ================================================================
             GROUP 3: DATA MANAGEMENT
             ================================================================ -->
        <section class="ritme-card ritme-settings-group">
          <div class="ritme-group-head">
            <ion-icon :icon="serverOutline" class="ritme-group-icon" />
            <h2 class="ritme-section-title">
              {{ t('settings.minimal.groupData') }}
            </h2>
          </div>

          <p class="ritme-subtitle" style="margin: 0 0 12px; font-size: 0.76rem; line-height: 1.45;">
            {{ t('settings.minimal.dataGroupDesc') }}
          </p>

          <!-- A. Export Data -->
          <div class="ritme-setting-block">
            <div class="ritme-field-label">
              {{ t('settings.minimal.exportSubheading') }}
            </div>
            <div class="ritme-action-row-2">
              <button
                type="button"
                class="ritme-primary-pill"
                @click="handleExportDownload"
              >
                <ion-icon :icon="downloadOutline" style="font-size: 0.92rem;" />
                {{ t('settings.exportFileBtn') }}
              </button>
              <button
                type="button"
                class="ritme-glass-pill"
                style="min-height: 40px; font-size: 0.78rem;"
                @click="handleCopyBackupJson"
              >
                <ion-icon :icon="copyOutline" style="font-size: 0.9rem;" />
                {{ t('settings.copyJsonBtn') }}
              </button>
            </div>
          </div>

          <!-- B. Import Data (Validates First -> Explicit Confirm Modal) -->
          <div class="ritme-setting-block">
            <div class="ritme-field-label">
              {{ t('settings.minimal.importSubheading') }}
            </div>
            <div class="ritme-action-row-2">
              <button
                type="button"
                class="ritme-glass-pill"
                style="min-height: 40px; font-size: 0.78rem;"
                @click="triggerFileInput"
              >
                <ion-icon :icon="cloudUploadOutline" style="font-size: 0.92rem;" />
                {{ t('settings.importFileBtn') }}
              </button>
              <button
                type="button"
                class="ritme-glass-pill"
                style="min-height: 40px; font-size: 0.78rem;"
                @click="showPasteJsonBox = !showPasteJsonBox"
              >
                {{ t('settings.togglePasteJsonBtn') }}
              </button>
            </div>

            <input
              ref="fileInputRef"
              type="file"
              accept=".json,application/json"
              style="display: none;"
              @change="handleFileSelected"
            />

            <div v-if="showPasteJsonBox" style="margin-top: 10px;">
              <textarea
                v-model="jsonTextBuffer"
                rows="4"
                :placeholder="t('settings.pasteJsonPlaceholder')"
                class="ritme-input ritme-input-themed"
                style="font-family: monospace; font-size: 0.76rem; margin-bottom: 8px; min-height: 92px; padding: 10px;"
              ></textarea>
              <button
                type="button"
                class="ritme-glass-pill"
                style="width: 100%; min-height: 38px; font-size: 0.78rem;"
                @click="handlePrepareImportFromText"
              >
                {{ t('settings.applyImportBtn') }}
              </button>
            </div>
          </div>

          <!-- C. Reset Data (Visually Separated Destructive Sub-section) -->
          <div class="ritme-reset-zone">
            <div class="ritme-reset-title">
              {{ t('settings.resetTitle') }}
            </div>
            <p class="ritme-subtitle" style="margin: 3px 0 10px; font-size: 0.74rem; line-height: 1.42;">
              {{ t('settings.resetDesc') }}
            </p>
            <button
              type="button"
              class="ritme-reset-trigger-btn"
              @click="openResetModal"
            >
              <ion-icon :icon="trashOutline" style="font-size: 0.9rem;" />
              {{ t('settings.resetBtn') }}
            </button>
          </div>
        </section>

        <!-- ================================================================
             GROUP 4: ABOUT RITME
             ================================================================ -->
        <section class="ritme-card ritme-settings-group">
          <div class="ritme-group-head">
            <ion-icon :icon="informationCircleOutline" class="ritme-group-icon" />
            <h2 class="ritme-section-title">
              {{ t('settings.minimal.groupAbout') }}
            </h2>
          </div>

          <div class="ritme-about-rows">
            <div class="ritme-about-row">
              <span class="ritme-subtitle">{{ t('settings.minimal.aboutAppNameLabel') }}</span>
              <strong>RITME</strong>
            </div>
            <div class="ritme-about-row">
              <span class="ritme-subtitle">{{ t('settings.version') }}</span>
              <strong>v3.1.0</strong>
            </div>
            <div class="ritme-about-row">
              <span class="ritme-subtitle">{{ t('settings.minimal.aboutPlatformLabel') }}</span>
              <strong>{{ platformLabel }}</strong>
            </div>
          </div>

          <p class="ritme-subtitle" style="margin: 10px 0 0; font-size: 0.75rem; line-height: 1.45;">
            {{ t('settings.minimal.aboutTagline') }}
          </p>
        </section>
      </div>
    </ion-content>

    <!-- Explicit Import / Reset Confirmation Modal -->
    <BackupConfirmModal
      :is-open="confirmModalOpen"
      :mode="confirmModalMode"
      :is-busy="isModalBusy"
      :locale="locale"
      :import-preview="pendingImportPreview"
      @close="closeConfirmModal"
      @confirm="handleModalConfirm"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { Capacitor } from '@capacitor/core'
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import {
  chevronDownOutline,
  chevronUpOutline,
  closeOutline,
  cloudUploadOutline,
  copyOutline,
  downloadOutline,
  informationCircleOutline,
  moonOutline,
  notificationsOutline,
  personOutline,
  serverOutline,
  sunnyOutline,
  trashOutline,
  volumeHighOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useGamificationStore } from '@/stores/gamificationStore'
import { useLearningStore } from '@/stores/learningStore'
import { useHabitStore } from '@/stores/habitStore'
import { playPreviewSound } from '@/services/timer/soundFeedbackService'
import {
  dispatchImmediateNotification,
  getNotificationPermissionState,
  NOTIF_IDS,
  requestNotificationPermission,
  syncAdaptiveNotifications,
  type NotifPermissionState,
} from '@/services/notifications/localNotificationService'
import {
  generateBackupJson,
  importBackupFromJson,
  resetAllApplicationData,
  triggerBackupDownload,
  validateBackupPayload,
} from '@/services/backup/backupService'
import BackupConfirmModal, {
  type BackupImportPreview,
} from '@/components/settings/BackupConfirmModal.vue'
import type { AppLanguage, AppTheme } from '@/types'

const DAILY_TARGET_PRESETS = [60, 120, 180, 240] as const
const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const
const SNOOZE_PRESETS = [10, 15, 30] as const

const { t } = useI18n()
const userStore = useUserStore()
const gamificationStore = useGamificationStore()
const learningStore = useLearningStore()
const habitStore = useHabitStore()

// General form inputs
const displayNameInput = ref(userStore.settings.displayName || '')
const dailyTargetInput = ref(String(userStore.settings.dailyTargetMinutes || 180))
const dailyTargetError = ref('')

// Reminders & Audio UI state
const notifPermState = ref<NotifPermissionState>('prompt')
const showAdvancedAudio = ref(false)

// Data Management UI state
const fileInputRef = ref<HTMLInputElement | null>(null)
const showPasteJsonBox = ref(false)
const jsonTextBuffer = ref('')
const confirmModalOpen = ref(false)
const confirmModalMode = ref<'import' | 'reset'>('import')
const isModalBusy = ref(false)
const pendingImportJson = ref('')
const pendingImportPreview = ref<BackupImportPreview | null>(null)

// Top feedback state
const statusMessage = ref('')
const isStatusError = ref(false)

watch(
  () => userStore.settings.displayName,
  (val) => {
    displayNameInput.value = val || ''
  }
)

watch(
  () => userStore.settings.dailyTargetMinutes,
  (val) => {
    dailyTargetInput.value = String(val || 180)
  }
)

onMounted(async () => {
  notifPermState.value = await getNotificationPermissionState()
})

const locale = computed<'id' | 'en'>(() =>
  userStore.settings.language === 'en' ? 'en' : 'id'
)

const platformLabel = computed(() => {
  const raw = Capacitor.getPlatform()
  if (raw === 'android') return 'Android'
  if (raw === 'ios') return 'iOS'
  return 'Web (Offline-First)'
})

const permissionBadgeText = computed(() => {
  if (notifPermState.value === 'granted') return t('settings.notifPermGranted')
  if (notifPermState.value === 'denied') return t('settings.notifPermDenied')
  return t('settings.notifPermPrompt')
})

const isStudyReminderEnabled = computed(
  () =>
    userStore.reminderConfig.enabled &&
    userStore.settings.notificationsEnabled !== false &&
    userStore.settings.notifyStudyReminder !== false
)

const isTimerNotifEnabled = computed(
  () =>
    userStore.settings.notificationsEnabled !== false &&
    userStore.settings.notifyFocusCompletion !== false
)

const isSoundEnabled = computed(
  () =>
    userStore.settings.silentMode !== true &&
    (userStore.settings.soundEffectsEnabled !== false ||
      userStore.settings.timerAlarmEnabled !== false)
)

const isHapticEnabled = computed(
  () => userStore.settings.vibrationEnabled !== false
)

function showFeedback(message: string, isError = false): void {
  statusMessage.value = message
  isStatusError.value = isError
}

async function resyncSchedules(): Promise<void> {
  await syncAdaptiveNotifications({
    settings: userStore.settings,
    reminderConfig: userStore.reminderConfig,
    dueReviewsCount: learningStore.smartReviewQueue.length,
    incompleteTodayQuestsCount: gamificationStore.todayQuests.filter(
      (q) => !q.completed
    ).length,
    currentStreak: habitStore.currentStreak,
  })
}

// =========================================================================
// Group 1: General Handlers
// =========================================================================
async function handleSaveProfileName(): Promise<void> {
  const cleaned = displayNameInput.value.trim().slice(0, 40)
  displayNameInput.value = cleaned
  await userStore.updateSettings({ displayName: cleaned })
  showFeedback(t('settings.minimal.profileSaved'), false)
}

async function handleLanguageChange(lang: AppLanguage): Promise<void> {
  await userStore.setLanguage(lang)
  await resyncSchedules()
}

async function handleThemeChange(theme: AppTheme): Promise<void> {
  await userStore.setTheme(theme)
}

async function applyDailyTargetPreset(minutes: number): Promise<void> {
  dailyTargetError.value = ''
  dailyTargetInput.value = String(minutes)
  await userStore.updateSettings({ dailyTargetMinutes: minutes })
  showFeedback(t('settings.minimal.dailyTargetSaved', { minutes }), false)
}

async function handleSaveDailyTarget(): Promise<void> {
  const raw = Number(dailyTargetInput.value)
  if (!Number.isFinite(raw) || !Number.isInteger(raw) || raw < 15 || raw > 600) {
    dailyTargetError.value = t('settings.minimal.dailyTargetInvalid')
    return
  }
  dailyTargetError.value = ''
  await userStore.updateSettings({ dailyTargetMinutes: raw })
  showFeedback(t('settings.minimal.dailyTargetSaved', { minutes: raw }), false)
}

async function handleRestDayChange(dayIdx: number): Promise<void> {
  await userStore.updateSettings({ weeklyRestDay: dayIdx })
  await resyncSchedules()
}

// =========================================================================
// Group 2: Reminders & Sound Handlers
// =========================================================================
async function handleRequestNotifPermission(): Promise<void> {
  notifPermState.value = await requestNotificationPermission()
  if (notifPermState.value === 'granted') {
    await resyncSchedules()
    showFeedback(t('settings.minimal.permGrantedToast'), false)
  } else {
    showFeedback(t('settings.minimal.permStillDeniedToast'), true)
  }
}

async function handleToggleStudyReminder(enabled: boolean): Promise<void> {
  await userStore.updateReminderConfig({ enabled })
  await userStore.updateSettings({
    notifyStudyReminder: enabled,
    ...(enabled ? { notificationsEnabled: true } : {}),
  })
  await resyncSchedules()
}

async function onMorningTimeChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  if (input.value) {
    await userStore.updateReminderConfig({ morningTime: input.value })
    await resyncSchedules()
    showFeedback(t('settings.remindersSaved'), false)
  }
}

async function onEveningTimeChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  if (input.value) {
    await userStore.updateReminderConfig({ eveningTime: input.value })
    await resyncSchedules()
    showFeedback(t('settings.remindersSaved'), false)
  }
}

async function handleToggleTimerNotif(enabled: boolean): Promise<void> {
  await userStore.updateSettings({
    notifyFocusCompletion: enabled,
    notifyBreakReminder: enabled,
    ...(enabled ? { notificationsEnabled: true } : {}),
  })
}

async function handleToggleQuietHours(enabled: boolean): Promise<void> {
  await userStore.updateSettings({ quietHoursEnabled: enabled })
  await resyncSchedules()
}

async function onQuietStartChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  if (input.value) {
    await userStore.updateSettings({ quietHoursStart: input.value })
    await resyncSchedules()
  }
}

async function onQuietEndChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  if (input.value) {
    await userStore.updateSettings({ quietHoursEnd: input.value })
    await resyncSchedules()
  }
}

async function handleToggleSound(enabled: boolean): Promise<void> {
  await userStore.updateSettings({
    soundEffectsEnabled: enabled,
    timerAlarmEnabled: enabled,
    silentMode: !enabled,
  })
}

async function handleToggleHaptic(enabled: boolean): Promise<void> {
  await userStore.updateSettings({ vibrationEnabled: enabled })
}

async function onAlarmToneChange(event: Event): Promise<void> {
  const select = event.target as HTMLSelectElement
  const tone = select.value as 'chime' | 'bell' | 'digital'
  if (tone === 'chime' || tone === 'bell' || tone === 'digital') {
    await userStore.updateSettings({ alarmTone: tone })
  }
}

async function onVolumeChange(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const vol = Number(input.value)
  if (!Number.isNaN(vol)) {
    await userStore.updateSettings({ soundVolume: vol })
  }
}

async function handleTestNotification(): Promise<void> {
  playPreviewSound('effect')
  const mode = await dispatchImmediateNotification({
    id: NOTIF_IDS.TEST,
    title: t('app.name'),
    body: t('settings.testNotifSent'),
    settings: userStore.settings,
    ignoreQuietHours: true,
  })
  notifPermState.value = await getNotificationPermissionState()
  showFeedback(
    mode === 'skipped'
      ? t('settings.testNotifNeedPerm')
      : t('settings.testNotifSent'),
    false
  )
}

// =========================================================================
// Group 3: Data Management (Export / Validated Import Confirm / Reset Confirm)
// =========================================================================
async function handleExportDownload(): Promise<void> {
  try {
    const json = await generateBackupJson()
    jsonTextBuffer.value = json
    triggerBackupDownload(json)
    showFeedback(t('settings.exportSuccess'), false)
  } catch {
    showFeedback(t('settings.minimal.exportError'), true)
  }
}

async function handleCopyBackupJson(): Promise<void> {
  try {
    const json = await generateBackupJson()
    jsonTextBuffer.value = json
    showPasteJsonBox.value = true
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(json)
      showFeedback(t('settings.copySuccess'), false)
      return
    }
    showFeedback(t('settings.exportSuccess'), false)
  } catch {
    showFeedback(t('settings.minimal.exportError'), true)
  }
}

function triggerFileInput(): void {
  fileInputRef.value?.click()
}

function prepareValidatedImport(rawJson: string): void {
  const parsed = validateBackupPayload(rawJson)
  if (!parsed) {
    showFeedback(t('settings.importError'), true)
    return
  }

  pendingImportJson.value = rawJson
  pendingImportPreview.value = {
    exportedAt: parsed.exportedAt || '',
    schemaVersion: parsed.schemaVersion,
    sessionsCount: Array.isArray(parsed.data.studySessions)
      ? parsed.data.studySessions.length
      : 0,
    topicsCount: Array.isArray(parsed.data.learningTopics)
      ? parsed.data.learningTopics.length
      : 0,
    habitsCount: Array.isArray(parsed.data.habits)
      ? parsed.data.habits.length
      : 0,
  }
  confirmModalMode.value = 'import'
  confirmModalOpen.value = true
}

async function handleFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const content = await file.text()
    prepareValidatedImport(content)
  } catch {
    showFeedback(t('settings.importError'), true)
  } finally {
    input.value = ''
  }
}

function handlePrepareImportFromText(): void {
  if (!jsonTextBuffer.value.trim()) {
    showFeedback(t('settings.importError'), true)
    return
  }
  prepareValidatedImport(jsonTextBuffer.value)
}

function openResetModal(): void {
  pendingImportJson.value = ''
  pendingImportPreview.value = null
  confirmModalMode.value = 'reset'
  confirmModalOpen.value = true
}

function closeConfirmModal(): void {
  if (isModalBusy.value) return
  confirmModalOpen.value = false
  pendingImportJson.value = ''
  pendingImportPreview.value = null
}

async function handleModalConfirm(): Promise<void> {
  if (isModalBusy.value) return
  isModalBusy.value = true

  try {
    if (confirmModalMode.value === 'import') {
      const ok = await importBackupFromJson(pendingImportJson.value)
      if (ok) {
        showPasteJsonBox.value = false
        showFeedback(t('settings.importSuccess'), false)
      } else {
        showFeedback(t('settings.importError'), true)
      }
    } else {
      await resetAllApplicationData()
      jsonTextBuffer.value = ''
      showPasteJsonBox.value = false
      showFeedback(t('settings.resetSuccess'), false)
    }
  } catch {
    showFeedback(
      confirmModalMode.value === 'import'
        ? t('settings.importError')
        : t('settings.minimal.resetError'),
      true
    )
  } finally {
    isModalBusy.value = false
    confirmModalOpen.value = false
    pendingImportJson.value = ''
    pendingImportPreview.value = null
  }
}
</script>

<style scoped>
.ritme-settings-header {
  padding: 2px 2px 12px;
}

.ritme-settings-h1 {
  margin: 0;
  font-size: 1.24rem;
  font-weight: 800;
  line-height: 1.25;
  color: var(--ritme-text-primary);
}

.ritme-settings-desc {
  margin: 4px 0 0;
  font-size: 0.8rem;
}

.ritme-feedback-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 14px;
  margin-bottom: 12px;
  border-radius: var(--ritme-radius-md);
  background: var(--ritme-glass-surface-strong);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
  color: var(--ritme-text-primary);
  font-size: 0.8rem;
  font-weight: 700;
}

.ritme-feedback-banner.is-error {
  border-color: var(--ritme-danger-border);
  color: var(--ritme-danger);
}

.ritme-feedback-dismiss {
  background: transparent;
  border: none;
  color: inherit;
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.ritme-settings-group {
  margin-bottom: 14px;
}

.ritme-group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.ritme-group-icon {
  font-size: 1rem;
  color: var(--ritme-text-secondary);
  flex-shrink: 0;
}

.ritme-setting-block {
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid var(--ritme-border-line);
}

.ritme-setting-block.is-last {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: none;
}

.ritme-field-label {
  display: block;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ritme-text-secondary);
  margin-bottom: 7px;
}

.ritme-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ritme-inline-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ritme-save-inline-btn {
  min-height: 42px;
  padding: 0 14px;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.ritme-input-themed,
.ritme-select-themed {
  width: 100%;
  min-height: 44px;
  border-radius: var(--ritme-radius-sm);
  background: var(--ritme-input-bg);
  border: 1px solid var(--ritme-input-border);
  color: var(--ritme-text-primary);
  font-size: 0.86rem;
  padding: 0 12px;
}

.ritme-inline-error {
  margin: 6px 0 0;
  font-size: 0.73rem;
  font-weight: 600;
  color: var(--ritme-danger);
}

.ritme-segment-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  padding: 4px;
  border-radius: var(--ritme-radius-pill);
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
}

.ritme-segment-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 0 10px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--ritme-text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--ritme-motion-fast);
}

.ritme-segment-icon {
  font-size: 0.96rem;
  flex-shrink: 0;
}

.ritme-segment-btn.is-active {
  background: var(--ritme-state-selected-bg);
  border-color: var(--ritme-state-selected-border);
  color: var(--ritme-text-primary);
  box-shadow: var(--ritme-glass-inset);
}

.ritme-preset-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.ritme-preset-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.ritme-days-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 5px;
}

.ritme-day-pill {
  min-height: 36px;
  padding: 0 4px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid var(--ritme-border-line);
  background: var(--ritme-surface-subtle);
  color: var(--ritme-text-secondary);
  font-size: 0.73rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--ritme-motion-fast);
}

.ritme-day-pill.is-active {
  background: var(--ritme-btn-primary-bg);
  color: var(--ritme-btn-primary-text);
  border-color: var(--ritme-btn-primary-border);
}

.ritme-perm-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: var(--ritme-radius-md);
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
}

.ritme-perm-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ritme-perm-title {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ritme-text-secondary);
}

.ritme-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.ritme-toggle-text {
  min-width: 0;
  flex: 1;
}

.ritme-toggle-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--ritme-text-primary);
}

.ritme-toggle-sub {
  font-size: 0.72rem;
  margin-top: 2px;
  line-height: 1.38;
}

.ritme-switch {
  width: 48px;
  height: 28px;
  padding: 3px;
  border-radius: 999px;
  border: 1px solid var(--ritme-glass-border);
  background: var(--ritme-surface-subtle);
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--ritme-motion-fast), border-color var(--ritme-motion-fast);
}

.ritme-switch.is-on {
  background: var(--ritme-btn-primary-bg);
  border-color: var(--ritme-btn-primary-border);
  justify-content: flex-end;
}

.ritme-switch-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ritme-text-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
  transition: transform var(--ritme-motion-fast);
}

.ritme-switch.is-on .ritme-switch-thumb {
  background: var(--ritme-btn-primary-text);
}

.ritme-time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.ritme-advanced-trigger {
  width: 100%;
  min-height: 38px;
  padding: 0 4px;
  border: none;
  background: transparent;
  color: var(--ritme-text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.ritme-advanced-panel {
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--ritme-border-line);
}

.ritme-action-row-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.ritme-primary-pill {
  min-height: 40px;
  padding: 0 10px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid var(--ritme-btn-primary-border);
  background: var(--ritme-btn-primary-bg);
  color: var(--ritme-btn-primary-text);
  box-shadow: var(--ritme-btn-primary-shadow);
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
}

.ritme-reset-zone {
  padding-top: 2px;
}

.ritme-reset-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ritme-danger);
}

.ritme-reset-trigger-btn {
  min-height: 40px;
  padding: 0 14px;
  border-radius: var(--ritme-radius-pill);
  background: var(--ritme-danger-soft);
  border: 1px solid var(--ritme-danger-border);
  color: var(--ritme-danger);
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.ritme-about-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ritme-about-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--ritme-radius-sm);
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
  font-size: 0.8rem;
  color: var(--ritme-text-primary);
}
</style>
