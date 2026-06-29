# WebCalendar

**[🇺🇦 Українська](#українська) | [🇬🇧 English](#english)**

---

## Українська

Десктопний та веб-застосунок для управління подіями та календарями. Побудований на React + Firebase з підтримкою Electron для Windows.

### Технології

- **React 19** + TypeScript
- **Firebase** — авторизація (Google OAuth) та зберігання даних (Firestore)
- **Zustand** — управління станом
- **Electron** — десктопна версія для Windows
- **Vite** — збірка проєкту

### Функціонал

- Авторизація через Google акаунт
- Три режими перегляду: День, Тиждень, Місяць
- Створення, редагування та видалення подій
- Управління кількома календарями з кольоровим маркуванням
- Пошук подій
- Адаптивний дизайн (веб + мобільна версія)
- Автоматичне оновлення десктопного застосунку

### Встановлення та запуск

**Вимоги:** Node.js 18+, npm

```bash
# Залежності
npm install

# Режим розробки (Electron + live-reload)
npm run dev

# Збірка веб-версії
npm run build

# Збірка Windows-інсталятора
npm run dist:win

# Публікація оновлення на GitHub
$env:GH_TOKEN = "your_github_token"
npm run release:win
```

> Підвищ версію у `package.json` перед публікацією оновлення.

### Структура проєкту

```
src/
├── app/          # Кореневий компонент
├── pages/        # Сторінки (LoginPage, CalendarPage)
├── widgets/      # Великі UI-блоки (Header, Sidebar, DayView, WeekView, MonthView)
├── features/     # Функції (EventModal, CalendarModal, Auth, SearchBar)
├── entities/     # Бізнес-логіка (Calendar store)
├── shared/       # Спільні утиліти, UI-компоненти, Firebase
└── mobile/       # Мобільна версія
electron/
├── main.ts       # Головний процес Electron
└── preload.ts    # Preload скрипт
```

---

## English

A desktop and web application for managing events and calendars. Built with React + Firebase and Electron support for Windows.

### Tech Stack

- **React 19** + TypeScript
- **Firebase** — authentication (Google OAuth) and data storage (Firestore)
- **Zustand** — state management
- **Electron** — desktop version for Windows
- **Vite** — build tool

### Features

- Sign in with Google account
- Three view modes: Day, Week, Month
- Create, edit and delete events
- Manage multiple calendars with color coding
- Event search
- Responsive design (web + mobile)
- Automatic desktop app updates

### Installation & Usage

**Requirements:** Node.js 18+, npm

```bash
# Install dependencies
npm install

# Development mode (Electron + live-reload)
npm run dev

# Build web version
npm run build

# Build Windows installer
npm run dist:win

# Publish update to GitHub
$env:GH_TOKEN = "your_github_token"
npm run release:win
```

> Bump the version in `package.json` before publishing an update.

### Project Structure

```
src/
├── app/          # Root component
├── pages/        # Pages (LoginPage, CalendarPage)
├── widgets/      # Large UI blocks (Header, Sidebar, DayView, WeekView, MonthView)
├── features/     # Features (EventModal, CalendarModal, Auth, SearchBar)
├── entities/     # Business logic (Calendar store)
├── shared/       # Shared utilities, UI components, Firebase
└── mobile/       # Mobile version
electron/
├── main.ts       # Electron main process
└── preload.ts    # Preload script
```

## License

MIT
