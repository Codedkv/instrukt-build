import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useUser } from '@/contexts/UserContext'

interface BurgerMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function BurgerMenu({ isOpen, onClose }: BurgerMenuProps) {
  const [langOpen, setLangOpen] = useState(false)
  const { i18n } = useTranslation()
  const { user } = useUser()

  if (!isOpen) return null

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
            <span className="font-semibold text-foreground">Язык</span>
            <button
              onClick={() => setLangOpen(v => !v)}
              className="border-none bg-transparent text-2xl p-1 cursor-pointer"
              aria-label="Выбрать язык"
            >
              🌐
            </button>
          </div>
          {langOpen && (
            <div className="mt-2">
              <select
                value={i18n.language}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value)
                  setLangOpen(false)
                }}
                className="w-full p-2 rounded border border-border text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"              >
                <option value="en">🇬🇧 English</option>
                <option value="ru">🇷🇺 Русский</option>
                <option value="pl">🇵🇱 Polski</option>
                <option value="uk">🇺🇦 Українська</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
              </select>
            </div>
          )}
        </div>

        {/* Тема день/ночь */}
        <div className="mb-5">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-foreground">Тема</span>
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
              Sign In
            </Link>
            <Link
              to="/auth?mode=signup"
              onClick={onClose}
              className="w-full py-2 px-4 bg-[#48d1cc] text-white rounded font-semibold text-center hover:bg-[#3bbcc0] transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
