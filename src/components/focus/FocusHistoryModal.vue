<template>
  <ion-modal
    class="ritme-glass-modal"
    :is-open="isOpen"
    :initial-breakpoint="0.76"
    :breakpoints="[0, 0.76, 0.94]"
    @didDismiss="$emit('close')"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title style="font-size: 1rem;">
          {{ t('focus.historyTitle') }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$emit('close')">
            {{ t('focus.zen.closeHistoryBtn') }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :scroll-y="true">
      <div class="ritme-page-container" style="padding-top: 10px;">
        <div class="ritme-card">
          <div
            v-if="sessions.length === 0"
            class="ritme-subtitle"
            style="text-align: center; padding: 14px 6px;"
          >
            {{ t('focus.historyEmpty') }}
          </div>

          <div v-else>
            <div
              v-for="session in sessions"
              :key="session.id"
              class="ritme-list-item"
              style="padding: 11px 12px;"
            >
              <div style="min-width: 0; flex: 1;">
                <div
                  style="font-weight: 700; font-size: 0.88rem; color: var(--ritme-text-primary); line-height: 1.3; overflow-wrap: break-word;"
                >
                  {{ resolveSessionTopic(session) }}
                </div>
                <div
                  class="ritme-subtitle"
                  style="font-size: 0.75rem; margin-top: 3px;"
                >
                  <span v-if="resolveSubtestCode(session.subjectId)">
                    {{ resolveSubtestCode(session.subjectId) }} •
                  </span>
                  {{ formatSessionDate(session.startTime) }}
                </div>
              </div>

              <span class="ritme-badge" style="flex-shrink: 0;">
                {{
                  t('focus.zen.historyDurationTag', {
                    minutes: session.durationMinutes,
                  })
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { useI18n } from 'vue-i18n'
import { SEED_TOPIC_TITLES } from '@/services/learning/learningTrackerService'
import type { AppLanguage, LearningTopic, StudySession, SubtestCategory } from '@/types'

const props = defineProps<{
  isOpen: boolean
  sessions: StudySession[]
  subtests: SubtestCategory[]
  topics: LearningTopic[]
  language: AppLanguage
}>()

defineEmits<{
  close: []
}>()

const { t, te } = useI18n()

function resolveSubtestCode(subjectId: string): string {
  if (!subjectId) return ''
  const sub = props.subtests.find((s) => s.id === subjectId)
  return sub ? sub.code : ''
}

function resolveSessionTopic(session: StudySession): string {
  const raw = (session.topicId || '').trim()
  if (!raw) return t('focus.zen.freeFocusTitle')

  const matched = props.topics.find(
    (item) => item.id === raw || item.title === raw
  )
  if (matched) {
    const seedTitle = SEED_TOPIC_TITLES[matched.id]
    const key = `defaultTopics.${matched.id}`
    if (seedTitle && matched.title === seedTitle && te(key)) {
      return t(key)
    }
    return matched.title
  }

  for (const [id, seedTitle] of Object.entries(SEED_TOPIC_TITLES)) {
    if (raw === id || raw === seedTitle) {
      const key = `defaultTopics.${id}`
      if (te(key)) return t(key)
    }
  }

  return raw
}

function formatSessionDate(isoString: string): string {
  const d = new Date(isoString)
  return new Intl.DateTimeFormat(props.language === 'id' ? 'id-ID' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
</script>
