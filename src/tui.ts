#!/usr/bin/env node

import blessed from 'blessed';
import { AstraAgent } from './agent.js';

interface UIState {
  currentTab: number;
  isThinking: boolean;
  inputMode: 'chat' | 'shell' | 'vibe' | 'select';
}

class AstraTUI {
  private screen: blessed.Widgets.Screen;
  private agent: AstraAgent;
  private state: UIState;
  
  // Main containers
  private mainBox!: blessed.Widgets.BoxElement;
  private tabBar!: blessed.Widgets.BoxElement;
  private contentArea!: blessed.Widgets.BoxElement;
  private statusBar!: blessed.Widgets.BoxElement;
  private inputBox!: blessed.Widgets.TextboxElement;
  
  // Tab contents
  private chatBox!: blessed.Widgets.BoxElement;
  private filesBox!: blessed.Widgets.BoxElement;
  private terminalBox!: blessed.Widgets.BoxElement;
  private tasksBox!: blessed.Widgets.BoxElement;
  
  // Chat elements
  private chatLog!: blessed.Widgets.BoxElement;
  private chatInput!: blessed.Widgets.TextboxElement;
  
  // Status bar elements
  private statusLeft!: blessed.Widgets.TextElement;
  private statusRight!: blessed.Widgets.TextElement;
  private braveIndicator!: blessed.Widgets.TextElement;

  constructor() {
    this.agent = new AstraAgent();
    this.state = {
      currentTab: 0,
      isThinking: false,
      inputMode: 'chat'
    };

    // Create the screen
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'ASTRACODE v0.1.0',
      program: {} as any
    });

    // Enable mouse support
    this.screen.key(['escape', 'q', 'C-c'], () => this.quit());
    this.screen.enableMouse();

    this.createLayout();
    this.setupEventHandlers();
    this.updateStatusBar();
  }

  private createLayout() {
    // Main container
    this.mainBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      bg: 'black'
    });
    this.screen.append(this.mainBox);

    // Tab bar at top
    this.tabBar = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      style: {
        bg: 'blue',
        fg: 'white'
      },
      content: this.getTabContent(),
      border: {
        type: 'line' as const
      }
    });
    this.mainBox.append(this.tabBar);

    // Content area (middle)
    this.contentArea = blessed.box({
      top: 3,
      left: 0,
      width: '100%',
      height: '100%-6',
      style: {
        bg: 'black'
      }
    });
    this.mainBox.append(this.contentArea);

    // Create tab content boxes
    this.createChatTab();
    this.createFilesTab();
    this.createTerminalTab();
    this.createTasksTab();

    // Input box at bottom
    this.inputBox = blessed.textbox({
      bottom: 3,
      left: 1,
      width: '100%-2',
      height: 3,
      style: {
        bg: 'black',
        fg: 'green'
      },
      border: {
        type: 'line' as const
      },
      label: ' 🤖 astra> ',
      keys: true,
      inputOnFocus: true
    });
    this.mainBox.append(this.inputBox);

    // Status bar at very bottom
    this.statusBar = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      style: {
        bg: 'blue',
        fg: 'white'
      }
    });
    this.mainBox.append(this.statusBar);

    // Status bar components
    this.statusLeft = blessed.text({
      top: 0,
      left: 1,
      width: '50%',
      height: 1,
      style: { fg: 'white' }
    });
    this.statusBar.append(this.statusLeft);

    this.braveIndicator = blessed.text({
      top: 0,
      left: '50%-10',
      width: 20,
      height: 1,
      style: { fg: 'red', bold: true },
      content: '[BRAVE: OFF]'
    });
    this.statusBar.append(this.braveIndicator);

    this.statusRight = blessed.text({
      top: 0,
      right: 1,
      width: '50%',
      height: 1,
      align: 'right',
      style: { fg: 'white' }
    });
    this.statusBar.append(this.statusRight);

    // Show welcome message
    this.addChatMessage('✨ ASTRACODE v0.1.0 — Твой терминал стал агентом', 'system');
    this.addChatMessage('🔄 Загружен контекст проекта (12 файлов, 3456 LOC)', 'system');
    this.addChatMessage('Введите /help для списка команд или напишите инструкцию на естественном языке', 'system');
  }

  private createChatTab() {
    this.chatBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      style: { bg: 'black' }
    });
    this.contentArea.append(this.chatBox);

    this.chatLog = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%-3',
      style: { fg: 'white' },
      scrollable: true,
      alwaysScroll: true,
      scrollbar: {
        ch: '│',
        style: { bg: 'blue' }
      }
    });
    this.chatBox.append(this.chatLog);

    this.chatInput = blessed.textbox({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      style: { bg: 'black', fg: 'green' }
    });
    this.chatBox.append(this.chatInput);
  }

  private createFilesTab() {
    this.filesBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      style: { bg: 'black', fg: 'white' },
      content: '📁 Файловый браузер (в разработке...)\n\nНажмите Tab для переключения между вкладками',
      scrollable: true
    });
    this.contentArea.append(this.filesBox);
  }

  private createTerminalTab() {
    this.terminalBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      style: { bg: 'black', fg: 'green' },
      content: '🖥️ Терминал (в разработке...)\n\nЗдесь будет вывод shell команд',
      scrollable: true
    });
    this.contentArea.append(this.terminalBox);
  }

  private createTasksTab() {
    this.tasksBox = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      style: { bg: 'black', fg: 'yellow' },
      content: '📋 Активные задачи (в разработке...)\n\nЗдесь будет дерево решений агента',
      scrollable: true
    });
    this.contentArea.append(this.tasksBox);
  }

  private getTabContent(): string {
    const tabs = ['[Чат с агентом]', '[Файлы проекта]', '[Терминал]', '[Tasks]'];
    return tabs.map((tab, i) => {
      if (i === this.state.currentTab) {
        return ` ${tab} `;
      }
      return ` ${tab.replace('[', ' ').replace(']', ' ')} `;
    }).join(' │ ');
  }

  private setupEventHandlers() {
    // Handle input submission
    this.inputBox.on('submit', async (value: string) => {
      if (!value.trim()) return;
      
      this.addChatMessage(value, 'user');
      this.inputBox.clearValue();
      this.screen.render();

      // Show thinking indicator
      this.setThinking(true);
      
      try {
        const response = await this.agent.processCommand(value);
        this.setThinking(false);
        this.addChatMessage(response, 'assistant');
      } catch (error) {
        this.setThinking(false);
        this.addChatMessage(`❌ Ошибка: ${error}`, 'system');
      }
      
      this.screen.render();
    });

    // Tab switching with numbers
    this.screen.key(['1', '2', '3', '4'], (ch, key) => {
      const tabIndex = parseInt(key.name) - 1;
      if (tabIndex >= 0 && tabIndex <= 3) {
        this.switchTab(tabIndex);
      }
    });

    // Brave mode toggle
    this.screen.key(['b'], () => {
      const newState = this.agent.toggleBraveMode();
      this.braveIndicator.setContent(newState ? '[BRAVE: ON]' : '[BRAVE: OFF]');
      this.braveIndicator.style.fg = newState ? 'red' : 'gray';
      this.updateStatusBar();
      this.screen.render();
    });

    // Refresh status periodically
    setInterval(() => this.updateStatusBar(), 5000);
  }

  private switchTab(index: number) {
    this.state.currentTab = index;
    this.tabBar.setContent(this.getTabContent());
    
    // Hide all tabs
    this.chatBox.hide();
    this.filesBox.hide();
    this.terminalBox.hide();
    this.tasksBox.hide();
    
    // Show selected tab
    const tabs = [this.chatBox, this.filesBox, this.terminalBox, this.tasksBox];
    tabs[index].show();
    
    this.screen.render();
  }

  private addChatMessage(content: string, role: 'user' | 'assistant' | 'system') {
    const prefix = role === 'user' ? '\n👤 Вы: ' : 
                   role === 'assistant' ? '\n\n🤖 astra> ' : 
                   '\n';
    
    const styledContent = prefix + content;
    this.chatLog.pushLine(styledContent);
    this.chatLog.setScrollPerc(100);
  }

  private setThinking(thinking: boolean) {
    this.state.isThinking = thinking;
    if (thinking) {
      this.braveIndicator.setContent('[Агент думает...] ●●○');
    } else {
      const braveState = this.agent.getState().braveMode;
      this.braveIndicator.setContent(braveState ? '[BRAVE: ON]' : '[BRAVE: OFF]');
    }
  }

  private updateStatusBar() {
    const state = this.agent.getState();
    const uptime = Math.floor((Date.now() - state.sessionStartTime.getTime()) / 1000);
    const minutes = Math.floor(uptime / 60);
    const seconds = uptime % 60;
    
    this.statusLeft.setContent(`[API: ${state.currentModel}] [Context: ~${state.contextTokens} tokens]`);
    this.statusRight.setContent(`[Session: ${minutes}m ${seconds}s] [Tab: ${this.state.currentTab + 1}/4]`);
    
    const braveState = this.agent.getState().braveMode;
    this.braveIndicator.setContent(braveState ? '[BRAVE: ON]' : '[BRAVE: OFF]');
    this.braveIndicator.style.fg = braveState ? 'red' : 'gray';
  }

  private quit() {
    this.screen.destroy();
    process.exit(0);
  }

  public run() {
    this.screen.render();
  }
}

// Start the application
const app = new AstraTUI();
app.run();

console.log('Starting ASTRACODE...');
