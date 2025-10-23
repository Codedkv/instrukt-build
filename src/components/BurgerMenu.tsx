import React, { useState } from 'react'
import { LanguageSwitcher } from './LanguageSwitcher'
// import { ThemeSwitcher } from './ThemeSwitcher' (добавлю позже)

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
      {/* Тема день/ночь — пока заглушка! */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600 }}>Тема</span>
          <button
            /* onClick={() => themeToggle()} */
            style={{ border: 'none', background: 'none', fontSize: 24, padding: 4 }}
            aria-label="Сменить тему"
          >🌙</button>
        </div>
      </div>
      {/* Кнопки регистрации/логина */}
      <div style={{ marginBottom: 12 }}>
        <button style={{ width: '100%', padding: 8, marginBottom: 10, background: '#4fd1c5', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }}>Sign In</button>
        <button style={{ width: '100%', padding: 8, background: '#4299e1', color: '#fff', border: 'none', borderRadius: 4, fontWeight: 600 }}>Sign Up</button>
      </div>
    </div>
  )
}

/* BurgerMenu будет расширяться, когда появится ThemeSwitcher */
