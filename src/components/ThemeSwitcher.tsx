import React, { useState } from 'react'

export function ThemeSwitcher() {
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    setDark(d => !d)
    document.body.className = !dark ? 'dark' : ''
  }

  return (
    <button
      aria-label="Сменить тему"
      style={{ fontSize: 24, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 50 }}
      onClick={toggleTheme}
    >
      {dark ? '🌙' : '🌞'}
    </button>
  )
}

/* Можно доработать под tailwind/shadcn-light/dark, если проект поддерживает css-классы themes */
