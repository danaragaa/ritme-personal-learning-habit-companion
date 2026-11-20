<template>
  <section class="ritme-card">
    <div class="ritme-section-header" style="align-items: center; margin-bottom: 10px;">
      <h2 class="ritme-section-title">
        {{ t('progress.minimal.historyTitle') }}
      </h2>
      <span class="ritme-badge ritme-glass-chip">
        {{ items.length }}
      </span>
    </div>

    <!-- Compact History Period Filter -->
    <div class="ritme-history-segment" role="tablist">
      <button
        v-for="opt in FILTER_OPTIONS"
        :key="opt.key"
        type="button"
        role="tab"
        :aria-selected="filter === opt.key"
        class="ritme-history-pill"
        :class="{ 'is-active': filter === opt.key }"
        @click="$emit('update:filter', opt.key)"
      >
        {{ t(opt.labelKey) }}
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="ritme-history-empty">
      <ion-icon
        :icon="timeOutline"
        style="font-size: 1.4rem; color: var(--ritme-text-muted); margin-bottom: 6px;"
      />
      <p class="ritme-subtitle" style="margin: 0; font-size: 0.78rem;">
        {{ t('progress.minimal.historyEmpty') }}
      </p>
    </div>

    <!-- Deduplicated Activity List -->
    <div v-else class="ritme-history-list">
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="ritme-list-item ritme-history-row"
      >
        <div class="ritme-history-icon" aria-hidden="true">
          <ion-icon
            :icon="iconForKind(item.kind)"
            style="font-size: 0.98rem;"
          />
        </div>

        <div class="ritme-history-body">
          <div class="ritme-history-title">
            {{ resolveItemTitle(item) }}
          </div>
          <div class="ritme-subtitle ritme-history-meta">
            <span>{{ kindLabel(item.kind) }}</span>
            <span v-if="item.subtestCode">• {{ item.subtestCode }}</span>
            <span>• {{ formatTimestamp(item.timestamp) }}</span>
          </div>
        </div>

        <span
          v-if="item.kind === 'focus_session'"
          class="ritme-badge ritme-glass-chip"
          style="flex-shrink: 0;"
        >
          {{ formatSessionDuration(item.durationMinutes || 0) }}
        </span>
        <span
          v-else
          class="ritme-badge ritme-glass-chip"
          style="flex-shrink: 0;"
        >
          {{
            item.kind === 'topic_completed'
              ? t('learning.tracker.statuses.completed')
              : t('learning.tracker.statuses.learning')
          }}
        </span>
      </div>

      <button
        v-if="items.length > DEFAULT_VISIBLE_COUNT"
        type="button"
        class="ritme-glass-pill"
        style="width: 100%; min-height: 36px; margin-top: 4px; font-size: 0.76rem;"
        @click="showAll = !showAll"
      >
        {{
          showAll
            ? t('progress.minimal.showLessBtn')
            : t('progress.minimal.showAllBtn', { count: items.length })
        }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  bookOutline,
  checkmarkCircleOutline,
  stopwatchOutline,
  timeOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { SEED_TOPIC_TITLES } from '@/services/learning/learningTrackerService'
import {
  formatFocusDuration,
  type LearningActivityItem,
  type LearningActivityKind,
  type ProgressHistoryFilter,
} from '@/services/analytics/progressSummaryService'

const DEFAULT_VISIBLE_COUNT = 6

const FILTER_OPTIONS: Array<{
  key: ProgressHistoryFilter
  labelKey: string
}> = [
  { key: 'today', labelKey: 'progress.minimal.filterToday' },
  { key: 'week', labelKey: 'progress.minimal.filterWeek' },
  { key: 'all', labelKey: 'progress.minimal.filterAll' },
]

const props = defineProps<{
  items: LearningActivityItem[]
  filter: ProgressHistoryFilter
  locale: 'id' | 'en'
}>()

defineEmits<{
  'update:filter': [value: ProgressHistoryFilter]
}>()

const { t, te } = useI18n()
const showAll = ref(false)

watch(
  () => props.filter,
  () => {
    showAll.value = false
  }
)

const visibleItems = computed(() =>
  showAll.value ? props.items : props.items.slice(0, DEFAULT_VISIBLE_COUNT)
)

function iconForKind(kind: LearningActivityKind): string {
  if (kind === 'focus_session') return stopwatchOutline
  if (kind === 'topic_completed') return checkmarkCircleOutline
  return bookOutline
}

function kindLabel(kind: LearningActivityKind): string {
  if (kind === 'focus_session') return t('progress.minimal.kindFocusSession')
  if (kind === 'topic_completed') return t('progress.minimal.kindTopicCompleted')
  return t('progress.minimal.kindTopicLearning')
}

function resolveItemTitle(item: LearningActivityItem): string {
  if (item.topicId && SEED_TOPIC_TITLES[item.topicId]) {
    const key = `defaultTopics.${item.topicId}`
    if (
      (!item.topicTitle ||
        item.topicTitle === SEED_TOPIC_TITLES[item.topicId]) &&
      te(key)
    ) {
      return t(key)
    }
  }
  if (item.topicTitle) {
    // Also check if a focus session stored a legacy raw seed title
    const matchedSeedEntry = Object.entries(SEED_TOPIC_TITLES).find(
      ([, title]) => title === item.topicTitle
    )
    if (matchedSeedEntry) {
      const key = `defaultTopics.${matchedSeedEntry[0]}`
      if (te(key)) return t(key)
    }
    return item.topicTitle
  }
  return t('focus.zen.freeFocusTitle')
}

function formatSessionDuration(minutes: number): string {
  if (minutes <= 0) {
    return t('progress.minimal.underOneMinShort')
  }
  return formatFocusDuration(minutes, props.locale)
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat(props.locale === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
</script>

<style scoped>
.ritme-history-segment {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  padding: 4px;
  border-radius: var(--ritme-radius-pill);
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
  margin-bottom: 12px;
}

.ritme-history-pill {
  min-height: 32px;
  padding: 0 8px;
  border-radius: var(--ritme-radius-pill);
  border: 1px solid transparent;
  background: transparent;
  color: var(--ritme-text-secondary);
  font-size: 0.74rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--ritme-motion-fast);
}

.ritme-history-pill.is-active {
  background: var(--ritme-state-selected-bg);
  border-color: var(--ritme-state-selected-border);
  color: var(--ritme-text-primary);
  box-shadow: var(--ritme-glass-inset);
}

.ritme-history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 18px 10px 10px;
}

.ritme-history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ritme-history-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
  padding: 10px 11px;
}

.ritme-history-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ritme-glass-surface-strong);
  border: 1px solid var(--ritme-border-line);
  color: var(--ritme-text-primary);
  flex-shrink: 0;
}

.ritme-history-body {
  min-width: 0;
  flex: 1;
}

.ritme-history-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--ritme-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ritme-history-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 0.7rem;
  margin-top: 2px;
}
</style>
