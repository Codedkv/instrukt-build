import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ThemeSwitcher } from './ThemeSwitcher'
import { useUser } from '@/contexts/UserContext'

export function BurgerMenu() {
  const [langOpen, setLangOpen] = useState(false)
  const { i18n } = useTranslation()
  const { user } = useUser()

  return (
    <div style={{ padding: 16, width: 340, maxWidth: '100%' }}>
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
            onClick={() => window.location.href = '/auth'}
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
            onClick={() => window.location.href = '/auth?tab=register'}
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
  )
}
