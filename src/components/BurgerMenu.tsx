import React, { useState } from 'react'
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
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999
        }}
        onClick={onClose}
      />

      {/* Меню справа */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 340,
          maxWidth: '90%',
          height: '100%',
          backgroundColor: 'white',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
          padding: 16,
          zIndex: 1000,
          overflowY: 'auto'
        }}
      >
        {/* Язык */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Язык</span>
            <button
              onClick={() => setLangOpen(v => !v)}
              style={{ border: 'none', background: 'none', fontSize: 24, padding: 4, cursor: 'pointer' }}
              aria-label="Выбрать язык"
            >
              🌐
            </button>
          </div>
          {langOpen && (
            <div style={{ marginTop: 8 }}>
              <select
                value={i18n.language}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value)
                  setLangOpen(false)
                }}
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  fontSize: 14
                }}
              >
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
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Тема</span>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Кнопки регистрации/логина - только если НЕ залогинен */}
        {!user && (
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => { window.location.href = '/auth'; onClose() }}
              style={{
                width: '100%',
                padding: 8,
                marginBottom: 8,
                background: '#20b2aa',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { window.location.href = '/auth?tab=register'; onClose() }}
              style={{
                width: '100%',
                padding: 8,
                background: '#48d1cc',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </>
  )
}
