# 🏠 Good House — Калькулятор ипотеки

MVP web-приложение «Калькулятор ипотеки на дом» для запуска из рекламы ВКонтакте.

## Что это

Адаптивное mobile-first веб-приложение с пятью экранами:
1. **Первый экран** — оффер и кнопка «Начать расчёт»
2. **Выбор доступа** — подписка ВК или оставить телефон
3. **ВК-экран** — переход в группу + кнопка «Я подписался»
4. **Форма лида** — имя и телефон → передача в Bitrix24
5. **Калькулятор** — программа, цена, взнос, срок
6. **Результат** — ежемесячный платёж + детали + CTA

---

## Быстрый старт (локально)

### 1. Клонирование и зависимости

```bash
git clone <ваш репозиторий>
cd goodhouse-mortgage-calculator
npm install
```

### 2. Настройка переменных окружения

```bash
cp .env.example .env.local
```

Откройте `.env.local` и заполните:

```env
# Ваш Bitrix24 webhook (см. ниже как получить)
NEXT_PUBLIC_BITRIX24_WEBHOOK=https://yourdomain.bitrix24.ru/rest/1/yourkey/crm.lead.add.json

# ID счётчика Яндекс Метрики (только цифры)
NEXT_PUBLIC_YM_ID=12345678

# Ссылка на вашу группу ВКонтакте
NEXT_PUBLIC_VK_GROUP_URL=https://vk.com/yourgroup
```

### 3. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## Настройка Bitrix24

### Как получить webhook URL:

1. Зайдите в Bitrix24 → **Разработчикам** → **Входящие вебхуки**
2. Нажмите «Добавить вебхук»
3. Выберите права: `CRM (crm)`
4. Скопируйте URL вида:
   `https://yourdomain.bitrix24.ru/rest/1/yoursecretkey/`
5. Добавьте в конце метод: `crm.lead.add.json`
6. Вставьте в `.env.local` как `NEXT_PUBLIC_BITRIX24_WEBHOOK`

### Что передаётся в лид:

- Имя и телефон клиента
- Источник: `mortgage_calculator_vk`
- Тип конверсии: подписка ВК или форма телефона
- Программа ипотеки, стоимость объекта, взнос, срок, платёж
- UTM-метки из URL рекламы

---

## Редактирование контента

Все настройки вынесены в **`lib/config.ts`** — можно менять без знания кода:

### Ипотечные программы

```typescript
export const MORTGAGE_PROGRAMS = [
  {
    id: 'family',
    name: 'Семейная ипотека',
    rate: 6,                  // ставка %
    minDownPaymentPct: 20,    // минимальный взнос %
    hint: 'Для семей с детьми до 18 лет',
    badge: 'Популярная',      // или убрать поле
  },
  // ... добавьте свои программы
]
```

### Тексты экранов

```typescript
export const TEXTS = {
  hero: {
    title: 'Рассчитайте ипотеку\nна дом за 1 минуту',
    // ...
  },
  // ...
}
```

### Сроки ипотеки

```typescript
export const MORTGAGE_TERMS_YEARS = [10, 15, 20, 25, 30]
```

---

## Деплой на Vercel

### Вариант 1 — через GitHub (рекомендуется)

1. Создайте репозиторий на [github.com](https://github.com)
2. Запушьте код:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourname/goodhouse.git
   git push -u origin main
   ```
3. Зайдите на [vercel.com](https://vercel.com) → **New Project**
4. Выберите ваш репозиторий
5. В разделе **Environment Variables** добавьте переменные из `.env.local`
6. Нажмите **Deploy**

### Вариант 2 — через Vercel CLI

```bash
npm i -g vercel
vercel
# следуйте инструкциям
```

После деплоя добавьте переменные окружения в настройках проекта на Vercel.

---

## Аналитика (Яндекс Метрика)

Приложение автоматически отправляет события:

| Событие | Когда |
|---|---|
| `page_view` | При открытии страницы |
| `click_start` | Нажатие «Начать расчёт» |
| `choose_vk_subscribe` | Выбор сценария ВК |
| `choose_phone_form` | Выбор сценария телефон |
| `submit_phone_form` | Успешная отправка формы |
| `open_calculator` | Открытие калькулятора |
| `calculate_result` | Нажатие «Рассчитать» |
| `final_success` | Показ результата |

Для активации — укажите `NEXT_PUBLIC_YM_ID` в переменных.

---

## Структура проекта

```
goodhouse/
├── app/
│   ├── api/lead/route.ts     # API-роут для передачи лида в Bitrix24
│   ├── globals.css           # Глобальные стили, CSS-переменные
│   ├── layout.tsx            # Корневой layout, Яндекс Метрика
│   └── page.tsx              # Главная страница, машина состояний экранов
├── components/
│   ├── HeroScreen.tsx        # Экран 1: оффер
│   ├── AccessScreen.tsx      # Экран 2: выбор способа доступа
│   ├── VKScreen.tsx          # Экран 3А: подписка ВК
│   ├── LeadFormScreen.tsx    # Экран 3Б: форма лида
│   ├── CalculatorScreen.tsx  # Экран 4: калькулятор
│   └── ResultScreen.tsx      # Экран 5: результат
├── lib/
│   ├── config.ts             # ← ГЛАВНЫЙ КОНФИГ (редактировать здесь)
│   ├── mortgage.ts           # Логика расчёта аннуитета
│   └── bitrix24.ts           # Интеграция с Bitrix24
├── .env.example              # Шаблон переменных окружения
└── README.md
```

---

## Переменные для ручного заполнения

| Переменная | Где | Что |
|---|---|---|
| `NEXT_PUBLIC_BITRIX24_WEBHOOK` | `.env.local` | URL вебхука Bitrix24 |
| `NEXT_PUBLIC_YM_ID` | `.env.local` | ID счётчика Яндекс Метрики |
| `NEXT_PUBLIC_VK_GROUP_URL` | `.env.local` | Ссылка на группу ВК |
| `NEXT_PUBLIC_TELEGRAM_URL` | `.env.local` | Ссылка на Telegram (опционально) |

---

## Что не входит в MVP (но легко добавить позже)

- Автоматическая проверка подписки на группу ВК
- Каталог проектов домов
- Банковские API и живые ставки
- Telegram Mini App и MAX

---

## Техстек

- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS**
- **Vercel** (деплой)
- **Bitrix24** (CRM через webhook)
- **Яндекс Метрика** (аналитика)
