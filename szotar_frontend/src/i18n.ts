import { createI18n } from 'vue-i18n'
import hu from './locales/hu.json'
import en from './locales/en.json'

export type MessageSchema = typeof hu

declare module 'vue-i18n' {
  export interface DefineLocaleMessage extends MessageSchema {}
}

export const supportedLocales = [`hu`, `en`] as const
export type SupportedLocale = typeof supportedLocales[number]

const LOCALE_STORAGE_KEY = `locale`

const isSupportedLocale = (l: unknown): l is SupportedLocale =>
  supportedLocales.includes(l as SupportedLocale)

const getInitialLocale = (): SupportedLocale => {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (isSupportedLocale(saved)) return saved
  const browserLang = navigator.language?.split(`-`)[0]
  if (isSupportedLocale(browserLang)) return browserLang
  return `hu`
}

const initialLocale = getInitialLocale()
document.documentElement.lang = initialLocale

export const i18n = createI18n<[MessageSchema], SupportedLocale, false>({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: `hu`,
  messages: { hu, en },
})

export const setLocale = (l: SupportedLocale) => {
  i18n.global.locale.value = l
  localStorage.setItem(LOCALE_STORAGE_KEY, l)
  document.documentElement.lang = l
}
