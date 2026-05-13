#!/usr/bin/env node

import blessed from 'blessed';
import * as pty from 'node-pty';
import { EventEmitter } from 'events';
import os from 'os';

// Types
interface AgentState {
  braveMode: boolean;
  economyMode: boolean;
  currentModel: string;
  sessionId: string | null;
  contextTokens: number;
  sessionStartTime: Date;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

class AstraAgent extends EventEmitter {
  private state: AgentState;
  private messages: Message[] = [];
  private shell: pty.IPty | null = null;
  
  constructor() {
    super();
    this.state = {
      braveMode: false,
      economyMode: false,
      currentModel: 'gpt-4',
      sessionId: null,
      contextTokens: 0,
      sessionStartTime: new Date()
    };
  }

  getState(): AgentState {
    return { ...this.state };
  }

  toggleBraveMode(): boolean {
    this.state.braveMode = !this.state.braveMode;
    this.emit('braveModeChanged', this.state.braveMode);
    return this.state.braveMode;
  }

  toggleEconomyMode(): boolean {
    this.state.economyMode = !this.state.economyMode;
    this.emit('economyModeChanged', this.state.economyMode);
    return this.state.economyMode;
  }

  addMessage(role: 'user' | 'assistant' | 'system', content: string) {
    const message: Message = { role, content, timestamp: new Date() };
    this.messages.push(message);
    this.emit('messageAdded', message);
  }

  getMessages(): Message[] {
    return [...this.messages];
  }

  async processCommand(input: string): Promise<string> {
    // Handle slash commands
    if (input.startsWith('/')) {
      return this.handleSlashCommand(input);
    }

    // Send to LLM (simulated for now)
    this.addMessage('user', input);
    
    // Simulate agent response
    const response = await this.simulateLLMResponse(input);
    this.addMessage('assistant', response);
    
    return response;
  }

  private async handleSlashCommand(input: string): Promise<string> {
    const parts = input.slice(1).split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'brave':
        const newState = this.toggleBraveMode();
        return newState 
          ? '⚠️ BRAVE MODE ACTIVATED — агент будет действовать без подтверждений' 
          : '✅ BRAVE MODE DEACTIVATED';
      
      case 'economy':
        const econState = this.toggleEconomyMode();
        return econState 
          ? '💰 ECONOMY MODE ON — использование локальной LLM' 
          : '💰 ECONOMY MODE OFF';
      
      case 'stats':
        const uptime = Math.floor((Date.now() - this.state.sessionStartTime.getTime()) / 1000);
        return `📊 Статистика сессии:\n` +
               `  Время: ${Math.floor(uptime / 60)}м ${uptime % 60}с\n` +
               `  Сообщений: ${this.messages.length}\n` +
               `  Токенов использовано: ~${this.state.contextTokens}\n` +
               `  Модель: ${this.state.currentModel}`;
      
      case 'undo':
        return '↩️ Отмена последнего действия... (реализуется в следующей версии)';
      
      case 'model':
        if (args[0] === 'switch' && args[1]) {
          this.state.currentModel = args[1];
          return `🔄 Модель переключена на ${args[1]}`;
        }
        return 'Использование: /model switch <name>';
      
      case 'context':
        if (args[0] === 'show') {
          return `📎 Текущий контекст:\n  Файлов: 12\n  LOC: 3456\n  Токенов: ${this.state.contextTokens}`;
        }
        return 'Использование: /context show';
      
      case 'commit':
        const message = args.join(' ') || 'auto-commit';
        return `✅ Коммит создан: "${message}"\n(hash: ${this.generateHash()})`;
      
      case 'fork':
        return '🍀 Создана новая ветка с текущим состоянием';
      
      case 'explain':
        return '📖 Объяснение последней команды... (реализуется в следующей версии)';
      
      case 'help':
        return this.getHelpText();
      
      default:
        return `❌ Неизвестная команда: /${command}\nВведите /help для списка команд`;
    }
  }

  private generateHash(): string {
    return Math.random().toString(36).substring(2, 8);
  }

  private getHelpText(): string {
    return `📚 Доступные команды:
  /brave [on/off]     - Включить автономный режим
  /economy [on/off]   - Режим экономии токенов
  /stats              - Статистика сессии
  /undo               - Отменить последнее действие
  /model switch <name>- Сменить модель
  /context show       - Показать текущий контекст
  /commit "message"   - Сделать коммит изменений
  /fork               - Создать новую ветку
  /explain            - Объяснить последнюю команду
  /help               - Эта справка`;
  }

  private async simulateLLMResponse(input: string): Promise<string> {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simple keyword-based responses for demo
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('запусти') || lowerInput.includes('запуск')) {
      return '[Агент] Выполняю команду...\n📤 Запуск процесса...';
    }
    
    if (lowerInput.includes('почини') || lowerInput.includes('исправь') || lowerInput.includes('fix')) {
      return '[Агент] Анализирую проблему...\n[Агент] Читаю файл...\n[Агент] Исправляю:\n\n✅ Патч применен';
    }
    
    if (lowerInput.includes('тест') || lowerInput.includes('test')) {
      return '[Агент] Выполняю: npm test\n📤 [output] Test suite: 5 passed, 0 failed\n✅ Все тесты прошли!';
    }
    
    if (lowerInput.includes('привет') || lowerInput.includes('hello')) {
      return '✨ Привет! Я ASTRACODE, твой терминальный агент. Чем могу помочь?';
    }
    
    return `[Агент] Получил инструкцию: "${input}"\n[Агент] Обрабатываю... ✨`;
  }

  spawnShell(env: NodeJS.ProcessEnv): pty.IPty {
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    this.shell = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.cwd(),
      env: { ...process.env, ...env }
    });
    return this.shell;
  }

  getShell(): pty.IPty | null {
    return this.shell;
  }
}

export { AstraAgent, AgentState, Message };
