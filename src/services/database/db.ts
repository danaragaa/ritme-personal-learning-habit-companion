import Dexie, { type Table } from 'dexie'
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

export class RitmeDatabase extends Dexie {
  userSettings!: Table<UserSettings, string>
  habits!: Table<Habit, string>
  habitCompletions!: Table<HabitCompletion, string>
  studySessions!: Table<StudySession, string>
  subtestCategories!: Table<SubtestCategory, string>
  learningTopics!: Table<LearningTopic, string>
  xpTransactions!: Table<XPTransaction, string>
  achievements!: Table<Achievement, string>
  personalRewards!: Table<PersonalReward, string>
  rewardRedemptions!: Table<RewardRedemption, string>
  dailyReflections!: Table<DailyReflection, string>
  // PRD 3.0 Tables
  chapters!: Table<AdventureChapter, string>
  questions!: Table<PracticeQuestion, string>
  questionAttempts!: Table<QuestionAttempt, string>
  mistakeNotes!: Table<MistakeNote, string>
  customQuests!: Table<CustomQuestRecord, string>
  bossAttempts!: Table<BossChallengeAttempt, string>
  mockTests!: Table<MockTestRecord, string>

  constructor() {
    super('RitmeOfflineDB')

    this.version(1).stores({
      userSettings: 'id',
      habits: 'id, active, stackOrder',
      habitCompletions: 'id, habitId, date, [habitId+date]',
      studySessions: 'id, startTime, subjectId, topicId, status',
      subtestCategories: 'id, code, order',
      learningTopics: 'id, subtestId, status',
      xpTransactions: 'id, &eventId, source, date',
      achievements: 'id, unlocked',
      personalRewards: 'id, active',
      rewardRedemptions: 'id, rewardId, redeemedAt',
      dailyReflections: 'id, &date, energyMode',
    })

    // PRD 3.0 Safe Non-Destructive Schema Upgrade (Section 21.2)
    this.version(2).stores({
      userSettings: 'id',
      habits: 'id, active, stackOrder',
      habitCompletions: 'id, habitId, date, [habitId+date]',
      studySessions: 'id, startTime, subjectId, topicId, status',
      subtestCategories: 'id, code, order',
      learningTopics: 'id, subtestId, status, chapterId',
      xpTransactions: 'id, &eventId, source, date',
      achievements: 'id, unlocked',
      personalRewards: 'id, active',
      rewardRedemptions: 'id, rewardId, redeemedAt',
      dailyReflections: 'id, &date, energyMode',
      chapters: 'id, subtestId, order, status',
      questions: 'id, subtestId, chapterId, topicId, difficulty',
      questionAttempts: 'id, questionId, subtestId, chapterId, topicId, attemptedAt',
      mistakeNotes: 'id, questionId, subtestId, topicId, errorCategory, resolved, dateRecorded',
      customQuests: 'id, questType, completed, createdAt',
      bossAttempts: 'id, bossId, bossType, subtestId, chapterId, passed, attemptedAt',
      mockTests: 'id, date, overallScore',
    })
  }
}

export const db = new RitmeDatabase()
