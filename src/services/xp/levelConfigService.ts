import { Preferences } from '@capacitor/preferences'
import type { LevelThreshold } from '@/types'

const LEVEL_THRESHOLDS_PREF_KEY = 'ritme_level_thresholds'

export const DEFAULT_LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, minXP: 0, maxXP: 99, titleId: 'Pemula Ritme', titleEn: 'Rhythm Novice' },
  { level: 2, minXP: 100, maxXP: 249, titleId: 'Penjaga Konsistensi', titleEn: 'Consistency Keeper' },
  { level: 3, minXP: 250, maxXP: 499, titleId: 'Pelajar Fokus', titleEn: 'Focused Learner' },
  { level: 4, minXP: 500, maxXP: 999, titleId: 'Arsitek Kebiasaan', titleEn: 'Habit Architect' },
  { level: 5, minXP: 1000, maxXP: 1499, titleId: 'Master Ritme', titleEn: 'Rhythm Master' },
  { level: 6, minXP: 1500, maxXP: 2199, titleId: 'Penjelajah Konsep', titleEn: 'Concept Explorer' },
  { level: 7, minXP: 2200, maxXP: 2999, titleId: 'Strategis UTBK', titleEn: 'UTBK Strategist' },
  { level: 8, minXP: 3000, maxXP: 3999, titleId: 'Cendekia Tangguh', titleEn: 'Resilient Scholar' },
  { level: 9, minXP: 4000, maxXP: 5499, titleId: 'Maestro Fokus', titleEn: 'Focus Maestro' },
  { level: 10, minXP: 5500, maxXP: null, titleId: 'Legenda SNBT', titleEn: 'SNBT Legend' },
]

export function normalizeLevelThresholds(
  items: LevelThreshold[]
): LevelThreshold[] {
  const sorted = items
    .slice()
    .sort((a, b) => a.level - b.level)
    .map((item, idx) => ({
      ...item,
      level: idx + 1,
      minXP: idx === 0 ? 0 : Math.max(10, Math.round(Number(item.minXP) || 0)),
    }))

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].minXP <= sorted[i - 1].minXP) {
      sorted[i].minXP = sorted[i - 1].minXP + 50
    }
    sorted[i - 1].maxXP = sorted[i].minXP - 1
  }
  if (sorted.length > 0) {
    sorted[sorted.length - 1].maxXP = null
  }
  return sorted
}

export async function loadCustomLevelThresholds(): Promise<LevelThreshold[]> {
  try {
    const res = await Preferences.get({ key: LEVEL_THRESHOLDS_PREF_KEY })
    if (!res.value) {
      return DEFAULT_LEVEL_THRESHOLDS.map((l) => ({ ...l }))
    }
    const parsed = JSON.parse(res.value) as LevelThreshold[]
    if (Array.isArray(parsed) && parsed.length >= 5) {
      return normalizeLevelThresholds(parsed)
    }
    return DEFAULT_LEVEL_THRESHOLDS.map((l) => ({ ...l }))
  } catch {
    return DEFAULT_LEVEL_THRESHOLDS.map((l) => ({ ...l }))
  }
}

export async function saveCustomLevelThresholds(
  thresholds: LevelThreshold[]
): Promise<LevelThreshold[]> {
  const normalized = normalizeLevelThresholds(thresholds)
  await Preferences.set({
    key: LEVEL_THRESHOLDS_PREF_KEY,
    value: JSON.stringify(normalized),
  })
  return normalized
}

export async function resetCustomLevelThresholds(): Promise<LevelThreshold[]> {
  await Preferences.remove({ key: LEVEL_THRESHOLDS_PREF_KEY })
  return DEFAULT_LEVEL_THRESHOLDS.map((l) => ({ ...l }))
}
