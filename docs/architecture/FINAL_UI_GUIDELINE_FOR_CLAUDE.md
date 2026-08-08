# 护无忧 UI 优化执行规范（交付 Claude Code）

> 这是你在本项目中执行一切 UI/前端改动的**唯一规范**。动手前先完整阅读本文件与 UI_DESIGN_SYSTEM.md、UI_OPTIMIZATION_ROADMAP.md。
> 优先级：本文件 > 旧文档 > 你的直觉。代码事实 > 文档描述。
> 版本：2026-08-08

## 1. 项目背景

「护无忧」是医疗陪诊平台：患者端（手机壳形态 SPA）+ 管理后台（侧栏 SaaS）。技术栈为原生 HTML/CSS/JS，无框架。

设计定位：**医疗可信感的 Apple 式精致**。保留现有品牌视觉基因，通过细节质量（间距、阴影、字号、动效、触控）提升高级感，不换风格、不换品牌色。

## 2. 你每次改动前必须做的事

1. 阅读 `src/styles/style.css` 与 `src/styles/workflow.css` 的 `:root` 变量段，**优先使用现有 CSS 变量**。
2. 先找有没有现成组件类（`.btn`、`.fg-input`、`.tag-*`、`.card`），能复用就复用，不新建重复类。
3. 改动后自查：是否引入硬编码颜色、是否破坏 44px 触控、是否使用 `transition: all`。
4. 涉及页面结构/流程的改动，先对照 `REQUIREMENT_GAP_ANALYSIS.md` 与 `UI_OPTIMIZATION_ROADMAP.md` 确认目标流程。

## 3. UI 设计目标（五条，逐条必须满足）

1. **保留品牌基因**：#3b6cb5 主蓝、#2c5a9e 深蓝、#c4922e 琥珀、slate 灰阶、Noto Serif SC 衬线标题——一个都不许改。
2. **清晰**：信息层级通过字号阶梯（见 UI_DESIGN_SYSTEM §3）表达，不用颜色堆砌。
3. **顺从**：卡片用阴影表达浮起，少用描边；留白到位，内容优先。
4. **深度**：页面转场、按压反馈、抽屉动效建立前后层级；动效快速、有目的、可关闭。
5. **医疗可信**：任何美化不得牺牲可读性、对比度与信息准确性。

## 4. 颜色规则（强制）

### 4.1 可用色（全部来自现有 token，禁止新增色值）

- 主操作/选中/链接：`--accent (#3b6cb5)`；hover `--accent-light`；按下 `--accent-deep`。
- 差异化入口（AI/人工）：`--accent-amber (#c4922e)` 及其 `-light`。
- 背景：`--bg-primary #f5f7fa` / `--bg-secondary #ffffff` / `--bg-tertiary #eef1f6` / `--bg-hover #f0f3f8`。
- 边框：`--border-color #e2e8f0` / `--border-light #cbd5e1`。
- 文本：主 `--text-primary`、次 `--text-secondary`、低强调 `--text-tertiary (#64748b，需新增)`、占位/禁用 `--text-muted`。
- 状态：成功 `#16a34a`、警告 `#ca8a04`、错误 `#dc2626`、待处理 `#94a3b8`、已派单 `#ea580c`。

### 4.2 规则

- 新代码**禁止硬编码颜色**，一律用变量。
- `--text-muted` 禁止用于正文，只用于 placeholder 与 disabled。
- 状态徽章统一：8% 同色底 + 20% 同色边框 + 同色文字 + 圆角 6px + 11-12px。
- 修复 `--warm`：`.tag-orange`（style.css:202）的 `var(--warm)` 未定义，改为 `var(--accent-amber)` 或新增 `--warm: #c4922e`。

## 5. 字体规则

- 正文 `Noto Sans SC` 15px（患者端）/ 14px（后台）；禁止 10px 以下正文。
- 衬线 `Noto Serif SC` **只用于页面主标题与品牌区，每页最多 2 处**；模块/卡片标题用无衬线 600。
- 数字与金额用 `tabular-nums`。
- 行高：正文 1.5-1.6，标题 1.3。

## 6. 间距规则

- 一律使用 8pt 体系：4/8/12/16/20/24/32/40（token：`--space-1` 至 `--space-10`）。
- 患者端页面 padding 16px、卡片间距 12px、区块间距 24px。
- 后台内容 padding 24px、卡片间距 16px、区块间距 32px。

## 7. 组件规则

### 7.1 按钮

- 移动端高度 ≥44px；后台 ≥40px（表格内小按钮可 32px）。
- 主按钮：蓝底白字、圆角 10px、hover 变 `--accent-light` + 蓝影、按下 `scale(0.98)` 150ms。
- 次按钮：透明 + 描边；危险：红底；AI 入口：琥珀底（仅首页双入口）。
- 禁用：`opacity .55` + `not-allowed`。
- transition 只写 `background-color, border-color, box-shadow, transform`。

### 7.2 输入框

- 高 44px（移动）/38px（后台），圆角 8px。
- focus：主色边框 + `0 0 0 3px rgba(59,108,181,0.12)` 光环。
- 错误态：红框 + 下方 12px 错误文案；成功态：右侧对勾。
- 时间选择用 Chip：`尽快` / `1-3 天` / `一周内`，选中 = 主色底白字。

### 7.3 卡片

- 圆角 12px、白底、`--shadow-sm`；hover（后台）`translateY(-1px)` + `--shadow-md` 200ms。
- 浅灰背景上的卡片用阴影，白色背景上的分区用 hairline 边框。
- 可点卡片按压：`scale(0.98)` 150ms。

### 7.4 导航

- 患者端 TabBar 56px + safe-area；二级页统一返回（44px 热区）+ 衬线主标题。
- 后台侧栏 240px（折叠 64px），顶栏 60px。

## 8. 动效规则

### 8.1 Token

```
--dur-fast: 150ms; --dur-base: 225ms; --dur-slow: 350ms;
--ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
```

### 8.2 允许的动效清单

- 页面进入：fade + translateX(16px)→0，350ms ease-out；返回反向。
- 底部抽屉：mask fade 180ms + 面板上滑 280ms ease-out。
- 弹窗：fade + scale(0.96)→1，200ms ease-out。
- 按压反馈：scale(0.98)，150ms。
- 状态更新：600ms 主色高亮闪过。
- 加载：骨架 shimmer（1200ms 循环，透明度 0.5-1）或 12px spinner。

### 8.3 禁止

- `transition: all`；`linear` 缓动；装饰性动画；高频交互位移（Tab 切换、输入只做淡变）。
- 忘记 `prefers-reduced-motion: reduce`：必须全局生效，reduce 时所有动画归零、仅保留 crossfade（参照 workflow.css:675，需推广到全站）。

## 9. 玻璃材质（Liquid Glass 克制版）

**全站只允许 4 处**：患者端底部 TabBar、后台顶栏、弹窗/抽屉遮罩、悬浮操作区。

```css
.glass-bar {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}
@supports not (backdrop-filter: blur(1px)) {
  .glass-bar { background: #ffffff; }
}
```

玻璃上不放正文；玻璃容器内部内容不透明或高对比。

## 10. 逐页面执行依据

按 `UI_OPTIMIZATION_ROADMAP.md` 的批次执行：

1. 全局地基：token、`--warm` 修复、transition 收敛、reduced-motion 全局化、按钮/输入统一。
2. 核心流程页：首页（双入口保留强化、四服务两排、医院介绍卡）、二级目录、预约填写页（移除陪诊师选择、Chip 时间、诊前咨询）、我的订单（状态时间线、匹配后显示陪诊师）。
3. 后台主链路：运营工作台、需求处理、陪诊师管理。
4. 体验打磨：AI 咨询、用户中心、其余后台页。

**产品流程红线（不得破坏）**：

- "人工下单 / AI下单"入口必须保留在首页。
- 预约流程 = 患者填信息 → 提交 → 后台匹配陪诊师 → 患者查看；**患者侧无陪诊师选择**。
- 陪诊师信息（姓名/电话/简介）只在订单匹配成功后对患者可见。

## 11. 改动完成后的自检清单

- [ ] 没有新增/修改任何品牌色值。
- [ ] 没有硬编码颜色（除 `rgba(255,255,255,...)` 玻璃底与遮罩）。
- [ ] 移动端所有可点目标 ≥44×44px。
- [ ] 无 `transition: all`、无 `linear`。
- [ ] `prefers-reduced-motion` 全局生效。
- [ ] 衬线标题每页 ≤2 处。
- [ ] 间距符合 8pt 体系。
- [ ] 玻璃材质只出现在允许的 4 处且有 `@supports` 降级。
- [ ] 预约流程没有出现"陪诊师选择"步骤。
- [ ] 已复用现有组件类而非复制粘贴样式。
- [ ] 修改后手动检查桌面（手机壳/后台）与 ≤768px 两种形态。

## 12. 禁止事项（违反即返工）

1. **禁止改变品牌主色** #3b6cb5 / #2c5a9e / #c4922e / slate 灰阶，禁止大面积替换颜色。
2. **禁止随意添加渐变**（唯一例外：品牌区或 AI 入口若已存在渐变则保留原样，禁止新增）。
3. **禁止滥用玻璃效果**：只允许第 9 节 4 处；禁止页面整底/卡片/表格玻璃化。
4. **禁止复制 Apple 官网或 iOS 系统界面**（禁止整屏大图留白营销页、禁止 iOS 设置列表式全屏分组）。
5. **禁止夸张动画**：禁止弹跳、旋转、霓虹、长时动画；动效必须有目的且 ≤350ms。
6. **禁止降低医疗产品可信感**：禁止不严肃的插画风、花哨装饰、低对比正文、抖动/闪烁效果。
7. **禁止 `transition: all` 与硬编码颜色**。
8. **禁止删除或弱化** 首页"人工下单/AI下单"入口与医院介绍区。
9. **禁止在患者端任何流程中加入陪诊师选择**。
10. **禁止凭感觉模仿 Apple**：一切 Apple 相关设计依据以 APPLE_DESIGN_REFERENCE.md 中的官方来源为准。

---

## 附：文档关系

| 文档 | 作用 |
| --- | --- |
| CURRENT_UI_ANALYSIS.md | 现状与问题清单（只读参考） |
| APPLE_DESIGN_REFERENCE.md | Apple 官方依据（只读参考） |
| UI_DESIGN_SYSTEM.md | 设计系统定义（唯一规范） |
| UI_OPTIMIZATION_ROADMAP.md | 逐页优化任务书（执行顺序） |
| 本文件 | 执行规则 + 禁止事项（动手前必读） |
