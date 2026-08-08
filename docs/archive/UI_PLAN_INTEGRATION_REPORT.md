# UI 计划融合报告

> 版本：v1.0（2026-08-08）
> 说明：Codex UI 设计体系如何被融合到项目开发计划中的完整说明

---

## 1. Codex UI 设计中采用的内容

| # | Codex UI 设计内容 | 来源文档 | 融合位置 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | 7 项 CSS Token 新增（间距 10 个 + 阴影 3 个 + 圆角 6 个 + 动效 5 个 + 玻璃 + text-tertiary） | UI_DESIGN_SYSTEM §12.1 | Phase 0 全局地基 | ✅ 采用 |
| 2 | `--warm` 未定义 bug 修复 | CURRENT_UI_ANALYSIS §2.2 | Phase 0 全局地基 | ✅ 采用 |
| 3 | `transition: all` → 指定属性收敛 | CURRENT_UI_ANALYSIS §6.2 | Phase 0 全局地基 | ✅ 采用 |
| 4 | `prefers-reduced-motion` 从 workflow.css 推广到全站 | CURRENT_UI_ANALYSIS §6.1 | Phase 0 全局地基 | ✅ 采用 |
| 5 | 按钮/输入框高度统一 44px（移动端） | UI_DESIGN_SYSTEM §5.2/§7.1 | Phase 0 全局地基 | ✅ 采用 |
| 6 | 字体阶梯（Type Scale）——患者端 15px/后台 14px | UI_DESIGN_SYSTEM §3.2 | Phase 0 全局地基 | ✅ 采用 |
| 7 | 衬线标题节制规则（每页 ≤2 处） | UI_DESIGN_SYSTEM §3.3 | Phase 0 全局地基 | ✅ 采用 |
| 8 | 间距 8pt 体系 | UI_DESIGN_SYSTEM §4 | Phase 0 全局地基 | ✅ 采用 |
| 9 | 阴影升级（sm/md/lg 三层）替代生硬描边 | UI_DESIGN_SYSTEM §6.2 | Phase 0 全局地基 | ✅ 采用 |
| 10 | 动效 token 化（dur-fast/base/slow + ease-out/standard） | UI_DESIGN_SYSTEM §9.1 | Phase 0 全局地基 | ✅ 采用 |
| 11 | 按钮层级 5 类（primary/outline/link/danger/amber） | UI_DESIGN_SYSTEM §5.1 | Phase 0 全局地基 | ✅ 采用 |
| 12 | 表单错误态/成功态规范 | UI_DESIGN_SYSTEM §7.2 | Phase 0 全局地基 | ✅ 采用 |
| 13 | 卡片系统（6 种类型 + 阴影代替描边） | UI_DESIGN_SYSTEM §6 | Phase 0 全局地基 | ✅ 采用 |
| 14 | 首页双入口卡片（人工=蓝、AI=琥珀） | UI_OPTIMIZATION_ROADMAP §A1 | Phase 1 首页 | ✅ 采用 |
| 15 | 预约表单 Chip 时间选择（尽快/1-3天/一周内） | UI_OPTIMIZATION_ROADMAP §A3 | Phase 1 预约流程 | ✅ 采用（已存在于工作区代码） |
| 16 | 预约表单分区卡片（基本信息/就诊需求/诊前咨询） | UI_OPTIMIZATION_ROADMAP §A3 | Phase 1 预约流程 | ✅ 采用 |
| 17 | 订单步骤时间线可视化（5 步） | UI_OPTIMIZATION_ROADMAP §A4 | Phase 3 订单系统 | ✅ 采用 |
| 18 | 未匹配/已匹配陪诊师信息分级展示 | UI_OPTIMIZATION_ROADMAP §A4 | Phase 3 订单系统 | ✅ 采用 |
| 19 | 运营工作台 KPI 卡片升级（24px 等宽数字 + 环比） | UI_OPTIMIZATION_ROADMAP §B2 | Phase 4 管理后台 | ✅ 采用 |
| 20 | 需求处理派单界面优化（左患者+右陪诊师候选） | UI_OPTIMIZATION_ROADMAP §B4 | Phase 4 管理后台 | ✅ 采用 |
| 21 | Liquid Glass 仅 4 处（TabBar/顶栏/遮罩/悬浮）+ 降级 | APPLE_DESIGN_REFERENCE §4.3 | Phase 2 全局地基 | ✅ 采用 |
| 22 | 动效规范（1.目的性 2.高频不位移 3.reduced 4.禁 all 5.禁 linear） | APPLE_DESIGN_REFERENCE §6.3 | Phase 0 全局地基 | ✅ 采用 |
| 23 | 后台 macOS 式高信息密度布局 | APPLE_DESIGN_REFERENCE §7.2 | Phase 4 管理后台 | ✅ 采用 |
| 24 | `--text-muted` 收敛为仅占位/禁用；新增 `--text-tertiary` | CURRENT_UI_ANALYSIS §2.1 | Phase 0 全局地基 | ✅ 采用 |

---

## 2. Codex UI 设计中调整的内容

| # | Codex 原建议 | 调整后的方案 | 调整原因 |
| --- | --- | --- | --- |
| 1 | 首页双入口"两张大卡片并排各 50%" | 保持纵向布局（AI横幅在上 + 人工下单卡片在下） | 移动端 420px 宽度下并排卡片文字拥挤，纵向更符合手机阅读习惯 |
| 2 | 新增 `--status-success`/`--status-warning`/`--status-error` 语义命名 | 保留现有 `--status-covered`/`--status-partial`/`--status-notfound` 命名 | 兼容现有大量引用代码，避免大面积重命名导致回归 |
| 3 | 弹窗遮罩 `blur(4px)` | 去掉 blur，仅 `rgba(15,23,42,0.45)` 半透明 | 降低实现复杂度，性能更好；blur 在低端设备可能掉帧 |
| 4 | 区块依次淡入（间隔 40ms） | 不实施 | 属于装饰性动画，违反"动效必须有目的"原则 |
| 5 | `scale(0.96)→1` 弹窗出现 | 简化为 `fade` 弹窗出现（不缩放） | 缩放动画可能被感知为"跳动"，淡入更安静 |
| 6 | 骨架屏 shimmer 1200ms | 不实施（Phase 5 再评估） | 演示原型页面加载近乎即时，不需要骨架屏 |
| 7 | 患者端卡片 hover `translateY(-1px)` | 仅后台桌面端保留 hover 效果 | 移动端无 hover 概念 |
| 8 | 后台侧栏折叠态 64px 毛玻璃 | 折叠态省略玻璃，仅展开态顶栏使用 | 简化实现 |

---

## 3. Codex UI 设计中拒绝的内容

| # | Codex 建议 | 拒绝原因 |
| --- | --- | --- |
| 1 | SF Pro 西文字体体系 | 项目以中文为主，Noto Sans/Serif SC 已满足需求 |
| 2 | iOS 设置列表式全屏分组 | 产品定位为医疗服务平台，非 iOS 系统设置 |
| 3 | 整屏大图留白营销风格 | 医疗场景信息效率优先，不需要 Apple 官网式营销页 |
| 4 | 全面 Liquid Glass 玻璃化 | 明确违反医疗可信原则，且 APPLE_DESIGN_REFERENCE 也明确拒绝 |
| 5 | 弹性回弹动画（spring） | Apple 官方建议弹性仅用于系统级控件，应用级控件不应使用 |

---

## 4. 最终开发路线（融合后）

### Phase 0：项目基础规范 + UI 地基

**业务范围**：Git 基线建立 + 文档更新
**UI 范围**：CSS Token 体系建立 + 全局样式收敛

| 类型 | 内容 |
| --- | --- |
| 功能 | 提交工作区改版、更新 README、建立冒烟清单 |
| UI 地基 | ① 新增/修复 CSS 变量（间距/阴影/圆角/动效/玻璃/text-tertiary）② 修复 `--warm` bug ③ 全局 `transition: all` → 指定属性 ④ `prefers-reduced-motion` 全局化 ⑤ 按钮/输入框高度统一 44px ⑥ 字体阶梯 + 衬线节制 |

### Phase 1：核心业务流程修复 + 首页 UI 优化

**业务范围**：REQ-01/02/04/05/07/08/11
**UI 范围**：首页 + 预约表单

| 类型 | 内容 |
| --- | --- |
| 功能 | ① 首页新增"人工下单"入口 ② `_submitBooking` 状态改为`待处理`、去自动派单、价格统一 PriceTable ③ 补全患者信息字段 ④ 修复 undefined 方法 ⑤ 收敛 `已对接` 状态 |
| UI 优化 | ① 首页双入口卡片（人工蓝+AI琥珀）② 预约表单分区卡片（基本信息/就诊需求/诊前咨询+辅助说明）③ Chip 时间选择强化 ④ 表单校验 feedback（错误态红框+顶部错误条+提交成功反馈）⑤ 按钮 loading spinner |

### Phase 2：预约系统完善 + 交互体验提升

**业务范围**：REQ-01/03/09（草稿共享、诊前咨询、医院申请、页面导航）
**UI 范围**：页面转场 + 玻璃材质 + 二级页面规范

| 类型 | 内容 |
| --- | --- |
| 功能 | ① 接线 workflow 患者页（renderNeed/renderProgress/renderHospitals）② 实现页面栈导航 ③ 人工/AI 共享草稿 ④ 诊前咨询问卷落地 ⑤ 医院申请闭环 |
| UI 优化 | ① 页面转场动画（推入/返回 350ms ease-out）② Liquid Glass TabBar + 后台顶栏（含 `@supports` 降级）③ 二级页统一规范（44px 热区返回+衬线主标题）④ AI 面板玻璃质感 |

### Phase 3：订单系统完善 + 状态可视化

**业务范围**：REQ-06/11/12（状态机收敛、订单详情/报告/评价闭环、通知链路）
**UI 范围**：订单页面 + AI 聊天

| 类型 | 内容 |
| --- | --- |
| 功能 | ① 状态流转全收敛 ② 陪诊报告查看入口 ③ 患者评价（星级+标签+文字）④ 后台评价数据联动 ⑤ 通知全链路验证 |
| UI 优化 | ① 订单步骤时间线（5 步可视化）② 陪诊师信息分级展示（未匹配/已匹配）③ 状态变化高亮反馈（600ms 主色闪过）④ AI 聊天气泡质感（主蓝用户+白底 AI+毛玻璃输入栏） |

### Phase 4：管理后台建设 + 专业化体验

**业务范围**：REQ-10（信息发布、实时统计、派单体验、死代码清理）
**UI 范围**：后台全面 UI 升级

| 类型 | 内容 |
| --- | --- |
| 功能 | ① 公告系统（管理端编辑+患者端展示）② KPI 实时统计 ③ 派单界面增强（患者情况+推荐匹配）④ 死代码清理 |
| UI 优化 | ① 工作台 KPI 卡升级（24px 等宽数字+环比标签+图标）② 需求处理"左患者+右候选"双栏布局 ③ 后台表格行 hover + 统一筛选条 ④ 弹窗层级规范（`--shadow-lg` + 16px 圆角）⑤ macOS 式高密度信息布局 |

### Phase 5：高级体验优化 + 工程化

**业务范围**：陪诊师 CRUD、数据迁移 v3、测试体系
**UI 范围**：微交互 + 性能 + 响应式补全

| 类型 | 内容 |
| --- | --- |
| 功能 | ① 陪诊师增删改查 ② Store v3 迁移（就诊人并入+公告+陪诊师持久化）③ 单元测试建立（状态机/价格表）④ 运营报表 |
| UI 优化 | ① 平板断点专项（768-1024px）② 极窄屏字号降级（≤374px）③ 数据导出 UI ④ 长列表性能（可选虚拟滚动） |

---

## 5. 当前最终开发路线总览

```
Phase 0: 基线 + UI 地基
  ├── CSS Token 体系
  ├── 全局样式收敛
  ├── 控件统一（44px）
  └── bug 修复

Phase 1: 核心流程 + 首页 UI
  ├── 双入口卡片
  ├── 预约表单重构
  ├── 状态机收敛
  └── Chip 时间选择

Phase 2: 预约系统 + 交互体验
  ├── 草稿共享
  ├── 页面转场
  ├── Liquid Glass
  └── 诊前咨询

Phase 3: 订单系统 + 状态可视
  ├── 订单时间线
  ├── 陪诊师分级展示
  ├── 评价闭环
  └── AI 聊天质感

Phase 4: 管理后台 + 专业体验
  ├── 公告系统
  ├── KPI 实时化
  ├── 派单双栏
  └── macOS 高密度

Phase 5: 工程化 + 打磨
  ├── 数据迁移 v3
  ├── 单元测试
  ├── 平板适配
  └── 微交互
```

---

## 附：文档体系关系

```
FINAL_UI_GUIDELINE_FOR_CLAUDE.md  ← 执行规范（开发时必读）
        ↕ 互相引用
UI_DESIGN_SYSTEM.md               ← 设计系统定义（唯一的 UI 规范来源）
        ↕ 依据
APPLE_DESIGN_REFERENCE.md         ← Apple 官方依据（只读参考）
        ↕ 分析
CURRENT_UI_ANALYSIS.md            ← 现状与问题（只读参考）
        ↕ 任务
UI_OPTIMIZATION_ROADMAP.md        ← 逐页优化任务书（实施顺序）
        ↕ 融合
UI_DESIGN_INTEGRATION_ANALYSIS.md ← 本报告的前置分析（设计→开发规则转换）
        ↕ 输出
UI_PLAN_INTEGRATION_REPORT.md     ← 本报告（最终融合说明）
        ↕ 指导
CLAUDE.md                         ← 最高工作规范（已更新 UI 开发规范章节）
IMPLEMENTATION_PLAN.md            ← 实施计划（功能层面）
```
