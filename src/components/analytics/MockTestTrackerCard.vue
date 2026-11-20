<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title ritme-title-row">
          <ion-icon :icon="statsChartOutline" style="color: var(--ritme-accent-secondary);" />
          <span>{{ t('progress.mockTrackerTitle') }}</span>
        </h2>
        <p class="ritme-subtitle" style="margin-top: 2px;">
          {{ t('progress.mockTrackerSubtitle') }}
        </p>
      </div>
      <button
        type="button"
        class="ritme-glass-pill"
        style="min-height: 34px; padding: 0 12px; font-size: 0.74rem;"
        @click="showMockForm = !showMockForm"
      >
        {{ showMockForm ? t('learning.cancelBtn') : t('progress.addMockBtn') }}
      </button>
    </div>

    <!-- Target Score & Delta Bar -->
    <div
      style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-surface-subtle); border: 1px solid var(--ritme-border-line); margin-bottom: 12px;"
    >
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span class="ritme-title-row" style="font-size: 0.78rem; font-weight: 700; gap: 5px;">
          <ion-icon :icon="locateOutline" style="font-size: 0.92rem; color: var(--ritme-gold);" />
          {{ t('progress.mockTargetLabel', { score: analytics.targetMockScore }) }}
        </span>
        <span
          v-if="analytics.latestDeltaFromTarget !== null"
          class="ritme-badge"
          :class="{
            'ritme-badge-gold': analytics.latestDeltaFromTarget >= 0,
          }"
          :style="
            analytics.latestDeltaFromTarget >= 0
              ? {}
              : {
                  background: 'var(--ritme-warning-soft)',
                  color: 'var(--ritme-warning)',
                }
          "
        >
          {{
            analytics.latestDeltaFromTarget >= 0
              ? t('progress.mockDeltaAbove', {
                  diff: analytics.latestDeltaFromTarget,
                })
              : t('progress.mockDeltaBelow', {
                  diff: Math.abs(analytics.latestDeltaFromTarget),
                })
          }}
        </span>
      </div>

      <div
        v-if="editingTarget"
        style="display: flex; align-items: center; gap: 6px;"
      >
        <input
          v-model.number="targetScoreInput"
          type="number"
          min="100"
          max="1000"
          class="ritme-input"
          style="width: 84px; height: 28px; padding: 0 8px; font-size: 0.78rem;"
        />
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 28px; padding: 0 8px; font-size: 0.72rem; border-color: var(--ritme-accent-primary); color: var(--ritme-accent-primary);"
          @click="saveTargetScore"
        >
          {{ t('progress.saveTargetBtn') }}
        </button>
      </div>
      <button
        v-else
        type="button"
        class="ritme-btn-outline"
        style="height: 26px; padding: 0 9px; font-size: 0.72rem;"
        @click="startEditTarget"
      >
        {{ t('progress.editTargetBtn') }}
      </button>
    </div>

    <!-- Mock Stats Summary (4 tiles) -->
    <div
      v-if="analytics.count > 0"
      style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px;"
    >
      <div class="ritme-summary-tile">
        <div class="ritme-subtitle" style="font-size: 0.7rem;">
          {{ t('progress.mockLatest', { score: analytics.latestScore }) }}
        </div>
      </div>
      <div class="ritme-summary-tile">
        <div
          class="ritme-subtitle"
          style="font-size: 0.7rem; color: var(--ritme-gold); font-weight: 700;"
        >
          {{ t('progress.mockHighest', { score: analytics.highestScore }) }}
        </div>
      </div>
      <div class="ritme-summary-tile">
        <div
          class="ritme-subtitle"
          style="font-size: 0.7rem; color: var(--ritme-accent-secondary); font-weight: 700;"
        >
          {{ t('progress.mockAverage', { score: analytics.averageScore }) }}
        </div>
      </div>
      <div class="ritme-summary-tile">
        <div
          class="ritme-subtitle"
          style="font-size: 0.7rem; font-weight: 700;"
          :style="{
            color:
              analytics.count < 2
                ? 'var(--ritme-text-secondary)'
                : analytics.trendDelta >= 0
                  ? 'var(--ritme-accent-secondary)'
                  : 'var(--ritme-warning)',
          }"
        >
          {{
            analytics.count < 2
              ? t('progress.mockTrendSingle')
              : t('progress.mockTrendDelta', {
                  delta:
                    analytics.trendDelta >= 0
                      ? `+${analytics.trendDelta}`
                      : `${analytics.trendDelta}`,
                })
          }}
        </div>
      </div>
    </div>

    <!-- SVG Mock Score Trend Chart -->
    <div
      v-if="analytics.chronologicalPoints.length > 0"
      style="padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line); margin-bottom: 12px;"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 0.76rem; font-weight: 700;"
      >
        <span class="ritme-title-row" style="gap: 5px;">
          <ion-icon :icon="trendingUpOutline" style="font-size: 0.92rem; color: var(--ritme-accent-secondary);" />
          {{ t('progress.mockTrendChartTitle') }}
        </span>
        <span class="ritme-subtitle" style="font-size: 0.7rem;">
          {{ t('progress.mockTargetLegend', { score: analytics.targetMockScore }) }}
        </span>
      </div>

      <svg
        viewBox="0 0 320 120"
        style="width: 100%; height: 120px; display: block; overflow: visible;"
      >
        <!-- Subtle Top & Bottom Grid Lines -->
        <line
          x1="20"
          y1="16"
          x2="300"
          y2="16"
          stroke="var(--ritme-border-line)"
          stroke-width="1"
          stroke-dasharray="3 3"
        />
        <line
          x1="20"
          y1="96"
          x2="300"
          y2="96"
          stroke="var(--ritme-border-line)"
          stroke-width="1"
        />

        <!-- Target Score Line -->
        <line
          x1="20"
          :y1="chartGeometry.targetY"
          x2="300"
          :y2="chartGeometry.targetY"
          stroke="var(--ritme-gold)"
          stroke-width="1.2"
          stroke-dasharray="5 4"
        />

        <!-- Score Polyline -->
        <polyline
          v-if="chartGeometry.points.length > 1"
          fill="none"
          stroke="var(--ritme-accent-secondary)"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :points="chartGeometry.polylinePoints"
        />

        <!-- Data Nodes & Labels -->
        <g v-for="pt in chartGeometry.points" :key="pt.id">
          <circle
            :cx="pt.x"
            :cy="pt.y"
            r="4.5"
            fill="var(--ritme-accent-primary)"
            stroke="var(--ritme-bg-card)"
            stroke-width="1.5"
          />
          <text
            :x="pt.x"
            :y="Math.max(12, pt.y - 8)"
            text-anchor="middle"
            fill="var(--ritme-text-primary)"
            font-size="9.5"
            font-weight="700"
          >
            {{ pt.score }}
          </text>
          <text
            :x="pt.x"
            y="112"
            text-anchor="middle"
            fill="var(--ritme-text-secondary)"
            font-size="8.5"
          >
            {{ pt.shortDate }}
          </text>
        </g>
      </svg>
    </div>

    <!-- Per-Subtest Performance Breakdown -->
    <div
      v-if="analytics.subtestPerformance.length > 0"
      style="padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line); margin-bottom: 12px;"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;"
      >
        <span
          class="ritme-title-row"
          style="font-size: 0.78rem; font-weight: 700; color: var(--ritme-accent-secondary); gap: 5px;"
        >
          <ion-icon :icon="compassOutline" style="font-size: 0.92rem;" />
          {{ t('progress.mockSubtestPerfTitle') }}
        </span>
        <span
          v-if="analytics.weakestSubtest"
          class="ritme-badge"
          style="background: var(--ritme-warning-soft); color: var(--ritme-warning); font-size: 0.68rem;"
        >
          {{
            t('progress.mockWeakestSubtestBadge', {
              code: analytics.weakestSubtest.code,
              score: analytics.weakestSubtest.averageScore,
            })
          }}
        </span>
      </div>

      <div
        style="display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 6px;"
      >
        <div
          v-for="sub in analytics.subtestPerformance"
          :key="sub.subtestId"
          style="padding: 7px 9px; border-radius: 8px; background: var(--ritme-bg-primary); border: 1px solid var(--ritme-border-line);"
        >
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="font-size: 0.74rem; color: var(--ritme-text-primary);">
              {{ sub.code }}
            </strong>
            <span
              v-if="sub.deltaFromPrev !== null"
              style="font-size: 0.68rem; font-weight: 700;"
              :style="{
                color:
                  sub.deltaFromPrev >= 0
                    ? 'var(--ritme-accent-secondary)'
                    : 'var(--ritme-warning)',
              }"
            >
              {{ sub.deltaFromPrev >= 0 ? `+${sub.deltaFromPrev}` : sub.deltaFromPrev }}
            </span>
          </div>
          <div style="font-size: 0.86rem; font-weight: 800; color: var(--ritme-accent-primary); margin-top: 2px;">
            {{ sub.averageScore }}
          </div>
          <div class="ritme-subtitle" style="font-size: 0.66rem;">
            {{ t('progress.mockSubtestLatest', { score: sub.latestScore }) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Add Mock Test Form (Complete PRD Section 13.3 fields) -->
    <div
      v-if="showMockForm"
      style="padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-highlight); margin-bottom: 12px;"
    >
      <div class="ritme-grid-2" style="margin-bottom: 8px;">
        <div>
          <label class="ritme-label">{{ t('progress.mockNameLabel') }}</label>
          <input
            v-model="mockNameInput"
            type="text"
            class="ritme-input"
            :placeholder="t('progress.mockNamePlaceholder')"
          />
        </div>
        <div>
          <label class="ritme-label">{{ t('progress.mockSourceLabel') }}</label>
          <input
            v-model="mockSourceInput"
            type="text"
            class="ritme-input"
            :placeholder="t('progress.mockSourcePlaceholder')"
          />
        </div>
      </div>

      <div class="ritme-grid-2" style="margin-bottom: 8px;">
        <div>
          <label class="ritme-label">{{ t('progress.mockDateLabel') }}</label>
          <input v-model="mockDateInput" type="date" class="ritme-input" />
        </div>
        <div>
          <label class="ritme-label">{{ t('progress.mockDurationLabel') }}</label>
          <input
            v-model.number="mockDurationInput"
            type="number"
            min="10"
            max="360"
            class="ritme-input"
          />
        </div>
      </div>

      <div class="ritme-grid-2" style="margin-bottom: 8px;">
        <div>
          <label class="ritme-label">{{ t('progress.mockScoreLabel') }}</label>
          <input
            v-model.number="mockScoreInput"
            type="number"
            min="0"
            max="1000"
            class="ritme-input"
          />
        </div>
        <div>
          <label class="ritme-label">{{ t('progress.mockTotalLabel') }}</label>
          <input
            v-model.number="mockTotalInput"
            type="number"
            min="1"
            max="250"
            class="ritme-input"
          />
        </div>
      </div>

      <div class="ritme-grid-2" style="margin-bottom: 8px;">
        <div>
          <label class="ritme-label">{{ t('progress.mockAttemptedLabel') }}</label>
          <input
            v-model.number="mockAttemptedInput"
            type="number"
            min="0"
            :max="mockTotalInput"
            class="ritme-input"
          />
        </div>
        <div>
          <label class="ritme-label">{{ t('progress.mockCorrectLabel') }}</label>
          <input
            v-model.number="mockCorrectInput"
            type="number"
            min="0"
            :max="mockAttemptedInput"
            class="ritme-input"
          />
        </div>
      </div>

      <!-- Optional Per-Subtest Scores -->
      <div style="margin-bottom: 10px;">
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 30px; padding: 0 10px; font-size: 0.74rem; width: 100%;"
          @click="showSubtestScoreInputs = !showSubtestScoreInputs"
        >
          {{
            showSubtestScoreInputs
              ? t('progress.hideMockSubtestInputsBtn')
              : t('progress.showMockSubtestInputsBtn')
          }}
        </button>

        <div
          v-if="showSubtestScoreInputs"
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 6px; margin-top: 8px; padding: 8px; border-radius: 8px; background: var(--ritme-bg-primary); border: 1px solid var(--ritme-border-line);"
        >
          <div v-for="sub in learningStore.sortedSubtests" :key="sub.id">
            <label
              class="ritme-subtitle"
              style="display: block; font-size: 0.68rem; margin-bottom: 3px;"
            >
              {{ sub.code }}
            </label>
            <input
              v-model.number="mockSubtestInputs[sub.id]"
              type="number"
              min="0"
              max="1000"
              placeholder="0–1000"
              class="ritme-input"
              style="height: 30px; padding: 0 8px; font-size: 0.76rem;"
            />
          </div>
        </div>
      </div>

      <div class="ritme-form-group" style="margin-bottom: 8px;">
        <label class="ritme-label">{{ t('progress.mockNotesLabel') }}</label>
        <input
          v-model="mockNotesInput"
          type="text"
          class="ritme-input"
          :placeholder="t('progress.mockNotesPlaceholder')"
        />
      </div>

      <p
        class="ritme-subtitle ritme-title-row"
        style="width: 100%; font-size: 0.7rem; margin: 0 0 10px; line-height: 1.4; align-items: flex-start;"
      >
        <ion-icon :icon="informationCircleOutline" style="font-size: 0.88rem; margin-top: 2px; flex-shrink: 0;" />
        <span>{{ t('progress.mockScoringDisclaimer') }}</span>
      </p>

      <button
        type="button"
        class="ritme-btn-primary"
        style="height: 38px; font-size: 0.84rem;"
        @click="handleAddMockTest"
      >
        {{ t('progress.saveMockBtn') }}
      </button>
    </div>

    <p
      v-if="analytics.reverseHistory.length === 0"
      class="ritme-subtitle"
      style="text-align: center; padding: 8px 0;"
    >
      {{ t('progress.emptyMockTests') }}
    </p>

    <!-- Mock Test History List -->
    <div
      v-for="entry in analytics.reverseHistory"
      :key="entry.record.id"
      class="ritme-list-item"
      style="display: block;"
    >
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
        <div style="min-width: 0; flex: 1;">
          <div style="font-weight: 700; font-size: 0.88rem;">
            {{ entry.record.testName }}
          </div>
          <div class="ritme-subtitle" style="font-size: 0.73rem; margin-top: 2px;">
            {{ entry.record.date }} • {{ entry.record.source }} • {{ entry.record.durationMinutes }}
            {{ t('focus.minutesShort') }}
          </div>
          <div class="ritme-subtitle" style="font-size: 0.73rem; margin-top: 2px;">
            {{
              t('progress.mockAttemptBreakdown', {
                correct: entry.record.correctAnswers,
                incorrect: entry.record.incorrectAnswers,
                attempted: entry.record.attemptedQuestions || entry.record.totalQuestions,
                total: entry.record.totalQuestions,
                accuracy: entry.accuracyPercent,
              })
            }}
          </div>
        </div>

        <div style="text-align: right; flex-shrink: 0;">
          <span class="ritme-badge ritme-badge-gold" style="font-size: 0.84rem;">
            {{ entry.record.overallScore }}
          </span>
          <div
            v-if="entry.deltaFromPrev !== null"
            style="font-size: 0.7rem; font-weight: 700; margin-top: 3px;"
            :style="{
              color:
                entry.deltaFromPrev >= 0
                  ? 'var(--ritme-accent-secondary)'
                  : 'var(--ritme-warning)',
            }"
          >
            {{
              t('progress.mockVsPrev', {
                delta:
                  entry.deltaFromPrev >= 0
                    ? `+${entry.deltaFromPrev}`
                    : `${entry.deltaFromPrev}`,
              })
            }}
          </div>
        </div>
      </div>

      <!-- Per-subtest score pills for this mock entry -->
      <div
        v-if="Object.keys(entry.record.subtestScores || {}).length > 0"
        style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px;"
      >
        <span
          v-for="(val, subId) in entry.record.subtestScores"
          :key="subId"
          class="ritme-badge"
          style="font-size: 0.68rem;"
        >
          {{ resolveSubtestCode(String(subId)) }}: {{ val }}
        </span>
      </div>

      <div
        v-if="entry.record.notes"
        class="ritme-subtitle"
        style="font-size: 0.74rem; margin-top: 6px; color: var(--ritme-text-primary);"
      >
        “{{ entry.record.notes }}”
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
        <button
          v-if="confirmDeleteMockId !== entry.record.id"
          type="button"
          class="ritme-btn-danger"
          style="min-height: 30px; padding: 0 10px; font-size: 0.7rem;"
          @click="confirmDeleteMockId = entry.record.id"
        >
          {{ t('learning.deleteBtn') }}
        </button>
        <div v-else style="display: flex; gap: 6px;">
          <button
            type="button"
            class="ritme-glass-pill"
            style="min-height: 30px; padding: 0 10px; font-size: 0.7rem;"
            @click="confirmDeleteMockId = null"
          >
            {{ t('learning.cancelBtn') }}
          </button>
          <button
            type="button"
            class="ritme-btn-danger"
            style="min-height: 30px; padding: 0 10px; font-size: 0.7rem;"
            @click="handleDeleteMock(entry.record.id)"
          >
            {{ t('learning.confirmDeleteYes') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { IonIcon } from '@ionic/vue'
import {
  compassOutline,
  informationCircleOutline,
  locateOutline,
  statsChartOutline,
  trendingUpOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import { buildMockTestAnalytics } from '@/services/analytics/learningAnalytics'
import { getLocalDateString } from '@/utils/date'

const { t } = useI18n()
const learningStore = useLearningStore()
const userStore = useUserStore()

const showMockForm = ref(false)
const showSubtestScoreInputs = ref(false)
const mockNameInput = ref('')
const mockSourceInput = ref('')
const mockDateInput = ref(getLocalDateString())
const mockDurationInput = ref(195)
const mockScoreInput = ref(620)
const mockTotalInput = ref(155)
const mockAttemptedInput = ref(155)
const mockCorrectInput = ref(95)
const mockNotesInput = ref('')
const mockSubtestInputs = reactive<Record<string, number | undefined>>({})

const editingTarget = ref(false)
const targetScoreInput = ref(userStore.settings.targetMockScore || 700)
const confirmDeleteMockId = ref<string | null>(null)

const analytics = computed(() =>
  buildMockTestAnalytics(
    learningStore.mockTests,
    learningStore.sortedSubtests,
    userStore.settings.targetMockScore || 700
  )
)

const chartGeometry = computed(() => {
  const entries = analytics.value.chronologicalPoints
  const target = analytics.value.targetMockScore
  const allVals = [...entries.map((e) => e.record.overallScore), target]
  const rawMin = allVals.length ? Math.min(...allVals) : 400
  const rawMax = allVals.length ? Math.max(...allVals) : 800
  const minBound = Math.max(0, rawMin - 60)
  const maxBound = Math.min(1000, Math.max(minBound + 100, rawMax + 60))

  const mapY = (score: number): number => {
    const ratio = (score - minBound) / (maxBound - minBound)
    return Math.round((96 - ratio * 80) * 10) / 10
  }

  const pts = entries.map((e, idx) => {
    const x =
      entries.length === 1
        ? 160
        : Math.round((24 + (idx / (entries.length - 1)) * 272) * 10) / 10
    const y = mapY(e.record.overallScore)
    const parts = e.record.date.split('-')
    const shortDate =
      parts.length === 3 ? `${parts[2]}/${parts[1]}` : e.record.date.slice(-5)
    return {
      id: e.record.id,
      x,
      y,
      score: e.record.overallScore,
      shortDate,
    }
  })

  return {
    targetY: mapY(target),
    points: pts,
    polylinePoints: pts.map((p) => `${p.x},${p.y}`).join(' '),
  }
})

function resolveSubtestCode(subtestId: string): string {
  return learningStore.getSubtestById(subtestId)?.code || subtestId
}

function startEditTarget() {
  targetScoreInput.value = analytics.value.targetMockScore
  editingTarget.value = true
}

async function saveTargetScore() {
  const clamped = Math.max(
    100,
    Math.min(1000, Math.round(Number(targetScoreInput.value) || 700))
  )
  await userStore.updateSettings({ targetMockScore: clamped })
  editingTarget.value = false
}

async function handleAddMockTest() {
  if (!mockNameInput.value.trim()) return

  const subtestScores: Record<string, number> = {}
  for (const sub of learningStore.sortedSubtests) {
    const val = mockSubtestInputs[sub.id]
    if (typeof val === 'number' && !Number.isNaN(val) && val > 0) {
      subtestScores[sub.id] = Math.max(0, Math.min(1000, Math.round(val)))
    }
  }

  const totalQ = Math.max(1, Math.round(Number(mockTotalInput.value) || 155))
  const attemptedQ = Math.min(
    totalQ,
    Math.max(0, Math.round(Number(mockAttemptedInput.value) || totalQ))
  )
  const correctQ = Math.min(
    attemptedQ,
    Math.max(0, Math.round(Number(mockCorrectInput.value) || 0))
  )

  await learningStore.addMockTestRecord({
    testName: mockNameInput.value,
    date: mockDateInput.value || getLocalDateString(),
    source: mockSourceInput.value.trim() || t('progress.mockSourceDefault'),
    durationMinutes: Math.max(10, Number(mockDurationInput.value) || 195),
    totalQuestions: totalQ,
    attemptedQuestions: attemptedQ,
    correctAnswers: correctQ,
    incorrectAnswers: Math.max(0, attemptedQ - correctQ),
    overallScore: Math.max(
      0,
      Math.min(1000, Math.round(Number(mockScoreInput.value) || 0))
    ),
    subtestScores,
    notes: mockNotesInput.value,
  })

  mockNameInput.value = ''
  mockSourceInput.value = ''
  mockNotesInput.value = ''
  for (const k of Object.keys(mockSubtestInputs)) {
    mockSubtestInputs[k] = undefined
  }
  showSubtestScoreInputs.value = false
  showMockForm.value = false
}

async function handleDeleteMock(mockId: string) {
  await learningStore.deleteMockTestRecord(mockId)
  confirmDeleteMockId.value = null
}
</script>
