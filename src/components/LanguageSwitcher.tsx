import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'ru', label: '🇷🇺 Русский' },
  { code: 'pl', label: '🇵🇱 Polski' },
  { code: 'uk', label: '🇺🇦 Українська' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {languages.map(lang => (
        <button
          key={lang.code}
          style={{
            padding: '6px 10px',
            borderRadius: '50px',
            fontWeight: i18n.language === lang.code ? 'bold' : 'normal',
            boxShadow: i18n.language === lang.code ? '0 0 4px #4fd1c5' : '',
            border: i18n.language === lang.code ? '2px solid #4fd1c5' : '1px solid #ddd',
            background: i18n.language === lang.code ? '#e6ffff' : '#fff',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

/**
 * LanguageSwitcher: компонент горизонтального выбора языка
 * - Флаги и подписи
 * - Сохраняет выделение активного языка с бирюзовой рамкой
 * - Можно размещать в navbar, главной, бургер-меню
 */
