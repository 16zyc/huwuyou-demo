# 护无忧 UI 设计系统

> 本文件是未来所有前端改动的**唯一 UI 规范来源**（与 FINAL_UI_GUIDELINE_FOR_CLAUDE.md 配合使用：本文件给"定义"，最终规范给"执行规则"）。
> 原则：保留现有品牌视觉基因，吸收 Apple Design Language 的清晰、层级、深度与动效质感，融合医疗可信感。
> 生成时间：2026-08-08

## 1. 总体设计方向

```
Apple Design Language（清晰/顺从/深度/克制动效）
        +
医疗服务温暖感（衬线标题/蓝灰配色/信任感）
        +
当前品牌视觉（#3b6cb5 蓝 / #c4922e 琥珀 / slate 灰阶）
        =
「护无忧」统一设计语言
```

三条铁律：

1. **品牌色不变**：#3b6cb5 主蓝、#2c5a9e 深蓝、#c4922e 琥珀、slate 中性灰，全部保留。
2. **细节决定高级感**：优化间距节奏、阴影层次、字号阶梯、按压反馈，而非换风格。
3. **医疗可信优先**：任何"好看"都不能损害信息可读性与可信度。

---

## 2. 颜色规范

### 2.1 品牌色（禁止修改）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--accent` | `#3b6cb5` | 主色：主按钮、选中态、链接、强调 |
| `--accent-light` | `#4a7cbe` | 主色亮阶：hover |
| `--accent-deep` | `#2c5a9e` | 主色深阶：按压态、深色背景上的文字 |
| `--accent-amber` | `#c4922e` | 琥珀：AI/人工差异化入口、暖色强调 |
| `--accent-amber-light` | `#d4a843` | 琥珀亮阶：hover |

### 2.2 中性色与背景

| Token | 值 | 用途 |
| --- | --- | --- |
| `--bg-primary` | `#f5f7fa` | 页面底色 |
| `--bg-secondary` | `#ffffff` | 卡片/浮层 |
| `--bg-tertiary` | `#eef1f6` | 次级背景、禁用底 |
| `--bg-hover` | `#f0f3f8` | hover 底色 |
| `--border-color` | `#e2e8f0` | 默认描边（浅） |
| `--border-light` | `#cbd5e1` | 强调描边（深） |

### 2.3 文本

| Token | 值 | 用途 | 对比度（白底） |
| --- | --- | --- | --- |
| `--text-primary` | `#1e293b` | 正文/标题 | 高（≥12:1） |
| `--text-secondary` | `#475569` | 次级说明 | 高（≈7:1） |
| `--text-tertiary`（新增） | `#64748b` | 低强调但需可读的文本 | 中（≈4.8:1） |
| `--text-muted` | `#94a3b8` | **仅**占位符/禁用态 | 低（≈2.9:1，禁止用于正文） |

> 修复项：`--text-muted` 从"到处用"收敛为"占位符/禁用专用"；正文降级一律用 `--text-tertiary`。

### 2.4 状态色

| Token | 值 | 用途 |
| --- | --- | --- |
| `--status-success` | `#16a34a` | 成功/已完成（兼容现有 `--status-covered`） |
| `--status-warning` | `#ca8a04` | 警告/部分完成（兼容现有 `--status-partial`） |
| `--status-error` | `#dc2626` | 错误/失败（兼容现有 `--status-notfound`） |
| `--status-pending` | `#94a3b8` | 待处理 |
| `--status-info` | `#ea580c` | 橙色强调/已派单（兼容现有 `--status-qualified`） |

状态徽章统一公式：**8% 同色底 + 20% 同色边框 + 同色文字 + 圆角 6px + 字号 11-12px**（与现状一致，仅统一圆角与字号）。

### 2.5 Bug 修复项

- 新增 `--warm: #c4922e`（与 `--accent-amber` 同值）修复 `.tag-orange`（style.css:202），或直接把该处改为 `var(--accent-amber)`。
- 后续新代码禁止硬编码颜色，一律走以上 token。

---

## 3. 字体规范

### 3.1 字体族

- 正文/控件：`'Noto Sans SC', -apple-system, "PingFang SC", "Microsoft YaHei", BlinkMacSystemFont, sans-serif`（不变）。
- 标题：`'Noto Serif SC', "PingFang SC", "Songti SC", serif`（不变），但**仅用于页面主标题与品牌展示**。

### 3.2 字号阶梯（Type Scale）

**患者端（移动，基础 15px）**

| 层级 | 字号 | 字重 | 用途 |
| --- | --- | --- | --- |
| Display | 24px | 700 衬线 | 首页品牌区/大标题 |
| H1 | 20px | 700 衬线 | 页面主标题 |
| H2 | 17px | 600 | 区块标题（无衬线） |
| H3 | 15px | 600 | 卡片标题 |
| Body | 15px | 400 | 正文 |
| Caption | 13px | 400 | 辅助说明 |
| Aux | 12px | 400 | 时间戳/标签补充 |
| Micro | 11px | 500 | 徽章/角标 |

**管理后台（桌面，基础 14px）**

| 层级 | 字号 | 字重 | 用途 |
| --- | --- | --- | --- |
| PageTitle | 20px | 700 衬线 | 页面主标题 |
| Section | 16px | 600 | 区块标题 |
| Body | 14px | 400 | 正文/表格 |
| Secondary | 13px | 400 | 辅助说明 |
| Caption | 12px | 400 | 表头/元信息 |

### 3.3 规则

- 行高：正文 1.5-1.6，标题 1.3。
- 数字（金额、统计、电话）：`font-variant-numeric: tabular-nums` 等宽数字，表格对齐。
- 行内不允许 10px 以下文字。
- 衬线标题使用规则：**一个页面最多 2 个衬线标题**（页面主标题 + 品牌区），其余标题用无衬线。

---

## 4. 间距系统

### 4.1 Token（4pt 基准）

| Token | 值 | 用途 |
| --- | --- | --- |
| `--space-1` | 4px | 图标与文字间隙 |
| `--space-2` | 8px | 控件内边距、标签间距 |
| `--space-3` | 12px | 卡片内元素间距 |
| `--space-4` | 16px | 患者端页面 padding、卡片 padding |
| `--space-5` | 20px | 区块内标题与内容间距 |
| `--space-6` | 24px | 后台内容 padding、区块间距 |
| `--space-8` | 32px | 页面大区块间距 |
| `--space-10` | 40px | 手机壳内顶级区块间距 |

### 4.2 页面规范

**患者端**

- 页面左右 padding：16px。
- 卡片间距：12px。
- 区块间距：24px。
- 卡片内部 padding：16px。
- 底部操作区：内容 16px + safe-area。

**管理后台**

- 内容区 padding：24px。
- 卡片间距：16px。
- 区块间距：32px。
- 表格单元格 padding：垂直 12px、水平 16px。

---

## 5. 按钮系统

### 5.1 层级

| 类型 | 用途 | 视觉 |
| --- | --- | --- |
| 主按钮 `.btn-primary` | 唯一强操作 | 蓝底白字 |
| 次按钮 `.btn-outline` | 次级操作 | 透明底 + 描边 |
| 三级按钮 `.btn-link` | 页面内链接式操作 | 蓝字 |
| 危险按钮 `.btn-danger` | 删除/不可逆 | 红底白字 |
| 琥珀按钮 `.btn-amber` | AI 入口差异化 | 琥珀底白字（仅首页入口使用） |

### 5.2 尺寸

| 尺寸 | 高度 | 内边距 | 字号 | 用途 |
| --- | --- | --- | --- | --- |
| Large | 48px | 16px 24px | 16px | 底部主操作 |
| Default | 44px | 10px 16px | 15px | 常规按钮（移动） |
| Medium | 40px | 8px 16px | 14px | 后台常规按钮 |
| Small | 32px | 4px 12px | 13px | 后台表格内按钮（桌面专用） |
| Icon | 44×44px 热区 | 图标 20px | — | 图标按钮（热区含透明边距） |

> 规则：**移动端任何可点目标视觉高度 ≥44px**；小尺寸按钮仅在后台桌面端允许。

### 5.3 状态与动效

- hover：主色变 `--accent-light` + 阴影 `0 2px 8px rgba(59,108,181,0.3)`。
- active/pressed：`scale(0.98)` + 背景加深（主按钮用 `--accent-deep`），150ms。
- disabled：`opacity: 0.55` + `cursor: not-allowed`，无阴影、无 hover 变化。
- loading：按钮内 spinner（12px 圆环，600ms 旋转）+ 禁用点击。
- 圆角：按钮 10px（原 8px 微调）；Large 12px。
- transition 只写 `background-color, border-color, box-shadow, transform`，禁止 `all`。

---

## 6. 卡片系统

### 6.1 通用原则

卡片 = **层级容器**，用阴影而非描边表达浮起；白色背景上用浅描边，浅灰背景上用阴影。

### 6.2 卡片类型

| 类型 | 圆角 | 背景 | 阴影 | 描边 | 用途 |
| --- | --- | --- | --- | --- | --- |
| 服务卡片 | 12px | 白 | sm | 无 | 服务入口（患者端 2 列网格） |
| 信息卡片 | 12px | 白 | sm | 可选 hairline | 预约表单分区、说明区 |
| 订单卡片 | 12px | 白 | sm | 无 | 订单列表（状态徽章+时间线） |
| 统计卡片 | 12px | 白 | sm | 无 | 后台 KPI |
| 状态卡片 | 12px | 白 | md | 无 | 高亮/待办提醒 |
| 列表行 | 8px | 白 | 无 | 1px hairline | 后台表格/列表 |

阴影规范：

```
--shadow-sm: 0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.05);
--shadow-md: 0 2px 4px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.08);
--shadow-lg: 0 4px 8px rgba(15,23,42,0.06), 0 16px 40px rgba(15,23,42,0.12);
```

### 6.3 交互反馈

- 可点卡片 hover（后台）：`translateY(-1px)` + `--shadow-md`，200ms。
- 可点卡片 pressed（移动）：`scale(0.98)` + 阴影减弱，150ms。
- 后台表格行 hover：`background: var(--bg-hover)`。

---

## 7. 表单与输入

### 7.1 输入框

- 高度 44px（移动）/ 38px（后台）。
- 背景白、圆角 8px、1px `--border-color`。
- focus：`border-color: var(--accent)` + `box-shadow: 0 0 0 3px rgba(59,108,181,0.12)`（现有 2px 环升级为 3px 更清晰）。
- placeholder：`--text-muted`，12px。

### 7.2 状态

| 状态 | 边框 | 附加 |
| --- | --- | --- |
| 正常 | `--border-color` | — |
| 聚焦 | 主色 + 3px 光环 | — |
| 错误 | `--status-error` | 下方 12px 错误文案（红），图标可选 |
| 成功 | `--status-success` | 右侧对勾图标 |
| 禁用 | `--bg-tertiary` 底 + `--text-muted` | `cursor: not-allowed` |

### 7.3 选择器与日期

- **日期/时间选择器一律用 Chip 组（分段选择）**：`尽快` / `1-3 天` / `一周内`，选中态 = 主色底白字（或 8% 主色底 + 主色描边 + 主色字）。
- 下拉选择：自定义 chevron（`background-image` SVG），focus 同输入框。
- 勾选框/单选：自定义样式，选中主色，热区 44px。

### 7.4 表单结构

- 表单按语义分组为信息卡片，每组卡片标题 15px/600。
- 必填项 `*` 用主色标注，整组校验在提交时统一提示（顶部错误条 + 字段级红框）。
- 底部主操作固定（页面滚动时吸附底部，含 safe-area）。

---

## 8. 导航与页面结构

### 8.1 患者端

- 底部 TabBar：高 56px + safe-area，图标 22px + 标签 11px；选中态主色，未选中 `--text-tertiary`；背景可做毛玻璃（见第 10 节）。
- 页面转场：前进 = 右侧滑入 + 淡入（350ms）；返回 = 反向（350ms）；Tab 切换 = 仅淡入（200ms）。
- 二级页统一：顶部返回按钮（44px 热区）+ 页面主标题（衬线 20px）+ 内容。

### 8.2 管理后台

- 侧栏 240px（折叠态 64px 只显图标），一级导航；当前项主色 8% 底 + 主色字 + 4px 左侧指示条。
- 顶栏 60px：毛玻璃 + 当前模块名 + 全局操作（搜索/通知/用户）。
- 内容区：页头（标题 + 说明 + 右侧主操作）→ 筛选条 → 卡片/表格。
- 弹窗：居中卡片（max-width 720px，圆角 16px，`--shadow-lg`），遮罩 `rgba(15,23,42,0.45)`。

---

## 9. 动画规范（Apple Motion）

### 9.1 Token

```
--dur-fast: 150ms;   /* 按压/悬停/输入反馈 */
--dur-base: 225ms;   /* 状态切换/淡入 */
--dur-slow: 350ms;   /* 页面转场/抽屉 */
--ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* 入场/浮起 */
```

### 9.2 动效清单

| 场景 | 动画 | 时长/曲线 |
| --- | --- | --- |
| 页面进入 | opacity 0→1 + translateX(16px)→0 | 350ms / ease-out |
| 页面返回 | 反向 translateX | 350ms / ease-out |
| 底部抽屉 | mask fade + translateY(40px)→0 | mask 180ms / panel 280ms / ease-out |
| 弹窗出现 | mask fade + scale(0.96)→1 | 200ms / ease-out |
| 按钮按压 | scale(1)→0.98 | 150ms / standard |
| 卡片 hover（后台） | translateY(-1px) + shadow | 200ms / standard |
| 状态徽章切换 | 背景淡变 | 200ms / standard |
| 加载骨架 | 浅灰 shimmer 扫光 | 1200ms 循环，透明度 0.5-1 |
| 订单状态更新 | 高亮闪一下（accent-bg→透明） | 600ms / standard |

### 9.3 规则

1. **动效必须有目的**：引导注意力、表达层级、反馈状态；禁止装饰性动画。
2. **高频交互不位移**：Tab 切换、输入、勾选只做淡变/颜色。
3. **reduced-motion**：`prefers-reduced-motion: reduce` 时所有动画时长归零，保留 crossfade；该规则需覆盖全站（当前仅 workflow.css:675 有）。
4. 禁止 `transition: all`；禁止 `linear` 缓动。

---

## 10. 材质（Liquid Glass 克制版）

### 10.1 允许场景（全站仅这 4 处）

1. 患者端底部 TabBar：`backdrop-filter: blur(20px) saturate(180%)` + `rgba(255,255,255,0.78)`。
2. 后台顶栏：同上。
3. 弹窗/抽屉遮罩：`rgba(15,23,42,0.45)`，可选 `blur(4px)`。
4. 后台侧栏（折叠态可省略）。

### 10.2 禁止场景

- 页面整底玻璃化；卡片透明；表格透明；玻璃上直接放正文。
- 模糊半径 >20px；透明度 <0.72。

### 10.3 工程要求

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

---

## 11. 响应式规范

| 断点 | 行为 |
| --- | --- |
| >1024px | 后台完整布局；统计卡 2-4 列 |
| 769-1024px | 统计卡折一列；表格横向滚动容器 |
| 769-1024px（患者端） | 手机壳宽度不变，内容加宽至 420px 上限 |
| ≤768px | 患者端全宽；后台侧栏变抽屉 |
| ≤374px | 字号降 1px、两列服务卡保持 2 列但内边距收窄 |

平板（768-1024px）专项：后台侧栏可默认折叠为 64px 图标栏，表格启用横向滚动。

---

## 12. 工程实现清单（交给开发的最小改动集）

### 12.1 CSS 变量新增/修正（style.css:root）

```css
:root {
  /* 修复 */
  --warm: #c4922e;
  /* 新增文本层 */
  --text-tertiary: #64748b;
  /* 间距 */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  /* 阴影升级 */
  --shadow-sm: 0 1px 2px rgba(15,23,42,0.04), 0 2px 8px rgba(15,23,42,0.05);
  --shadow-md: 0 2px 4px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.08);
  --shadow-lg: 0 4px 8px rgba(15,23,42,0.06), 0 16px 40px rgba(15,23,42,0.12);
  /* 圆角分级 */
  --radius-xs: 6px; --radius-sm: 8px; --radius-md: 10px;
  --radius-lg: 12px; --radius-xl: 16px; --radius-xxl: 24px;
  /* 动效 */
  --dur-fast: 150ms; --dur-base: 225ms; --dur-slow: 350ms;
  --ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  /* 毛玻璃 */
  --glass-bg: rgba(255,255,255,0.78);
}
```

### 12.2 需要建立的公共类

- `.btn-primary/.btn-amber/.btn-outline/.btn-link/.btn-danger`（统一 44px 高）
- `.input-error/.input-success`
- `.chip/.chip-active`（时间选择）
- `.glass-bar`
- `.card-press`（移动端按压缩放）
- `.skeleton`（骨架屏）
- `.status-badge`（统一徽章）
- `.page-enter/.page-enter-back`（转场类）

### 12.3 需全局收敛的存量问题

1. 修复 `--warm`。
2. `transition: all` → 指定属性。
3. 硬编码颜色 → token（分批，不影响视觉）。
4. `prefers-reduced-motion` 从 workflow.css 复制到全局。
5. 移动端可点目标 <44px 的补齐热区。
