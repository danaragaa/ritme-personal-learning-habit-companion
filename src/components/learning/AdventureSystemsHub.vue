<template>
  <div>
    <!-- PRD 3.0 Learning Adventure Sub-System Navigation Pills -->
    <div
      class="ritme-pill-strip"
      style="margin-bottom: 12px;"
    >
      <button
        v-for="tab in subTabs"
        :key="tab.key"
        type="button"
        class="ritme-btn-outline ritme-pill-tab"
        style="height: 34px; padding: 0 12px; font-size: 0.76rem; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;"
        :style="{
          background:
            activeSubTab === tab.key
              ? 'rgba(139, 124, 255, 0.22)'
              : 'var(--ritme-bg-card)',
          borderColor:
            activeSubTab === tab.key
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-border-line)',
          color:
            activeSubTab === tab.key
              ? 'var(--ritme-accent-primary)'
              : 'var(--ritme-text-secondary)',
        }"
        @click="activeSubTab = tab.key"
      >
        <ion-icon :icon="tab.icon" style="font-size: 0.95rem;" />
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 1. WORLD MAP & CHAPTERS VIEW -->
    <div v-if="activeSubTab === 'adventure'">
      <!-- 7 Realms Interactive World Map Grid -->
      <div class="ritme-card">
        <div class="ritme-section-header">
          <h2 class="ritme-section-title ritme-title-row">
            <ion-icon :icon="mapOutline" style="color: var(--ritme-accent-primary);" />
            <span>{{ t('learning.worldMapTitle') }}</span>
          </h2>
          <span class="ritme-badge ritme-badge-cyan">
            {{ selectedRealmInfo?.realm.code || 'UTBK' }}
          </span>
        </div>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 8px; margin-bottom: 12px;"
        >
          <button
            v-for="item in learningStore.adventureRealms"
            :key="item.subtest.id"
            type="button"
            class="ritme-pill-tab"
            style="text-align: left; padding: 10px; border-radius: var(--ritme-radius-md); cursor: pointer;"
            :style="{
              background:
                selectedSubtestId === item.subtest.id
                  ? 'rgba(139, 124, 255, 0.18)'
                  : 'var(--ritme-bg-elevated)',
              border:
                selectedSubtestId === item.subtest.id
                  ? '1px solid var(--ritme-accent-primary)'
                  : '1px solid var(--ritme-border-line)',
            }"
            @click="$emit('select-subtest', item.subtest.id)"
          >
            <div
              style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;"
            >
              <RadialRing
                :percent="item.progress.percent"
                :size="34"
                :stroke-width="3"
                :color="
                  item.status === 'mastered'
                    ? 'var(--ritme-gold)'
                    : 'var(--ritme-accent-secondary)'
                "
              >
                <RealmEmblem
                  :subtest-id="item.subtest.id"
                  :icon-key="item.realm.icon"
                  :size="16"
                  :color="
                    item.status === 'mastered'
                      ? 'var(--ritme-gold)'
                      : 'var(--ritme-accent-secondary)'
                  "
                />
              </RadialRing>
              <span
                class="ritme-badge"
                style="font-size: 0.65rem; padding: 2px 7px;"
                :class="{
                  'ritme-badge-gold': item.status === 'mastered',
                  'ritme-badge-cyan':
                    item.status === 'completed' || item.status === 'in_progress',
                }"
              >
                {{ t(`learning.realmStatus.${item.status}`) }}
              </span>
            </div>
            <div
              style="font-size: 0.8rem; font-weight: 800; color: var(--ritme-text-primary);"
            >
              {{
                userStore.settings.language === 'id'
                  ? item.realm.realmNameId
                  : item.realm.realmNameEn
              }}
            </div>
            <div class="ritme-subtitle" style="font-size: 0.7rem; margin-top: 2px;">
              {{ item.subtest.code }} • {{ item.progress.percent }}%
            </div>
          </button>
        </div>

        <!-- Chapters Connected Progression Path -->
        <div v-if="selectedRealmChapters.length > 0">
          <div
            class="ritme-title-row"
            style="font-weight: 700; font-size: 0.88rem; margin: 10px 0 10px; color: var(--ritme-accent-secondary);"
          >
            <ion-icon :icon="bookOutline" style="font-size: 1rem;" />
            <span>
              {{ t('learning.chaptersTitle') }} ({{
                selectedRealmInfo?.subtest.code
              }})
            </span>
          </div>

          <div class="ritme-timeline-wrapper">
            <div
              v-for="(chap, cIdx) in selectedRealmChapters"
              :key="chap.id"
              class="ritme-timeline-step"
              :class="{
                'is-done':
                  chap.status === 'completed' || chap.status === 'mastered',
              }"
            >
              <div
                class="ritme-list-item"
                style="display: block;"
                :style="{ opacity: chap.status === 'locked' ? 0.72 : 1 }"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;"
                >
                  <div style="min-width: 0;">
                    <div
                      class="ritme-title-row"
                      style="font-weight: 700; font-size: 0.88rem; align-items: flex-start;"
                    >
                      <ion-icon
                        v-if="chap.status === 'locked'"
                        :icon="lockClosedOutline"
                        style="font-size: 0.9rem; color: var(--ritme-warning); margin-top: 2px; flex-shrink: 0;"
                      />
                      <span>
                        {{
                          userStore.settings.language === 'id'
                            ? chap.titleId
                            : chap.titleEn
                        }}
                      </span>
                    </div>
                    <div
                      class="ritme-subtitle ritme-title-row"
                      style="font-size: 0.74rem; margin-top: 3px; gap: 4px;"
                    >
                      <ion-icon :icon="timeOutline" style="font-size: 0.82rem;" />
                      <span>~{{ chap.estimatedMinutes }} {{ t('focus.minutesShort') }}</span>
                    </div>
                  </div>
                  <span
                    class="ritme-badge"
                    :class="{
                      'ritme-badge-gold': chap.status === 'mastered',
                      'ritme-badge-cyan':
                        chap.status === 'completed' ||
                        chap.status === 'challenge_ready',
                    }"
                  >
                    {{ t(`learning.chapterStatus.${chap.status}`) }}
                  </span>
                </div>

                <div
                  v-if="chap.status === 'locked'"
                  class="ritme-subtitle ritme-title-row"
                  style="margin-top: 8px; font-size: 0.75rem; color: var(--ritme-warning);"
                >
                  <ion-icon :icon="lockClosedOutline" style="font-size: 0.85rem; flex-shrink: 0;" />
                  <span>
                    {{
                      cIdx > 0 && selectedRealmChapters[cIdx - 1]
                        ? t('learning.chapterUnlockWithPrev', {
                            prev:
                              userStore.settings.language === 'id'
                                ? (selectedRealmChapters[cIdx - 1]?.titleId ?? '')
                                : (selectedRealmChapters[cIdx - 1]?.titleEn ?? ''),
                            status: t(
                              `learning.chapterStatus.${selectedRealmChapters[cIdx - 1]?.status ?? 'available'}`
                            ),
                          })
                        : t('learning.chapterLockedHint')
                    }}
                  </span>
                </div>

                <div v-else style="margin-top: 8px; display: flex; gap: 8px; flex-wrap: wrap;">
                  <button
                    type="button"
                    class="ritme-btn-outline"
                    style="height: 30px; padding: 0 10px; font-size: 0.74rem; display: inline-flex; align-items: center; gap: 5px;"
                    @click="
                      expandedChapterId =
                        expandedChapterId === chap.id ? null : chap.id
                    "
                  >
                    <ion-icon :icon="readerOutline" style="font-size: 0.88rem;" />
                    {{
                      expandedChapterId === chap.id
                        ? t('learning.closeChapterBtn')
                        : t('learning.readChapterBtn')
                    }}
                  </button>
                  <button
                    type="button"
                    class="ritme-btn-outline"
                    style="height: 30px; padding: 0 10px; font-size: 0.74rem; color: var(--ritme-accent-secondary); display: inline-flex; align-items: center; gap: 5px;"
                    @click="openPracticeForChapter(chap.subtestId, chap.id)"
                  >
                    <ion-icon :icon="createOutline" style="font-size: 0.88rem;" />
                    {{ t('learning.practiceChapterBtn') }}
                  </button>
                </div>

                <!-- Expanded Structured Material Reader (never rendered if locked) -->
                <div
                  v-if="chap.status !== 'locked' && expandedChapterId === chap.id"
                  style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--ritme-border-line); font-size: 0.82rem;"
                >
                  <div
                    class="ritme-title-row"
                    style="font-weight: 700; color: var(--ritme-accent-primary); margin-bottom: 4px;"
                  >
                    <ion-icon :icon="locateOutline" style="font-size: 0.92rem;" />
                    <span>{{ t('learning.objectivesLabel') }}</span>
                  </div>
                  <ul style="margin: 0 0 10px 18px; padding: 0; color: var(--ritme-text-secondary);">
                    <li
                      v-for="(obj, oIdx) in userStore.settings.language === 'id'
                        ? chap.objectivesId
                        : chap.objectivesEn"
                      :key="oIdx"
                      style="margin-bottom: 3px;"
                    >
                      {{ obj }}
                    </li>
                  </ul>

                  <div
                    class="ritme-title-row"
                    style="font-weight: 700; color: var(--ritme-accent-secondary); margin-bottom: 4px;"
                  >
                    <ion-icon :icon="bookOutline" style="font-size: 0.92rem;" />
                    <span>{{ t('learning.materialSummaryLabel') }}</span>
                  </div>
                  <div
                    style="white-space: pre-line; padding: 10px; border-radius: 10px; background: var(--ritme-bg-primary); border: 1px solid var(--ritme-border-line); margin-bottom: 10px; line-height: 1.5;"
                  >
                    {{
                      userStore.settings.language === 'id'
                        ? chap.materialSummaryId
                        : chap.materialSummaryEn
                    }}
                  </div>

                  <div
                    class="ritme-title-row"
                    style="font-weight: 700; color: var(--ritme-gold); margin-bottom: 4px;"
                  >
                    <ion-icon :icon="bulbOutline" style="font-size: 0.92rem;" />
                    <span>{{ t('learning.exampleLabel') }}</span>
                  </div>
                  <div
                    style="padding: 10px; border-radius: 10px; background: var(--ritme-gold-soft); border: 1px solid var(--ritme-gold-border); margin-bottom: 10px; line-height: 1.45;"
                  >
                    {{
                      userStore.settings.language === 'id'
                        ? chap.exampleId
                        : chap.exampleEn
                    }}
                  </div>

                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <ion-button
                      size="small"
                      color="primary"
                      @click="handleCompleteChapter(chap.id)"
                    >
                      <ion-icon slot="start" :icon="checkmarkOutline" />
                      {{ t('learning.completeChapterBtn') }}
                    </ion-button>
                    <ion-button
                      size="small"
                      fill="outline"
                      color="secondary"
                      @click="openBossForChapter(chap.subtestId, chap.id)"
                    >
                      <ion-icon slot="start" :icon="shieldOutline" />
                      {{ t('learning.tabBoss') }}
                    </ion-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. STRUCTURED PRACTICE SESSIONS & EXPLANATION SYSTEM -->
    <PracticeSessionPanel
      v-else-if="activeSubTab === 'practice'"
      :subtest-filter="practiceSubtestFilter"
      :chapter-filter="practiceChapterFilter"
      :topic-filter="practiceTopicFilter"
      @update:subtest-filter="handlePracticeSubtestUpdate"
      @clear-scope-filters="clearPracticeScopeFilters"
    />

    <!-- 3. SMART REVIEW & QUESTION-BASED SPACED REPETITION -->
    <SmartReviewPanel v-else-if="activeSubTab === 'review'" />

    <!-- 4. MISTAKE NOTEBOOK & ACTIVE RETRY -->
    <MistakeNotebookPanel v-else-if="activeSubTab === 'mistakes'" />

    <!-- 5. BOSS CHALLENGE & DIAGNOSTIC HISTORY -->
    <BossChallengePanel
      v-else-if="activeSubTab === 'boss'"
      :initial-subtest-id="bossInitialSubtestId"
      :initial-chapter-id="bossInitialChapterId"
      @open-review="activeSubTab = 'review'"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { IonButton, IonIcon } from '@ionic/vue'
import {
  bookmarkOutline,
  bookOutline,
  bulbOutline,
  checkmarkOutline,
  createOutline,
  locateOutline,
  lockClosedOutline,
  mapOutline,
  readerOutline,
  refreshCircleOutline,
  shieldOutline,
  timeOutline,
} from 'ionicons/icons'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/learningStore'
import { useUserStore } from '@/stores/userStore'
import PracticeSessionPanel from '@/components/learning/PracticeSessionPanel.vue'
import SmartReviewPanel from '@/components/learning/SmartReviewPanel.vue'
import MistakeNotebookPanel from '@/components/learning/MistakeNotebookPanel.vue'
import BossChallengePanel from '@/components/learning/BossChallengePanel.vue'
import RealmEmblem from '@/components/ui/RealmEmblem.vue'
import RadialRing from '@/components/ui/RadialRing.vue'

export type HubTabKey = 'adventure' | 'practice' | 'review' | 'mistakes' | 'boss'

const props = defineProps<{
  selectedSubtestId: string
  requestedTab?: HubTabKey
  requestedTabNonce?: number
  requestedTopicFilter?: {
    subtestId: string
    topicId: string
    nonce: number
  } | null
}>()

defineEmits<{
  (e: 'select-subtest', subtestId: string): void
}>()

const { t } = useI18n()
const learningStore = useLearningStore()
const userStore = useUserStore()

const activeSubTab = ref<HubTabKey>('adventure')

const practiceSubtestFilter = ref<string>('all')
const practiceChapterFilter = ref<string | null>(null)
const practiceTopicFilter = ref<string | null>(null)

const bossInitialSubtestId = ref<string>(props.selectedSubtestId || 'subtest_pu')
const bossInitialChapterId = ref<string | null>(null)

const expandedChapterId = ref<string | null>(null)

const subTabs = computed(() => [
  { key: 'adventure' as const, icon: mapOutline, label: t('learning.tabAdventure') },
  { key: 'practice' as const, icon: createOutline, label: t('learning.tabPractice') },
  {
    key: 'review' as const,
    icon: refreshCircleOutline,
    label: t('learning.tabReview', {
      count: learningStore.smartReviewQueue.length,
    }),
  },
  {
    key: 'mistakes' as const,
    icon: bookmarkOutline,
    label: t('learning.tabMistakes', {
      count: learningStore.unresolvedMistakes.length,
    }),
  },
  { key: 'boss' as const, icon: shieldOutline, label: t('learning.tabBoss') },
])

const selectedRealmInfo = computed(() =>
  learningStore.adventureRealms.find(
    (r) => r.subtest.id === props.selectedSubtestId
  )
)

const selectedRealmChapters = computed(() =>
  learningStore.getChaptersBySubtest(props.selectedSubtestId)
)

watch(
  () => [props.requestedTab, props.requestedTabNonce] as const,
  ([tab]) => {
    if (tab) {
      activeSubTab.value = tab
    }
  },
  { immediate: true }
)

watch(
  () => props.requestedTopicFilter,
  (req) => {
    if (!req) return
    practiceSubtestFilter.value = req.subtestId
    practiceChapterFilter.value = null
    practiceTopicFilter.value = req.topicId
    activeSubTab.value = 'practice'
  }
)

watch(
  () => props.selectedSubtestId,
  (newId) => {
    if (newId && activeSubTab.value !== 'boss') {
      bossInitialSubtestId.value = newId
      bossInitialChapterId.value = null
    }
  }
)

async function handleCompleteChapter(chapterId: string) {
  if (learningStore.isChapterLocked(chapterId)) return
  await learningStore.completeChapterStudy(chapterId)
}

function openPracticeForChapter(subtestId: string, chapterId: string) {
  if (learningStore.isChapterLocked(chapterId)) return
  practiceSubtestFilter.value = subtestId
  practiceChapterFilter.value = chapterId
  practiceTopicFilter.value = null
  activeSubTab.value = 'practice'
}

function openBossForChapter(subtestId: string, chapterId: string) {
  if (learningStore.isChapterLocked(chapterId)) return
  bossInitialSubtestId.value = subtestId
  bossInitialChapterId.value = chapterId
  activeSubTab.value = 'boss'
}

function handlePracticeSubtestUpdate(subtestId: string) {
  practiceSubtestFilter.value = subtestId
  practiceChapterFilter.value = null
  practiceTopicFilter.value = null
}

function clearPracticeScopeFilters() {
  practiceChapterFilter.value = null
  practiceTopicFilter.value = null
}
</script>
