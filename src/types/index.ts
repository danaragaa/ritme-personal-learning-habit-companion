export type AppLanguage = 'id' | 'en'
export type AppTheme = 'dark' | 'light'
export type EnergyMode = 'green' | 'yellow' | 'red'

export type TopicStatus =
  | 'not_started'
  | 'learning'
  | 'practicing'
  | 'needs_review'
  | 'understood'
  | 'proficient'
  | 'mastered'

export type SessionStatus = 'running' | 'paused' | 'completed' | 'cancelled'
export type FocusMode = 'free' | 'pomodoro'
export type PomodoroPhase = 'focus' | 'short_break' | 'long_break'

export type XPSource =
  | 'first_focus_session'
  | 'focus_block_20m'
  | 'daily_learning_task'
  | 'daily_reflection'
  | 'concept_mastered'
  | 'reward_redemption'
  | 'quest_completed'
  | 'boss_challenge'
  | 'practice_completed'
  | 'review_completed'

export interface UserSettings {
  id: string
  displayName: string
  language: AppLanguage
  theme: AppTheme
  dailyTargetMinutes: number
  idealTargetMinutes: number
  maximumTargetMinutes: number
  studyTrigger: string
  primaryLocation: string
  alternativeLocation: string
  weeklyRestDay: number // 0 = Minggu/Sunday ... 6 = Sabtu/Saturday
  onboardingCompleted: boolean
  currentEnergyMode: EnergyMode
  // PRD 3.0 Adaptive Notifications, Audio & Haptic Feedback + Mock Target + Phase 6
  targetMockScore?: number
  prioritySubtestId?: string
  selectedTitleId?: string
  selectedFrameId?: string
  snoozeMinutes?: number
  weeklyFocusTargetMinutes?: number
  weeklyPracticeTargetQuestions?: number
  weeklyStreakTargetDays?: number
  notificationsEnabled?: boolean
  notifyStudyReminder?: boolean
  notifyFocusCompletion?: boolean
  notifyBreakReminder?: boolean
  notifyQuestReminder?: boolean
  notifyReviewReminder?: boolean
  notifyReflectionReminder?: boolean
  notifyStreakProtection?: boolean
  notifyAchievementUnlock?: boolean
  notifyLevelUp?: boolean
  notifyBossReady?: boolean
  quietHoursEnabled?: boolean
  quietHoursStart?: string
  quietHoursEnd?: string
  soundEffectsEnabled?: boolean
  timerAlarmEnabled?: boolean
  soundVolume?: number
  alarmTone?: 'chime' | 'bell' | 'digital'
  vibrationEnabled?: boolean
  silentMode?: boolean
}

export interface Habit {
  id: string
  name: string
  description: string
  active: boolean
  stackOrder: number
  createdAt: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  date: string // Local YYYY-MM-DD
  completedAt: string
}

export interface StudySession {
  id: string
  startTime: string
  endTime: string | null
  durationMinutes: number
  pausedDuration: number // in seconds
  subjectId: string
  topicId: string
  notes: string
  location: string
  status: SessionStatus
}

export interface SubtestCategory {
  id: string
  code: string
  nameId: string
  nameEn: string
  order: number
}

export interface LearningTopic {
  id: string
  subtestId: string
  title: string
  description: string
  status: TopicStatus
  sourceName?: string
  sourceUrl?: string
  targetDurationMinutes?: number | null
  completedAt?: string | null
  practiceCount: number
  correctCount: number
  incorrectCount: number
  notes: string
  lastStudiedAt: string | null
  reviewSchedule: string | null
  reviewIntervalDays?: number
  chapterId?: string
  lastReviewedAt?: string | null
  reviewCount?: number
  lastReviewAccuracy?: number | null
  masteryReasonKey?: string
  masteryReasonParams?: Record<string, string | number>
  statusUpdatedAt?: string | null
}

export interface XPTransaction {
  id: string
  eventId: string // Ensures idempotency (unique per reward event)
  source: XPSource
  amount: number
  date: string // Local YYYY-MM-DD for daily cap calculation
  createdAt: string
}

export interface DailyQuestItem {
  id: string
  eventId: string
  source: XPSource
  titleKey: string
  titleParams?: Record<string, string | number>
  descKey: string
  xpReward: number
  completed: boolean
  currentProgress?: number
  targetProgress?: number
  progressUnit?: 'minutes' | 'questions' | 'days' | 'steps' | 'topics'
}

export interface LevelThreshold {
  level: number
  minXP: number
  maxXP: number | null
  titleId: string
  titleEn: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  unlocked: boolean
  unlockedAt: string | null
}

export interface PersonalReward {
  id: string
  title: string
  description: string
  xpCost: number
  active: boolean
  createdAt: string
}

export interface RewardRedemption {
  id: string
  rewardId: string
  title: string
  xpCost: number
  redeemedAt: string
}

export interface DailyReflection {
  id: string
  date: string // Local YYYY-MM-DD
  energyMode: EnergyMode
  achievement: string
  challenge: string
  improvement: string
  nextDayPlan: string
}

/* ==========================================================================
   RITME 3.0 — Your Learning Adventure Entities (PRD 3.0 Sections 6–16)
   ========================================================================== */

export type RealmStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'
  | 'mastered'

export type ChapterStatus =
  | 'locked'
  | 'available'
  | 'learning'
  | 'challenge_ready'
  | 'completed'
  | 'mastered'

export interface AdventureRealmInfo {
  subtestId: string
  code: string
  realmNameId: string
  realmNameEn: string
  themeId: string
  themeEn: string
  icon: string
}

export interface AdventureChapter {
  id: string
  subtestId: string
  order: number
  titleId: string
  titleEn: string
  objectivesId: string[]
  objectivesEn: string[]
  materialSummaryId: string
  materialSummaryEn: string
  exampleId: string
  exampleEn: string
  estimatedMinutes: number
  status: ChapterStatus
}

export interface PracticeQuestion {
  id: string
  subtestId: string
  chapterId: string
  topicId: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionIdText: string
  questionEnText: string
  optionsId: string[]
  optionsEn: string[]
  correctIndex: number
  explanationId: string
  explanationEn: string
}

export interface QuestionAttempt {
  id: string
  questionId: string
  subtestId: string
  chapterId: string
  topicId: string
  selectedIndex: number
  isCorrect: boolean
  attemptedAt: string
}

export type MistakeErrorCategory =
  | 'concept_not_understood'
  | 'misread_question'
  | 'calculation_error'
  | 'logic_error'
  | 'careless_mistake'
  | 'time_pressure'
  | 'unknown'

export interface MistakeNote {
  id: string
  questionId: string
  subtestId: string
  topicId: string
  questionPreview: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  errorCategory: MistakeErrorCategory
  personalNote: string
  resolved: boolean
  dateRecorded: string
  nextReviewDate: string
}

export type QuestCategoryType = 'daily' | 'weekly' | 'main' | 'side' | 'custom'

export interface CustomQuestRecord {
  id: string
  title: string
  description: string
  questType: QuestCategoryType
  targetCount: number
  currentCount: number
  xpReward: number
  completed: boolean
  createdAt: string
  completedEventId: string
}

export interface BossChallengeAttempt {
  id: string
  bossId: string
  bossType: 'mini_boss' | 'chapter_boss' | 'subtest_boss' | 'final_challenge'
  subtestId: string
  chapterId: string
  totalQuestions: number
  correctCount: number
  incorrectCount?: number
  accuracyPercent: number
  passingThreshold?: number
  passed: boolean
  timeSpentSeconds: number
  weakTopicIds?: string[]
  xpAwarded?: number
  attemptedAt: string
}

export interface MockTestRecord {
  id: string
  testName: string
  date: string
  source: string
  durationMinutes: number
  totalQuestions: number
  attemptedQuestions: number
  correctAnswers: number
  incorrectAnswers: number
  overallScore: number
  subtestScores: Record<string, number>
  notes: string
}
