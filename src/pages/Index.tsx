import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Target } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            PerplexitySchool
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Онлайн-обучение работе с искусственным интеллектом
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="text-lg">
                Начать обучение
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="text-lg">
                Войти
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Структурированные уроки</h3>
              <p className="text-muted-foreground">
                Пошаговое изучение AI от основ до продвинутых техник
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Perplexity Pro</h3>
              <p className="text-muted-foreground">
                Получите доступ к Pro версии при регистрации
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Практические навыки</h3>
              <p className="text-muted-foreground">
                Применяйте AI в повседневной жизни и работе
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
