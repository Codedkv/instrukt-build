import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { BookOpen, Sparkles, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useUser } from '@/contexts/UserContext'

const Index = () => {
  const { t } = useTranslation()
  const { user } = useUser()
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('indexTitle')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            {t('indexSubtitle')}
          </p>
          
          {/* Показываем кнопки регистрации/входа только если пользователь НЕ залогинен */}
          {!user && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="text-lg">
                  {t('startLearning')}
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg">
                  {t('enter')}
                </Button>
              </Link>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('structuredLessons')}</h3>
              <p className="text-muted-foreground">
                {t('structuredLessonsDesc')}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('perplexityProTitle')}</h3>
              <p className="text-muted-foreground">
                {t('perplexityProDesc')}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('practicalSkills')}</h3>
              <p className="text-muted-foreground">
                {t('practicalSkillsDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Index
