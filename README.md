# ✨ ASTRACODE — Терминальный агент для кодинга

**Твой терминал стал агентом.** Пиши код на естественном языке.

```bash
$ astracode
🤖 astra> переименуй все компоненты с Button на Btn
```

---

## 🚀 Быстрая установка

### macOS и Linux (одна команда)

```bash
curl -fsSL https://raw.githubusercontent.com/ASTRACAT2022/ASTRACODE/refs/heads/main/install.sh | bash
```

Или если уже скачали репозиторий:

```bash
./install.sh
```

После установки просто введите:

```bash
astracode
```

---

## 📋 Требования

- **macOS** 10.15+ или **Linux** (Ubuntu, Debian, Fedora, Arch)
- **Node.js** 18+ (установится автоматически если нет)
- **npm** 9+

---

## 🎯 Возможности

| Режим | Хоткей | Описание |
|-------|--------|----------|
| **Chat mode** | `Esc` | Пишем инструкции на русском/английском |
| **Shell mode** | `Ctrl+Shift+S` | Обычный shell внутри агента |
| **Vibe mode** | `Ctrl+V` | Агент сам следит за изменениями файлов |
| **Select mode** | `Ctrl+Space` | Выбираем файлы/код мышкой |

### Slash команды

```bash
/brave [on/off]     # Включить автономный режим
/stats              # Статистика токенов за сессию
/undo               # Отменить последнее действие агента
/model switch gpt4  # Сменить модель на лету
/context show       # Показать, что сейчас видит агент
/commit "message"   # Агент сам сделает коммит изменений
/explain            # Агент объяснит последнюю команду
/help               # Показать все команды
```

### Навигация

- `1-4` — переключение вкладок (Чат, Файлы, Терминал, Tasks)
- `q` — выход
- `Tab` — следующая вкладка
- `Ctrl+R` — поиск по истории

---

## 💡 Примеры использования

```bash
# Запустить агент
$ astracode

# В интерфейсе:
🤖 astra> запусти тесты
🤖 astra> почини ошибку в auth.test.js
🤖 astra> /brave on
🤖 astra> сделай рефакторинг и закоммить
```

---

## 🔧 Конфигурация

Создайте файл `~/.astracode/config.toml`:

```toml
[agent]
model = "gpt-4"
auto_save = true

[economy]
enabled = false
max_tokens_per_request = 2000

[ui]
theme = "dark"
show_tree_view = true
```

---

## 🛠 Разработка

```bash
# Клонировать
git clone https://github.com/YOUR_USERNAME/astracode.git
cd astracode

# Установить зависимости
npm install

# Сборка
npm run build

# Запуск
npm start

# Тесты
npm test
```

---

## 📊 Экономия токенов

ASTRACODE умнее аналогов:

- Отправляет LLM только **измененные файлы** (git-aware)
- Извлекает **только ошибки** из логов (не весь вывод)
- Выполняет простые команды **локально** (ls, pwd, git status)

**Экономия: 60-80% токенов** по сравнению с Claude Code.

---

## 🆚 Сравнение

| Фича | Claude Code | ASTRACODE |
|------|-------------|-----------|
| Захват терминала | ❌ | ✅ |
| Локальные LLM | ❌ | ✅ |
| Brave режим | 🟡 | ✅ |
| Дерево решений | ❌ | ✅ |
| Цена | $20/мес | Бесплатно |

---

## 📄 Лицензия

MIT — используй бесплатно для любых целей.

---

## 🙏 Contributing

PRs welcome! Читайте [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**ASTRACODE — это не инструмент. Это напарник, который живет в вашем терминале.**
