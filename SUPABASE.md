# Конфигурация Supabase для PerplexitySchool

## Обзор

Данный файл содержит полное описание структуры базы данных Supabase для системы управления уроками PerplexitySchool.

---

## 📊 Структура таблиц

### 1. Таблица `lessons` (Уроки)

Основная таблица для хранения информации об уроках.

**Колонки:**
- `id` (UUID, PRIMARY KEY) - Уникальный идентификатор урока
- `uuid` (UUID, NOT NULL) - Дополнительный UUID
- `title` (TEXT, NOT NULL) - Название урока
- `description` (TEXT, NULL) - Описание урока
- `content` (TEXT, NULL) - Основной контент урока
- `video_url` (TEXT, NULL) - URL видео урока
- `order_index` (INTEGER, NOT NULL, DEFAULT 0) - **Порядковый номер для сортировки уроков**
- `status` (TEXT, NOT NULL, DEFAULT 'draft') - **Статус урока: 'draft', 'published', 'archived'**
- `duration_minutes` (INTEGER, NULL) - Длительность урока в минутах
- `thumbnail_url` (TEXT, NULL) - URL миниатюры урока
- `publish_date` (TIMESTAMPTZ, NULL) - Дата публикации
- `is_published` (BOOLEAN, NULL, DEFAULT false) - Флаг публикации (устаревшее поле)
- `created_at` (TIMESTAMPTZ, NULL, DEFAULT NOW()) - Дата создания
- `updated_at` (TIMESTAMPTZ, NULL, DEFAULT NOW()) - Дата последнего обновления

**Индексы:**
- `lessons_pkey` - PRIMARY KEY (id)
- `lessons_order_index_key` - UNIQUE (order_index)
- `idx_lessons_order` - INDEX (order_index)
- `idx_lessons_status` - INDEX (status)
- `idx_lessons_published` - INDEX (is_published) WHERE is_published = true

**Constraints:**
- `lessons_status_check` - CHECK (status IN ('draft', 'published', 'archived'))

---

### 2. Таблица `lesson_content` (Контент уроков)

**НОВАЯ ТАБЛИЦА** для хранения различных типов контента внутри урока (видео, текст, изображения, файлы).

**Колонки:**
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid()) - Уникальный идентификатор контента
- `lesson_id` (UUID, NOT NULL, REFERENCES lessons(id) ON DELETE CASCADE) - **Связь с уроком**
- `content_type` (TEXT, NOT NULL) - **Тип контента: 'video', 'text', 'image', 'file'**
- `content_data` (JSONB, NOT NULL) - **Данные контента в формате JSON**
  - Для видео: `{"url": "...", "title": "...", "description": "..."}`
  - Для текста: `{"text": "...", "formatting": "..."}`
  - Для изображения: `{"url": "...", "alt": "...", "caption": "..."}`
  - Для файла: `{"url": "...", "filename": "...", "size": "..."}`
- `order_index` (INTEGER, NOT NULL, DEFAULT 0) - **Порядковый номер элемента внутри урока**
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Дата создания
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Дата последнего обновления

**Индексы:**
- `lesson_content_pkey` - PRIMARY KEY (id)
- `idx_lesson_content_lesson` - INDEX (lesson_id, order_index)

**Constraints:**
- `lesson_content_content_type_check` - CHECK (content_type IN ('video', 'text', 'image', 'file'))
- `lesson_content_lesson_id_fkey` - FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE

---

### 3. Таблица `progress` (Прогресс пользователей)

Таблица для отслеживания прогресса пользователей по урокам.

**Колонки:**
- `id` (UUID, PRIMARY KEY) - Уникальный идентификатор записи прогресса
- `user_id` (UUID, NOT NULL) - ID пользователя (связь с auth.users)
- `lesson_id` (UUID, NOT NULL) - ID урока (связь с lessons)
- `completed` (BOOLEAN, NOT NULL, DEFAULT FALSE) - **Флаг завершения урока**
- `last_accessed` (TIMESTAMPTZ, DEFAULT NOW()) - **Дата последнего доступа к уроку**
- `completion_date` (TIMESTAMPTZ, NULL) - **Дата завершения урока**
- `progress_percentage` (INTEGER, DEFAULT 0) - Процент прохождения урока (0-100)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW()) - Дата создания записи
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW()) - Дата последнего обновления

**Индексы:**
- `progress_pkey` - PRIMARY KEY (id)
- `idx_progress_user_lesson` - **UNIQUE INDEX (user_id, lesson_id)** - Один пользователь не может иметь дубликаты прогресса
- `idx_progress_user` - INDEX (user_id)

**Constraints:**
- `progress_percentage_check` - CHECK (progress_percentage >= 0 AND progress_percentage <= 100)

---

## 🔒 Row Level Security (RLS)

### Таблица `lessons`

**Включено:** ✅ `ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;`

**Политики:**

1. **"Admins can do everything with lessons"** (FOR ALL)
   - Админы могут создавать, читать, обновлять и удалять все уроки
   - Условие: пользователь имеет роль 'admin' в таблице user_roles

2. **"Users can view published lessons"** (FOR SELECT)
   - Обычные пользователи могут видеть только опубликованные уроки
   - Условие: `status = 'published'` AND `auth.uid() IS NOT NULL`

---

### Таблица `lesson_content`

**Включено:** ✅ `ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;`

**Политики:**

1. **"Admins can do everything with lesson_content"** (FOR ALL)
   - Админы могут управлять всем контентом уроков
   - Условие: пользователь имеет роль 'admin' в таблице user_roles

2. **"Users can view content of published lessons"** (FOR SELECT)
   - Пользователи могут видеть контент только опубликованных уроков
   - Условие: урок имеет статус 'published' AND пользователь авторизован

---

### Таблица `progress`

**Включено:** ✅ `ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;`

**Политики:**

1. **"Users can view their own progress"** (FOR SELECT)
   - Пользователи могут видеть только свой прогресс
   - Условие: `auth.uid() = user_id`

2. **"Users can insert their own progress"** (FOR INSERT)
   - Пользователи могут создавать записи прогресса только для себя
   - Условие: `auth.uid() = user_id`

3. **"Users can update their own progress"** (FOR UPDATE)
   - Пользователи могут обновлять только свой прогресс
   - Условие: `auth.uid() = user_id`

4. **"Admins can view all progress"** (FOR SELECT)
   - Админы могут видеть прогресс всех пользователей
   - Условие: пользователь имеет роль 'admin' в таблице user_roles

---

## ⚙️ Триггеры

### Автоматическое обновление `updated_at`

**Функция:**
```sql
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Триггеры:**
1. `set_updated_at_lessons` - срабатывает при UPDATE на таблице lessons
2. `set_updated_at_lesson_content` - срабатывает при UPDATE на таблице lesson_content
3. `set_updated_at_progress` - срабатывает при UPDATE на таблице progress

---

## 📝 Функции

### 1. `get_user_progress_percentage(p_user_id UUID)`

**Назначение:** Вычисляет общий процент завершённых уроков пользователя (для индикатора прогресса).

**Возвращает:** INTEGER (0-100)

**Логика:**
1. Считает общее количество опубликованных уроков
2. Считает количество завершённых уроков пользователем (completed = TRUE)
3. Вычисляет процент: `(completed / total) * 100`

**Пример использования:**
```sql
SELECT get_user_progress_percentage(auth.uid());
```

---

### 2. `upsert_lesson_progress(p_user_id UUID, p_lesson_id UUID, p_completed BOOLEAN DEFAULT FALSE)`

**Назначение:** Создаёт или обновляет запись прогресса пользователя по уроку.

**Возвращает:** UUID (ID записи прогресса)

**Логика:**
1. Пытается вставить новую запись прогресса
2. При конфликте (user_id, lesson_id уже существует) обновляет существующую запись:
   - Обновляет `last_accessed` на текущее время
   - Если `p_completed = TRUE`, устанавливает `completed = TRUE`
   - Если урок только что завершён, устанавливает `completion_date`

**Пример использования:**
```sql
-- Отметить доступ к уроку
SELECT upsert_lesson_progress(auth.uid(), 'lesson-uuid', FALSE);

-- Завершить урок
SELECT upsert_lesson_progress(auth.uid(), 'lesson-uuid', TRUE);
```

---

## 🎯 Ключевые особенности

### Безопасность
✅ Все таблицы защищены Row Level Security (RLS)
✅ Админы имеют полный доступ ко всем данным
✅ Пользователи видят только опубликованные уроки
✅ Пользователи управляют только своим прогрессом
✅ Уникальный индекс предотвращает дубликаты прогресса

### Производительность
✅ Индексы на часто запрашиваемые поля (order_index, status, user_id)
✅ Составной индекс для быстрого поиска контента урока
✅ Автоматическое каскадное удаление контента при удалении урока

### Гибкость
✅ JSONB для хранения различных типов контента
✅ Поддержка нескольких элементов контента в одном уроке
✅ Возможность изменения порядка уроков и элементов контента
✅ Статусы уроков для черновиков и архивирования

---

## 📋 Использование в приложении

### Для админов
1. Создание/редактирование уроков через страницу `/admin/lessons`
2. Управление контентом внутри уроков (добавление видео, текста, изображений)
3. Изменение порядка уроков (drag-and-drop)
4. Публикация/архивирование уроков
5. Просмотр статистики по прогрессу пользователей

### Для пользователей
1. Просмотр опубликованных уроков на странице `/lessons`
2. Автоматическое отслеживание прогресса
3. Отображение индикатора общего прогресса в дашборде
4. Возможность завершить урок и перейти к следующему

---

## 🚀 Миграция базы данных

Все изменения применены через SQL-скрипт в Supabase SQL Editor.

**Дата миграции:** 25 октября 2025

**Статус:** ✅ Успешно применено

---

## 📞 Контакты

**Проект:** PerplexitySchool  
**База данных:** Supabase  
**Разработчик:** Codedkv
