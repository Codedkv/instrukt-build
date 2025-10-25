import { useEffect, useState } from 'react'
import { useUser } from '@/contexts/UserContext'
import { supabase } from '@/lib/supabase'

export function ProgressBar() {
  const { user } = useUser()
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_progress_percentage', { p_user_id: user.id })

        if (error) throw error
        setProgress(data || 0)
      } catch (error) {
        console.error('Error fetching progress:', error)
        setProgress(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user])

  if (!user || loading) return null

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 to-black py-4 px-6 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-cyan-300">
            Прогресс обучения
          </span>
          <span className="text-lg font-bold text-cyan-400">
            {progress}%
          </span>
        </div>
        
        {/* Прогресс-бар */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          {/* Фоновый градиент */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"></div>
          
          {/* Неоновая жидкость */}
          <div
            className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out
                       bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500
                       shadow-[0_0_20px_rgba(6,182,212,0.8),0_0_40px_rgba(6,182,212,0.4)]
                       animate-pulse-slow"
            style={{ width: `${progress}%` }}
          >
            {/* Блики на жидкости */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            
            {/* Флюоресцентный эффект по краям */}
            <div className="absolute inset-y-0 left-0 w-1 bg-cyan-300 blur-sm"></div>
            <div className="absolute inset-y-0 right-0 w-1 bg-cyan-300 blur-sm"></div>
          </div>
          
          {/* Главное свечение (неоновый эффект) */}
          {progress > 0 && (
            <div
              className="absolute top-0 left-0 h-full
                         bg-gradient-to-r from-transparent via-cyan-400 to-transparent
                         opacity-60 blur-md animate-glow"
              style={{ width: `${progress}%` }}
            ></div>
          )}
        </div>

        {/* Дополнительная информация */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          {progress === 100 ? (
            <span className="text-cyan-400 font-semibold">🎉 Поздравляем! Вы завершили все уроки!</span>
          ) : progress > 0 ? (
            <span>Продолжайте в том же духе! 🚀</span>
          ) : (
            <span>Начните свой путь обучения! 🎓</span>
          )}
        </div>
      </div>

      {/* CSS анимации */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite linear;
        }
        .animate-glow {
          animation: glow 2s infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}
