# 护无忧 · 智陪诊全链路平台

> 本文件是项目中所有 AI Agent 和开发者的**最高工作规范**。
> 优先级：本文件 > 需求文档 > 路线图 > 设计方案 > README > 其他历史文档。
> **代码实现永远优先于任何文档描述。**

---

## 项目简介

**护无忧 · 智陪诊全链路平台**是一个面向智能陪诊业务的**纯前端交互演示原型**。

| 属性 | 值 |
| --- | --- |
| 技术栈 | 原生 HTML5 / CSS3 / JavaScript（ES2020），零 npm 依赖，零构建 |
| 持久化 | 浏览器 LocalStorage（`huwuyou_store_v1` + `huwuyou_patients`） |
| 运行方式 | 任意静态 Web 服务器托管 |
| 代码规模 | `index.html` + 6 个 JS 文件（约 5,100 行）+ 2 个 CSS 文件（约 1,532 行） |
| 版本 | CareStore.version = 2；页面自称 v2.0 |
| 性质 | **演示原型，不可生产使用**（无后端、无认证、无安全、无测试） |

---

## 产品定位

为患者提供"在线提交陪诊需求 → 后台审核派单 → 查看进度与陪诊报告"的全流程数字化体验；为管理者提供订单管理、陪诊师配置、价格调整、医院维护、信息发布等运营工具。

**核心价值**：患者只需描述需求，不用自己选陪诊师；平台根据诊前咨询信息匹配最合适的陪诊师。

---

## 核心业务模型

### 核心实体

```
患者（Patient）──提交──→ 订单（Need）──分配──→ 陪诊师（Escort）
                              │
                              ├── 价格快照（serviceSnapshot）
                              ├── 患者信息快照
                              ├── 身份证资料（identity）
                              ├── 检查报告（reportImages）
                              └── 陪诊报告（EscortReport）
```

### 状态机（唯一合法流转）

```
待处理 ──→ 已分配 ──→ 服务中 ──→ 已完成
  │          │
  └──────────┴──→ 已取消
```

- **所有状态变更必须经 `CareStore.transitionNeed`**（`store.js:186-201`）
- 禁止跳级、禁止回退、禁止创建"已对接"状态
- 待处理/已分配 可取消；服务中/已完成 不可取消

---

## 用户角色

### 患者（Patient）

**能做的**：
- 浏览服务（首页 2×2 入口）、查看医院介绍
- 通过"人工下单"或"AI下单"提交陪诊需求
- 填写个人信息（姓名/性别/年龄/电话/病史/过敏/用药/行动能力/紧急联系人）
- 选择就诊时间范围（1-3天内 / 一周内 / 尽快）
- 查看订单进展（"我的"页面 / 订单 Tab）
- 订单匹配后查看陪诊师信息（姓名/电话/简介）
- 查看已发布的陪诊报告
- 管理就诊人信息
- 申请新增医院
- 接收状态变更通知

**不能做的**：
- **禁止浏览/选择陪诊师**（患者不参与陪诊师选择）
- **禁止查看未匹配订单的陪诊师信息**
- **禁止查看他人数据**
- **禁止自主推进订单状态**

### 管理者（Admin）

**能做的**：
- 查看全部订单与患者情况（诊前咨询信息）
- 审核订单、分配陪诊师（按患者情况匹配）
- 推进订单状态（待处理→已分配→服务中→已完成→发布报告）
- 维护陪诊师信息（姓名/电话/专长/状态）
- 管理医院资料与审批医院申请
- 调整服务价格（含变更记录）
- 发布公告/信息
- 查看运营统计
- 重置演示数据

**不能做的**：
- 以患者身份提交订单
- （演示阶段）查看真实敏感资料

### 陪诊师（Escort）

- **当前阶段无独立端/独立登录**
- 是后台可配置的**资源对象**（姓名/电话/专长/状态）
- 信息仅在订单匹配后对患者可见
- 未来可扩展为独立端

---

## 核心业务流程（目标）

```text
患者浏览服务（首页 2×2）
        ↓
选择服务 → 二级目录 → 立即预约
        ↓
填写患者信息 + 就诊信息（医院/科室/时间范围）
        ↓
提交订单 → 状态：待处理（无陪诊师信息！）
        ↓
"我的"查看进展（是否接单）
        ↓
后台管理员审核 → 按患者情况匹配陪诊师 → 状态：已分配 → 通知患者
        ↓
患者查看陪诊师信息（姓名/电话）
        ↓
服务开始（服务中）→ 服务完成（已完成）
        ↓
管理员发布陪诊报告 → 患者查看 → 评价
```

### 关键业务规则

**陪诊师隐私规则**：
- 患者提交订单前：不可查看任何陪诊师信息
- 管理员完成匹配后：开放必要信息（姓名/电话/简介）
- 禁止患者自主选择陪诊师

**预约规则**：
- 患者不选陪诊师，只提交需求
- 管理员根据诊前咨询信息匹配人员
- 提交后状态为"待处理"，不得携带陪诊师字段

**时间规则**：
- 使用范围表达：1-3天内 / 一周内 / 尽快
- 禁止固定日期选择（今天/明天/后天）

**价格规则**：
- 价格唯一来源：`PriceTable`（`CareStore.state.prices`）
- 提交时生成价格快照（`serviceSnapshot`），历史订单不受后续调价影响
- 禁止在页面硬编码价格

---

## 当前技术架构

### 脚本加载顺序（不可调整）

```
data.js → store.js → app.js → patient.js → admin.js → workflow.js
```

**`workflow.js` 是覆盖层**：通过直接替换前面模块的方法实现扩展。修改任何被覆盖的方法时，必须同时检查 workflow.js。

### 分层架构

```
┌─────────────────────────────────────┐
│ workflow.js  工作流覆盖层             │  ← 方法覆盖（AI面板/通知/后台/患者页）
├─────────────────────────────────────┤
│ patient.js   患者端页面              │  ← 首页/特色/订单/我的
│ admin.js     管理后台页面            │  ← 工作台/需求/陪诊师/医院/评价/系统
├─────────────────────────────────────┤
│ app.js       应用外壳               │  ← 登录/路由/手机壳/AI浮球/toast
├─────────────────────────────────────┤
│ store.js     统一状态层             │  ← CareStore + MediaService/OCR/AI
├─────────────────────────────────────┤
│ data.js      数据定义层             │  ← NeedPool/PriceTable/MockData/基础数据
└─────────────────────────────────────┘
         ↕
    LocalStorage (huwuyou_store_v1)
```

### 数据流

```
CareStore（唯一事实源，所有状态变更必须经过它）
  ├── state.draft           ← AI/人工共享草稿
  ├── state.needs[]         ← 所有订单（Need）
  ├── state.prices[]        ← 价格表（= PriceTable.items）
  ├── state.hospitals[]     ← 医院库（= MockData.hospitals）
  ├── state.hospitalApplications[] ← 医院申请
  ├── state.notifications[] ← 双角色通知
  ├── state.escortReports[] ← 陪诊报告
  ├── state.priceChanges[]  ← 价格变更记录
  └── state.ai              ← AI 对话状态
```

### 关键约束

1. **状态机唯一**：所有状态变更走 `CareStore.transitionNeed`
2. **价格唯一**：价格读 `PriceTable`（`CareStore.state.prices`）
3. **医院唯一**：医院读 `CareStore.state.hospitals`
4. **通知去重**：`recipientRole + type + targetId + eventKey`
5. **演示边界**：不录真实资料；不引入后端/依赖；不宣称生产能力

---

## 项目目录结构

```text
智能陪护-开发交接包-20260720/
├── index.html                        # 应用唯一入口 + 脚本加载顺序
├── CLAUDE.md                         # 本文件：AI Agent 最高工作规范
├── README.md                         # 项目说明（部分功能清单已过时）
├── agent.md                          # 工作规范（Codex 编写，本文件将替代）
├── PROJECT_ANALYSIS_REPORT.md        # Codex 完整代码分析（已验证准确）
├── PRODUCT_REQUIREMENTS_ANALYSIS.md  # 需求正式化（REQ-01~13）
├── REQUIREMENT_GAP_ANALYSIS.md       # 需求差距分析
├── DOCUMENT_REQUIREMENT_AUDIT.md     # 文档审计
├── IMPLEMENTATION_ROADMAP.md         # Codex 实施路线图（参考）
├── PROJECT_REORGANIZATION_SUMMARY.md # Codex 重组总结
├── PROJECT_HANDOVER_ANALYSIS.md      # 本项目接管分析
├── IMPLEMENTATION_PLAN.md            # 最终实施计划（本阶段产出）
├── frontend_analysis.md              # 前端/UI 分析（子Agent产出）
├── business_flow_analysis.md         # 业务流程分析（子Agent产出）
├── backend_analysis.md               # 后端/数据分析（子Agent产出）
├── testing_strategy.md               # 测试策略（子Agent产出）
├── deploy/
│   └── nginx-huwuyou-demo.conf       # Nginx 演示站配置
├── src/
│   ├── scripts/
│   │   ├── data.js                   # 数据定义（828行）
│   │   ├── store.js                  # CareStore 状态层（364行）
│   │   ├── app.js                    # 应用外壳/路由（649行）
│   │   ├── patient.js                # 患者端页面（1941行）
│   │   ├── admin.js                  # 管理后台页面（1147行）
│   │   └── workflow.js               # 工作流覆盖层（194行）
│   └── styles/
│       ├── style.css                 # 全局样式（697行）
│       └── workflow.css              # 工作流样式（835行）
└── docs/
    ├── INDEX.md                      # 文档目录约定
    ├── requirements/                 # 需求文档
    ├── planning/                     # 活跃设计方案
    ├── presentations/                # 演示汇报材料
    ├── screenshots/                  # 产品截图
    ├── architecture/                 # 架构设计（规划中）
    ├── development/                  # 开发记录（规划中）
    ├── testing/                      # 测试报告（规划中）
    ├── reports/                      # 审查报告（规划中）
    └── archive/                      # 历史归档
```

---

## 页面结构

### 患者端（手机壳形态）

| Tab | 页面 | 渲染函数 | 文件:行 |
| --- | --- | --- | --- |
| 首页 | 首页（Banner + AI下单横幅 + 2×2 服务 + 热门医院） | `Patient.renderHome` | patient.js:460 |
| 特色 | 特色医院列表/详情 | `Patient.renderFeaturedHospitals` / `goHospitalDetail` | patient.js:435/1065 |
| 订单 | 订单列表（状态筛选）+ 详情时间线 | `Patient.renderOrders` / `_renderOrderDetailPage` | patient.js:1407/1472 |
| 我的 | 个人信息/统计/就诊人管理/设置 | `Patient.renderProfile` | patient.js:1591 |

**子页面（直接改写 `#screen`）**：
- 二级目录页：`_renderSubCategoryPage`（patient.js:577）
- 流程步骤页：`_openServiceSteps`（patient.js:645）
- 统一预约表单：`_openBookingForm`（patient.js:806）
- AI智能下单页：`_openAIOrder`（patient.js:758）
- 医院列表（搜索/筛选）：`_renderHospitalListPage`（patient.js:988）
- 订单详情：`_renderOrderDetailPage`（patient.js:1472）
- 就诊人管理：`openPatientManager`（patient.js:1681）

**孤儿页面（代码存在但无 Tab 入口）**：
- 我的需求（草稿人工表单）：`Patient.renderNeed`（workflow.js:116）
- 陪诊进度：`Patient.renderProgress`（workflow.js:152）
- 医院介绍/申请：`Patient.renderHospitals`（workflow.js:155）
- 陪诊师列表/详情/聊天：`Patient.renderEscorts` 等（patient.js:1123-1405）

### 管理端（SaaS 布局）

9 个菜单（workflow.js:160 定义）：
工作台、服务跟踪、服务收费、患者档案、需求处理、陪诊师管理、医院审批与资料、评价反馈、系统设置

---

## 数据模型

### Need（订单）

```javascript
{
  id: string,                    // 格式: N + 时间戳36进制 + 随机3位
  status: '待处理'|'已分配'|'服务中'|'已完成'|'已取消',
  patientName, gender, age, phone,
  emergencyName, emergencyPhone,
  history, allergy, medicine, mobility, insurance,  // 诊前咨询信息
  hospital, dept, date,          // 就诊信息（date为时间范围）
  serviceType,                   // 服务类型（必须匹配 PriceTable）
  amount,                        // 支付金额
  serviceSnapshot: { name, price, unit },  // 提交时价格快照
  escortName, escortPhone,       // 陪诊师（仅匹配后填充）
  identity: { front, back, fields, status },
  reportImages: [],
  escortReportId: string|null,
  feedback: null,                // 评价（待实现）
  createTime, updatedAt
}
```

### PriceItem（价格）

```javascript
{
  id: 'S01'|'S02'|'S03'|'S04',
  name: '半程陪诊'|'全程陪诊'|'代办跑腿'|'陪同复诊',
  price: number,                 // 当前价格
  unit: '次',
  desc: string,
  active: true
}
```

### Hospital（医院）

```javascript
{
  id, name, shortName, level, category, city, address,
  intro, phone, keyDepts, orders, hot, image, specialties, active
}
```

### EscortReport（陪诊报告）

```javascript
{
  id, needId, status: 'draft'|'published',
  timeline: [{time, text}],
  completedItems: string[],
  summary, notes, images,
  plainExplanation,              // 通俗说明
  publishedAt, updatedAt
}
```

### 存储键

| Key | 用途 |
| --- | --- |
| `huwuyou_store_v1` | 主数据（CareStore.state 全量） |
| `huwuyou_store_corrupt_backup` | 损坏备份 |
| `huwuyou_patients` | 就诊人管理（独立键，待并入 CareStore） |

---

## API 规范

当前项目无后端，所有"API"均为本地函数调用。

### CareStore 核心方法（`store.js`）

| 方法 | 签名 | 职责 |
| --- | --- | --- |
| `addNeed(input)` | → Need | 创建订单，默认 status='待处理'，生成价格快照，通知 admin |
| `transitionNeed(id, next, extra)` | → Need | **唯一合法的状态变更入口**，非法跳转抛错，触发患者通知 |
| `createNeedFromDraft()` | → Need | 从草稿创建订单，校验必填+医院申请状态，清空草稿 |
| `updateNeed(id, patch)` | → Need | 更新订单字段（**禁止直接改 status**） |
| `updatePrice(id, price)` | → PriceItem | 调价并记录变更 |
| `submitHospitalApplication(input)` | → {application, duplicate} | 提交医院申请，防重复 |
| `approveHospitalApplication(id)` / `rejectHospitalApplication(id, reason)` | → Application | 审批医院申请，通知患者 |
| `saveEscortReport(needId, data, publish)` | → Report | 保存/发布陪诊报告，发布时校验总结非空 |
| `notify(input)` | → Notification | 创建通知（角色+类型+去重键） |

---

## UI 设计规范

### 设计变量

沿用 `style.css` 全局变量（`:root`）：
- 主色：`--accent: #3b6cb5`
- 状态色：`--status-partial: #c4922e`（待处理）、`--status-covered: #16a34a`（服务中）、`--text-muted: #94a3b8`
- 圆角：`--radius: 8px`、`--radius-lg: 12px`
- 字体：系统默认 + `Noto Serif SC`（品牌标题）

### 移动端布局

- 患者端：手机壳在 ≥768px 居中（max-width 420px），窄屏全宽
- `#screen` 独立滚动区，Tab 栏固定底部
- 时间选择使用范围按钮组（1-3天内 / 一周内 / 尽快）——禁止日期选择器

### 样式写入规则

- 新组件样式优先写入 `style.css` 或 `workflow.css`
- **禁止在 JS 中注入大段样式**（patient.js 的注入样式为历史遗留）
- 所有用户输入渲染前必须转义（`App.escape` / `WUtil.escape`）

---

## UI 开发规范

> 完整规范见 `UI_DESIGN_SYSTEM.md`（定义）和 `FINAL_UI_GUIDELINE_FOR_CLAUDE.md`（执行规则）。
> 本节约定了所有 UI 开发的核心规则，优先级高于个人直觉。

### 设计理念

**"医疗可信感的 Apple 式精致"**

```
医疗服务可信感 + Apple Design Language（清晰/顺从/深度） + 轻量 Liquid Glass = 本项目 UI
```

五条铁律：
1. **保留品牌基因**：#3b6cb5 主蓝、#c4922e 琥珀、slate 灰阶、Noto Serif SC 衬线——一个都不许改
2. **清晰**：信息层级通过字号阶梯表达，不用颜色堆砌
3. **顺从**：卡片用阴影表达浮起、少用描边；留白到位、内容优先
4. **深度**：页面转场、按压反馈、抽屉动效建立层级；动效快速/有目的/可关闭
5. **医疗可信**：任何美化不得牺牲可读性、对比度与信息准确性

### 颜色规则

- **所有新代码禁止硬编码颜色**，一律用 CSS 变量
- 品牌色 `--accent: #3b6cb5` / `--accent-amber: #c4922e` / slate 灰阶——**禁止修改**
- `--text-muted: #94a3b8` **仅用于 placeholder 与 disabled**，禁止用于正文
- 正文低强调使用 `--text-tertiary: #64748b`（新增 token）
- 状态徽章统一：8% 同色底 + 20% 同色边框 + 同色文字 + 圆角 6px + 11-12px
- **Bug 修复**：`.tag-orange` 的 `var(--warm)` 未定义 → 改为 `var(--accent-amber)`

### 字体规则

- 正文 `Noto Sans SC`：患者端 15px / 后台 14px；禁止 10px 以下正文
- 衬线 `Noto Serif SC` **只用于页面主标题与品牌区，每页最多 2 处**
- 模块/卡片标题用无衬线 600
- 数字（金额、统计）用 `font-variant-numeric: tabular-nums` 等宽
- 行高：正文 1.5-1.6，标题 1.3

### 间距规则

- 一律使用 4pt 基准：4/8/12/16/20/24/32/40（`--space-1` 至 `--space-10`）
- 患者端：页面 padding 16px、卡片间距 12px、区块间距 24px
- 后台：内容区 padding 24px、卡片间距 16px、区块间距 32px

### 组件规则

- **按钮**：移动端高度 ≥44px（主按钮 44px）；后台 ≥40px；圆角 10px
  - 主按钮蓝底白字、hover 变 `--accent-light` + 蓝影、按下 `scale(0.98)` 150ms
  - AI 入口专用琥珀按钮（仅首页双入口使用）
- **输入框**：高 44px（移动）/38px（后台），圆角 8px；focus 主色边框 + 3px 光环
  - 错误态：红框 + 下方错误文案；成功态：右对勾
- **卡片**：圆角 12px、白底、`--shadow-sm`；阴影代替描边表达浮起
  - 可点卡片按压 `scale(0.98)` 150ms
- **时间选择**：用 Chip 组（`尽快`/`1-3天`/`一周内`），选中 = 主色底白字
- **图标按钮**：热区 44×44px，图标 20-22px

### 动画规则

- **Token 化**：`--dur-fast: 150ms` / `--dur-base: 225ms` / `--dur-slow: 350ms`
- 缓动：`--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` / `--ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1)`
- 页面进入：fade + translateX(16px)→0，350ms ease-out；返回反向
- 高频交互（Tab 切换、输入）只做淡变，不做位移
- **禁止 `transition: all`**——必须指定 `background-color, border-color, box-shadow, transform, opacity`
- **`prefers-reduced-motion: reduce` 必须全局生效**（reduce 时动画归零，仅保留 crossfade）

### Liquid Glass（全站仅 4 处）

仅允许：① 患者端底部 TabBar ② 后台顶栏 ③ 弹窗遮罩 ④ 悬浮操作区

```css
.glass-bar {
  background: rgba(255, 255, 255, 0.78);
  backdrop-filter: blur(20px) saturate(180%);
}
@supports not (backdrop-filter: blur(1px)) {
  .glass-bar { background: #ffffff; }
}
```

**禁止**：页面整底玻璃化、卡片透明、玻璃上直接放正文

### UI 禁止事项

- ❌ 禁止改变品牌主色 #3b6cb5 / #c4922e / slate 灰阶
- ❌ 禁止滥用玻璃效果（仅上述 4 处）
- ❌ 禁止复制 Apple 官网或 iOS 系统界面
- ❌ 禁止装饰性动画（弹跳/旋转/霓虹/长时动画）
- ❌ 禁止降低医疗可信感（花哨装饰/低对比正文/不严肃插画）
- ❌ 禁止 `transition: all` 与硬编码颜色
- ❌ 禁止在患者端任何流程中加入陪诊师选择 UI
- ❌ 禁止随便加渐变（仅保留现有渐变）

### 开发前必读

动手前先：
1. 读 `style.css` 和 `workflow.css` 的 `:root` 变量段
2. 找现有组件类（`.btn`/`.fg-input`/`.card`），能复用就复用
3. 改动后自查：颜色 token、44px 触控、`transition: all`、reduced-motion
4. 涉及页面流程的改动，对照 `UI_DESIGN_INTEGRATION_ANALYSIS.md` 确认目标

---

## 开发规范

### 代码修改原则

1. **先定位所有相关方再修改**：全局搜索同名方法（尤其是 workflow.js 覆盖）+ 所有调用点
2. **状态唯一入口**：任何下单创建 status='待处理'；任何状态变更走 `CareStore.transitionNeed`
3. **价格唯一来源**：读 `PriceTable.items`，提交时生成快照；禁止硬编码价格
4. **医院唯一来源**：读 `CareStore.state.hospitals`
5. **陪诊师禁止患者选择**：患者端不渲染陪诊师浏览/选择；陪诊师字段仅由后台写入
6. **时间使用范围**：1-3天内 / 一周内 / 尽快；清理"今天/明天/后天"遗留
7. **页面返回必须可靠**：使用明确的返回目标，不依赖 `history.back()`
8. **删除代码前确认无调用方**（含 workflow 覆盖 + 内联 onclick）
9. **脚本加载顺序不可变**；`index.html` 缓存版本号 `?v=` 随修改递增
10. **孤儿代码要么接线、要么清理**：不允许"写了不用"

### 禁止事项

- ❌ 禁止绕过 CareStore 直接改状态
- ❌ 禁止创建"已对接"状态订单
- ❌ 禁止患者端自动分配陪诊师
- ❌ 禁止新增硬编码价格/第三套服务定义/第二套医院库
- ❌ 禁止恢复已废弃能力（DeepSeek 前端直连、财务结算、医院对接人、陪诊师端选择）
- ❌ 禁止在未匹配订单中展示陪诊师信息
- ❌ 禁止引入 npm 依赖、打包器、后端服务
- ❌ 禁止修改脚本加载顺序
- ❌ 禁止删除/覆盖任何文档（归档代替删除）
- ❌ 禁止保存/展示/要求输入真实敏感资料
- ❌ 禁止在没有基线确认（`git status`）的情况下开始修改

---

## 测试要求

### 每次修改后必做

1. `node --check` 全部 6 个 JS 文件（纯语法）
2. 浏览器冒烟：患者全链路（登录→下单→查状态）+ 管理员全链路（派单→推进→发报告）
3. 状态机变更必须验证：合法流转、非法跳转报错、取消规则、通知触发
4. 数据兼容：结构升级后验证旧 localStorage 数据可加载

### 冒烟清单入口

见 `testing_strategy.md` 第 3 节（完整人工冒烟清单，含 7 大场景）。

### 已知限制

- 无自动化测试（Phase 5 规划）
- `node --check` 仅验证语法，不验证运行行为

---

## 文档维护规则

1. 文档结构见 `docs/INDEX.md`
2. 新需求先存档原文到 `docs/requirements/`，再正式化
3. 方案被取代：旧文件移入 `docs/archive/`，不删除
4. 实现变更后：更新 README 功能清单、差距分析状态、路线图进度
5. 开发记录写入 `docs/development/`；测试结果写入 `docs/testing/`
6. **本文件（CLAUDE.md）变更需留痕**

---

## Git 规范

- 按功能小步提交
- Commit message 格式：`feat:` / `fix:` / `refactor:` / `docs:` / `test:`
- 当前有未提交改版，新工作开始前先确认基线

---

## 当前开发阶段

**Phase 0（基线建立）**：
- 提交当前工作区改版
- 更新 README
- 建立冒烟清单

**当前状态**：
- Git 工作区有 5 个未提交文件（index.html, app.js, data.js, patient.js, style.css）
- 患者端改版（2×2 布局 + 预约表单 + 医院目录 + 登录入口修复）已实现但未提交
- 与 workflow 覆盖层尚未完成集成

---

## 后续路线

| Phase | 内容 | 优先级 |
| --- | --- | --- |
| **Phase 0** | 提交改版、更新 README、建立基线 | P0（立即） |
| **Phase 1** | 首页双入口、预约流程重构（待处理+无陪诊师）、修复已对接、统一价格 | P0 |
| **Phase 2** | 人工/AI 共享草稿、诊前咨询问卷、医院申请接线 | P1 |
| **Phase 3** | 状态机全收敛、订单详情/报告/评价闭环 | P1 |
| **Phase 4** | 后台信息发布、实时统计、派单体验优化 | P2 |
| **Phase 5** | 报表/审计/数据迁移/测试体系 | P3 |

> 详细计划见 `IMPLEMENTATION_PLAN.md`
