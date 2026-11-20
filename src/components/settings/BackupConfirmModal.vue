<template>
  <ion-modal
    :is-open="isOpen"
    :initial-breakpoint="mode === 'import' ? 0.56 : 0.46"
    :breakpoints="[0, 0.46, 0.56, 0.78]"
    css-class="ritme-glass-modal"
    @didDismiss="$emit('close')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>
          {{
            mode === 'import'
              ? t('settings.minimal.importModalTitle')
              : t('settings.minimal.resetModalTitle')
          }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button :disabled="isBusy" @click="$emit('close')">
            {{ t('learning.cancelBtn') }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="ritme-confirm-sheet">
        <div
          class="ritme-confirm-icon"
          :class="{ 'is-danger': mode === 'reset' }"
          aria-hidden="true"
        >
          <ion-icon
            :icon="
              mode === 'import' ? cloudUploadOutline : warningOutline
            "
            style="font-size: 1.55rem;"
          />
        </div>

        <h2 class="ritme-confirm-heading">
          {{
            mode === 'import'
              ? t('settings.minimal.importConfirmHeading')
              : t('settings.minimal.resetConfirmHeading')
          }}
        </h2>

        <p class="ritme-subtitle ritme-confirm-desc">
          {{
            mode === 'import'
              ? t('settings.minimal.importConfirmDesc')
              : t('settings.minimal.resetConfirmDesc')
          }}
        </p>

        <!-- Validated Backup Summary Preview (Import Mode Only) -->
        <div
          v-if="mode === 'import' && importPreview"
          class="ritme-preview-box"
        >
          <div class="ritme-preview-row">
            <span class="ritme-subtitle">
              {{ t('settings.minimal.importPreviewDate') }}
            </span>
            <strong>{{ formattedExportDate }}</strong>
          </div>
          <div class="ritme-preview-row">
            <span class="ritme-subtitle">
              {{ t('settings.minimal.importPreviewContent') }}
            </span>
            <strong>
              {{
                t('settings.minimal.importPreviewCounts', {
                  sessions: importPreview.sessionsCount,
                  topics: importPreview.topicsCount,
                  habits: importPreview.habitsCount,
                })
              }}
            </strong>
          </div>
        </div>

        <div class="ritme-confirm-actions">
          <button
            type="button"
            class="ritme-glass-pill ritme-confirm-btn"
            :disabled="isBusy"
            @click="$emit('close')"
          >
            {{ t('learning.cancelBtn') }}
          </button>

          <button
            type="button"
            class="ritme-confirm-btn"
            :class="
              mode === 'reset'
                ? 'ritme-confirm-danger-btn'
                : 'ritme-confirm-primary-btn'
            "
            :disabled="isBusy"
            @click="$emit('confirm')"
          >
            {{
              mode === 'import'
                ? t('settings.minimal.importConfirmYesBtn')
                : t('settings.minimal.resetConfirmYesBtn')
            }}
          </button>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import { cloudUploadOutline, warningOutline } from 'ionicons/icons'
import { useI18n } from 'vue-i18n'

export interface BackupImportPreview {
  exportedAt: string
  schemaVersion: 1 | 2
  sessionsCount: number
  topicsCount: number
  habitsCount: number
}

const props = defineProps<{
  isOpen: boolean
  mode: 'import' | 'reset'
  isBusy: boolean
  locale: 'id' | 'en'
  importPreview?: BackupImportPreview | null
}>()

defineEmits<{
  close: []
  confirm: []
}>()

const { t } = useI18n()

const formattedExportDate = computed(() => {
  const raw = props.importPreview?.exportedAt
  if (!raw) return '-'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return raw
  return new Intl.DateTimeFormat(props.locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
})
</script>

<style scoped>
.ritme-confirm-sheet {
  padding: 18px 18px 28px;
  text-align: center;
}

.ritme-confirm-icon {
  width: 50px;
  height: 50px;
  margin: 0 auto 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ritme-glass-surface-strong);
  border: 1px solid var(--ritme-glass-border);
  box-shadow: var(--ritme-glass-inset);
  color: var(--ritme-text-primary);
}

.ritme-confirm-icon.is-danger {
  background: var(--ritme-danger-soft);
  border-color: var(--ritme-danger-border);
  color: var(--ritme-danger);
}

.ritme-confirm-heading {
  margin: 0 0 6px;
  font-size: 1.04rem;
  font-weight: 800;
  color: var(--ritme-text-primary);
}

.ritme-confirm-desc {
  margin: 0 auto 14px;
  font-size: 0.8rem;
  line-height: 1.48;
  max-width: 320px;
}

.ritme-preview-box {
  padding: 10px 12px;
  margin-bottom: 16px;
  border-radius: var(--ritme-radius-md);
  background: var(--ritme-glass-surface);
  border: 1px solid var(--ritme-border-line);
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.ritme-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 0.76rem;
  color: var(--ritme-text-primary);
}

.ritme-confirm-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.ritme-confirm-btn {
  min-height: 44px;
  padding: 0 12px;
  border-radius: var(--ritme-radius-pill);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--ritme-motion-fast);
}

.ritme-confirm-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.ritme-confirm-primary-btn {
  background: var(--ritme-btn-primary-bg);
  color: var(--ritme-btn-primary-text);
  border: 1px solid var(--ritme-btn-primary-border);
  box-shadow: var(--ritme-btn-primary-shadow);
}

.ritme-confirm-danger-btn {
  background: var(--ritme-danger);
  color: #101114;
  border: 1px solid transparent;
}
</style>
