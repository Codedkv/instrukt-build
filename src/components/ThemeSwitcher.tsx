import React, { useState, useEffect } from 'react'

export function ThemeSwitcher() {
  const [dark, setDark] = useState(() => {
    // Инициализация из localStorage
    const saved = localStorage.getItem('theme')
    return saved === 'dark'
  })

  useEffect(() => {
    // Применяем тему к document.body
    if (dark) {
      document.body.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.body.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  function toggleTheme() {
    setDark(d => !d)
  }

  return (
    <button
      aria-label="Сменить тему"
      style={{ fontSize: 24, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 50 }}
      onClick={toggleTheme}
    >
      {dark ? '🌙' : '☀️'}
    </button>
  )
}
