-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('student', 'admin');

-- Profiles table (without role)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  has_perplexity_pro BOOLEAN DEFAULT false,
  perplexity_pro_expires_at TIMESTAMPTZ,
  telegram_id BIGINT UNIQUE,
  telegram_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Promo codes table
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired')),
  perplexity_account_email TEXT,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 year',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  order_index INTEGER NOT NULL UNIQUE,
  duration_minutes INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Indexes for performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_user ON promo_codes(user_id);
CREATE INDEX idx_promo_codes_status ON promo_codes(status);
CREATE INDEX idx_lessons_order ON lessons(order_index);
CREATE INDEX idx_lessons_published ON lessons(is_published) WHERE is_published = true;
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for promo_codes
CREATE POLICY "Users can view own promo code"
  ON promo_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own promo code"
  ON promo_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all promo codes"
  ON promo_codes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update promo codes"
  ON promo_codes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lessons
CREATE POLICY "Anyone can view published lessons"
  ON lessons FOR SELECT
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for progress
CREATE POLICY "Users can manage own progress"
  ON progress FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress"
  ON progress FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate username from metadata or email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  -- Clean special characters
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '', 'g');
  final_username := base_username;
  
  -- Find unique username
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;
  
  -- Insert profile
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Give student role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger on user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed lessons
INSERT INTO lessons (title, description, order_index, is_published, duration_minutes) VALUES
('Что такое Искусственный Интеллект?', 'Введение в мир AI: история, возможности и ограничения', 0, true, 15),
('Знакомство с Perplexity', 'Первые шаги: интерфейс, основные функции', 1, true, 20),
('Как правильно задавать вопросы', 'Искусство промптинга: получаем лучшие ответы', 2, true, 25),
('Исследование с источниками', 'Работа с цитатами и проверка информации', 3, false, 30),
('Работа с документами', 'Загрузка и анализ файлов в Perplexity Pro', 4, false, 35),
('Креативное использование AI', 'Нестандартные применения AI в повседневной жизни', 5, false, 40);