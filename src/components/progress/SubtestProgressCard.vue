<template>
  <section class="ritme-card">
    <div class="ritme-section-header" style="align-items: flex-start; margin-bottom: 12px;">
      <div style="min-width: 0;">
        <h2 class="ritme-section-title">
          {{ t('progress.minimal.subtestsTitle') }}
        </h2>
        <p class="ritme-subtitle" style="margin: 2px 0 0; font-size: 0.75rem;">
          {{ t('progress.minimal.subtestsSubtitle') }}
        </p>
      </div>
      <span class="ritme-badge ritme-glass-chip" style="flex-shrink: 0;">
        {{
          t('progress.minimal.subtestsTotalBadge', {
            done: totalCompleted,
            total: totalTopics,
          })
        }}
      </span>
    </div>

    <div class="ritme-subtest-list">
      <div
        v-for="item in subtestItems"
        :key="item.subtestId"
        class="ritme-subtest-row"
      >
        <div class="ritme-subtest-meta">
          <div class="ritme-subtest-label">
            <span class="ritme-subtest-code">{{ item.code }}</span>
            <span class="ritme-subtest-name">
              {{ locale === 'id' ? item.nameId : item.nameEn }}
            </span>
          </div>
          <span class="ritme-subtest-ratio">
            {{ item.completedTopics }}/{{ item.totalTopics }}
          </span>
        </div>

        <div class="ritme-progress-track" style="height: 6px;">
          <div
            class="ritme-progress-fill"
            :style="{ width: `${item.completionPercent}%` }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { SubtestCompletionItem } from '@/services/analytics/progressSummaryService'

const props = defineProps<{
  subtestItems: SubtestCompletionItem[]
  locale: 'id' | 'en'
}>()

const { t } = useI18n()

const totalCompleted = computed(() =>
  props.subtestItems.reduce((sum, item) => sum + item.completedTopics, 0)
)

const totalTopics = computed(() =>
  props.subtestItems.reduce((sum, item) => sum + item.totalTopics, 0)
)
</script>

<style scoped>
.ritme-subtest-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.ritme-subtest-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.ritme-subtest-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.ritme-subtest-label {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
  flex: 1;
}

.ritme-subtest-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  background: var(--ritme-surface-subtle);
  border: 1px solid var(--ritme-border-line);
  color: var(--ritme-text-primary);
  flex-shrink: 0;
}

.ritme-subtest-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ritme-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ritme-subtest-ratio {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ritme-text-secondary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}
</style>
