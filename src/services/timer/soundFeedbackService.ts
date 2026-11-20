import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { useUserStore } from '@/stores/userStore'

let sharedAudioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AudioCtx) return null
    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioCtx()
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume()
    }
    return sharedAudioCtx
  } catch {
    return null
  }
}

function canUseWebVibrate(): boolean {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) {
    return false
  }
  const navWithActivation = navigator as Navigator & {
    userActivation?: { hasBeenActive?: boolean }
  }
  if (
    navWithActivation.userActivation &&
    !navWithActivation.userActivation.hasBeenActive
  ) {
    return false
  }
  return true
}

async function triggerHapticImpact(style: ImpactStyle): Promise<void> {
  const userStore = useUserStore()
  if (userStore.settings.vibrationEnabled === false) return
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style })
    } else if (canUseWebVibrate()) {
      navigator.vibrate(style === ImpactStyle.Heavy ? 40 : 18)
    }
  } catch {
    // Haptics not supported on this device/browser
  }
}

async function triggerHapticNotification(
  type: NotificationType
): Promise<void> {
  const userStore = useUserStore()
  if (userStore.settings.vibrationEnabled === false) return
  try {
    if (Capacitor.isNativePlatform()) {
      await Haptics.notification({ type })
    } else if (canUseWebVibrate()) {
      navigator.vibrate(type === NotificationType.Success ? [25, 40, 35] : 50)
    }
  } catch {
    // Haptics not supported on this device/browser
  }
}

function playNotes(
  notes: Array<{
    freq: number
    durationMs: number
    delayMs: number
    type?: OscillatorType
  }>,
  volumePercent: number,
  bypassSilent = false
): void {
  const userStore = useUserStore()
  if (!bypassSilent && userStore.settings.silentMode) return

  const ctx = getAudioContext()
  if (!ctx) return

  const clampedVol = Math.max(0, Math.min(100, volumePercent)) / 100
  if (clampedVol <= 0.01) return

  const now = ctx.currentTime
  for (const note of notes) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = note.type || 'sine'
    osc.frequency.setValueAtTime(note.freq, now + note.delayMs / 1000)

    const startSec = now + note.delayMs / 1000
    const endSec = startSec + note.durationMs / 1000
    const peakGain = 0.18 * clampedVol

    gain.gain.setValueAtTime(0.0001, startSec)
    gain.gain.exponentialRampToValueAtTime(peakGain, startSec + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, endSec)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startSec)
    osc.stop(endSec + 0.02)
  }
}

function getAlarmNotesForTone(
  tone: 'chime' | 'bell' | 'digital' | undefined
): Array<{
  freq: number
  durationMs: number
  delayMs: number
  type?: OscillatorType
}> {
  if (tone === 'bell') {
    return [
      { freq: 659.25, durationMs: 220, delayMs: 0, type: 'triangle' },
      { freq: 880, durationMs: 280, delayMs: 240, type: 'triangle' },
      { freq: 1318.5, durationMs: 420, delayMs: 520, type: 'sine' },
    ]
  }
  if (tone === 'digital') {
    return [
      { freq: 987.77, durationMs: 90, delayMs: 0, type: 'square' },
      { freq: 987.77, durationMs: 90, delayMs: 140, type: 'square' },
      { freq: 1318.5, durationMs: 180, delayMs: 280, type: 'square' },
      { freq: 1318.5, durationMs: 220, delayMs: 540, type: 'square' },
    ]
  }
  return [
    { freq: 880, durationMs: 160, delayMs: 0, type: 'sine' },
    { freq: 987.77, durationMs: 160, delayMs: 180, type: 'sine' },
    { freq: 1174.66, durationMs: 260, delayMs: 360, type: 'sine' },
    { freq: 880, durationMs: 160, delayMs: 700, type: 'sine' },
    { freq: 1174.66, durationMs: 320, delayMs: 880, type: 'sine' },
  ]
}

export function triggerActionHaptic(
  strength: 'light' | 'medium' = 'light'
): void {
  void triggerHapticImpact(
    strength === 'medium' ? ImpactStyle.Medium : ImpactStyle.Light
  )
}

export function playTimerStartTone(): void {
  const userStore = useUserStore()
  void triggerHapticImpact(ImpactStyle.Light)
  if (userStore.settings.soundEffectsEnabled === false) return
  const vol = userStore.settings.soundVolume ?? 70
  playNotes(
    [
      { freq: 523.25, durationMs: 110, delayMs: 0, type: 'sine' },
      { freq: 659.25, durationMs: 160, delayMs: 110, type: 'sine' },
    ],
    vol
  )
}

export function playAnswerFeedback(isCorrect: boolean): void {
  const userStore = useUserStore()
  void triggerHapticNotification(
    isCorrect ? NotificationType.Success : NotificationType.Warning
  )
  if (userStore.settings.soundEffectsEnabled === false) return
  const vol = userStore.settings.soundVolume ?? 70
  if (isCorrect) {
    playNotes(
      [
        { freq: 659.25, durationMs: 85, delayMs: 0, type: 'sine' },
        { freq: 880, durationMs: 140, delayMs: 85, type: 'sine' },
      ],
      vol
    )
  } else {
    playNotes(
      [
        { freq: 329.63, durationMs: 110, delayMs: 0, type: 'triangle' },
        { freq: 261.63, durationMs: 150, delayMs: 115, type: 'triangle' },
      ],
      vol
    )
  }
}

export function playQuestCompleteChime(): void {
  const userStore = useUserStore()
  void triggerHapticNotification(NotificationType.Success)
  if (userStore.settings.soundEffectsEnabled === false) return
  const vol = userStore.settings.soundVolume ?? 70
  playNotes(
    [
      { freq: 587.33, durationMs: 100, delayMs: 0, type: 'triangle' },
      { freq: 783.99, durationMs: 120, delayMs: 100, type: 'triangle' },
      { freq: 1046.5, durationMs: 220, delayMs: 210, type: 'triangle' },
    ],
    vol
  )
}

export function playBossPassFanfare(): void {
  const userStore = useUserStore()
  void triggerHapticNotification(NotificationType.Success)
  if (userStore.settings.soundEffectsEnabled === false) return
  const vol = userStore.settings.soundVolume ?? 70
  playNotes(
    [
      { freq: 523.25, durationMs: 110, delayMs: 0, type: 'triangle' },
      { freq: 659.25, durationMs: 110, delayMs: 110, type: 'triangle' },
      { freq: 783.99, durationMs: 110, delayMs: 220, type: 'triangle' },
      { freq: 1046.5, durationMs: 320, delayMs: 330, type: 'triangle' },
    ],
    vol
  )
}

export function playTimerCompleteAlarm(): void {
  const userStore = useUserStore()
  void triggerHapticNotification(NotificationType.Success)
  if (userStore.settings.timerAlarmEnabled === false) return
  const vol = userStore.settings.soundVolume ?? 70
  playNotes(getAlarmNotesForTone(userStore.settings.alarmTone), vol)
}

export function playPreviewSound(
  kind: 'effect' | 'alarm',
  volumeOverride?: number
): void {
  const userStore = useUserStore()
  const vol = volumeOverride ?? userStore.settings.soundVolume ?? 70
  void triggerHapticImpact(ImpactStyle.Light)
  if (kind === 'alarm') {
    playNotes(getAlarmNotesForTone(userStore.settings.alarmTone), vol, true)
  } else {
    playNotes(
      [
        { freq: 587.33, durationMs: 100, delayMs: 0, type: 'triangle' },
        { freq: 880, durationMs: 180, delayMs: 105, type: 'triangle' },
      ],
      vol,
      true
    )
  }
}
