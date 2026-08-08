# Apple Design Language 研究参考

> 本文件为 UI/UX 架构依据，所有结论均来自 Apple 官方资料（Human Interface Guidelines、Developer Documentation、WWDC 视频），并附来源链接。
> 用途：为「护无忧」医疗陪诊平台提供 Apple Design Language 的融合依据，**不是**要求复刻 Apple 官网或 iOS 系统界面。
> 生成时间：2026-08-08

## 0. 研究范围与方法

- 研究对象：iOS / iPadOS、visionOS（Liquid Glass）、macOS 三大平台设计语言。
- 资料来源：Apple Developer 官网（HIG、设计原则、动效、按钮、布局、材质章节）、Apple 开发者文档（Liquid Glass 技术总览）、WWDC25 官方视频、Apple 字体官方页。
- 引用方式：每一条结论标注官方原文或出处 URL。

---

## 1. Apple 核心设计原则

### 1.1 官方定义

Apple Human Interface Guidelines 的 Design Principles 页面（https://developer.apple.com/design/human-interface-guidelines/design-principles）阐述现代设计原则：**Purpose（目的性）——设计始于意图**，每个界面决策都应服务于功能与用户任务。

iOS 自诞生起确立的三大经典原则（同一官方体系）：

1. **Clarity（清晰）**：文字清晰易读、图标精确、装饰克制、以内容优先。
2. **Deference（顺从）**：界面让位于内容，用留白、颜色、字体层级引导注意力，而非用框线装饰。
3. **Depth（深度）**：用层级、动效、半透明材质建立空间关系，让内容有"前后"秩序，帮助用户理解当前位置。

### 1.2 对照本项目

| Apple 原则 | 本项目现状 | 融合方式 |
| --- | --- | --- |
| 清晰 Clarity | 文案层级基本清晰，但字号无阶梯 | 建立字号 scale；正文 15px、辅助 13px；关键数字用大字号强调 |
| 顺从 Deference | 卡片用"边框+浅影"双层描边，视觉噪音偏多 | 减框线、加留白，用阴影与字号层级代替描边 |
| 深度 Depth | 只有 fade-in，无层级转场 | 页面推入/返回、按压反馈、底部抽屉分层 |
| 目的性 Purpose | 部分装饰性元素无功能含义 | 任何动效/玻璃/颜色变化必须有明确用途 |

---

## 2. 清晰：字体的官方基准

### 2.1 官方资料

- Apple 字体官方页（https://developer.apple.com/fonts/）：SF Pro 提供 9 个字重，支持可变光学字号（optical size 随字号自动调整），覆盖 144+ 语言。
- SF Pro Text 用于 20pt 以下正文，SF Pro Display 用于 20pt 以上大标题（Apple 官方排版体系）。
- 系统默认正文字号 17pt；可读正文建议不小于 11pt；行高约 1.3 倍；每行 35-50 字符；正文对比度不低于 4.5:1（WCAG AA）。

### 2.2 本项目应用

- 项目保留 `Noto Sans SC` / `Noto Serif SC`（中文字体，不引入 SF Pro 作为正文——SF Pro 不覆盖中文）。
- 借鉴"光学字号"思想：**大标题用衬线 + 粗字重（品牌特征），正文用无衬线 + 常规字重**，形成"标题识别 + 正文易读"的双轨。
- 正文 14px 提升至 15px（患者端），后台保持 14px 密度；禁用 10px 以下正文。
- 所有正文颜色保证 4.5:1 对比度，`--text-muted` 只用于占位符与禁用态。

---

## 3. 顺从：布局与留白的官方基准

### 3.1 官方资料

- HIG Layout（https://developer.apple.com/design/human-interface-guidelines/layout）：同一行最多容纳 2-3 个控件；可点击目标中心间距建议 ≥60pt（避免误触）。
- HIG Spatial Layout（空间布局章节）：按钮之间的最小间距 16pt。
- 8pt 网格：Apple Design Resources / Figma 模板的惯例（间距、控件尺寸均落在 8 的倍数上），配合 HIG 布局规则使用。

### 3.2 本项目应用

- 建立 4pt 基准间距体系：4/8/12/16/20/24/32/40，页面节奏全部对齐。
- 患者端页面左右 padding 16px、卡片间距 12px、区块间距 24px。
- 后台内容区 padding 24px、卡片间距 16px、区块间距 32px。
- 可点目标中心间距 ≥ 44px，按钮/输入高度统一 44px（触控目标下限，见第 5 节）。

---

## 4. 深度：材质、阴影与半透明的官方基准

### 4.1 官方资料

- HIG Materials（https://developer.apple.com/design/human-interface-guidelines/materials）：
  - "Prefer translucency to opaque colors in windows"（窗口材质优先半透明而非纯色）。
  - 厚材质（thick material）对比度更好，适合承载大量文本。
  - Vibrancy（活力色）慎用于自定义视图，可能干扰可读性。
- 深度层次：iOS 通过**阴影 + 材质模糊 + 层级动效**表达"浮起"的控件（如弹窗、抽屉、工具栏）。

### 4.2 Liquid Glass（visionOS / iOS 26 / macOS 26 统一材质）

- Apple 官方技术总览（https://developer.apple.com/documentation/technologyoverviews/liquid-glass）：
  - Liquid Glass 是一种动态材质，"combines the optical properties of glass with a sense of fluidity"（结合玻璃光学特性与流动感）。
- WWDC25 官方视频 "Meet Liquid Glass"（https://developer.apple.com/videos/play/wwdc2025/219/，2025-06-08）：
  - Liquid Glass 作为 iOS 26、macOS 26 等平台统一设计语言的核心，能"动态弯曲并重塑光线，如轻质液体般有机灵动"，让内容与界面交融。
- 业界确认（Times of India 2025-06-08 报道 iOS 26 引入全新 "clear look" 设计；AppleInsider 2026-03 报道 Liquid Glass 在后续版本持续迭代）。

### 4.3 本项目应用：克制使用 Liquid Glass 元素

**禁止**大面积玻璃化。医疗产品第一优先级是信息可信与可读。

**允许使用的 4 个场景**：

| 场景 | 实现建议 | 原因 |
| --- | --- | --- |
| 后台顶栏 | `backdrop-filter: blur(20px) saturate(180%)` + `rgba(255,255,255,0.72)` | 内容滚动时工具栏保持可读，有"浮起"感 |
| 患者端底部 TabBar | 同上（含 safe-area） | 滚动时内容从工具栏下穿过，建立深度 |
| 弹窗/抽屉遮罩层 | 遮罩可用 `rgba(15,23,42,0.45)` + 可选 blur(4px) | 强调层级关系 |
| 悬浮操作按钮区 | 半透明底 + 模糊 | 不遮挡内容 |

**禁止场景**：页面整底、所有卡片透明化、表格行透明、玻璃上直接放长文本。

**工程要求**：

- 必须写降级：`@supports not (backdrop-filter: blur(1px))` 时回退为不透明底色。
- 玻璃上不放正文；玻璃内部的内容容器必须不透明或高对比。
- 模糊半径不超过 20px，透明度不低于 0.72，保证文字底噪。

---

## 5. 控件：触控目标与按钮的官方基准

### 5.1 官方资料

- HIG 触控目标（Buttons 章节 / Game Controls / Design Tips）：iOS 最小触控目标 **44×44pt**。
- HIG Buttons（https://developer.apple.com/design/human-interface-guidelines/buttons）：
  - visionOS 按钮尺寸分级 28/32/44/52/64pt，按钮中心间距 ≥60pt。
  - 常用按钮应与上下文中其他按钮尺寸一致。

### 5.2 本项目应用

- 所有可点目标 ≥44×44pt（移动端）；后台桌面端 ≥36×36px 但保持 44px 主操作。
- 主按钮高度统一 44px；输入框高度统一 44px。
- 图标按钮热区 44×44px（图标本身 20-22px）。
- 底部主操作按钮全宽、贴底、含 safe-area padding。

---

## 6. 动效的官方基准

### 6.1 官方资料

HIG Motion（https://developer.apple.com/design/human-interface-guidelines/motion）官方原文要点：

- "Add motion purposefully, supporting the experience without overshadowing it. Don't add motion for the sake of adding motion."（动效应有目的，服务体验而不喧宾夺主；不为动而动。）
- "Aim for brevity and precision in feedback animations."（反馈动画要简短、精准。）
- "In apps, generally avoid adding motion to UI interactions that occur frequently."（高频交互避免动效。）
- "Let people cancel motion."（允许用户关闭动效——对应 `prefers-reduced-motion`，关闭时用 crossfade 替代位移。）

### 6.2 Apple 动效特征（官方体系观察）

- **连续性**：状态变化无缝衔接，无跳变。
- **自然缓动**：入场快、结尾慢（ease-out 风格），不使用线性运动。
- **时间短**：反馈动画 150-250ms 内完成；转场 300-350ms。
- **方向一致**：从右进入表示"前进"，返回时反向滑出（层级导航）。
- **物理感**：按压缩放、抽屉跟随手势、弹性回弹仅出现在系统级控件。

### 6.3 本项目应用

- 建立动效 token：150ms（按压/悬停）、225ms（状态切换/淡入）、350ms（页面转场/抽屉）。
- 缓动曲线：入场 `cubic-bezier(0.16, 1, 0.3, 1)`（快进缓出），常规 `cubic-bezier(0.25, 0.1, 0.25, 1)`。
- 页面前进：内容从右滑入 + 淡入；返回：反向（约 350ms）。
- 按钮按压：scale(0.98) + 150ms。
- 高频交互（输入、勾选、Tab 切换）：只做 150ms 内的轻反馈，不做位移动画。
- `prefers-reduced-motion: reduce` 时全部动画时长归零，只保留 crossfade（现有 workflow.css:675 已实现，需推广到 style.css 系）。

---

## 7. macOS 设计语言的参考

### 7.1 官方特征

- 信息密度高：macOS 允许更紧凑的列表与表格。
- 窗口层级：侧栏 + 内容 + 检查器的三栏结构；工具栏作为窗口级操作区。
- 控件一致性：所有控件遵循统一尺寸、圆角与材质（HIG 控件章节）。

### 7.2 本项目应用（管理后台）

- 后台采用"侧栏导航 + 顶栏 + 内容"结构，借鉴 macOS 的窗口层级：侧栏为一级导航，顶栏为全局操作，内容区为数据工作区。
- 表格/列表允许高密度（行高 44-52px），但关键状态用徽章与颜色区分。
- 数据统计使用卡片化数字 + 轻量图表，保持专业感，不做过度图形化。

---

## 8. 融合结论：本项目的"Apple 化"边界

### 8.1 借鉴（吸收）

1. 清晰的字号层级与留白节奏（8pt 网格）。
2. 以阴影和层级代替生硬描边的深度表达。
3. 44pt 触控目标与统一控件尺寸。
4. 简短、有目的、可关闭的动效。
5. 半透明材质只用于工具栏/浮层，并强制降级。
6. 后台的高信息密度与窗口式层级。

### 8.2 不借鉴（拒绝）

1. 不把页面做成 iOS 设置列表（大量内嵌分组表）。
2. 不照搬 Apple 官网的整屏大图留白营销风格——医疗场景信息效率优先。
3. 不引入 SF Pro 等西文字体体系替代中文字体。
4. 不做 Liquid Glass 全面玻璃化。
5. 不牺牲医疗产品的可信感去追求"酷"。

### 8.3 本项目的差异化定位

**"医疗可信感的 Apple 式精致"**：

- 蓝（#3b6cb5）= 信任与专业（保留）；
- 衬线标题 = 品牌温度（保留，但节制）；
- 浅灰底 + 白卡片 + 柔和阴影 = 清爽层级（微调）；
- 琥珀色 = 功能差异入口（AI/人工，保留）；
- 动效 = 安静、快速、可关闭（新建规范）。

---

## 附：主要官方来源清单

| 资料 | 链接 |
| --- | --- |
| Apple Human Interface Guidelines 总览 | https://developer.apple.com/design/human-interface-guidelines/ |
| Design Principles（设计原则） | https://developer.apple.com/design/human-interface-guidelines/design-principles |
| Motion（动效规范） | https://developer.apple.com/design/human-interface-guidelines/motion |
| Buttons（按钮规范） | https://developer.apple.com/design/human-interface-guidelines/buttons |
| Layout（布局规范） | https://developer.apple.com/design/human-interface-guidelines/layout |
| Materials（材质规范） | https://developer.apple.com/design/human-interface-guidelines/materials |
| Liquid Glass 技术总览 | https://developer.apple.com/documentation/technologyoverviews/liquid-glass |
| WWDC25 Meet Liquid Glass | https://developer.apple.com/videos/play/wwdc2025/219/ |
| Apple Fonts（字体体系） | https://developer.apple.com/fonts/ |
