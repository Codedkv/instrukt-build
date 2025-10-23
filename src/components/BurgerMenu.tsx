import React, { useState } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeSwitcher } from './ThemeSwitcher'

export function BurgerMenu() {
  const [langOpen, setLangOpen] = useState(false)

  return (
    <div style={{ padding: 16, minWidth: 220 }}>
      {/* Язык */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Язык</span>
          <button
            onClick={() => setLangOpen(v => !v)}
            style={{ border: 'none', background: 'none', fontSize: 24, padding: 4 }}
            aria-label="Выбрать язык"
          >🌐</button>
        </div>
        {langOpen && (
          <div style={{ marginTop: 8 }}>
            <LanguageSwitcher />
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

      {/* Кнопки регистрации/логина */}
      <div style={{ marginBottom: 20 }}>
        <button style={{ width: '100%', padding: 8, marginBottom: 8, background: '#007bff', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600 }}>Sign In</button>
        <button style={{ width: '100%', padding: 8, background: '#28a745', color: 'white', border: 'none', borderRadius: 4, fontWeight: 600 }}>Sign Up</button>
      </div>
    </div>
  )
}

/* BurgerMenu теперь использует ThemeSwitcher */
