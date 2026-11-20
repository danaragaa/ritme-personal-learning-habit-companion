import { Capacitor } from '@capacitor/core'
import type { LearningTopic, TopicStatus } from '@/types'

export type LearningUiStatus = 'not_started' | 'learning' | 'completed'

export const SEED_TOPIC_TITLES: Record<string, string> = {
  topic_pu_1: 'Penalaran Induktif & Deduktif',
  topic_pu_2: 'Penalaran Kuantitatif & Pola Bilangan',
  topic_ppu_1: 'Makna Kata, Sinonim & Kepaduan Paragraf',
  topic_pbm_1: 'Ejaan (EYD V), Tanda Baca & Kalimat Efektif',
  topic_pk_1: 'Aljabar & Aritmetika Dasar',
  topic_pk_2: 'Geometri, Fungsi & Peluang Dasar',
  topic_lbi_1: 'Ide Pokok & Simpulan Bacaan',
  topic_lbe_1: 'Main Idea, Inference & Vocabulary in Context',
  topic_pm_1: 'Pemodelan Matematika Kontekstual',
}

/**
 * Compatibility mapping between 7 stored legacy TopicStatus values
 * and the 3 simplified UI statuses (v3.1.0 Personal Learning Tracker).
 */
export function mapTopicStatusToUi(status: TopicStatus): LearningUiStatus {
  if (status === 'not_started') return 'not_started'
  if (
    status === 'understood' ||
    status === 'proficient' ||
    status === 'mastered'
  ) {
    return 'completed'
  }
  return 'learning'
}

/**
 * Maps a UI status selection to the canonical stored TopicStatus
 * compatible with existing stores, Progress breakdown, and XP rules.
 */
export function mapUiStatusToStorage(uiStatus: LearningUiStatus): TopicStatus {
  if (uiStatus === 'completed') return 'mastered'
  if (uiStatus === 'learning') return 'learning'
  return 'not_started'
}

export function isTopicCompletedStatus(status: TopicStatus): boolean {
  return mapTopicStatusToUi(status) === 'completed'
}

/**
 * Logical topic ordering:
 * 1. Currently Learning (learning / practicing / needs_review)
 * 2. Not Started (not_started)
 * 3. Completed (understood / proficient / mastered)
 */
export function sortLearningTopicsForTracker(
  list: LearningTopic[]
): LearningTopic[] {
  const rankMap: Record<LearningUiStatus, number> = {
    learning: 0,
    not_started: 1,
    completed: 2,
  }
  return list.slice().sort((a, b) => {
    const rankDiff =
      rankMap[mapTopicStatusToUi(a.status)] -
      rankMap[mapTopicStatusToUi(b.status)]
    if (rankDiff !== 0) return rankDiff
    const timeA = a.statusUpdatedAt || a.lastStudiedAt || ''
    const timeB = b.statusUpdatedAt || b.lastStudiedAt || ''
    return timeB.localeCompare(timeA)
  })
}

export interface UrlValidationResult {
  valid: boolean
  normalizedUrl: string
  errorKey?:
    | 'learning.tracker.urlInvalidProtocol'
    | 'learning.tracker.urlInvalidFormat'
}

const CONTROL_OR_WHITESPACE_PATTERN = /[\u0000-\u001F\u007F\s]/

/**
 * Strict HTTP/HTTPS external URL validator.
 * Rejects javascript:, data:, file:, vbscript:, relative URLs, and malformed hosts.
 */
export function validateExternalUrl(rawUrl: string): UrlValidationResult {
  const trimmed = rawUrl.trim()
  if (!trimmed) {
    return { valid: true, normalizedUrl: '' }
  }
  if (CONTROL_OR_WHITESPACE_PATTERN.test(trimmed)) {
    return {
      valid: false,
      normalizedUrl: '',
      errorKey: 'learning.tracker.urlInvalidFormat',
    }
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return {
      valid: false,
      normalizedUrl: '',
      errorKey: 'learning.tracker.urlInvalidFormat',
    }
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return {
      valid: false,
      normalizedUrl: '',
      errorKey: 'learning.tracker.urlInvalidProtocol',
    }
  }

  if (!parsed.hostname || parsed.username || parsed.password) {
    return {
      valid: false,
      normalizedUrl: '',
      errorKey: 'learning.tracker.urlInvalidFormat',
    }
  }

  return {
    valid: true,
    normalizedUrl: parsed.toString(),
  }
}

export interface OpenExternalUrlResult {
  ok: boolean
  normalizedUrl?: string
  errorKey?:
    | 'learning.tracker.urlInvalidProtocol'
    | 'learning.tracker.urlInvalidFormat'
    | 'learning.tracker.urlOpenFailed'
}

interface CapacitorBrowserPluginLike {
  open?: (options: { url: string }) => Promise<void>
}

interface WindowWithCapacitor extends Window {
  Capacitor?: {
    Plugins?: {
      Browser?: CapacitorBrowserPluginLike
    }
  }
}

/**
 * Safely opens an external HTTP/HTTPS learning link across Browser and Capacitor Android.
 * Never evaluates non-HTTP(S) schemes and provides explicit failure status if blocked.
 */
export async function openExternalLearningUrl(
  rawUrl: string
): Promise<OpenExternalUrlResult> {
  const check = validateExternalUrl(rawUrl)
  if (!check.valid || !check.normalizedUrl) {
    return {
      ok: false,
      errorKey: check.errorKey || 'learning.tracker.urlInvalidFormat',
    }
  }

  const normalizedUrl = check.normalizedUrl

  try {
    if (typeof window !== 'undefined') {
      const capWin = window as WindowWithCapacitor
      const browserPlugin = capWin.Capacitor?.Plugins?.Browser
      if (Capacitor.isNativePlatform() && typeof browserPlugin?.open === 'function') {
        await browserPlugin.open({ url: normalizedUrl })
        return { ok: true, normalizedUrl }
      }

      const opened = window.open(normalizedUrl, '_blank')
      if (opened) {
        try {
          opened.opener = null
        } catch {
          // Cross-origin window proxy may restrict setter
        }
        return { ok: true, normalizedUrl }
      }

      // Fallback for mobile WebViews or strict environments using anchor target="_blank"
      if (typeof document !== 'undefined') {
        const anchor = document.createElement('a')
        anchor.href = normalizedUrl
        anchor.target = '_blank'
        anchor.rel = 'noopener noreferrer external'
        anchor.style.display = 'none'
        document.body.appendChild(anchor)
        anchor.click()
        document.body.removeChild(anchor)
        return { ok: true, normalizedUrl }
      }
    }
  } catch {
    return {
      ok: false,
      normalizedUrl,
      errorKey: 'learning.tracker.urlOpenFailed',
    }
  }

  return {
    ok: false,
    normalizedUrl,
    errorKey: 'learning.tracker.urlOpenFailed',
  }
}
