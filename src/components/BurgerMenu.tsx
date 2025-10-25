import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useUser } from '@/contexts/UserContext'

interface BurgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

// Маппинг языков на флаги (используем CDN Circle Flags)
const languageFlags = {
  en: { flag: 'https://hatscripts.github.io/circle-flags/flags/gb.svg', name: 'English' },
  ru: { flag: 'https://hatscripts.github.io/circle-flags/flags/ru.svg', name: 'Русский' },
  pl: { flag: 'https://hatscripts.github.io/circle-flags/flags/pl.svg', name: 'Polski' },
  uk: { flag: 'https://hatscripts.github.io/circle-flags/flags/ua.svg', name: 'Українська' },
  es: { flag: 'https://hatscripts.github.io/circle-flags/flags/es.svg', name: 'Español' },
  fr: { flag: 'https://hatscripts.github.io/circle-flags/flags/fr.svg', name: 'Français' },
  de: { flag: 'https://hatscripts.github.io/circle-flags/flags/de.svg', name: 'Deutsch' },
} as const

export function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
  const [langOpen, setLangOpen] = useState(false)
  const { i18n, t } = useTranslation()
  const { user } = useUser()

  if (!isOpen) return null

  const currentLanguage = (i18n.language in languageFlags) ? i18n.language as keyof typeof languageFlags : 'en'
  const currentFlag = languageFlags[currentLanguage]

  return (
    <>
      {/* Overlay (backdrop) */}
      <div
        className="fixed inset-0 bg-black/50 z-[999]"
        onClick={onClose}
      />
      
      {/* Меню справа */}
      <div className="fixed top-0 right-0 w-[340px] max-w-[90%] h-auto max-h-screen bg-card shadow-lg p-4 z-[1000] overflow-y-auto">
        
        {/* Язык */}
        <div className="mb-5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">{t('language')}</span>
            <button
              onClick={() => setLangOpen(v => !v)}
              className="border-none bg-transparent p-1 cursor-pointer"
              aria-label="Выбрать язык"
            >
              {/* Показываем флаг текущего языка */}
              <img 
                src={currentFlag.flag} 
                alt={currentFlag.name}
                className="w-5 h-5 rounded-full object-cover"
              />
            </button>
          </div>
          
          {langOpen && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {Object.entries(languageFlags).map(([code, { flag, name }]) => (
                <button
                  key={code}
                  onClick={() => {
                    i18n.changeLanguage(code)
                    setLangOpen(false)
                  }}
                  className={`
                    relative w-8 h-8 rounded-full overflow-hidden 
                    border-2 transition-all cursor-pointer
                    hover:scale-110 hover:shadow-lg
                    ${
                      i18n.language === code 
                        ? 'border-primary ring-2 ring-primary ring-offset-2' 
                        : 'border-border hover:border-primary/50'
                    }
                  `}
                  title={name}
                  aria-label={name}
                >
                  <img 
                    src={flag} 
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Тема день/ночь */}
        <div className="mb-5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">{t('theme')}</span>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Кнопки регистрации/логина - только если НЕ залогинен */}
        {!user && (
          <div className="mb-5 flex flex-col gap-2">
            <Link
              to="/auth"
              onClick={onClose}
              className="w-full py-2 px-4 bg-[#20b2aa] text-white rounded font-semibold text-center hover:bg-[#1a9b93] transition-colors"
            >
              {t('signIn')}
            </Link>
            <Link
              to="/auth?mode=signup"
              onClick={onClose}
              className="w-full py-2 px-4 bg-[#48d1cc] text-white rounded font-semibold text-center hover:bg-[#3bbcc0] transition-colors"
            >
              {t('signUp')}
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
