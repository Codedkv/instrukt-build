import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en/translation.json'
import ru from './locales/ru/translation.json'
import pl from './locales/pl/translation.json'
import uk from './locales/uk/translation.json'
import es from './locales/es/translation.json'
import fr from './locales/fr/translation.json'
import de from './locales/de/translation.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      pl: { translation: pl },
      uk: { translation: uk },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  })

export default i18n
