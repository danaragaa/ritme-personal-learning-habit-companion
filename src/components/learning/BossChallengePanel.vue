<template>
  <div class="ritme-card">
    <div class="ritme-section-header">
      <div>
        <h2 class="ritme-section-title ritme-title-row">
          <ion-icon :icon="shieldOutline" style="color: var(--ritme-gold);" />
          <span>{{ t('learning.bossTitle') }}</span>
        </h2>
        <p class="ritme-subtitle" style="margin-top: 2px;">
          {{ t('learning.bossSubtitle') }}
        </p>
      </div>
    </div>

    <!-- Boss Configuration -->
    <div v-if="!bossSessionActive" style="margin-bottom: 12px;">
      <div class="ritme-grid-2" style="margin-bottom: 8px;">
        <div>
          <label class="ritme-label">{{ t('learning.bossLevelLabel') }}</label>
          <select v-model="bossType" class="ritme-input">
            <option value="mini_boss">{{ t('learning.bossTypeMini') }}</option>
            <option value="chapter_boss">{{ t('learning.bossTypeChapter') }}</option>
            <option value="subtest_boss">{{ t('learning.bossTypeSubtest') }}</option>
            <option
              value="final_challenge"
              :disabled="!learningStore.finalChallengeEligible"
            >
              {{ t('learning.bossTypeFinal') }}
            </option>
          </select>
        </div>
        <div v-if="bossType !== 'final_challenge'">
          <label class="ritme-label">{{ t('focus.subjectLabel') }}</label>
          <select v-model="bossSubtestId" class="ritme-input">
            <option
              v-for="sub in learningStore.sortedSubtests"
              :key="sub.id"
              :value="sub.id"
            >
              {{ sub.code }} —
              {{ userStore.settings.language === 'id' ? sub.nameId : sub.nameEn }}
            </option>
          </select>
        </div>
        <div v-else>
          <label class="ritme-label">{{ t('learning.bossPassingLabel') }}</label>
          <select v-model.number="passingThreshold" class="ritme-input">
            <option :value="60">60%</option>
            <option :value="70">70%</option>
            <option :value="75">75%</option>
            <option :value="80">80%</option>
          </select>
        </div>
      </div>

      <div
        v-if="bossType === 'final_challenge'"
        class="ritme-list-item"
        style="margin-bottom: 10px; border-color: var(--ritme-gold-border); background: var(--ritme-gold-soft); font-size: 0.76rem; color: var(--ritme-text-primary);"
      >
        {{
          learningStore.finalChallengeEligible
            ? t('learning.finalChallengeScopeNote')
            : t('learning.finalChallengeLockedNote')
        }}
      </div>

      <div v-else class="ritme-grid-2" style="margin-bottom: 10px;">
        <div>
          <label class="ritme-label">{{ t('learning.chaptersTitle') }}</label>
          <select v-model="bossChapterId" class="ritme-input">
            <option
              v-for="chap in unlockedChaptersInSubtest"
              :key="chap.id"
              :value="chap.id"
            >
              {{ userStore.settings.language === 'id' ? chap.titleId : chap.titleEn }}
            </option>
          </select>
        </div>
        <div>
          <label class="ritme-label">{{ t('learning.bossPassingLabel') }}</label>
          <select v-model.number="passingThreshold" class="ritme-input">
            <option :value="60">60%</option>
            <option :value="70">70%</option>
            <option :value="75">75%</option>
            <option :value="80">80%</option>
          </select>
        </div>
      </div>

      <ion-button
        expand="block"
        color="primary"
        class="ritme-focus-cta"
        :disabled="
          bossUnlockedPool.length === 0 ||
          (bossType === 'final_challenge' && !learningStore.finalChallengeEligible)
        "
        @click="startBossChallenge"
      >
        <ion-icon slot="start" :icon="shieldOutline" />
        {{ t('learning.startBossBtn') }}
      </ion-button>
      <p
        v-if="bossUnlockedPool.length === 0"
        class="ritme-subtitle"
        style="margin-top: 8px; color: var(--ritme-warning); font-size: 0.76rem; text-align: center;"
      >
        {{ t('learning.bossNoUnlockedQuestions') }}
      </p>
    </div>

    <!-- Active Boss Quiz + Interactive Boss Progress Gauge -->
    <div v-else>
      <div
        style="padding: 10px 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-gold-border); margin-bottom: 10px;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.76rem; font-weight: 700; margin-bottom: 6px;">
          <span class="ritme-title-row" style="color: var(--ritme-gold);">
            <ion-icon :icon="shieldOutline" style="font-size: 0.92rem;" />
            {{ formatBossType(bossType) }}
          </span>
          <span style="color: var(--ritme-accent-secondary);">
            {{ bossAnsweredCount }} / {{ bossQuestions.length }}
          </span>
        </div>
        <div class="ritme-progress-track" style="height: 6px; margin-bottom: 8px;">
          <div
            class="ritme-progress-fill ritme-progress-fill-gold"
            :style="{ width: `${bossProgressPercent}%` }"
          />
        </div>
        <div class="ritme-pill-strip" style="padding-bottom: 0;">
          <button
            v-for="(_, qIdx) in bossQuestions"
            :key="`jump-${qIdx}`"
            type="button"
            class="ritme-step-chip"
            :style="
              bossAnswers[qIdx] !== undefined
                ? {
                    background: 'var(--ritme-accent-soft)',
                    borderColor: 'var(--ritme-accent-primary)',
                    color: 'var(--ritme-accent-primary)',
                  }
                : {}
            "
            @click="scrollToBossQuestion(qIdx)"
          >
            {{ qIdx + 1 }}
          </button>
        </div>
      </div>

      <div
        v-for="(bq, qIdx) in bossQuestions"
        :id="`boss-q-${qIdx}`"
        :key="bq.id"
        style="padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated); border: 1px solid var(--ritme-border-line); margin-bottom: 10px;"
      >
        <div
          style="font-weight: 700; font-size: 0.84rem; margin-bottom: 6px; color: var(--ritme-accent-secondary);"
        >
          {{ t('learning.bossQuestionLabel', { number: qIdx + 1 }) }}
        </div>
        <div style="font-size: 0.86rem; line-height: 1.45; white-space: pre-line; margin-bottom: 8px;">
          {{
            userStore.settings.language === 'id'
              ? bq.questionIdText
              : bq.questionEnText
          }}
        </div>
        <div>
          <button
            v-for="(opt, oIdx) in userStore.settings.language === 'id'
              ? bq.optionsId
              : bq.optionsEn"
            :key="oIdx"
            type="button"
            style="width: 100%; text-align: left; padding: 8px 10px; border-radius: 8px; margin-bottom: 6px; font-size: 0.8rem; cursor: pointer;"
            :style="{
              background:
                bossAnswers[qIdx] === oIdx
                  ? 'rgba(139, 124, 255, 0.22)'
                  : 'var(--ritme-bg-primary)',
              border:
                bossAnswers[qIdx] === oIdx
                  ? '1px solid var(--ritme-accent-primary)'
                  : '1px solid var(--ritme-border-line)',
              color: 'var(--ritme-text-primary)',
            }"
            @click="bossAnswers[qIdx] = oIdx"
          >
            <strong>{{ ['A', 'B', 'C', 'D', 'E'][oIdx] }}.</strong> {{ opt }}
          </button>
        </div>
      </div>

      <div style="display: flex; gap: 8px;">
        <ion-button
          expand="block"
          color="primary"
          style="flex: 1; font-weight: 700;"
          @click="submitBossEvaluation"
        >
          {{ t('learning.submitBossBtn') }}
        </ion-button>
        <ion-button
          fill="outline"
          color="secondary"
          @click="bossSessionActive = false"
        >
          {{ t('learning.cancelBtn') }}
        </ion-button>
      </div>
    </div>

    <!-- Boss Evaluation Result Banner (PRD Section 12.3 Complete Display) -->
    <div
      v-if="lastBossResult"
      style="margin-top: 12px; padding: 12px; border-radius: var(--ritme-radius-md); background: var(--ritme-bg-elevated);"
      :style="{
        border: lastBossResult.passed
          ? '1px solid var(--ritme-gold-border)'
          : '1px solid var(--ritme-warning)',
      }"
    >
      <div
        class="ritme-title-row"
        style="font-weight: 800; font-size: 0.92rem; margin-bottom: 4px;"
        :style="{
          color: lastBossResult.passed
            ? 'var(--ritme-gold)'
            : 'var(--ritme-warning)',
        }"
      >
        <ion-icon
          :icon="lastBossResult.passed ? trophyOutline : shieldHalfOutline"
          style="font-size: 1.05rem;"
        />
        <span>
          {{
            lastBossResult.passed
              ? t('learning.bossPassedTitle')
              : t('learning.bossFailedTitle')
          }}
        </span>
      </div>
      <div class="ritme-subtitle" style="font-size: 0.8rem; margin-bottom: 6px;">
        {{
          t('learning.bossResultStats', {
            correct: lastBossResult.correct,
            total: lastBossResult.total,
            accuracy: lastBossResult.accuracyPercent,
            seconds: lastBossResult.seconds,
          })
        }}
      </div>

      <div
        v-if="lastBossResult.unlockedChapterTitle"
        class="ritme-title-row"
        style="font-size: 0.8rem; font-weight: 700; color: var(--ritme-accent-primary); margin-bottom: 4px;"
      >
        <ion-icon :icon="lockOpenOutline" style="font-size: 0.9rem;" />
        <span>
          {{
            t('learning.bossUnlockedChapterLabel', {
              title: lastBossResult.unlockedChapterTitle,
            })
          }}
        </span>
      </div>

      <div
        v-if="lastBossResult.xpEarned > 0"
        class="ritme-title-row"
        style="font-size: 0.8rem; font-weight: 700; color: var(--ritme-accent-secondary); margin-bottom: 4px;"
      >
        <ion-icon :icon="flashOutline" style="font-size: 0.9rem; color: var(--ritme-gold);" />
        <span>{{ t('learning.bossFirstClearXp', { xp: lastBossResult.xpEarned }) }}</span>
      </div>
      <div
        v-else-if="lastBossResult.passed"
        class="ritme-subtitle"
        style="font-size: 0.75rem; margin-bottom: 6px;"
      >
        {{ t('learning.bossRepeatClearNote') }}
      </div>

      <!-- Weak Topics & Review Recommendation -->
      <div
        v-if="lastBossResult.weakTopicTitles.length > 0"
        style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--ritme-border-line);"
      >
        <div style="font-size: 0.76rem; font-weight: 700; color: var(--ritme-warning); margin-bottom: 4px;">
          {{ t('learning.bossWeakTopicsLabel') }}
        </div>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px;">
          <span
            v-for="wt in lastBossResult.weakTopicTitles"
            :key="wt"
            class="ritme-badge"
            style="background: var(--ritme-warning-soft); color: var(--ritme-warning);"
          >
            {{ wt }}
          </span>
        </div>
        <button
          type="button"
          class="ritme-btn-outline"
          style="height: 30px; padding: 0 10px; font-size: 0.74rem; color: var(--ritme-accent-secondary); display: inline-flex; align-items: center; gap: 5px;"
          @click="$emit('open-review')"
        >
          <ion-icon :icon="refreshCircleOutline" style="font-size: 0.88rem;" />
          {{ t('learning.bossGoReviewBtn') }}
        </button>
      </div>
    </div>

    <!-- Boss Challenge History (PRD Section 26 AC: Hasil dapat dilihat kembali) -->
    <div
      style="margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--ritme-border-line);"
    >
      <div class="ritme-section-header" style="margin-bottom: 8px;">
        <h3 class="ritme-title-row" style="margin: 0; font-size: 0.88rem; font-weight: 700;">
          <ion-icon :icon="timeOutline" style="color: var(--ritme-accent-primary);" />
          <span>{{ t('learning.bossHistoryTitle') }}</span>
        </h3>
        <span class="ritme-badge">{{ learningStore.bossAttempts.length }}</span>
      </div>

      <p
        v-if="learningStore.bossAttempts.length === 0"
        class="ritme-subtitle"
        style="font-size: 0.76rem;"
      >
        {{ t('learning.bossHistoryEmpty') }}
      </p>

      <div
        v-for="att in learningStore.bossAttempts.slice(0, 10)"
        :key="att.id"
        class="ritme-list-item"
      >
        <div style="min-width: 0; flex: 1;">
          <div style="font-weight: 700; font-size: 0.82rem;">
            {{ resolveSubtestCode(att.subtestId) }} • {{ formatBossType(att.bossType) }}
          </div>
          <div class="ritme-subtitle" style="font-size: 0.72rem; margin-top: 2px;">
            {{ formatDateShort(att.attemptedAt) }} •
            {{ att.correctCount }}/{{ att.totalQuestions }} •
            {{ att.timeSpentSeconds }}s
            <span v-if="att.passingThreshold">(Min {{ att.passingThreshold }}%)</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <span
            class="ritme-badge"
            :class="att.passed ? 'ritme-badge-gold' : ''"
            :style="
              att.passed
                ? {}
                : {
                    background: 'var(--ritme-warning-soft)',
                    color: 'var(--ritme-warning)',
                  }
            "
          >
            {{ att.accuracyPercent }}% •
            {{
              att.passed
                ? t('learning.bossPassedBadge')
                : t('learning.bossFailedBadge')
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import {
  flashOutline,
  lockOpenOutline,
  refreshCircleOutline,
  shieldHalfOutline,
  shieldOutline,
  timeOutline,
  trophyOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import type { PracticeQuestion } from '@/types'

const props = defineProps<{
  initialSubtestId: string
  initialChapterId: string | null
}>()

defineEmits<{
  (e: 'open-review'): void
}>()

const { t } = useI18n()
const learningStore = useLearningStore()
const userStore = useUserStore()

const bossSubtestId = ref(props.initialSubtestId || 'subtest_pu')
const bossChapterId = ref(props.initialChapterId || 'chap_pu_1')
const bossType = ref<
  'mini_boss' | 'chapter_boss' | 'subtest_boss' | 'final_challenge'
>('mini_boss')
const passingThreshold = ref<number>(70)
const bossSessionActive = ref(false)
const bossQuestions = ref<PracticeQuestion[]>([])
const bossAnswers = ref<Record<number, number>>({})
const bossStartTimeMs = ref<number>(0)
const lastBossResult = ref<{
  passed: boolean
  correct: number
  total: number
  accuracyPercent: number
  seconds: number
  xpEarned: number
  weakTopicTitles: string[]
  unlockedChapterTitle?: string
} | null>(null)

const unlockedChaptersInSubtest = computed(() =>
  learningStore
    .getChaptersBySubtest(bossSubtestId.value)
    .filter((c) => c.status !== 'locked')
)

const bossAnsweredCount = computed(
  () =>
    bossQuestions.value.filter((_, idx) => bossAnswers.value[idx] !== undefined)
      .length
)

const bossProgressPercent = computed(() =>
  bossQuestions.value.length > 0
    ? Math.round((bossAnsweredCount.value / bossQuestions.value.length) * 100)
    : 0
)

watch(
  () => props.initialSubtestId,
  (val) => {
    if (val) bossSubtestId.value = val
  }
)

watch(
  () => props.initialChapterId,
  (val) => {
    if (val && !learningStore.isChapterLocked(val)) {
      bossChapterId.value = val
    }
  }
)

watch(
  unlockedChaptersInSubtest,
  (chaps) => {
    if (chaps.length > 0 && !chaps.some((c) => c.id === bossChapterId.value)) {
      bossChapterId.value = chaps[0].id
    }
  },
  { immediate: true }
)

const bossUnlockedPool = computed(() => {
  if (bossType.value === 'final_challenge') {
    return learningStore.getFinalChallengeQuestions(14)
  }
  if (bossType.value === 'mini_boss' && bossChapterId.value) {
    const chapPool = learningStore.getQuestionsBySubtest(
      bossSubtestId.value,
      bossChapterId.value
    )
    if (chapPool.length > 0) return chapPool
  }
  return learningStore.getQuestionsBySubtest(bossSubtestId.value)
})

function startBossChallenge(): void {
  const pool = bossUnlockedPool.value
  if (pool.length === 0) return

  const count =
    bossType.value === 'final_challenge'
      ? Math.min(14, pool.length)
      : bossType.value === 'subtest_boss'
        ? Math.min(6, pool.length)
        : bossType.value === 'chapter_boss'
          ? Math.min(4, pool.length)
          : Math.min(3, pool.length)

  bossQuestions.value = pool.slice(0, count)
  bossAnswers.value = {}
  bossStartTimeMs.value = Date.now()
  lastBossResult.value = null
  bossSessionActive.value = true
}

function scrollToBossQuestion(qIdx: number): void {
  const el = document.getElementById(`boss-q-${qIdx}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function submitBossEvaluation(): Promise<void> {
  const total = bossQuestions.value.length
  if (total === 0) return
  let correct = 0

  const questionResults = bossQuestions.value.map((q, idx) => {
    const selectedIndex = bossAnswers.value[idx] ?? -1
    const isCorrect = selectedIndex === q.correctIndex
    if (isCorrect) correct++
    return {
      questionId: q.id,
      topicId: q.topicId,
      selectedIndex,
      isCorrect,
    }
  })

  const seconds = Math.max(
    1,
    Math.round((Date.now() - bossStartTimeMs.value) / 1000)
  )
  const targetSubtestId =
    bossType.value === 'final_challenge'
      ? 'final_challenge'
      : bossSubtestId.value
  const targetChapterId =
    bossType.value === 'final_challenge'
      ? 'all'
      : bossChapterId.value || unlockedChaptersInSubtest.value[0]?.id || 'chap_pu_1'

  const res = await learningStore.submitBossChallengeAttempt({
    bossType: bossType.value,
    subtestId: targetSubtestId,
    chapterId: targetChapterId,
    totalQuestions: total,
    correctCount: correct,
    timeSpentSeconds: seconds,
    passingThreshold: passingThreshold.value,
    questionResults,
  })

  const weakTopicTitles = res.weakTopicIds
    .map((id) => learningStore.getTopicById(id)?.title || id)
    .filter(Boolean)

  lastBossResult.value = {
    passed: res.passed,
    correct,
    total,
    accuracyPercent: res.accuracyPercent,
    seconds,
    xpEarned: res.xpEarned,
    weakTopicTitles,
    unlockedChapterTitle:
      userStore.settings.language === 'id'
        ? res.unlockedChapterTitleId
        : res.unlockedChapterTitleEn,
  }
  bossSessionActive.value = false
}

function resolveSubtestCode(subtestId: string): string {
  if (subtestId === 'final_challenge') return 'ALL'
  return learningStore.getSubtestById(subtestId)?.code || subtestId
}

function formatBossType(type: string): string {
  if (type === 'final_challenge') return t('learning.bossTypeFinalShort')
  if (type === 'subtest_boss') return 'Subtest Boss'
  if (type === 'chapter_boss') return 'Chapter Boss'
  return 'Mini-Boss'
}

function formatDateShort(iso: string): string {
  return iso.slice(0, 10)
}
</script>
