import { createI18n } from 'vue-i18n'
import id from './id.json'
import en from './en.json'
import type { AppLanguage } from '@/types'

export type MessageSchema = typeof id

function getInitialLocale(): AppLanguage {
  try {
    if (typeof localStorage !== 'undefined') {
      const cached =
        localStorage.getItem('ritme_lang_cache') ||
        localStorage.getItem('CapacitorStorage.ritme_language')
      if (cached === 'en' || cached === 'id') return cached
    }
  } catch {
    // Fallback to default locale in non-browser/test environments
  }
  return 'id'
}

export const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    id,
    en,
  },
})

export function setI18nLocale(lang: AppLanguage): void {
  i18n.global.locale.value = lang
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.lang = lang
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ritme_lang_cache', lang)
    }
  } catch {
    // Ignore storage unavailability
  }
}
