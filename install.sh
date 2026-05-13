#!/bin/bash

# 🚀 ASTRACODE Installer
# Установка одной командой для macOS и Linux

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Логотип
echo ""
echo -e "${CYAN}✨ ASTRACODE Installer v0.1.0${NC}"
echo -e "${BLUE}Твой терминал станет агентом${NC}"
echo ""

# Проверка системы
OS="$(uname -s)"
case "$OS" in
    Linux*)     MACHINE="linux";;
    Darwin*)    MACHINE="macos";;
    *)          echo -e "${RED}❌ Поддерживаются только macOS и Linux${NC}"; exit 1;;
esac

echo -e "${GREEN}✓ Обнаружена ОС: $MACHINE ($OS)${NC}"

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js не найден. Устанавливаю...${NC}"
    
    if [ "$MACHINE" = "macos" ]; then
        if ! command -v brew &> /dev/null; then
            echo -e "${YELLOW}Устанавливаю Homebrew...${NC}"
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node
    else
        # Linux - пробуем разные пакетные менеджеры
        if command -v apt-get &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif command -v dnf &> /dev/null; then
            sudo dnf install -y nodejs
        elif command -v pacman &> /dev/null; then
            sudo pacman -S --noconfirm nodejs npm
        else
            echo -e "${RED}❌ Не удалось автоматически установить Node.js${NC}"
            echo "Пожалуйста, установите Node.js вручную: https://nodejs.org/"
            exit 1
        fi
    fi
fi

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"
echo -e "${GREEN}✓ npm $NPM_VERSION${NC}"

# Создание директории установки
INSTALL_DIR="$HOME/.astracode"
echo -e "${BLUE}📁 Установка в: $INSTALL_DIR${NC}"

# Удаляем старую директорию если есть
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}⚠️  Удаляю старую версию...${NC}"
    rm -rf "$INSTALL_DIR"
fi

mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Клонируем репозиторий
REPO_URL="https://github.com/ASTRACAT2022/ASTRACODE.git"
echo -e "${BLUE}🔄 Клонирую репозиторий...${NC}"
echo -e "${YELLOW}URL: $REPO_URL${NC}"

if git clone "$REPO_URL" repo 2>/dev/null; then
    echo -e "${GREEN}✓ Репозиторий успешно склонирован${NC}"
else
    echo -e "${RED}❌ Не удалось клонировать репозиторий${NC}"
    echo -e "${YELLOW}Проверьте:${NC}"
    echo "  1. Доступ к GitHub"
    echo "  2. Правильность URL репозитория"
    echo "  3. Наличие git (проверьте: git --version)"
    exit 1
fi

cd repo

# Проверяем наличие package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json не найден в репозитории${NC}"
    echo -e "${YELLOW}Содержимое директории:${NC}"
    ls -la
    exit 1
fi

# Установка зависимостей
echo -e "${BLUE}📦 Установка зависимостей...${NC}"
npm install --silent

# Проверяем наличие скрипта build
if grep -q '"build"' package.json; then
    echo -e "${BLUE}🔨 Сборка проекта...${NC}"
    npm run build --silent
else
    echo -e "${YELLOW}⚠️  Скрипт build не найден, пропускаем сборку${NC}"
fi

# Создание глобальной команды
echo -e "${BLUE}🔗 Создание глобальной команды 'astracode'...${NC}"

# Создаем симлинк или скрипт-обертку
BIN_DIR="$HOME/.local/bin"
mkdir -p "$BIN_DIR"

# Добавляем в PATH если нужно
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
    echo -e "${YELLOW}⚠️  Добавляю $BIN_DIR в PATH${NC}"
    
    SHELL_NAME=$(basename "$SHELL")
    case "$SHELL_NAME" in
        bash)
            PROFILE="$HOME/.bashrc"
            ;;
        zsh)
            PROFILE="$HOME/.zshrc"
            ;;
        fish)
            PROFILE="$HOME/.config/fish/config.fish"
            echo "fish_add_path $BIN_DIR" >> "$PROFILE"
            PROFILE=""
            ;;
        *)
            PROFILE="$HOME/.profile"
            ;;
    esac
    
    if [ -n "$PROFILE" ]; then
        echo "" >> "$PROFILE"
        echo "# ASTRACODE" >> "$PROFILE"
        echo "export PATH=\"$BIN_DIR:\$PATH\"" >> "$PROFILE"
        echo -e "${GREEN}✓ Добавлено в $PROFILE${NC}"
        echo -e "${YELLOW}ℹ️  Перезапустите терминал или выполните: source $PROFILE${NC}"
    fi
fi

# Определяем точку входа
if [ -f "dist/agent.js" ]; then
    ENTRY_POINT="dist/agent.js"
elif [ -f "index.js" ]; then
    ENTRY_POINT="index.js"
elif [ -f "src/index.js" ]; then
    ENTRY_POINT="src/index.js"
else
    echo -e "${RED}❌ Не найден файл точки входа${NC}"
    echo -e "${YELLOW}Поиск .js файлов:${NC}"
    find . -maxdepth 2 -name "*.js" -type f | head -10
    exit 1
fi

echo -e "${GREEN}✓ Точка входа: $ENTRY_POINT${NC}"

# Создаем исполняемый скрипт
cat > "$BIN_DIR/astracode" << EOF
#!/bin/bash
INSTALL_DIR="$INSTALL_DIR/repo"
cd "\$INSTALL_DIR"
exec node $ENTRY_POINT "\$@"
EOF

chmod +x "$BIN_DIR/astracode"

echo -e "${GREEN}✓ Команда 'astracode' создана${NC}"

# Финальное сообщение
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  ✨ ASTRACODE успешно установлен!          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🚀 Запуск:${NC}   ${YELLOW}astracode${NC}"
echo ""

# Предложение запустить сразу
echo -ne "${GREEN}Запустить ASTRACODE сейчас? [Y/n] ${NC}"
read -r response
response=${response:-Y}

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}Запуск ASTRACODE...${NC}"
    echo ""
    exec "$BIN_DIR/astracode"
else
    echo ""
    echo -e "${BLUE}Готово! Запустите ${YELLOW}astracode${BLUE} когда будете готовы.${NC}"
fi
