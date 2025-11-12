# 白烬山口 - AI 狼人杀游戏

> **Whitefire Pass: An AI-Powered Werewolf Game**

一个由 AI 驱动的狼人杀变体游戏，基于 1913 年的神秘山庄背景设定。游戏使用 Gemini 2.5 Pro API 驱动 15 位 AI 旅者，支持手动单步执行，让你见证 AI 角色在生死博弈中的思考过程。

[![CI](https://github.com/ZacharyZcR/Wolf/workflows/CI/badge.svg)](https://github.com/ZacharyZcR/Wolf/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 游戏特色

### 🎭 独特的角色系统

游戏共有 7 种角色，分为三个阵营：

**烙印者阵营**（狼人方）
- 🔥 **烙印者 (The Marked)**: 夜晚共同投票杀害旅者
- ☽ **背誓者 (The Heretic)**: 烙印者阵营，伪装成无知者

**村民阵营**
- ◈ **聆心者 (The Listener)**: 每晚查验一名旅者的阵营
- ✟ **食灰者 (Ash-Walker)**: 在旅者死亡后获得其身份信息
- ◐◑ **共誓者 (The Twin)**: 两位旅者相互验证身份
- ◆ **设闩者 (Guardian)**: 每晚守护一名旅者，免受烙印者杀害
- ○ **无知者 (The Innocent)**: 普通村民，凭推理找出烙印者

### 🎨 精美的视觉设计

- **塔罗牌风格 UI**: 1913 年复古哥特式设计
- **角色立绘系统**: 每个角色都有独特的精美立绘
- **ADV 对话框**: 视觉小说风格的剧情展示
- **动态转场效果**: 流畅的相位切换和卡片翻转动画

### 🤖 AI 智能体系统

- 使用 **Gemini 2.5 Pro** 驱动每个 AI 旅者
- 每个角色拥有独特的性格、背景和人际关系
- **情感状态系统**: 角色会因关系网络中的死亡事件产生"美德"或"罪恶"状态
- **完整的自传**: 每个角色都有详细的背景故事
- 支持查看完整的 AI prompt 和响应内容

### 🎯 游戏机制

- **手动单步执行**: 完全控制游戏进度，观察每一步 AI 推理
- **自动执行模式**: 一键自动运行整个阶段
- **线索系统**: 收集和分析游戏中的各类线索
- **密会系统**: 选择 2-3 名旅者进行秘密会谈
- **投票追踪**: 实时记录所有投票结果

## 🚀 快速开始

### 前置要求

- **Node.js** >= 18.17.0
- **pnpm** >= 8.0.0
- **Gemini API Key** - 从 [Google AI Studio](https://makersuite.google.com/app/apikey) 获取

### 安装

```bash
# 克隆仓库
git clone https://github.com/ZacharyZcR/Wolf.git
cd Wolf

# 安装依赖
pnpm install
```

### 配置

1. 复制环境变量配置文件：
```bash
cp .env.example .env.local
```

2. 编辑 `.env.local`，填入你的 Gemini API Key：
```env
GEMINI_API_KEY=your_api_key_here
```

### 代理配置（可选）

如果需要通过代理访问 Gemini API，在 `src/app/api/gemini/route.ts` 中修改代理地址：

```typescript
const PROXY_URL = 'http://127.0.0.1:7897'; // 修改为你的代理地址
```

### 运行

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

## 🎲 如何游玩

### 1. 游戏开始

- 点击"开始游戏"进入序章
- 阅读故事背景和世界观设定
- 确认角色配置（默认15人局）

### 2. 游戏流程

**白天阶段**
- 所有存活旅者依次发言
- 讨论并分析前一晚发生的事件
- 点击"下一步"或"自动执行"推进游戏

**投票阶段**
- 每位旅者投票选择要驱逐的对象
- 得票最高者被投票出局
- 可以选择"不投票"

**夜晚阶段**
- **聆心者查验**: 查看一名旅者的阵营
- **烙印者讨论**: 烙印者们秘密商讨杀人目标
- **烙印者投票**: 选择今夜要杀害的旅者
- **设闩者守护**: 选择一名旅者进行保护
- **食灰者验尸**: 如有旅者死亡，获得其身份信息

**特殊机制**
- **密会**: 在白天可发起2-3人的秘密会谈
- **情感触发**: 重要角色死亡可能触发其他角色的情感状态变化

### 3. 胜利条件

- **烙印者胜利**: 烙印者数量 ≥ 村民数量
- **村民胜利**: 所有烙印者被驱逐

## 📁 项目结构

```
Wolf/
├── src/
│   ├── app/                      # Next.js 应用路由
│   │   ├── api/gemini/          # Gemini API 代理
│   │   ├── page.tsx             # 主页面
│   │   └── tarot-demo/          # 塔罗牌演示
│   ├── components/
│   │   ├── game/                # 游戏组件
│   │   │   ├── GameBoard.tsx    # 游戏主面板
│   │   │   ├── ControlPanel.tsx # 控制面板
│   │   │   ├── TarotCard.tsx    # 塔罗牌组件
│   │   │   ├── ADVDialogBox.tsx # ADV对话框
│   │   │   ├── PersonalityEditor.tsx # 旅者档案
│   │   │   └── ...
│   │   └── ui/                  # shadcn/ui 基础组件
│   ├── lib/
│   │   ├── game-engine.ts       # 纯函数游戏引擎
│   │   ├── ai-service.ts        # AI 服务
│   │   ├── relationships.ts     # 角色关系网络
│   │   ├── emotional-prompts.ts # 情感状态系统
│   │   ├── character-autobiographies.ts # 角色自传
│   │   └── ...
│   ├── stores/
│   │   └── game-store.ts        # Zustand 游戏状态管理
│   ├── types/
│   │   └── game.ts              # TypeScript 类型定义
│   └── hooks/                   # 自定义 Hooks
├── public/
│   ├── portraits/               # 角色立绘 (640x1632)
│   ├── bgm/                     # 背景音乐
│   └── sounds/                  # 音效
└── docs/                        # 文档
```

## 🛠️ 技术栈

### 核心框架
- **Next.js 15** - React 框架
- **React 18** - UI 库
- **TypeScript** - 类型安全

### 样式与UI
- **Tailwind CSS** - 原子化 CSS
- **shadcn/ui** - UI 组件库
- **Radix UI** - 无障碍组件
- **Lucide React** - 图标库

### 状态管理
- **Zustand** - 轻量级状态管理
- **TanStack Query** - 数据获取

### AI 集成
- **Gemini 2.5 Pro API** - Google 最新大模型
- **Undici** - HTTP 客户端（支持代理）

### 开发工具
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **TypeScript** - 类型检查
- **Vitest** - 单元测试
- **Playwright** - E2E 测试

## 🎯 开发命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm start            # 启动生产服务器

# 代码质量
pnpm lint             # ESLint 检查
pnpm format           # Prettier 格式化
pnpm type-check       # TypeScript 类型检查

# 测试
pnpm test             # 运行单元测试
pnpm test:watch       # 监视模式运行测试
pnpm test:coverage    # 测试覆盖率报告
pnpm test:e2e         # E2E 测试
```

## 🏗️ 架构设计

### 游戏引擎

游戏引擎采用**纯函数式设计**，所有游戏逻辑都是纯函数，不产生副作用：

```typescript
// 游戏状态转换
newState = gameEngine.processAction(currentState, action)

// 相位推进
newState = gameEngine.advancePhase(currentState)

// 投票处理
newState = gameEngine.processVoting(currentState)
```

### 状态管理

使用 Zustand 进行集中式状态管理：

```typescript
const gameStore = {
  gameState: GameState,      // 游戏状态
  isProcessing: boolean,     // 处理中标志
  isAutoExecuting: boolean,  // 自动执行标志

  // Actions
  executeNextStep(),         // 执行下一步
  executePhaseAuto(),        // 自动执行阶段
  retryCurrentStep(),        // 重试当前步骤
}
```

### AI 服务

AI 服务负责与 Gemini API 交互：

```typescript
// 生成 AI 响应
const response = await aiService.generateResponse({
  player,
  gameState,
  additionalContext,
  actionType
})
```

## 🎨 UI/UX 设计理念

### 1913 复古哥特风格

- **字体**: Cinzel (哥特式衬线字体)
- **配色**: 琥珀色 + 石板灰
- **装饰**: 维多利亚时代风格的边框和花纹

### 视觉层次

1. **塔罗牌**: 画廊视图展示所有角色
2. **立绘**: 角色档案中展示完整立绘（640x1632）
3. **对话框**: ADV风格展示当前发言内容

### 动画效果

- 卡片翻转（3D transform）
- 相位转场
- 消息流动画
- 加载状态

## 📊 代码质量标准

### ESLint 规则

- **复杂度限制**: 单函数圈复杂度 ≤ 25（组件/库）
- **嵌套深度**: 最大 3 层
- **函数长度**: 最多 50 行（不含空行和注释）
- **禁止 any**: 必须明确类型
- **JSDoc**: 公开 API 必须有文档

### Git Hooks

提交时自动执行：
- 代码格式化
- ESLint 检查
- 类型检查
- 提交信息规范检查（Conventional Commits）

### CI/CD

每次提交/PR 自动运行：
- ✅ 代码质量检查
- ✅ 类型检查
- ✅ 单元测试
- ✅ 生产构建

## 🎮 游戏配置

### 角色配置

可在 `src/lib/game-engine.ts` 中修改角色配置：

```typescript
export const DEFAULT_ROLE_CONFIG = {
  marked: 3,      // 烙印者数量
  heretic: 1,     // 背誓者数量
  listener: 1,    // 聆心者数量
  coroner: 1,     // 食灰者数量
  twin: 2,        // 共誓者数量（必须为偶数）
  guard: 1,       // 设闩者数量
  innocent: 6,    // 无知者数量
};
```

### Gemini 配置

在 `src/app/api/gemini/route.ts` 中修改 API 配置：

```typescript
generationConfig: {
  temperature: 0.9,  // 创造性参数
  // 无 token 限制，让 AI 自由思考
}
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 提交规范

使用 [约定式提交](https://www.conventionalcommits.org/zh-hans/)：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构代码
perf: 性能优化
test: 测试相关
chore: 其他修改
```

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'feat: 添加某某功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 待办事项

- [ ] 添加游戏存档/读档功能
- [ ] 支持自定义角色配置
- [ ] 添加游戏重播功能
- [ ] 支持多语言（英文）
- [ ] 添加音效系统
- [ ] 优化移动端体验
- [ ] 添加游戏统计和数据分析
- [ ] 支持其他 AI 模型（Claude, GPT-4 等）

## 🐛 已知问题

- 长时间游戏可能导致 API 调用过多
- 移动端部分布局需要优化
- 某些情况下 AI 可能产生不符合规则的输出

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- 感谢 Google 提供的 Gemini API
- 感谢 shadcn/ui 提供的优秀组件库
- 感谢所有为本项目做出贡献的开发者

## 📮 联系方式

- GitHub Issues: [提交问题](https://github.com/ZacharyZcR/Wolf/issues)
- 项目主页: [白烬山口](https://github.com/ZacharyZcR/Wolf)

---

**🎲 愿火焰指引你的道路 | May the Flame Guide Your Path**
