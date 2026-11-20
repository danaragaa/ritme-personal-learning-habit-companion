import test, { after, before } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'esbuild'

import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ritme-tests-'))

let mods = {}

before(async () => {
  const entryMap = {
    date: path.join(repoRoot, 'src/utils/date.ts'),
    mastery: path.join(repoRoot, 'src/services/learning/masteryEngine.ts'),
    tracker: path.join(repoRoot, 'src/services/learning/learningTrackerService.ts'),
    learningStore: path.join(repoRoot, 'src/stores/learningStore.ts'),
    gamificationStore: path.join(repoRoot, 'src/stores/gamificationStore.ts'),
    userStore: path.join(repoRoot, 'src/stores/userStore.ts'),
    focusStore: path.join(repoRoot, 'src/stores/focusStore.ts'),
    habitStore: path.join(repoRoot, 'src/stores/habitStore.ts'),
    pinia: path.join(repoRoot, 'node_modules/pinia/dist/pinia.mjs'),
    focusTimer: path.join(repoRoot, 'src/services/timer/focusTimerService.ts'),
    notifications: path.join(
      repoRoot,
      'src/services/notifications/localNotificationService.ts'
    ),
    seed: path.join(repoRoot, 'src/services/learning/adventureContentSeed.ts'),
    levelConfig: path.join(repoRoot, 'src/services/xp/levelConfigService.ts'),
    analytics: path.join(repoRoot, 'src/services/analytics/learningAnalytics.ts'),
    progressSummary: path.join(
      repoRoot,
      'src/services/analytics/progressSummaryService.ts'
    ),
    backupSchema: path.join(repoRoot, 'src/services/backup/backupSchema.ts'),
    backupService: path.join(repoRoot, 'src/services/backup/backupService.ts'),
  }

  const stubPlugin = {
    name: 'ritme-test-stubs',
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter: /^@\/services\/database\/db$/ }, () => ({
        path: 'ritme-db-stub',
        namespace: 'db-stub',
      }))

      pluginBuild.onLoad({ filter: /.*/, namespace: 'db-stub' }, () => ({
        contents: `
          function makeTable(name) {
            const store = new Map();
            const sortBy = (arr, field, desc = false) =>
              arr.slice().sort((a, b) => {
                const av = String(a?.[field] ?? '');
                const bv = String(b?.[field] ?? '');
                return desc ? bv.localeCompare(av) : av.localeCompare(bv);
              });
            const makeQuery = (items) => ({
              reverse: () => makeQuery(items.slice().reverse()),
              toArray: async () => items.map((x) => structuredClone(x)),
            });
            return {
              _store: store,
              get: async (id) => (store.has(id) ? structuredClone(store.get(id)) : undefined),
              toArray: async () => Array.from(store.values()).map((x) => structuredClone(x)),
              put: async (item) => { store.set(item.id, structuredClone(item)); return item.id; },
              bulkPut: async (items) => { for (const item of items) store.set(item.id, structuredClone(item)); },
              delete: async (id) => { store.delete(id); },
              bulkDelete: async (ids) => { for (const id of ids) store.delete(id); },
              clear: async () => { store.clear(); },
              orderBy: (field) => {
                const sorted = sortBy(Array.from(store.values()), field, false);
                return makeQuery(sorted);
              },
              where: (field) => ({
                equals: (val) => ({
                  first: async () => {
                    for (const row of store.values()) {
                      if (row?.[field] === val) return structuredClone(row);
                    }
                    return undefined;
                  },
                }),
              }),
            };
          }
          export const db = {
            userSettings: makeTable('userSettings'),
            habits: makeTable('habits'),
            habitCompletions: makeTable('habitCompletions'),
            studySessions: makeTable('studySessions'),
            subtestCategories: makeTable('subtestCategories'),
            learningTopics: makeTable('learningTopics'),
            xpTransactions: makeTable('xpTransactions'),
            achievements: makeTable('achievements'),
            personalRewards: makeTable('personalRewards'),
            rewardRedemptions: makeTable('rewardRedemptions'),
            dailyReflections: makeTable('dailyReflections'),
            chapters: makeTable('chapters'),
            questions: makeTable('questions'),
            questionAttempts: makeTable('questionAttempts'),
            mistakeNotes: makeTable('mistakeNotes'),
            customQuests: makeTable('customQuests'),
            bossAttempts: makeTable('bossAttempts'),
            mockTests: makeTable('mockTests'),
            transaction: async (_mode, _tables, fn) => await fn(),
          };
        `,
        loader: 'js',
      }))

      pluginBuild.onResolve({ filter: /^@\/i18n$/ }, () => ({
        path: 'ritme-i18n-stub',
        namespace: 'i18n-stub',
      }))

      pluginBuild.onLoad({ filter: /.*/, namespace: 'i18n-stub' }, () => ({
        contents: `
          export const i18n = { global: { locale: { value: 'id' } } };
          export function setI18nLocale(lang) {
            i18n.global.locale.value = lang;
          }
        `,
        loader: 'js',
      }))

      pluginBuild.onResolve({ filter: /^@\// }, (args) => {
        const rel = args.path.slice(2)
        const base = path.join(repoRoot, 'src', rel)
        for (const ext of ['', '.ts', '.tsx', '.js', '/index.ts']) {
          if (fs.existsSync(base + ext) && fs.statSync(base + ext).isFile()) {
            return { path: base + ext }
          }
        }
        return { path: base }
      })

      pluginBuild.onResolve({ filter: /^@capacitor\// }, (args) => ({
        path: args.path,
        namespace: 'cap-stub',
      }))

      pluginBuild.onLoad({ filter: /.*/, namespace: 'cap-stub' }, () => ({
        contents: `
          if (!globalThis.__ritmeTestPrefs) {
            const prefStore = new Map();
            globalThis.__ritmeTestPrefs = {
              _store: prefStore,
              keys: async () => ({ keys: Array.from(prefStore.keys()) }),
              get: async ({ key }) => ({ value: prefStore.has(key) ? prefStore.get(key) : null }),
              set: async ({ key, value }) => { prefStore.set(key, String(value)); },
              remove: async ({ key }) => { prefStore.delete(key); },
              clear: async () => { prefStore.clear(); },
            };
          }
          export const Capacitor = { isNativePlatform: () => false, getPlatform: () => 'web' };
          export const Preferences = globalThis.__ritmeTestPrefs;
          export const Haptics = {
            impact: async () => {},
            notification: async () => {},
          };
          export const ImpactStyle = { Light: 'LIGHT', Medium: 'MEDIUM', Heavy: 'HEAVY' };
          export const NotificationType = { Success: 'SUCCESS', Warning: 'WARNING' };
          export const LocalNotifications = {
            createChannel: async () => {},
            checkPermissions: async () => ({ display: 'prompt' }),
            requestPermissions: async () => ({ display: 'prompt' }),
            schedule: async () => {},
            cancel: async () => {},
          };
        `,
        loader: 'js',
      }))
    },
  }

  const outDir = path.join(tmpDir, 'out')
  await build({
    entryPoints: entryMap,
    outdir: outDir,
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'node',
    plugins: [stubPlugin],
    logLevel: 'silent',
  })

  for (const key of Object.keys(entryMap)) {
    const outFile = path.join(outDir, `${key}.js`)
    mods[key] = await import(pathToFileURL(outFile).href)
  }
})

after(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true })
})

test('PRD 3.0 Sec 26: Local date & Monday–Sunday weekly reset keys work across month boundaries', () => {
  const {
    getLocalDateString,
    parseLocalDateString,
    getLocalWeekStartDateString,
    isDateInCurrentLocalWeek,
  } = mods.date

  const mon = parseLocalDateString('2026-11-30')
  const sunSameWeek = parseLocalDateString('2026-12-06')
  const prevSun = parseLocalDateString('2026-11-29')
  const nextMon = parseLocalDateString('2026-12-07')

  assert.equal(getLocalDateString(mon), '2026-11-30')
  assert.equal(getLocalWeekStartDateString(mon), '2026-11-30')
  assert.equal(getLocalWeekStartDateString(sunSameWeek), '2026-11-30')
  assert.equal(getLocalWeekStartDateString(prevSun), '2026-11-23')

  assert.equal(isDateInCurrentLocalWeek('2026-12-04', mon), true)
  assert.equal(isDateInCurrentLocalWeek('2026-11-29', mon), false)
  assert.equal(isDateInCurrentLocalWeek('2026-12-07', sunSameWeek), false)
  assert.notEqual(
    getLocalWeekStartDateString(nextMon),
    getLocalWeekStartDateString(sunSameWeek)
  )
})

test('PRD 3.0 Sec 9.7 & 26: Topic Mastery is computed from evidence, not XP or button clicks', () => {
  const { evaluateTopicMasteryState } = mods.mastery
  const baseTopic = {
    id: 'topic_pu_1',
    subtestId: 'subtest_pu',
    title: 'Silogisme',
    description: '',
    status: 'not_started',
    practiceCount: 1,
    correctCount: 1,
    incorrectCount: 0,
    notes: '',
    reviewSchedule: null,
    lastStudiedAt: '2026-11-18T10:00:00.000Z',
  }

  // Only 1 question -> stays practicing (cannot jump to mastered)
  const res1 = evaluateTopicMasteryState({
    topic: baseTopic,
    unresolvedMistakesCount: 0,
    todayStr: '2026-11-18',
  })
  assert.equal(res1.status, 'practicing')

  // 2 correct (>=70%), 0 reviews -> proficient
  const res2 = evaluateTopicMasteryState({
    topic: { ...baseTopic, correctCount: 2, incorrectCount: 0 },
    unresolvedMistakesCount: 0,
    todayStr: '2026-11-18',
  })
  assert.equal(res2.status, 'proficient')

  // 3 correct (>=85%) + >=1 review -> mastered
  const res3 = evaluateTopicMasteryState({
    topic: {
      ...baseTopic,
      correctCount: 3,
      incorrectCount: 0,
      reviewCount: 1,
      lastReviewedAt: '2026-11-18T11:00:00.000Z',
    },
    unresolvedMistakesCount: 0,
    todayStr: '2026-11-18',
  })
  assert.equal(res3.status, 'mastered')

  // Unresolved mistake overrides high accuracy -> needs_review
  const resUnresolved = evaluateTopicMasteryState({
    topic: { ...baseTopic, correctCount: 5, reviewCount: 2, status: 'mastered' },
    unresolvedMistakesCount: 1,
    todayStr: '2026-11-18',
  })
  assert.equal(resUnresolved.status, 'needs_review')
  assert.equal(
    resUnresolved.reasonKey,
    'learning.masteryReason.unresolvedMistakes'
  )

  // Stale mastered topic (>=14 days) regresses -> needs_review
  const resStale = evaluateTopicMasteryState({
    topic: {
      ...baseTopic,
      correctCount: 4,
      reviewCount: 1,
      status: 'mastered',
      lastReviewedAt: '2026-11-01T10:00:00.000Z',
    },
    unresolvedMistakesCount: 0,
    todayStr: '2026-11-18',
  })
  assert.equal(resStale.status, 'needs_review')
  assert.equal(resStale.reasonKey, 'learning.masteryReason.staleEvidence')
})

test('PRD 3.0 Sec 10.4: Smart Review Queue sorts by 5 deterministic priority tiers', () => {
  const { buildSmartReviewQueue } = mods.mastery
  const subtests = [{ id: 'subtest_pu', code: 'PU', nameId: 'PU', nameEn: 'PU', order: 1 }]
  const topics = [
    {
      id: 't_never',
      subtestId: 'subtest_pu',
      title: 'Never Reviewed',
      description: '',
      status: 'proficient',
      practiceCount: 2,
      correctCount: 2,
      incorrectCount: 0,
      reviewCount: 0,
      notes: '',
      reviewSchedule: '2026-11-25',
      lastStudiedAt: null,
    },
    {
      id: 't_overdue',
      subtestId: 'subtest_pu',
      title: 'Overdue',
      description: '',
      status: 'needs_review',
      practiceCount: 2,
      correctCount: 2,
      incorrectCount: 0,
      reviewCount: 1,
      notes: '',
      reviewSchedule: '2026-11-15',
      lastStudiedAt: null,
    },
    {
      id: 't_due_today',
      subtestId: 'subtest_pu',
      title: 'Due Today',
      description: '',
      status: 'practicing',
      practiceCount: 2,
      correctCount: 2,
      incorrectCount: 0,
      reviewCount: 1,
      notes: '',
      reviewSchedule: '2026-11-18',
      lastStudiedAt: null,
    },
  ]

  const queue = buildSmartReviewQueue({
    topics,
    mistakeNotes: [],
    subtests,
    todayStr: '2026-11-18',
  })

  assert.deepEqual(
    queue.map((q) => q.topic.id),
    ['t_overdue', 't_due_today', 't_never']
  )
  assert.equal(queue[0].priorityRank, 1)
  assert.equal(queue[1].priorityRank, 4)
  assert.equal(queue[2].priorityRank, 5)
})

test('PRD 3.0 Sec 14.4: Timestamp-based focus timer tracks background jumps and excludes paused time', () => {
  const { computeTimerProgress } = mods.focusTimer
  const start = 1_700_000_000_000
  const runningState = {
    sessionId: 'sess_1',
    startTimeMs: start,
    targetDurationSeconds: 1500, // 25m
    accumulatedPausedMs: 60_000, // 1m paused earlier
    pausedAtMs: null,
    status: 'running',
    subjectId: 'subtest_pu',
    topicId: 'topic_pu_1',
    customTopicTitle: '',
    location: 'Desk',
    notes: '',
  }

  // 11m wall clock passed - 1m paused = 10m effective (600s), 900s remaining
  const mid = computeTimerProgress(runningState, start + 660_000)
  assert.equal(mid.effectiveElapsedSeconds, 600)
  assert.equal(mid.remainingSeconds, 900)
  assert.equal(mid.totalPausedSeconds, 60)
  assert.equal(mid.isTimeUp, false)

  // Paused at +660s; check 5 minutes later -> effective still frozen at 600s
  const pausedState = {
    ...runningState,
    status: 'paused',
    pausedAtMs: start + 660_000,
  }
  const pausedCheck = computeTimerProgress(pausedState, start + 960_000)
  assert.equal(pausedCheck.effectiveElapsedSeconds, 600)
  assert.equal(pausedCheck.totalPausedSeconds, 360)
  assert.equal(pausedCheck.isTimeUp, false)

  // Resumed & past target duration -> isTimeUp true, remainingSeconds clamped at 0
  const doneCheck = computeTimerProgress(runningState, start + 1_600_000)
  assert.equal(doneCheck.remainingSeconds, 0)
  assert.equal(doneCheck.isTimeUp, true)
})

test('PRD 3.0 Sec 15.4 & 26: Quiet hours handles overnight windows correctly', () => {
  const { isTimeWithinQuietHours } = mods.notifications
  const overnightSettings = {
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
  }

  assert.equal(
    isTimeWithinQuietHours(new Date('2026-11-18T23:15:00'), overnightSettings),
    true
  )
  assert.equal(
    isTimeWithinQuietHours(new Date('2026-11-18T04:30:00'), overnightSettings),
    true
  )
  assert.equal(
    isTimeWithinQuietHours(new Date('2026-11-18T08:00:00'), overnightSettings),
    false
  )
  assert.equal(
    isTimeWithinQuietHours(new Date('2026-11-18T21:59:00'), overnightSettings),
    false
  )
  assert.equal(
    isTimeWithinQuietHours(new Date('2026-11-18T23:15:00'), {
      ...overnightSettings,
      quietHoursEnabled: false,
    }),
    false
  )
})

test('PRD 3.0 Sec 6 & 9: Content seed has 7 realms, 14 structured chapters (lock progression), 42 bilingual questions, and zero emojis', () => {
  const {
    ADVENTURE_REALMS,
    DEFAULT_CHAPTERS_SEED,
    DEFAULT_PRACTICE_QUESTIONS_SEED,
  } = mods.seed

  assert.equal(ADVENTURE_REALMS.length, 7)
  assert.equal(DEFAULT_CHAPTERS_SEED.length, 14)
  assert.ok(DEFAULT_PRACTICE_QUESTIONS_SEED.length >= 42)

  // Verify each realm has Ch1 available, sequential locked progression across realms, & >=6 questions
  let lockedChapsCount = 0
  for (const realm of ADVENTURE_REALMS) {
    const chaps = DEFAULT_CHAPTERS_SEED.filter(
      (c) => c.subtestId === realm.subtestId
    ).sort((a, b) => a.order - b.order)
    assert.equal(chaps.length, 2)
    assert.equal(chaps[0].status, 'available')
    if (chaps[1].status === 'locked') {
      lockedChapsCount += 1
    } else {
      assert.equal(chaps[1].status, 'available')
    }

    const qs = DEFAULT_PRACTICE_QUESTIONS_SEED.filter(
      (q) => q.subtestId === realm.subtestId
    )
    assert.ok(qs.length >= 6, `Expected >=6 questions for ${realm.subtestId}`)
  }
  assert.ok(lockedChapsCount >= 6)

  // Verify bilingual choices & valid answer index + zero emoji discipline
  const emojiRegex = /[\p{Extended_Pictographic}\u2600-\u27BF]/u
  for (const q of DEFAULT_PRACTICE_QUESTIONS_SEED) {
    assert.equal(q.optionsId.length, 5)
    assert.equal(q.optionsEn.length, 5)
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 5)
    assert.equal(emojiRegex.test(q.questionIdText), false)
    assert.equal(emojiRegex.test(q.questionEnText), false)
  }
})

test('PRD 3.0 Sec 13 & 24: Level threshold normalization & mock test/learning analytics calculate cleanly', () => {
  const { DEFAULT_LEVEL_THRESHOLDS, normalizeLevelThresholds } = mods.levelConfig
  const { buildMockTestAnalytics, buildLearningAnalyticsReport } = mods.analytics

  const normalized = normalizeLevelThresholds([
    ...DEFAULT_LEVEL_THRESHOLDS.slice(0, 2),
    { ...DEFAULT_LEVEL_THRESHOLDS[2], minXP: 80 }, // below Level 2 minXP 100
    ...DEFAULT_LEVEL_THRESHOLDS.slice(3),
  ])
  for (let i = 1; i < normalized.length; i++) {
    assert.ok(normalized[i].minXP > normalized[i - 1].minXP)
    assert.equal(normalized[i - 1].maxXP, normalized[i].minXP - 1)
  }
  assert.equal(normalized[normalized.length - 1].maxXP, null)

  const subtests = [
    { id: 'subtest_pu', code: 'PU', nameId: 'Penalaran Umum', nameEn: 'General Reasoning', order: 1 },
    { id: 'subtest_pk', code: 'PK', nameId: 'Pengetahuan Kuantitatif', nameEn: 'Quantitative', order: 2 },
  ]
  const mockReport = buildMockTestAnalytics(
    [
      {
        id: 'm1',
        testName: 'TO 1',
        date: '2026-11-10',
        source: 'Offline',
        durationMinutes: 120,
        totalQuestions: 100,
        attemptedQuestions: 90,
        correctAnswers: 60,
        incorrectAnswers: 30,
        overallScore: 620,
        subtestScores: { subtest_pu: 660, subtest_pk: 580 },
      },
      {
        id: 'm2',
        testName: 'TO 2',
        date: '2026-11-18',
        source: 'Offline',
        durationMinutes: 120,
        totalQuestions: 100,
        attemptedQuestions: 95,
        correctAnswers: 76,
        incorrectAnswers: 19,
        overallScore: 710,
        subtestScores: { subtest_pu: 740, subtest_pk: 680 },
      },
    ],
    subtests,
    700
  )

  assert.equal(mockReport.count, 2)
  assert.equal(mockReport.latestScore, 710)
  assert.equal(mockReport.trendDelta, 90)
  assert.equal(mockReport.latestDeltaFromTarget, 10)
  assert.equal(mockReport.weakestSubtest?.subtestId, 'subtest_pk')

  const analytics = buildLearningAnalyticsReport({
    topics: [],
    subtests,
    questionAttempts: [
      { id: 'qa1', questionId: 'q1', subtestId: 'subtest_pu', chapterId: 'c1', topicId: 't1', selectedIndex: 0, isCorrect: true, attemptedAt: '2026-11-18T09:00:00.000Z' },
      { id: 'qa2', questionId: 'q2', subtestId: 'subtest_pk', chapterId: 'c2', topicId: 't2', selectedIndex: 1, isCorrect: false, attemptedAt: '2026-11-18T09:05:00.000Z' },
    ],
    mistakeNotes: [],
    bossAttempts: [
      { id: 'b1', bossId: 'final_challenge_all', bossType: 'final_challenge', subtestId: 'final_challenge', chapterId: 'all', totalQuestions: 10, correctCount: 8, accuracyPercent: 80, passed: true, timeSpentSeconds: 300, attemptedAt: '2026-11-18T10:00:00.000Z' },
    ],
    smartReviewQueue: [],
    questCounts: {
      dailyDone: 2,
      dailyTotal: 4,
      weeklyDone: 1,
      weeklyTotal: 3,
      mainSideDone: 1,
      mainSideTotal: 5,
      customDone: 0,
      customTotal: 0,
    },
    todayLocalDate: '2026-11-18',
  })

  assert.equal(analytics.overallAttempts, 2)
  assert.equal(analytics.overallAccuracyPercent, 50)
  assert.equal(analytics.passedBossCount, 1)
  assert.equal(analytics.bossPassRatePercent, 100)
})

test('PRD 3.0 Sec 21 & 26: Backup payload validator supports v1 (2.0.0) & v2 (3.0.0) and rejects invalid JSON', () => {
  const { validateBackupPayload } = mods.backupSchema

  const v1Payload = JSON.stringify({
    schemaVersion: 1,
    appName: 'RITME',
    exportedAt: '2026-11-01T10:00:00.000Z',
    data: {
      userSettings: [{ id: 'default_user', language: 'id' }],
      habits: [{ id: 'h1', name: 'Read 10 mins' }],
    },
  })
  const parsedV1 = validateBackupPayload(v1Payload)
  assert.ok(parsedV1 !== null)
  assert.equal(parsedV1.schemaVersion, 1)

  const v2Payload = JSON.stringify({
    schemaVersion: 2,
    appName: 'RITME',
    exportedAt: '2026-11-18T10:00:00.000Z',
    data: {
      userSettings: [{ id: 'default_user', language: 'en' }],
      habits: [],
      chapters: [],
      bossAttempts: [],
      mockTests: [],
    },
  })
  const parsedV2 = validateBackupPayload(v2Payload)
  assert.ok(parsedV2 !== null)
  assert.equal(parsedV2.schemaVersion, 2)

  assert.equal(validateBackupPayload('{"appName":"OTHER"}'), null)
  assert.equal(validateBackupPayload('not-json'), null)
})

test('TASK 03: Legacy 7-status compatibility mapping, canonical storage & logical tracker sort', () => {
  const {
    mapTopicStatusToUi,
    mapUiStatusToStorage,
    sortLearningTopicsForTracker,
  } = mods.tracker

  assert.equal(mapTopicStatusToUi('not_started'), 'not_started')
  assert.equal(mapTopicStatusToUi('learning'), 'learning')
  assert.equal(mapTopicStatusToUi('practicing'), 'learning')
  assert.equal(mapTopicStatusToUi('needs_review'), 'learning')
  assert.equal(mapTopicStatusToUi('understood'), 'completed')
  assert.equal(mapTopicStatusToUi('proficient'), 'completed')
  assert.equal(mapTopicStatusToUi('mastered'), 'completed')

  assert.equal(mapUiStatusToStorage('not_started'), 'not_started')
  assert.equal(mapUiStatusToStorage('learning'), 'learning')
  assert.equal(mapUiStatusToStorage('completed'), 'mastered')

  const sorted = sortLearningTopicsForTracker([
    { id: 't_done', status: 'understood', subtestId: 'subtest_pu', title: 'Done' },
    { id: 't_idle', status: 'not_started', subtestId: 'subtest_pu', title: 'Idle' },
    { id: 't_rev', status: 'needs_review', subtestId: 'subtest_pu', title: 'Active Review' },
  ])
  assert.deepEqual(
    sorted.map((t) => t.id),
    ['t_rev', 't_idle', 't_done']
  )
})

test('TASK 03: External URL validation allows HTTP/HTTPS and blocks dangerous schemes', () => {
  const { validateExternalUrl } = mods.tracker

  assert.equal(validateExternalUrl('').valid, true)
  const yt = validateExternalUrl('  https://www.youtube.com/watch?v=dQw4w9WgXcQ  ')
  assert.equal(yt.valid, true)
  assert.equal(yt.normalizedUrl, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

  const httpPdf = validateExternalUrl('http://example.com/modul-utbk.pdf')
  assert.equal(httpPdf.valid, true)

  for (const unsafe of [
    'javascript:alert(1)',
    'JAVASCRIPT:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'file:///etc/passwd',
    'vbscript:msgbox(1)',
    'not-a-valid-url',
    'https://user:pass@evil.com',
    'https://evil.com/\u0000test',
  ]) {
    const res = validateExternalUrl(unsafe)
    assert.equal(res.valid, false, `Expected URL "${unsafe}" to be rejected`)
  }
})

test('TASK 03: Topic CRUD, reload persistence, completion timestamp, XP idempotency & backup compatibility', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
    }
  }
  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())

  const userStore = mods.userStore.useUserStore()
  const habitStore = mods.habitStore.useHabitStore()
  const focusStore = mods.focusStore.useFocusStore()
  const learningStore = mods.learningStore.useLearningStore()
  const gamificationStore = mods.gamificationStore.useGamificationStore()

  await Promise.all([
    userStore.initUserStore(true),
    habitStore.initHabitStore(true),
    focusStore.initFocusStore(true),
    learningStore.initLearningStore(true),
    gamificationStore.initGamificationStore(true),
  ])

  // 1. Create topic with external source fields
  const created = await learningStore.addTopic({
    subtestId: 'subtest_pk',
    title: 'Pertidaksamaan Kuadrat',
    sourceName: 'Khan Academy',
    sourceUrl: 'https://www.khanacademy.org/math',
    targetDurationMinutes: 35,
    notes: 'Catat garis bilangan tanda + / -',
  })
  assert.ok(created.topic !== null)
  assert.equal(created.topic.status, 'not_started')
  assert.equal(created.topic.sourceName, 'Khan Academy')
  assert.equal(created.topic.sourceUrl, 'https://www.khanacademy.org/math')
  assert.equal(created.topic.targetDurationMinutes, 35)
  assert.equal(created.topic.completedAt, null)
  assert.equal(created.xpEarned, 0)

  const topicId = created.topic.id
  const xpBeforeCompletion = gamificationStore.totalXP

  // 2. Edit topic title/notes/url without completion -> zero XP
  const editXp = await learningStore.updateTopic(topicId, {
    title: 'Pertidaksamaan Kuadrat & Rasional',
    notes: 'Fokus syarat penyebut != 0',
    sourceUrl: 'javascript:alert(1)', // stripped/rejected at store boundary too
  })
  assert.equal(editXp, 0)
  assert.equal(gamificationStore.totalXP, xpBeforeCompletion)
  assert.equal(learningStore.getTopicById(topicId)?.sourceUrl, '')

  // Restore safe URL
  await learningStore.updateTopic(topicId, {
    sourceUrl: 'https://www.khanacademy.org/math/algebra',
  })

  // 3. Status update -> learning -> completed sets timestamps & awards XP ONCE
  const learningXp = await learningStore.updateTopicStatus(topicId, 'learning')
  assert.equal(learningXp, 0)
  assert.ok(learningStore.getTopicById(topicId)?.lastStudiedAt)
  assert.equal(learningStore.getTopicById(topicId)?.completedAt, null)

  const completeXpFirst = await learningStore.updateTopicStatus(topicId, 'mastered')
  assert.equal(completeXpFirst, 10)
  const completedTopic = learningStore.getTopicById(topicId)
  assert.equal(completedTopic?.status, 'mastered')
  assert.ok(completedTopic?.completedAt)
  const xpAfterFirstComplete = gamificationStore.totalXP

  // 4. Editing completed topic & toggling status repeatedly produces ZERO extra XP (idempotency)
  const editAfterDoneXp = await learningStore.updateTopic(topicId, {
    title: 'Pertidaksamaan Kuadrat Updated',
    notes: 'Selesai catatan',
  })
  assert.equal(editAfterDoneXp, 0)
  assert.equal(gamificationStore.totalXP, xpAfterFirstComplete)

  await learningStore.updateTopicStatus(topicId, 'learning')
  assert.equal(learningStore.getTopicById(topicId)?.completedAt, null)
  const repeatCompleteXp = await learningStore.updateTopicStatus(topicId, 'mastered')
  assert.equal(repeatCompleteXp, 0)
  assert.equal(gamificationStore.totalXP, xpAfterFirstComplete)

  // 5. Persistence after store reload (simulates app restart)
  await learningStore.initLearningStore(true)
  await gamificationStore.initGamificationStore(true)
  const reloadedTopic = learningStore.getTopicById(topicId)
  assert.ok(reloadedTopic)
  assert.equal(reloadedTopic.title, 'Pertidaksamaan Kuadrat Updated')
  assert.equal(reloadedTopic.status, 'mastered')
  assert.equal(reloadedTopic.sourceName, 'Khan Academy')
  assert.equal(
    reloadedTopic.sourceUrl,
    'https://www.khanacademy.org/math/algebra'
  )
  assert.equal(reloadedTopic.targetDurationMinutes, 35)
  assert.ok(reloadedTopic.completedAt)
  assert.equal(gamificationStore.totalXP, xpAfterFirstComplete)

  // 6. Backup payload schema accepts legacy + new external tracker fields cleanly
  const backupJson = JSON.stringify({
    schemaVersion: 2,
    appName: 'RITME',
    exportedAt: '2026-11-18T12:00:00.000Z',
    data: {
      userSettings: [],
      habits: [],
      learningTopics: [
        reloadedTopic,
        {
          id: 'legacy_v2',
          subtestId: 'subtest_pu',
          title: 'Legacy Topik',
          description: '',
          status: 'understood',
          practiceCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          notes: '',
          lastStudiedAt: null,
          reviewSchedule: null,
        },
      ],
    },
  })
  const parsedBackup = mods.backupSchema.validateBackupPayload(backupJson)
  assert.ok(parsedBackup !== null)
  assert.equal(parsedBackup.data.learningTopics.length, 2)
  assert.equal(parsedBackup.data.learningTopics[1].status, 'understood')

  // 7. Delete topic persists across reload
  await learningStore.deleteTopic(topicId)
  assert.equal(learningStore.getTopicById(topicId), undefined)
  await learningStore.initLearningStore(true)
  assert.equal(learningStore.getTopicById(topicId), undefined)
})

test('TASK 04: Focus Timer Free/Pomodoro, Pause/Resume, Background & Reload Recovery, Cancel, Break Exclusion, Persistence & XP Idempotency', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }
  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())

  const userStore = mods.userStore.useUserStore()
  const habitStore = mods.habitStore.useHabitStore()
  const focusStore = mods.focusStore.useFocusStore()
  const learningStore = mods.learningStore.useLearningStore()
  const gamificationStore = mods.gamificationStore.useGamificationStore()

  await Promise.all([
    userStore.initUserStore(true),
    habitStore.initHabitStore(true),
    focusStore.initFocusStore(true),
    learningStore.initLearningStore(true),
    gamificationStore.initGamificationStore(true),
  ])

  const realDateNow = Date.now
  const todayBase = new Date()
  todayBase.setHours(8, 0, 0, 0)
  let mockNow = todayBase.getTime()
  Date.now = () => mockNow

  try {
    // 1. Default Free Focus (25m) without topic
    assert.equal(focusStore.focusMode, 'free')
    assert.equal(focusStore.selectedDurationMinutes, 25)
    focusStore.selectedSubjectId = ''
    focusStore.selectedTopicId = ''
    focusStore.customTopicTitle = ''

    const xpBeforeStart = gamificationStore.totalXP
    await focusStore.startSession()
    assert.equal(focusStore.timerStatus, 'running')
    assert.equal(focusStore.activeSession?.subjectId, '')
    assert.equal(focusStore.activeSession?.topicId, '')
    // Premature start must NOT award XP yet (so Cancel gives 0 XP)
    assert.equal(gamificationStore.totalXP, xpBeforeStart)

    // 2. Cancel session -> status 'cancelled', 0 study minutes, 0 XP, not in completedSessions
    mockNow += 5 * 60_000
    await focusStore.cancelSession()
    assert.equal(focusStore.timerStatus, 'idle')
    assert.equal(focusStore.activeSession, null)
    assert.equal(focusStore.completedSessions.length, 0)
    assert.equal(gamificationStore.totalXP, xpBeforeStart)

    // 3. Start Free Focus with selected duration 25m + Pause/Resume + Background jump + Reload recovery
    focusStore.setDurationMinutes(25)
    focusStore.selectedSubjectId = 'subtest_pu'
    focusStore.selectedTopicId = 'Penalaran Induktif & Deduktif'
    await focusStore.startSession()
    const firstSessionId = focusStore.activeSession.id
    assert.equal(focusStore.timerStatus, 'running')

    // Run 5 minutes, pause for 3 minutes -> elapsed MUST freeze at 300s
    mockNow += 5 * 60_000
    await focusStore.pauseSession()
    assert.equal(focusStore.timerStatus, 'paused')
    assert.equal(focusStore.effectiveElapsedSeconds, 300)

    mockNow += 3 * 60_000
    focusStore.syncTimerNow()
    assert.equal(focusStore.effectiveElapsedSeconds, 300)
    assert.equal(focusStore.totalPausedSeconds, 180)
    assert.equal(gamificationStore.totalXP, xpBeforeStart)

    // Resume and simulate 15-minute background jump (total effective = 20m = 1200s, remaining = 300s)
    await focusStore.resumeSession()
    assert.equal(focusStore.timerStatus, 'running')
    mockNow += 15 * 60_000
    focusStore.syncTimerNow()
    assert.equal(focusStore.effectiveElapsedSeconds, 1200)
    assert.equal(focusStore.remainingSeconds, 300)

    // 4. Reload / restart recovery from persisted Preferences without duplicating StudySession
    await focusStore.initFocusStore(true)
    await gamificationStore.syncDailyQuestRewards()
    assert.equal(focusStore.timerStatus, 'running')
    assert.equal(focusStore.activeSession?.id, firstSessionId)
    assert.equal(focusStore.effectiveElapsedSeconds, 1200)
    assert.equal(focusStore.remainingSeconds, 300)
    assert.equal(gamificationStore.totalXP, xpBeforeStart) // Reload mid-session must NOT leak XP before completion
    assert.equal(
      focusStore.sessions.filter((s) => s.id === firstSessionId).length,
      1
    )

    // Advance remaining 5 minutes -> finish with concurrent double-tap guard (no duplicate session or XP!)
    mockNow += 5 * 60_000
    const [res1, res2] = await Promise.all([
      focusStore.finishSession(),
      focusStore.finishSession(),
    ])
    assert.ok(res1 !== null)
    assert.equal(res2, null)
    assert.equal(res1.durationMinutes, 25)
    assert.equal(res1.focusMode, 'free')
    assert.equal(res1.xpEarned, 20) // 5 (first_focus_session) + 15 (first 20m focus block)
    assert.equal(focusStore.completedSessions.length, 1)
    assert.equal(focusStore.todayStudyMinutes, 25)

    // 5. Session persistence after reload + XP idempotency
    const xpAfterFirstComplete = gamificationStore.totalXP
    await focusStore.initFocusStore(true)
    await gamificationStore.initGamificationStore(true)
    assert.equal(focusStore.timerStatus, 'idle')
    assert.equal(focusStore.completedSessions.length, 1)
    assert.equal(focusStore.completedSessions[0].id, firstSessionId)
    assert.equal(focusStore.completedSessions[0].durationMinutes, 25)
    assert.equal(gamificationStore.totalXP, xpAfterFirstComplete)

    // Verify XP idempotency explicitly (re-awarding same day eventId & focus block yields 0)
    const todayKey = new Date(mockNow)
    const yyyy = todayKey.getFullYear()
    const mm = String(todayKey.getMonth() + 1).padStart(2, '0')
    const dd = String(todayKey.getDate()).padStart(2, '0')
    const duplicateFirstXp = await gamificationStore.awardXP(
      `quest_first_focus_${yyyy}-${mm}-${dd}`,
      'first_focus_session',
      5
    )
    const duplicateBlockXp = await gamificationStore.syncFocusBlocksXP(25)
    assert.equal(duplicateFirstXp, 0)
    assert.equal(duplicateBlockXp, 0)
    assert.equal(gamificationStore.totalXP, xpAfterFirstComplete)

    // 6. Start Pomodoro focus phase -> complete -> transitions cleanly to short_break + idempotent XP
    focusStore.setFocusMode('pomodoro')
    assert.equal(focusStore.focusMode, 'pomodoro')
    assert.equal(focusStore.pomodoroPhase, 'focus')
    assert.equal(focusStore.selectedDurationMinutes, 25)

    await focusStore.startSession()
    assert.equal(focusStore.timerStatus, 'running')
    assert.ok(focusStore.activeSession !== null)
    mockNow += 25 * 60_000
    const pomoFocusSummary = await focusStore.finishSession()
    assert.ok(pomoFocusSummary !== null)
    assert.equal(pomoFocusSummary.isBreak, false)
    assert.equal(pomoFocusSummary.focusMode, 'pomodoro')
    assert.equal(pomoFocusSummary.durationMinutes, 25)
    assert.equal(pomoFocusSummary.xpEarned, 15) // 2nd 20m block (+15 XP); first_focus_session NOT re-awarded
    assert.equal(focusStore.completedSessions.length, 2)
    assert.equal(focusStore.todayStudyMinutes, 50)
    assert.equal(focusStore.pomodoroPhase, 'short_break')
    assert.equal(focusStore.isBreakPhase, true)
    assert.equal(focusStore.selectedDurationMinutes, 5)

    // 7. Pomodoro break phase exclusion (0 StudySession, 0 minutes, 0 XP)
    const xpAfterPomoFocus = gamificationStore.totalXP
    await focusStore.startSession()
    assert.equal(focusStore.timerStatus, 'running')
    assert.equal(focusStore.activeSession, null) // Break never creates StudySession
    assert.equal(focusStore.completedSessions.length, 2)

    mockNow += 5 * 60_000
    const breakSummary = await focusStore.finishSession()
    assert.ok(breakSummary !== null)
    assert.equal(breakSummary.isBreak, true)
    assert.equal(breakSummary.xpEarned, 0)
    assert.equal(focusStore.completedSessions.length, 2) // Still 2 study sessions
    assert.equal(focusStore.todayStudyMinutes, 50) // Break excluded from study minutes
    assert.equal(gamificationStore.totalXP, xpAfterPomoFocus) // Zero break XP
    assert.equal(focusStore.pomodoroPhase, 'focus') // Advanced cleanly to next focus cycle
    assert.equal(focusStore.pomodoroCycleCount, 2)
  } finally {
    Date.now = realDateNow
    await focusStore.cancelSession()
  }
})

test('TASK 05: Focus Time, Cancelled/Break Exclusion, Period Windows (7d/30d) & Deduplicated History Filters', () => {
  const {
    computePeriodFocusStats,
    buildFocusActivityBars,
    buildLearningActivityHistory,
    formatFocusDuration,
  } = mods.progressSummary

  // Fixed local reference date: Thursday 2026-11-19 14:00 local time
  const refDate = new Date(2026, 10, 19, 14, 0, 0, 0)
  const makeIso = (daysAgo, hour = 9) => {
    const d = new Date(2026, 10, 19 - daysAgo, hour, 0, 0, 0)
    return d.toISOString()
  }

  const sessions = [
    // Today completed 25m
    {
      id: 'sess_today_1',
      startTime: makeIso(0, 9),
      endTime: makeIso(0, 9.5),
      durationMinutes: 25,
      pausedDuration: 0,
      subjectId: 'subtest_pu',
      topicId: 'topic_pu_1',
      notes: '',
      location: 'Desk',
      status: 'completed',
    },
    // Duplicate of sess_today_1 (defensive dedupe check)
    {
      id: 'sess_today_1',
      startTime: makeIso(0, 9),
      endTime: makeIso(0, 9.5),
      durationMinutes: 25,
      pausedDuration: 0,
      subjectId: 'subtest_pu',
      topicId: 'topic_pu_1',
      notes: '',
      location: 'Desk',
      status: 'completed',
    },
    // Today early-finish (< 60s -> durationMinutes 0, still 1 completed session, 0 fake minutes added)
    {
      id: 'sess_today_short',
      startTime: makeIso(0, 10),
      endTime: makeIso(0, 10),
      durationMinutes: 0,
      pausedDuration: 0,
      subjectId: '',
      topicId: '',
      notes: '',
      location: 'Desk',
      status: 'completed',
    },
    // Today cancelled (MUST be excluded)
    {
      id: 'sess_today_cancelled',
      startTime: makeIso(0, 11),
      endTime: makeIso(0, 11),
      durationMinutes: 20,
      pausedDuration: 0,
      subjectId: 'subtest_pu',
      topicId: 'topic_pu_1',
      notes: '',
      location: 'Desk',
      status: 'cancelled',
    },
    // Today running & paused (MUST be excluded)
    {
      id: 'sess_today_running',
      startTime: makeIso(0, 12),
      endTime: null,
      durationMinutes: 15,
      pausedDuration: 0,
      subjectId: 'subtest_pu',
      topicId: 'topic_pu_1',
      notes: '',
      location: 'Desk',
      status: 'running',
    },
    {
      id: 'sess_today_paused',
      startTime: makeIso(0, 13),
      endTime: null,
      durationMinutes: 10,
      pausedDuration: 30,
      subjectId: 'subtest_pu',
      topicId: 'topic_pu_1',
      notes: '',
      location: 'Desk',
      status: 'paused',
    },
    // Synthetic Pomodoro break ID (MUST be excluded)
    {
      id: 'break_today_1',
      startTime: makeIso(0, 10),
      endTime: makeIso(0, 10),
      durationMinutes: 5,
      pausedDuration: 0,
      subjectId: '',
      topicId: '',
      notes: '',
      location: 'Desk',
      status: 'completed',
    },
    // 3 days ago completed 40m (inside 7d & 30d)
    {
      id: 'sess_3d_ago',
      startTime: makeIso(3, 8),
      endTime: makeIso(3, 9),
      durationMinutes: 40,
      pausedDuration: 0,
      subjectId: 'subtest_pm',
      topicId: 'topic_pm_1',
      notes: '',
      location: 'Desk',
      status: 'completed',
    },
    // 12 days ago completed 50m (outside 7d, inside 30d)
    {
      id: 'sess_12d_ago',
      startTime: makeIso(12, 8),
      endTime: makeIso(12, 9),
      durationMinutes: 50,
      pausedDuration: 0,
      subjectId: 'subtest_pk',
      topicId: 'topic_pk_1',
      notes: '',
      location: 'Desk',
      status: 'completed',
    },
    // 40 days ago completed 60m (outside 7d & 30d, only in 'all' history)
    {
      id: 'sess_40d_ago',
      startTime: makeIso(40, 8),
      endTime: makeIso(40, 9),
      durationMinutes: 60,
      pausedDuration: 0,
      subjectId: 'subtest_lbi',
      topicId: 'topic_lbi_1',
      notes: '',
      location: 'Desk',
      status: 'completed',
    },
  ]

  // 1-4 & 11. Focus stats for Minggu Ini (7d) vs 30 Hari (30d)
  const weekStats = computePeriodFocusStats(sessions, 'week', refDate)
  assert.equal(weekStats.totalFocusMinutes, 65) // 25 + 0 + 40
  assert.equal(weekStats.completedSessionsCount, 3) // sess_today_1, sess_today_short, sess_3d_ago
  assert.equal(weekStats.activeDaysCount, 2)

  const monthStats = computePeriodFocusStats(sessions, 'month', refDate)
  assert.equal(monthStats.totalFocusMinutes, 115) // 65 + 50
  assert.equal(monthStats.completedSessionsCount, 4) // + sess_12d_ago
  assert.equal(monthStats.activeDaysCount, 3)

  // Activity bars length and totals
  const weekChart = buildFocusActivityBars(sessions, 'week', refDate)
  assert.equal(weekChart.bars.length, 7)
  assert.equal(weekChart.totalMinutes, 65)
  assert.equal(weekChart.bars[6].isToday, true)
  assert.equal(weekChart.bars[6].minutes, 25)
  assert.equal(weekChart.bars[3].minutes, 40)

  const monthChart = buildFocusActivityBars(sessions, 'month', refDate)
  assert.equal(monthChart.bars.length, 30)
  assert.equal(monthChart.totalMinutes, 115)
  assert.equal(monthChart.bars[29].isToday, true)

  // Readable duration formatting
  assert.equal(formatFocusDuration(0, 'id'), '0 mnt')
  assert.equal(formatFocusDuration(65, 'id'), '1j 5m')
  assert.equal(formatFocusDuration(120, 'en'), '2h')

  // 12. Learning Activity History filters (today / week / all) without duplicates
  const subtests = mods.learningStore.DEFAULT_UTBK_SUBTESTS
  const topics = [
    // Untouched default learning topic (null timestamps -> must NOT pollute history)
    {
      id: 'topic_untouched',
      subtestId: 'subtest_pu',
      title: 'Untouched Seed',
      description: '',
      status: 'learning',
      practiceCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      notes: '',
      lastStudiedAt: null,
      reviewSchedule: null,
    },
    // Topic completed today
    {
      id: 'topic_done_today',
      subtestId: 'subtest_pbm',
      title: 'Ejaan (EYD V)',
      description: '',
      status: 'understood', // legacy completed status!
      completedAt: makeIso(0, 11),
      statusUpdatedAt: makeIso(0, 11),
      practiceCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      notes: '',
      lastStudiedAt: makeIso(0, 11),
      reviewSchedule: null,
    },
    // Topic started learning 4 days ago
    {
      id: 'topic_learn_4d',
      subtestId: 'subtest_lbe',
      title: 'Inference',
      description: '',
      status: 'practicing', // legacy in-progress status!
      statusUpdatedAt: makeIso(4, 10),
      practiceCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      notes: '',
      lastStudiedAt: makeIso(4, 10),
      reviewSchedule: null,
    },
  ]

  const todayHistory = buildLearningActivityHistory({
    sessions,
    topics,
    subtests,
    filter: 'today',
    refDate,
  })
  // Expected today items: topic_done_today (11:00), sess_today_short (10:00), sess_today_1 (09:30)
  assert.equal(todayHistory.length, 3)
  assert.equal(todayHistory[0].id, 'topic_completed_topic_done_today')
  assert.equal(todayHistory[1].id, 'focus_sess_today_short')
  assert.equal(todayHistory[2].id, 'focus_sess_today_1')

  const weekHistory = buildLearningActivityHistory({
    sessions,
    topics,
    subtests,
    filter: 'week',
    refDate,
  })
  // Expected week items: 3 today + sess_3d_ago + topic_learn_4d = 5 (no duplicates, no untouched seed)
  assert.equal(weekHistory.length, 5)
  assert.equal(new Set(weekHistory.map((x) => x.id)).size, 5)
  assert.equal(
    weekHistory.some((x) => x.topicId === 'topic_untouched'),
    false
  )

  const allHistory = buildLearningActivityHistory({
    sessions,
    topics,
    subtests,
    filter: 'all',
    refDate,
  })
  // Expected all items: 5 week + sess_12d_ago + sess_40d_ago = 7
  assert.equal(allHistory.length, 7)
  for (let i = 1; i < allHistory.length; i++) {
    assert.ok(allHistory[i - 1].timestampMs >= allHistory[i].timestampMs)
  }
})

test('TASK 05: Legacy TopicStatus Completion (understood/proficient/mastered), 7 Subtests Breakdown & Rest-Day Habit Consistency', () => {
  const {
    computeCompletedTopicsSummary,
    computeSubtestCompletionBreakdown,
    computeHabitConsistency,
  } = mods.progressSummary

  const subtests = mods.learningStore.DEFAULT_UTBK_SUBTESTS
  const makeTopic = (id, subtestId, status) => ({
    id,
    subtestId,
    title: id,
    description: '',
    status,
    practiceCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    notes: '',
    lastStudiedAt: null,
    reviewSchedule: null,
  })

  const topics = [
    // PU: 1 understood (legacy completed) + 1 not_started => 1/2 (50%)
    makeTopic('t_pu_1', 'subtest_pu', 'understood'),
    makeTopic('t_pu_2', 'subtest_pu', 'not_started'),
    // PPU: 1 proficient (legacy completed) => 1/1 (100%)
    makeTopic('t_ppu_1', 'subtest_ppu', 'proficient'),
    // PBM: 1 mastered (canonical completed) => 1/1 (100%)
    makeTopic('t_pbm_1', 'subtest_pbm', 'mastered'),
    // PK: 1 learning + 1 practicing => 0/2 (0%)
    makeTopic('t_pk_1', 'subtest_pk', 'learning'),
    makeTopic('t_pk_2', 'subtest_pk', 'practicing'),
    // LBI: 1 needs_review => 0/1 (0%)
    makeTopic('t_lbi_1', 'subtest_lbi', 'needs_review'),
    // LBE: 1 not_started => 0/1 (0%)
    makeTopic('t_lbe_1', 'subtest_lbe', 'not_started'),
    // PM: 1 understood + 1 mastered => 2/2 (100%)
    makeTopic('t_pm_1', 'subtest_pm', 'understood'),
    makeTopic('t_pm_2', 'subtest_pm', 'mastered'),
  ]

  // 5-8. Legacy & modern status mapping consistency
  const summary = computeCompletedTopicsSummary(topics)
  assert.equal(summary.totalTopics, 10)
  assert.equal(summary.completedTopics, 5) // understood(2) + proficient(1) + mastered(2)
  assert.equal(summary.learningTopics, 3) // learning + practicing + needs_review
  assert.equal(summary.notStartedTopics, 2)
  assert.equal(summary.completionPercent, 50)

  // 9. All 7 UTBK subtests accurate order & completed/total counts
  const breakdown = computeSubtestCompletionBreakdown(subtests, topics)
  assert.deepEqual(
    breakdown.map((s) => s.code),
    ['PU', 'PPU', 'PBM', 'PK', 'LBI', 'LBE', 'PM']
  )
  const byCode = Object.fromEntries(breakdown.map((s) => [s.code, s]))
  assert.equal(byCode.PU.completedTopics, 1)
  assert.equal(byCode.PU.totalTopics, 2)
  assert.equal(byCode.PU.completionPercent, 50)
  assert.equal(byCode.PPU.completedTopics, 1)
  assert.equal(byCode.PPU.completionPercent, 100)
  assert.equal(byCode.PBM.completedTopics, 1)
  assert.equal(byCode.PBM.completionPercent, 100)
  assert.equal(byCode.PK.completedTopics, 0)
  assert.equal(byCode.PK.totalTopics, 2)
  assert.equal(byCode.LBI.completedTopics, 0)
  assert.equal(byCode.LBE.completedTopics, 0)
  assert.equal(byCode.PM.completedTopics, 2)
  assert.equal(byCode.PM.totalTopics, 2)
  assert.equal(byCode.PM.completionPercent, 100)

  // 10. Habit consistency respects rest days & excludes inactive habits without streak penalty
  const refDate = new Date(2026, 10, 19, 12, 0, 0, 0) // Thu 2026-11-19
  const weeklyRestDay = 0 // Sunday (2026-11-15 falls inside the last 7 days)
  const habits = [
    { id: 'h_active_1', name: 'A1', description: '', active: true, stackOrder: 1, createdAt: '' },
    { id: 'h_active_2', name: 'A2', description: '', active: true, stackOrder: 2, createdAt: '' },
    { id: 'h_inactive', name: 'Old', description: '', active: false, stackOrder: 3, createdAt: '' },
  ]

  // Complete both active habits on all 6 non-rest days in last 7 days; 0 completions on Sunday rest day
  const nonRestDates = [
    '2026-11-13', // Fri
    '2026-11-14', // Sat
    // 2026-11-15 is Sunday (rest day -> 0 completions, MUST NOT count as failure!)
    '2026-11-16', // Mon
    '2026-11-17', // Tue
    '2026-11-18', // Wed
    '2026-11-19', // Thu
  ]
  const completions = []
  for (const date of nonRestDates) {
    completions.push({ id: `c1_${date}`, habitId: 'h_active_1', date, completedAt: '' })
    completions.push({ id: `c2_${date}`, habitId: 'h_active_2', date, completedAt: '' })
  }

  const weekConsistency = computeHabitConsistency({
    activeHabits: habits,
    completions,
    weeklyRestDay,
    period: 'week',
    refDate,
  })
  assert.equal(weekConsistency.activeHabitsCount, 2) // Inactive habit excluded
  assert.equal(weekConsistency.restDaysExcludedCount, 1) // Sunday excluded cleanly
  assert.equal(weekConsistency.plannedDaysCount, 6)
  assert.equal(weekConsistency.consistencyPercent, 100) // Rest day did NOT penalize consistency!

  // 30-day window excludes all Sundays with 0 completions (4 Sundays in 2026-10-21..2026-11-19)
  const monthConsistency = computeHabitConsistency({
    activeHabits: habits,
    completions,
    weeklyRestDay,
    period: 'month',
    refDate,
  })
  assert.equal(monthConsistency.restDaysExcludedCount, 4)
  assert.equal(monthConsistency.plannedDaysCount, 26)
  assert.equal(monthConsistency.consistencyPercent, Math.round(600 / 26)) // 23%
})

test('TASK 06: Settings General, Reminders, Quiet Hours, Sound, Haptics & Timer Notification Persistence Across Reload', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }

  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())

  const userStore = mods.userStore.useUserStore()
  await userStore.initUserStore(true)

  // 1. Update profile name
  await userStore.updateSettings({ displayName: 'Nadia Pratama' })
  // 2. Change language -> 'en'
  await userStore.setLanguage('en')
  // 3. Change theme -> 'light'
  await userStore.setTheme('light')
  // 4. Update daily focus target -> 150
  await userStore.updateSettings({ dailyTargetMinutes: 150 })
  // 5. Update weekly rest day -> 3 (Wednesday)
  await userStore.updateSettings({ weeklyRestDay: 3 })
  // 6. Toggle study reminders OFF (must NOT turn off timer completion notifications!)
  await userStore.updateReminderConfig({
    enabled: false,
    morningTime: '07:30',
    eveningTime: '21:15',
  })
  await userStore.updateSettings({ notifyStudyReminder: false })
  // 7. Quiet hours configuration
  await userStore.updateSettings({
    quietHoursEnabled: true,
    quietHoursStart: '21:30',
    quietHoursEnd: '05:30',
  })
  // 8. Sound toggle OFF
  await userStore.updateSettings({
    soundEffectsEnabled: false,
    timerAlarmEnabled: false,
    silentMode: true,
  })
  // 9. Haptic toggle OFF
  await userStore.updateSettings({ vibrationEnabled: false })
  // 10. Timer completion notification settings (still enabled even with study reminders off, then toggle off & verify)
  assert.equal(userStore.settings.notificationsEnabled, true)
  assert.equal(userStore.settings.notifyFocusCompletion, true)
  await userStore.updateSettings({
    notifyFocusCompletion: false,
    notifyBreakReminder: false,
  })

  // Reload userStore from persisted Dexie + Capacitor Preferences and verify EVERY field survived!
  await userStore.initUserStore(true)
  assert.equal(userStore.settings.displayName, 'Nadia Pratama')
  assert.equal(userStore.settings.language, 'en')
  assert.equal(userStore.settings.theme, 'light')
  assert.equal(userStore.settings.dailyTargetMinutes, 150)
  assert.equal(userStore.effectiveDailyTargetMinutes, 150)
  assert.equal(userStore.settings.weeklyRestDay, 3)
  assert.equal(userStore.reminderConfig.enabled, false)
  assert.equal(userStore.reminderConfig.morningTime, '07:30')
  assert.equal(userStore.reminderConfig.eveningTime, '21:15')
  assert.equal(userStore.settings.notifyStudyReminder, false)
  assert.equal(userStore.settings.quietHoursEnabled, true)
  assert.equal(userStore.settings.quietHoursStart, '21:30')
  assert.equal(userStore.settings.quietHoursEnd, '05:30')
  assert.equal(
    mods.notifications.isTimeWithinQuietHours(
      new Date(2026, 10, 19, 22, 0, 0),
      userStore.settings
    ),
    true
  )
  assert.equal(
    mods.notifications.isTimeWithinQuietHours(
      new Date(2026, 10, 19, 10, 0, 0),
      userStore.settings
    ),
    false
  )
  assert.equal(userStore.settings.soundEffectsEnabled, false)
  assert.equal(userStore.settings.timerAlarmEnabled, false)
  assert.equal(userStore.settings.silentMode, true)
  assert.equal(userStore.settings.vibrationEnabled, false)
  assert.equal(userStore.settings.notifyFocusCompletion, false)
  assert.equal(userStore.settings.notifyBreakReminder, false)
})

test('TASK 06: Full Backup Export (18 Tables + Preferences), Valid Import, Invalid Rejection Without Corruption & Atomic Reset', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }

  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())

  const userStore = mods.userStore.useUserStore()
  const habitStore = mods.habitStore.useHabitStore()
  const focusStore = mods.focusStore.useFocusStore()
  const learningStore = mods.learningStore.useLearningStore()
  const gamificationStore = mods.gamificationStore.useGamificationStore()

  await mods.backupService.reloadAllStores()

  // Seed recognizable user state across Dexie + Preferences
  await userStore.updateSettings({
    displayName: 'Backup Owner',
    language: 'en',
    theme: 'light',
    dailyTargetMinutes: 210,
    weeklyRestDay: 5,
  })
  await userStore.setDaySubtestSchedule(1, 'subtest_pm')
  await userStore.updateReminderConfig({
    enabled: true,
    morningTime: '06:45',
    eveningTime: '20:30',
  })
  const added = await learningStore.addTopic({
    subtestId: 'subtest_pu',
    title: 'Backup Guard Topic',
    status: 'mastered',
  })
  assert.ok(added.topic !== null)
  const backupTopicId = added.topic.id

  // 11. Export full backup -> must include all 18 Dexie tables + preferences
  const exportedJson = await mods.backupService.generateBackupJson()
  const parsedExport = mods.backupSchema.validateBackupPayload(exportedJson)
  assert.ok(parsedExport !== null)
  assert.equal(parsedExport.schemaVersion, 2)
  assert.equal(parsedExport.appName, 'RITME')
  const expected18Tables = [
    'userSettings',
    'habits',
    'habitCompletions',
    'studySessions',
    'subtestCategories',
    'learningTopics',
    'xpTransactions',
    'achievements',
    'personalRewards',
    'rewardRedemptions',
    'dailyReflections',
    'chapters',
    'questions',
    'questionAttempts',
    'mistakeNotes',
    'customQuests',
    'bossAttempts',
    'mockTests',
  ]
  for (const tableKey of expected18Tables) {
    assert.equal(Array.isArray(parsedExport.data[tableKey]), true, `Missing table ${tableKey}`)
  }
  assert.equal(parsedExport.data.preferences?.weeklySchedule?.[1], 'subtest_pm')
  assert.equal(parsedExport.data.preferences?.reminderConfig?.morningTime, '06:45')

  // 13 & 14. Reject invalid backups WITHOUT corrupting existing database
  const bad1 = await mods.backupService.importBackupFromJson('{invalid json')
  const bad2 = await mods.backupService.importBackupFromJson(
    JSON.stringify({ schemaVersion: 99, appName: 'RITME', data: { userSettings: [], habits: [] } })
  )
  const bad3 = await mods.backupService.importBackupFromJson(
    JSON.stringify({
      schemaVersion: 2,
      appName: 'RITME',
      data: { userSettings: [], habits: [], studySessions: 'corrupted-not-array' },
    })
  )
  assert.equal(bad1, false)
  assert.equal(bad2, false)
  assert.equal(bad3, false)
  assert.equal(userStore.settings.displayName, 'Backup Owner')
  assert.ok(learningStore.topics.some((t) => t.id === backupTopicId))

  // Mutate state heavily, then 12. Import valid backup -> restores original state cleanly across stores & Preferences
  await userStore.updateSettings({
    displayName: 'Temporary Overwrite',
    language: 'id',
    theme: 'dark',
    dailyTargetMinutes: 90,
  })
  await learningStore.deleteTopic(backupTopicId)
  assert.equal(learningStore.topics.some((t) => t.id === backupTopicId), false)

  const importOk = await mods.backupService.importBackupFromJson(exportedJson)
  assert.equal(importOk, true)
  assert.equal(userStore.settings.displayName, 'Backup Owner')
  assert.equal(userStore.settings.language, 'en')
  assert.equal(userStore.settings.theme, 'light')
  assert.equal(userStore.settings.dailyTargetMinutes, 210)
  assert.equal(userStore.settings.weeklyRestDay, 5)
  assert.equal(userStore.weeklySchedule[1], 'subtest_pm')
  assert.equal(userStore.reminderConfig.morningTime, '06:45')
  assert.equal(learningStore.topics.some((t) => t.id === backupTopicId), true)

  // 15 & 16. Reset database and Preferences consistently (including stopping any active timer!)
  await focusStore.startSession()
  assert.equal(focusStore.timerStatus, 'running')
  assert.ok(focusStore.activeSession !== null)

  await mods.backupService.resetAllApplicationData()

  // Verify clean defaults across all stores, zero active timer, zero stale preferences
  assert.equal(focusStore.timerStatus, 'idle')
  assert.equal(focusStore.activeSession, null)
  assert.equal(focusStore.completedSessions.length, 0)
  assert.equal(userStore.settings.displayName, '')
  assert.equal(userStore.settings.language, 'id')
  assert.equal(userStore.settings.theme, 'dark')
  assert.equal(userStore.settings.dailyTargetMinutes, 180)
  assert.equal(userStore.settings.weeklyRestDay, 0)
  assert.equal(userStore.reminderConfig.morningTime, '08:00')
  assert.equal(learningStore.topics.some((t) => t.id === backupTopicId), false)
  assert.equal(gamificationStore.totalXP, 0)
  assert.equal(habitStore.todayCompletedCount, 0)
})

test('TASK 07: Lightweight XP Sources, Idempotency, Daily Cap (100), Level-Up Feedback, Streak & Rest Day, Anti-Grinding', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }

  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())

  await mods.backupService.resetAllApplicationData()

  const userStore = mods.userStore.useUserStore()
  const habitStore = mods.habitStore.useHabitStore()
  const focusStore = mods.focusStore.useFocusStore()
  const learningStore = mods.learningStore.useLearningStore()
  const gamificationStore = mods.gamificationStore.useGamificationStore()

  const realDateNow = Date.now
  const todayBase = new Date()
  todayBase.setHours(8, 0, 0, 0)
  let mockNow = todayBase.getTime()
  Date.now = () => mockNow

  try {
    // 10. Cancelled focus session -> 0 XP
    focusStore.setDurationMinutes(25)
    await focusStore.startSession()
    mockNow += 5 * 60_000
    await focusStore.cancelSession()
    assert.equal(gamificationStore.totalXP, 0)

    // 1. Completed focus session (25m) -> +20 XP (5 first_focus + 15 block 1) & lightweight 'xp' celebration (NEVER 'achievement')
    await focusStore.startSession()
    mockNow += 25 * 60_000
    const focusRes = await focusStore.finishSession()
    assert.equal(focusRes.xpEarned, 20)
    assert.equal(gamificationStore.totalXP, 20)
    assert.equal(gamificationStore.activeCelebration?.kind, 'xp')

    // 11. Pomodoro break -> 0 XP
    focusStore.setFocusMode('pomodoro')
    focusStore.selectPomodoroPhase('short_break')
    await focusStore.startSession()
    mockNow += 5 * 60_000
    const breakRes = await focusStore.finishSession()
    assert.equal(breakRes.isBreak, true)
    assert.equal(breakRes.xpEarned, 0)
    assert.equal(gamificationStore.totalXP, 20)

    // 2. Habit completion -> +10 XP (toggling off & back on -> 0 duplicate XP)
    const firstHabit = habitStore.activeHabits[0]
    await habitStore.toggleHabitToday(firstHabit.id)
    assert.equal(gamificationStore.totalXP, 30)
    await habitStore.toggleHabitToday(firstHabit.id) // uncheck
    await habitStore.toggleHabitToday(firstHabit.id) // re-check same day
    assert.equal(gamificationStore.totalXP, 30)

    // 3, 12, 13. Learning topic completion -> +10 XP; topic edit & opening external URL -> 0 XP
    const created = await learningStore.addTopic({
      subtestId: 'subtest_pu',
      title: 'Silogisme Dasar',
      sourceUrl: 'https://example.com/silogisme',
      status: 'learning',
    })
    assert.equal(created.xpEarned, 0)
    assert.equal(gamificationStore.totalXP, 30)

    const topicId = created.topic.id
    // Edit topic details without completing -> 0 XP
    const editXp = await learningStore.updateTopic(topicId, {
      title: 'Silogisme Dasar (Revisi)',
      notes: 'Catatan tambahan',
    })
    assert.equal(editXp, 0)
    assert.equal(gamificationStore.totalXP, 30)

    // Validate/open external URL -> 0 XP
    const urlCheck = mods.tracker.validateExternalUrl(created.topic.sourceUrl)
    assert.equal(urlCheck.valid, true)
    assert.equal(gamificationStore.totalXP, 30)

    // Mark completed -> +10 XP; re-toggling status -> 0 extra XP
    const doneXp = await learningStore.updateTopicStatus(topicId, 'mastered')
    assert.equal(doneXp, 10)
    assert.equal(gamificationStore.totalXP, 40)
    await learningStore.updateTopicStatus(topicId, 'learning')
    const reDoneXp = await learningStore.updateTopicStatus(topicId, 'mastered')
    assert.equal(reDoneXp, 0)
    assert.equal(gamificationStore.totalXP, 40)

    // 4. Concurrent duplicate prevention (pendingEventIds guard)
    const [a1, a2] = await Promise.all([
      gamificationStore.awardXP('task07_dedupe_test', 'concept_mastered', 10),
      gamificationStore.awardXP('task07_dedupe_test', 'concept_mastered', 10),
    ])
    assert.equal(a1 + a2, 10)
    assert.equal(gamificationStore.totalXP, 50)

    // 5, 6, 7. Level progression (Lv 1 -> Lv 2 at 100 XP), Level-Up celebration & Daily XP Cap (100 XP)
    const capGain = await gamificationStore.awardXP('task07_cap_push', 'focus_block_20m', 70)
    assert.equal(capGain, 50) // Clamped strictly by DAILY_XP_CAP (50 + 50 = 100)
    assert.equal(gamificationStore.todayXP, 100)
    assert.equal(gamificationStore.totalXP, 100)
    assert.equal(gamificationStore.currentLevel, 2)
    assert.equal(gamificationStore.levelProgressInfo.nextLevel, 3)
    assert.equal(gamificationStore.levelProgressInfo.nextLevelMinXP, 250)
    assert.equal(gamificationStore.levelProgressInfo.remainingXPToNextLevel, 150)
    assert.equal(gamificationStore.activeCelebration?.kind, 'level_up')
    assert.equal(gamificationStore.activeCelebration?.previousLevel, 1)
    assert.equal(gamificationStore.activeCelebration?.newLevel, 2)

    // Further awards same day strictly blocked by cap (0 XP)
    const overCap = await gamificationStore.awardXP('task07_over_cap', 'concept_mastered', 10)
    assert.equal(overCap, 0)
    assert.equal(gamificationStore.totalXP, 100)

    // 8 & 9. Streak local date calculation + Weekly rest day handling (zero XP penalty!)
    const { getLocalDateString } = mods.date
    const d0 = new Date()
    d0.setHours(12, 0, 0, 0)
    const d1 = new Date(d0)
    d1.setDate(d1.getDate() - 1)
    const d2 = new Date(d0)
    d2.setDate(d2.getDate() - 2)

    // Set yesterday (d1) as scheduled weeklyRestDay and add completion on d2 + duplicate activity on today (d0)
    await userStore.updateSettings({ weeklyRestDay: d1.getDay() })
    const d2Str = getLocalDateString(d2)
    habitStore.completions.push({
      id: `hcomp_rest_test_${d2Str}`,
      habitId: firstHabit.id,
      date: d2Str,
      completedAt: d2.toISOString(),
    })
    // Today (d0) has BOTH habit completion AND completed focus session -> must count as 1 day, + d2 across rest day d1 => streak 2!
    assert.equal(habitStore.currentStreak, 2)
    assert.equal(gamificationStore.totalXP, 100) // Streak never reduces XP
  } finally {
    Date.now = realDateNow
    await focusStore.cancelSession()
  }
})

test('TASK 07: Legacy Data Preservation, No Startup/Hidden Quest Auto-Rewards & Backup Compatibility', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }

  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())

  await mods.backupService.resetAllApplicationData()

  const learningStore = mods.learningStore.useLearningStore()
  const gamificationStore = mods.gamificationStore.useGamificationStore()

  // Complete 3 topics and add 1 mock test (previously triggered hidden main_master_3 +35 XP & side_mock_log +15 XP!)
  const t1 = await learningStore.addTopic({ subtestId: 'subtest_pu', title: 'T1', status: 'mastered' })
  const t2 = await learningStore.addTopic({ subtestId: 'subtest_ppu', title: 'T2', status: 'mastered' })
  const t3 = await learningStore.addTopic({ subtestId: 'subtest_pbm', title: 'T3', status: 'mastered' })
  assert.equal(t1.xpEarned + t2.xpEarned + t3.xpEarned, 30)

  await learningStore.addMockTestRecord({
    testName: 'TO Legacy Check',
    date: mods.date.getLocalDateString(),
    source: 'Self',
    durationMinutes: 180,
    totalQuestions: 100,
    attemptedQuestions: 100,
    correctAnswers: 70,
    incorrectAnswers: 30,
    overallScore: 680,
    subtestScores: {},
    notes: '',
  })

  // Total XP MUST be strictly 30 (zero hidden side_mock_log +15 XP or main_master_3 +35 XP!)
  assert.equal(gamificationStore.totalXP, 30)
  assert.equal(
    gamificationStore.transactions.some((tx) => tx.eventId === 'quest_main_master_3'),
    false
  )
  assert.equal(
    gamificationStore.transactions.some((tx) => tx.eventId === 'quest_side_mock_log'),
    false
  )

  // 15. Reloading / startup simulation must NOT award any automatic quest rewards
  await mods.backupService.reloadAllStores()
  assert.equal(gamificationStore.totalXP, 30)
  assert.equal(gamificationStore.transactions.length, 3)

  // 14 & 16. Legacy achievements/rewards/historical XP transactions survive backup export & import intact
  const exported = await mods.backupService.generateBackupJson()
  const payload = JSON.parse(exported)
  payload.data.xpTransactions.push({
    id: 'xp_legacy_v2_record',
    eventId: 'legacy_v2_event_1',
    source: 'quest_completed',
    amount: 45,
    date: '2026-01-15',
    createdAt: '2026-01-15T10:00:00.000Z',
  })
  payload.data.achievements[0].unlocked = true
  payload.data.achievements[0].unlockedAt = '2026-01-15T10:00:00.000Z'

  const restored = await mods.backupService.importBackupFromJson(JSON.stringify(payload))
  assert.equal(restored, true)
  assert.equal(gamificationStore.totalXP, 75) // 30 + 45 legacy preserved without mass recalculation!
  assert.equal(gamificationStore.achievements[0].unlocked, true)
  assert.equal(gamificationStore.rewards.length > 0, true)
  assert.equal(gamificationStore.transactions.length, 4) // No auto quest reward added on restore!
})

test('TASK 08: Selective RITME Preferences Reset Preserves Foreign Keys & Clears Dynamic Daily Keys', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }

  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())
  await mods.backupService.reloadAllStores()

  const userStore = mods.userStore.useUserStore()
  const focusStore = mods.focusStore.useFocusStore()
  const prefs = globalThis.__ritmeTestPrefs

  await userStore.updateSettings({
    displayName: 'Selective Reset Tester',
    language: 'en',
    theme: 'light',
  })
  await focusStore.startSession()
  assert.equal(focusStore.timerStatus, 'running')

  // Seed both a dynamic RITME daily key AND an unrelated foreign key in shared Preferences
  await prefs.set({ key: 'ritme_prep_checklist_2026-11-19', value: '["desk_clear"]' })
  await prefs.set({ key: 'foreign_plugin_key', value: 'must-survive-reset' })

  await mods.backupService.resetAllApplicationData()

  // All RITME keys including dynamic checklist & active timer must be removed
  const remaining = await prefs.keys()
  const ritmeRemaining = remaining.keys.filter(
    (k) => k.startsWith('ritme_') && k !== 'ritme_language' && k !== 'ritme_theme'
  )
  assert.equal(ritmeRemaining.length, 0)
  assert.equal((await prefs.get({ key: 'ritme_prep_checklist_2026-11-19' })).value, null)
  assert.equal((await prefs.get({ key: 'ritme_active_timer_state' })).value, null)

  // Foreign non-RITME key MUST survive untouched
  assert.equal((await prefs.get({ key: 'foreign_plugin_key' })).value, 'must-survive-reset')

  // Clean store defaults restored and active timer stopped
  assert.equal(focusStore.timerStatus, 'idle')
  assert.equal(focusStore.activeSession, null)
  assert.equal(userStore.settings.displayName, '')
  assert.equal(userStore.settings.language, 'id')
  assert.equal(userStore.settings.theme, 'dark')

  // Clean up test foreign key
  await prefs.remove({ key: 'foreign_plugin_key' })
})

test('TASK 08: Cross-Storage Import Rollback Recovers Dexie & Preferences on Mid-Import Preferences Write Failure', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }

  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())
  await mods.backupService.resetAllApplicationData()

  const userStore = mods.userStore.useUserStore()
  const learningStore = mods.learningStore.useLearningStore()
  const prefs = globalThis.__ritmeTestPrefs

  // 1. Create incoming valid v2 backup payload first
  await userStore.updateSettings({
    displayName: 'Incoming Profile',
    language: 'id',
    theme: 'dark',
    dailyTargetMinutes: 120,
  })
  await userStore.updateReminderConfig({
    enabled: true,
    morningTime: '09:15',
    eveningTime: '21:45',
  })
  const incomingTopicRes = await learningStore.addTopic({
    subtestId: 'subtest_pm',
    title: 'Incoming Rollback Check Topic',
    status: 'learning',
  })
  const incomingTopicId = incomingTopicRes.topic.id
  const incomingBackupJson = await mods.backupService.generateBackupJson()

  // 2. Establish distinct "Original" state that MUST survive a failed import
  await mods.backupService.resetAllApplicationData()
  await userStore.updateSettings({
    displayName: 'Original Owner',
    language: 'en',
    theme: 'light',
    dailyTargetMinutes: 240,
  })
  await userStore.updateReminderConfig({
    enabled: true,
    morningTime: '06:30',
    eveningTime: '20:00',
  })
  const originalTopicRes = await learningStore.addTopic({
    subtestId: 'subtest_pu',
    title: 'Original Protected Topic',
    status: 'mastered',
  })
  const originalTopicId = originalTopicRes.topic.id

  // 3. Inject one-shot failure when writing ritme_study_reminders (AFTER Dexie + ritme_language/theme already mutated!)
  const origSet = prefs.set
  let injectedOnce = false
  prefs.set = async (opts) => {
    if (!injectedOnce && opts.key === 'ritme_study_reminders') {
      injectedOnce = true
      throw new Error('Simulated Preferences write failure')
    }
    return origSet.call(prefs, opts)
  }

  let importOk = true
  try {
    importOk = await mods.backupService.importBackupFromJson(incomingBackupJson)
  } finally {
    prefs.set = origSet
  }

  // 4. Verify import returned false AND both Dexie and Preferences rolled back 100% cleanly!
  assert.equal(injectedOnce, true)
  assert.equal(importOk, false)
  assert.equal(userStore.settings.displayName, 'Original Owner')
  assert.equal(userStore.settings.language, 'en')
  assert.equal(userStore.settings.theme, 'light')
  assert.equal(userStore.settings.dailyTargetMinutes, 240)
  assert.equal(userStore.reminderConfig.morningTime, '06:30')
  assert.equal((await prefs.get({ key: 'ritme_language' })).value, 'en')
  assert.equal((await prefs.get({ key: 'ritme_theme' })).value, 'light')
  assert.equal(learningStore.topics.some((t) => t.id === originalTopicId), true)
  assert.equal(learningStore.topics.some((t) => t.id === incomingTopicId), false)
})

test('TASK 08: Backup schemaVersion 1 (No preferences, Legacy TopicStatus & Optional Fields) and v2 Compatibility', async () => {
  if (!globalThis.document) {
    globalThis.document = {
      documentElement: {
        classList: { add() {}, remove() {} },
        lang: 'id',
      },
      visibilityState: 'visible',
      addEventListener() {},
    }
  }

  const { createPinia, setActivePinia } = mods.pinia
  setActivePinia(createPinia())
  await mods.backupService.resetAllApplicationData()

  const userStore = mods.userStore.useUserStore()
  const learningStore = mods.learningStore.useLearningStore()
  const gamificationStore = mods.gamificationStore.useGamificationStore()

  // Seed local schedule preference so we confirm v1 import without data.preferences clears stale prefs
  await userStore.setDaySubtestSchedule(1, 'subtest_pm')
  assert.equal(userStore.weeklySchedule[1], 'subtest_pm')

  // Legacy schemaVersion: 1 backup (no data.preferences, no v3 tables, legacy TopicStatus, omitted optional fields)
  const legacyV1Payload = {
    schemaVersion: 1,
    appName: 'RITME',
    exportedAt: '2026-01-10T08:00:00.000Z',
    data: {
      userSettings: [
        {
          id: 'default_user',
          displayName: 'Legacy v1 Learner',
          language: 'id',
          theme: 'dark',
          dailyTargetMinutes: 150,
          weeklyRestDay: 0,
          onboardingCompleted: true,
        },
      ],
      habits: [
        {
          id: 'habit_v1_1',
          name: 'Baca ringkasan 10 menit',
          description: '',
          active: true,
          stackOrder: 0,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      habitCompletions: [],
      studySessions: [],
      subtestCategories: [
        {
          id: 'subtest_pu',
          code: 'PU',
          name: 'Penalaran Umum',
          description: '',
          order: 0,
        },
      ],
      learningTopics: [
        {
          id: 'topic_v1_not_started',
          subtestId: 'subtest_pu',
          title: 'Topik Lama Belum Mulai',
          description: '',
          status: 'not_started',
          practiceCount: 0,
          correctCount: 0,
          incorrectCount: 0,
          notes: '',
          reviewSchedule: null,
          lastStudiedAt: null,
        },
        {
          id: 'topic_v1_practicing',
          subtestId: 'subtest_pu',
          title: 'Topik Lama Sedang Latihan',
          description: '',
          status: 'practicing',
          practiceCount: 2,
          correctCount: 1,
          incorrectCount: 1,
          notes: '',
          reviewSchedule: null,
          lastStudiedAt: '2026-01-09T10:00:00.000Z',
        },
        {
          id: 'topic_v1_proficient',
          subtestId: 'subtest_pu',
          title: 'Topik Lama Mahir',
          description: '',
          status: 'proficient',
          practiceCount: 3,
          correctCount: 3,
          incorrectCount: 0,
          notes: '',
          reviewSchedule: null,
          lastStudiedAt: '2026-01-09T11:00:00.000Z',
        },
        {
          id: 'topic_v1_mastered',
          subtestId: 'subtest_pu',
          title: 'Topik Lama Selesai',
          description: '',
          status: 'mastered',
          practiceCount: 5,
          correctCount: 5,
          incorrectCount: 0,
          notes: '',
          reviewSchedule: null,
          lastStudiedAt: '2026-01-09T12:00:00.000Z',
        },
        {
          id: 'topic_v1_review',
          subtestId: 'subtest_pu',
          title: 'Topik Lama Perlu Review',
          description: '',
          status: 'needs_review',
          practiceCount: 3,
          correctCount: 2,
          incorrectCount: 1,
          notes: '',
          reviewSchedule: null,
          lastStudiedAt: '2026-01-09T13:00:00.000Z',
        },
      ],
      xpTransactions: [
        {
          id: 'xp_v1_1',
          eventId: 'v1_legacy_quest_1',
          source: 'quest_completed',
          amount: 125,
          date: '2026-01-09',
          createdAt: '2026-01-09T12:00:00.000Z',
        },
      ],
      achievements: [],
      personalRewards: [],
      rewardRedemptions: [],
      dailyReflections: [],
      diagnosticBaseline: null,
    },
  }

  const v1Raw = JSON.stringify(legacyV1Payload)
  assert.ok(mods.backupSchema.validateBackupPayload(v1Raw) !== null)
  const v1Ok = await mods.backupService.importBackupFromJson(v1Raw)
  assert.equal(v1Ok, true)

  assert.equal(userStore.settings.displayName, 'Legacy v1 Learner')
  assert.equal(userStore.weeklySchedule[1], 'subtest_pu') // Stale schedule cleared back to default on v1 import
  assert.equal(gamificationStore.totalXP, 125)
  assert.equal(gamificationStore.currentLevel, 2)

  // Verify legacy TopicStatus mapping (proficient + mastered => completed = 2)
  assert.equal(
    mods.tracker.isTopicCompletedStatus(
      learningStore.topics.find((t) => t.id === 'topic_v1_proficient').status
    ),
    true
  )
  assert.equal(
    mods.tracker.isTopicCompletedStatus(
      learningStore.topics.find((t) => t.id === 'topic_v1_mastered').status
    ),
    true
  )
  assert.equal(
    mods.tracker.mapTopicStatusToUi('practicing'),
    'learning'
  )
  assert.equal(
    mods.tracker.mapTopicStatusToUi('needs_review'),
    'learning'
  )

  // Re-export upgrades cleanly to schemaVersion 2 with all 18 tables and re-imports cleanly
  const upgradedV2Json = await mods.backupService.generateBackupJson()
  const upgradedParsed = mods.backupSchema.validateBackupPayload(upgradedV2Json)
  assert.equal(upgradedParsed?.schemaVersion, 2)
  assert.equal(await mods.backupService.importBackupFromJson(upgradedV2Json), true)
  assert.equal(gamificationStore.totalXP, 125)
})

test('TASK 08: Route Consistency, Onboarding Cleanup & Android Version Alignment (v3.1.0)', () => {
  const routerSrc = fs.readFileSync(path.join(repoRoot, 'src/router/index.ts'), 'utf8')
  const onboardingSrc = fs.readFileSync(
    path.join(repoRoot, 'src/views/onboarding/OnboardingPage.vue'),
    'utf8'
  )
  const pkgJson = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
  )
  const gradleSrc = fs.readFileSync(
    path.join(repoRoot, 'android/app/build.gradle'),
    'utf8'
  )
  const settingsSrc = fs.readFileSync(
    path.join(repoRoot, 'src/views/SettingsPage.vue'),
    'utf8'
  )
  const manifestSrc = fs.readFileSync(
    path.join(repoRoot, 'android/app/src/main/AndroidManifest.xml'),
    'utf8'
  )

  // Legacy RPG route safely redirected & secondary habits route preserved
  assert.match(routerSrc, /path:\s*['"]\/rewards['"][\s\S]*?redirect:\s*['"]\/tabs\/progress['"]/)
  assert.match(routerSrc, /path:\s*['"]habits['"][\s\S]*?redirect:\s*['"]\/habits['"]/)
  assert.match(routerSrc, /path:\s*['"]\/onboarding['"]/)

  // Onboarding is completely free of RPG realms & purple Aurora leftovers
  assert.equal(onboardingSrc.includes('RealmEmblem'), false)
  assert.equal(onboardingSrc.includes('ADVENTURE_REALMS'), false)
  assert.equal(onboardingSrc.includes('priorityRealm'), false)
  assert.equal(onboardingSrc.includes('rgba(139, 124, 255'), false)

  // Version consistency across package.json, Android Gradle, and Settings About RITME
  assert.equal(pkgJson.version, '3.1.0')
  assert.match(gradleSrc, /applicationId\s+"com\.ritme\.app"/)
  assert.match(gradleSrc, /versionName\s+"3\.1\.0"/)
  assert.match(gradleSrc, /versionCode\s+\d+/)
  assert.equal(settingsSrc.includes('v3.1.0'), true)
  assert.equal(manifestSrc.includes('android.permission.POST_NOTIFICATIONS'), true)
})
