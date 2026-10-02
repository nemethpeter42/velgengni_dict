<template>
  <button
    id="locale-toggle"
    type="button"
    :title="$t('nav.switchLanguage')"
    :aria-label="$t('nav.switchLanguage')"
    @click="switchToNextLocale()"
    class="
      ml-2 border-4 rounded-lg text-sm px-1.5 py-1.5 font-bold uppercase
      text-gray-500 border-gray-200
      hover:bg-gray-100
      focus:outline-none focus:ring-4 focus:ring-gray-200
      dark:text-gray-400 dark:border-gray-600
      dark:hover:bg-gray-700
      dark:focus:ring-gray-700">
    {{ locale }}
  </button>
</template>

<script lang="ts" setup>
  import { useI18n } from 'vue-i18n'
  import { setLocale, supportedLocales, type SupportedLocale } from '@/i18n'

  const { locale } = useI18n()

  const switchToNextLocale = () => {
    const currIdx = supportedLocales.indexOf(locale.value as SupportedLocale)
    setLocale(supportedLocales[(currIdx + 1) % supportedLocales.length])
  }
</script>
