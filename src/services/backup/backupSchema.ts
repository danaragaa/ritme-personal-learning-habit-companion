import type {
  Achievement,
  AdventureChapter,
  BossChallengeAttempt,
  CustomQuestRecord,
  DailyReflection,
  Habit,
  HabitCompletion,
  LearningTopic,
  MistakeNote,
  MockTestRecord,
  PersonalReward,
  PracticeQuestion,
  QuestionAttempt,
  RewardRedemption,
  StudySession,
  SubtestCategory,
  UserSettings,
  XPTransaction,
} from '@/types'

export interface InformalDiagnosticBaselineSummary {
  completedAt: string
  scorePercent: number
  correctCount: number
  totalCount: number
}

export interface RitmeBackupPreferences {
  weeklySchedule?: Record<number, string>
  reminderConfig?: {
    enabled: boolean
    morningTime: string
    eveningTime: string
  }
  pomodoroConfig?: unknown
  levelThresholds?: unknown
}

export interface RitmeBackupPayload<TBaseline = InformalDiagnosticBaselineSummary | null> {
  schemaVersion: 1 | 2
  appName: 'RITME'
  exportedAt: string
  data: {
    userSettings: UserSettings[]
    habits: Habit[]
    habitCompletions: HabitCompletion[]
    studySessions: StudySession[]
    subtestCategories: SubtestCategory[]
    learningTopics: LearningTopic[]
    xpTransactions: XPTransaction[]
    achievements: Achievement[]
    personalRewards: PersonalReward[]
    rewardRedemptions: RewardRedemption[]
    dailyReflections: DailyReflection[]
    diagnosticBaseline: TBaseline
    chapters?: AdventureChapter[]
    questions?: PracticeQuestion[]
    questionAttempts?: QuestionAttempt[]
    mistakeNotes?: MistakeNote[]
    customQuests?: CustomQuestRecord[]
    bossAttempts?: BossChallengeAttempt[]
    mockTests?: MockTestRecord[]
    preferences?: RitmeBackupPreferences
  }
}

const OPTIONAL_ARRAY_TABLES = [
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
] as const

/**
 * Pure schema validator supporting both RITME v2.0 (schemaVersion: 1)
 * and RITME v3.0+ (schemaVersion: 2) backup JSON exports.
 */
export function validateBackupPayload(
  rawJson: string
): RitmeBackupPayload<unknown> | null {
  try {
    const parsed = JSON.parse(rawJson.trim()) as Partial<
      RitmeBackupPayload<unknown>
    >
    if (
      !parsed ||
      parsed.appName !== 'RITME' ||
      (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) ||
      !parsed.data ||
      typeof parsed.data !== 'object' ||
      !Array.isArray(parsed.data.userSettings) ||
      !Array.isArray(parsed.data.habits)
    ) {
      return null
    }

    const recordData = parsed.data as Record<string, unknown>
    for (const key of OPTIONAL_ARRAY_TABLES) {
      if (recordData[key] !== undefined && !Array.isArray(recordData[key])) {
        return null
      }
    }

    return parsed as RitmeBackupPayload<unknown>
  } catch {
    return null
  }
}
