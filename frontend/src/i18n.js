import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hi from './locales/hi.json'
import mr from './locales/mr.json'

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('ruralcare_language') : null

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: savedLanguage || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values safely
    },
  })

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ruralcare_language', lng)
  }
})

export default i18n
