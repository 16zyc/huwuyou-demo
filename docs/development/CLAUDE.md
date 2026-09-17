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
| 持久化 | 浏览器 LocalStorage（`huwuyou_store_v1`，schema v3；旧键 `huwuyou_patients` 已并入 `state.patients`，保留作备份） |
| 运行方式 | 任意静态 Web 服务器托管 |
| 代码规模 | `index.html` + 8 个 JS 文件（约 7,400 行）+ 2 个 CSS 文件 + `scripts/smoke-test.js` 回归脚本 |
| 版本 | CareStore.version = 3；页面自称 v2.0 |
| 性质 | **演示原型，不可生产使用**（无后端、无认证、无安全；已有零依赖回归脚本） |

---

## 产品定位

为患者提供"在线提交陪诊需求 → 后台审核派单 → 查看进度与陪诊报告"的全流程数字化体验；为管理者提供订单管理、陪诊师配置、价格调整、医院维护、患者档案与信息发布等运营工具。

**核心价值**：患者只需描述需求，不用自己选陪诊师；平台根据诊前咨询信息匹配最合适的陪诊师（患者可登记"意向陪诊师"作为偏好参考）。

---

## 核心业务模型

### 核心实体

```
患者（Patient）──提交──→ 订单（Need）──分配──→ 陪诊师（Escort）
      │                       │
      │                       ├── 价格快照（serviceSnapshot）
      │                       ├── 患者信息快照
      │                       ├── 身份证资料（identity）
      │                       ├── 检查报告（reportImages）
      │                       └── 陪诊报告（EscortReport）
      └──就诊档案（Archive）──→ 就诊情况 / 主诊医生 / 复查计划（管理员与患者双向填写）
```

### 状态机（唯一合法流转）

```
待处理 ──→ 已分配 ──→ 服务中 ──→ 已完成
  │          │
  └──────────┴──→ 已取消
```

- **所有状态变更必须经 `CareStore.transitionNeed`**
- 禁止跳级、禁止回退、禁止创建"已对接"状态
- 待处理/已分配 可取消；服务中/已完成 不可取消

---

## 用户角色

### 患者（Patient）

**能做的**：
- 浏览服务（首页 2×2 入口）、查看医院介绍（含医院图片）
- 通过"人工下单"或"AI下单"提交陪诊需求
- 填写个人信息（姓名/性别/年龄/电话/病史/过敏/用药/行动能力/紧急联系人）
- 选择就诊时间范围（1-3天内 / 一周内 / 尽快）
- 查看订单进展（"我的"页面 / 订单 Tab）
- 订单匹配后查看陪诊师信息（姓名/电话/简介）
- 查看已发布的陪诊报告
- 管理就诊人信息、查看"我的档案"（就诊记录与复查计划，可补充填写）
- 提交**意向陪诊师**（可选，仅作偏好登记，不构成指派）
- 查看平台咨询电话（首页 / 流程页 / 客服中心，号码由管理员配置）
- 申请新增医院
- 接收状态变更通知（含复查到期提醒）

**不能做的**：
- **禁止直接指定/绑定陪诊师**：可选择"意向陪诊师"，但订单提交后必须仍为"待处理"且不得携带 `escortId/escortName/escortPhone`，最终由管理员分配
- **禁止浏览陪诊师列表/联系方式**（仅在订单匹配后可查看已分配陪诊师信息）
- **禁止查看未匹配订单的陪诊师信息**
- **禁止查看他人数据**（档案仅按本人姓名可见）
- **禁止自主推进订单状态**

### 管理者（Admin）

**能做的**：
- 查看全部订单与患者情况（诊前咨询信息）
- 审核订单、分配陪诊师（按患者情况与患者意向匹配）
- 推进订单状态（待处理→已分配→服务中→已完成→发布报告）
- 陪诊师完整 CRUD（新增/编辑/停用/删除，停用后不参与派单与患者端意向列表）
- 医院完整 CRUD（新增/编辑/停用/删除，支持图片上传）
- 服务收费维护（新增服务项 / 停用 / 删除 / 调价，含变更记录）
- 患者数据与就诊档案管理（建档、编辑、删除、标记已复查）
- 配置咨询电话等联系方式（患者端实时同步）
- 发布公告/信息、查看运营统计、重置演示数据

**不能做的**：
- 以患者身份提交订单
- （演示阶段）查看真实敏感资料

### 陪诊师（Escort）

- **当前阶段无独立端/独立登录**
- 是后台可配置的**资源对象**（姓名/电话/专长/状态/在岗标记）
- 信息仅在订单匹配后对患者可见；停用（`active=false`）后不参与派单，也不出现在患者端意向列表
- 未来可扩展为独立端

---

## 核心业务流程（目标）

```text
患者浏览服务（首页 2×2）
        ↓
选择服务 → 二级目录 → 立即预约
        ↓
填写患者信息 + 就诊信息（医院/科室/时间范围）+ 意向陪诊师（可选）
        ↓
提交订单 → 状态：待处理（无陪诊师信息！仅记录意向）
        ↓
"我的"查看进展（是否接单）
        ↓
后台管理员审核 → 按患者情况（参考意向）匹配陪诊师 → 状态：已分配 → 通知患者
        ↓
患者查看陪诊师信息（姓名/电话）
        ↓
服务开始（服务中）→ 服务完成（已完成）
        ↓
管理员发布陪诊报告 + 建立/更新就诊档案（含复查计划）→ 患者查看并补充 → 复查到期自动提醒
```

### 关键业务规则

**陪诊师规则（v3 修订）**：
- 患者提交订单前：不可查看任何陪诊师信息（含下拉中的联系方式：意向列表仅展示姓名与专长标签）
- 患者可登记"意向陪诊师"（`preferredEscortId/preferredEscortName`），**仅作偏好参考**
- 订单提交后必须仍为"待处理"且不得携带 `escortId/escortName/escortPhone`（`addNeed` 强制归零）
- 管理员完成匹配后：开放必要信息（姓名/电话/简介）
- 停用陪诊师（`active=false`）不得出现在派单弹窗与患者端意向下拉

**预约规则**：
- 患者不直接指派陪诊师，只提交需求 + 可选意向
- 管理员根据诊前咨询信息与意向匹配人员
- 提交后状态为"待处理"

**时间规则**：
- 预约时间使用范围表达：1-3天内 / 一周内 / 尽快（禁止固定日期选择器）
- 就诊档案的"就诊日期/复查到期时间"为**已发生或计划的具体日期**，使用 `<input type="date">`（不受上述范围规则限制）

**价格规则**：
- 价格唯一来源：`PriceTable`（`CareStore.state.prices`）
- 提交时生成价格快照（`serviceSnapshot`），历史订单不受后续调价/停用/删除影响
- 禁止在页面硬编码价格

**档案规则**：
- 就诊档案由管理员建档，患者可补充；按字段记录来源（`fieldsSource`），部分更新不得覆盖其他字段
- 复查计划：`needRecheck` + `recheckDate`；到期前 `RECHECK_REMIND_DAYS`（7）天自动提醒患者，按 `档案id+复查日期` 去重；逾期自动置为"已逾期"

**删除规则（v3）**：
- 一律**软删除优先**：患者/医院/服务项/陪诊师/档案均以 `active=false` 隐藏，可恢复
- 存在未完成订单（待处理/已分配/服务中）引用时**禁止删除**并提示改为停用
- 医院无任何需求/申请引用时允许"彻底删除"（物理移除）

---

## 当前技术架构

### 脚本加载顺序（不可调整）

```
data-hospitals.js → data.js → store.js → app.js → patient.js → hospital-ui.js → admin.js → workflow.js
```

- `data-hospitals.js`（链首）：23 家医院纯数据声明（`HospitalData`，branches 结构化地址 + source 数据来源），零依赖。
- `hospital-ui.js`（patient.js 之后）：`HospitalUI` 医院渲染纯函数模块（卡片/介绍卡/列表骨架/详情页），运行时经 `window.P_ICON` 取图标，自含转义。
- **`workflow.js` 是覆盖层**：通过直接替换前面模块的方法实现扩展（含文件末尾按批次追加的覆盖块）。修改任何被覆盖的方法时，必须同时检查 workflow.js。

### 分层架构

```
┌─────────────────────────────────────┐
│ workflow.js  工作流覆盖层             │  ← 方法覆盖（AI面板/通知/后台/患者页/医院·收费·档案·陪诊师管理）
├─────────────────────────────────────┤
│ patient.js   患者端页面              │  ← 首页/特色/订单/我的/我的档案/客服中心
│ admin.js     管理后台页面            │  ← 工作台/需求/陪诊师/医院/评价/系统
├─────────────────────────────────────┤
│ app.js       应用外壳               │  ← 登录/路由/手机壳/AI浮球/toast/复查提醒启动检查
├─────────────────────────────────────┤
│ store.js     统一状态层             │  ← CareStore + MediaService/OCR/AI + 业务 CRUD
├─────────────────────────────────────┤
│ data.js      数据定义层             │  ← NeedPool/PriceTable/MockData/基础数据（含档案种子）
└─────────────────────────────────────┘
         ↕
    LocalStorage (huwuyou_store_v1)
```

### 数据流

```
CareStore（唯一事实源，所有状态变更必须经过它）
  ├── state.draft           ← AI/人工共享草稿（含 preferredEscortId 意向陪诊师）
  ├── state.needs[]         ← 所有订单（Need）
  ├── state.prices[]        ← 价格表（= PriceTable.items，active=false 即停用/隐藏）
  ├── state.patients[]      ← 患者数据（v3 新增，管理员与患者端共用）
  ├── state.archives[]      ← 就诊档案（v3 新增：就诊情况/主诊医生/复查计划，双向填写）
  ├── state.settings        ← 系统配置（v3 新增：consultPhone 咨询电话等）
  ├── state.hospitals[]     ← 医院库（= MockData.hospitals，支持上传图片 dataUrl）
  ├── state.escorts[]       ← 陪诊师（active=false 即停用，不参与派单）
  ├── state.hospitalApplications[] ← 医院申请
  ├── state.notifications[] ← 双角色通知（含复查提醒 recheck_due）
  ├── state.escortReports[] ← 陪诊报告
  ├── state.priceChanges[]  ← 价格变更记录
  └── state.ai              ← AI 对话状态
```

### 关键约束

1. **状态机唯一**：所有状态变更走 `CareStore.transitionNeed`
2. **价格唯一**：价格读 `PriceTable`（`CareStore.state.prices`）
3. **医院唯一**：医院读 `CareStore.state.hospitals`（含患者端医院介绍页）
4. **患者唯一**：患者数据读 `CareStore.state.patients`（不得再新增独立存储键）
5. **通知去重**：`recipientRole + type + targetId + eventKey`
6. **演示边界**：不录真实资料；不引入后端/依赖；不宣称生产能力

---

## 项目目录结构

```text
智能陪护-开发交接包-20260720/
├── index.html                        # 应用唯一入口 + 脚本加载顺序
├── README.md                         # 项目说明（功能清单）
├── deploy/
│   └── nginx-huwuyou-demo.conf       # Nginx 演示站配置
├── scripts/
│   ├── validate-hospitals.js         # 医院数据零依赖校验脚本（node 直跑）
│   └── smoke-test.js                 # 零依赖回归测试（数据层 + 全链路 UI + 数据流向，206 项断言）
├── src/
│   ├── scripts/
│   │   ├── data-hospitals.js         # 23家上海三甲医院数据（branches 结构化地址 + source 来源）
│   │   ├── data.js                   # 数据定义（PriceTable/MockData/档案种子/ServiceFlow）
│   │   ├── store.js                  # CareStore 状态层（schema v3 + 全部业务 CRUD）
│   │   ├── app.js                    # 应用外壳/路由
│   │   ├── patient.js                # 患者端页面（首页/特色/订单/我的/我的档案/客服中心）
│   │   ├── hospital-ui.js            # HospitalUI 医院渲染纯函数模块
│   │   ├── admin.js                  # 管理后台页面（基础实现）
│   │   └── workflow.js               # 工作流覆盖层（后台与患者端增强实现）
│   └── styles/
│       ├── style.css                 # 全局样式（含 B7 首页视觉与 token）
│       └── workflow.css              # 工作流样式（咨询电话/档案/医院介绍卡等）
└── docs/
    ├── INDEX.md                      # 文档目录约定
    ├── requirements/                 # 需求文档
    ├── planning/                     # 活跃设计方案
    ├── presentations/                # 演示汇报材料
    ├── screenshots/                  # 产品截图
    ├── architecture/                 # 架构设计
    ├── development/                  # 开发记录（含本文件 CLAUDE.md）
    ├── testing/                      # 测试报告与冒烟清单
    ├── reports/                      # 审查报告
    └── archive/                      # 历史归档
```

---

## 页面结构

### 患者端（手机壳形态）

| Tab | 页面 | 渲染函数 | 位置 |
| --- | --- | --- | --- |
| 首页 | 医院实景 Hero + 实时数据条 + 复查提醒条 + 服务分类 2×2 + 快速下单双入口 + 热门医院列表 + 电话咨询条 + 公告 | `Patient.renderHome` | patient.js |
| 特色 | 完整医院目录（搜索/分类/城市/排序筛选 + 实景图卡）→ 医院详情 | `Patient.renderFeaturedHospitals` / `goHospitalDetail` | patient.js |
| 订单 | 订单列表（状态筛选）+ 详情时间线 | `Patient.renderOrders` / `_renderOrderDetailPage` | patient.js |
| 我的 | 个人信息/统计/就诊人管理/设置 | `Patient.renderProfile`（workflow.js 注入"我的档案"入口） | patient.js + workflow.js |

**子页面（直接改写 `#screen`）**：
- 二级目录页：`_renderSubCategoryPage`（patient.js）
- 流程步骤页：`_openServiceSteps`（patient.js，含"电话咨询"卡）
- 统一需求表单（人工下单/我的需求共用，draft 驱动）：`Patient.renderNeed` + 唯一入口 `Patient.openNeedForm`（workflow.js；含专家预约选项卡与意向陪诊师下拉）
- AI智能下单页：`_openAIOrder`（patient.js）
- 医院目录/详情：`Patient.renderFeaturedHospitals` / `HospitalUI.renderDetail`
- 就诊人管理：`openPatientManager`（patient.js）

**无 Tab 入口、经二级入口进入的页面**：
- 我的需求（经首页人工下单横幅/流程页"立即预约"/特需"就诊预约"/我的菜单/AI 面板进入）：`Patient.renderNeed`（workflow.js）
- 陪诊进度（经"我的→订单中心"进入）：`Patient.renderProgress`（workflow.js）
- 医院介绍/申请（经表单"申请新医院"链接进入，含医院图片）：`Patient.renderHospitals`（workflow.js）
- 我的档案（经"我的→订单中心"或首页复查提醒条进入，可补充填写）：`Patient.renderMyArchives` + `openArchiveSupplement`（patient.js）
- 客服中心（经"我的→其他功能"进入，含咨询电话与常见问题）：`Patient.renderServiceCenter`（patient.js）

**孤儿页面（代码存在但无任何入口）**：
- 陪诊师列表/详情/聊天：`Patient.renderEscorts` 等（patient.js，历史遗留，禁止接入患者端）

### 管理端（SaaS 布局）

**10 个菜单**（workflow.js 中 `Admin.menus` 定义）：
工作台、服务跟踪、服务收费、**档案管理**、患者档案、需求处理、陪诊师管理、医院审批与资料、评价反馈、系统设置

| 菜单 | 渲染函数 | 能力 |
| --- | --- | --- |
| 服务收费 | `Admin.renderPricing` | 改价 + 新增服务项（分组）+ 停用/恢复 + 删除守卫 |
| 档案管理 | `Admin.renderRecords` | 复查提醒待办 + 就诊档案 CRUD + 患者数据 CRUD |
| 医院审批与资料 | `Admin.renderHospitals` | 医院 CRUD + 图片上传 + 停用/恢复/彻底删除 + 申请审批 |
| 陪诊师管理 | `Admin.renderEscorts` | 陪诊师 CRUD + 停用/恢复 + 在岗筛选 |
| 系统设置 | `Admin.renderSystem` | 咨询电话配置 + 公告 + 数据重置 |

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
  preferredEscortId, preferredEscortName,  // v3：患者意向（不构成指派）
  escortId, escortName, escortPhone,       // 陪诊师（仅匹配后填充；新建订单恒为 null）
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
  id: 'S01'…,                    // 种子 S01-S07，新增项用 uid('S')
  name: string,                  // 半程陪诊/全程陪诊/代办跑腿/陪同复诊/普通专家/专家门诊/特需专家/管理员新增
  price: number,
  unit: '次',
  desc: string,
  group: 'escort'|'expert',      // escort=服务类型区；expert=专家预约选项卡区
  active: true                   // false = 停用（患者端与表单不渲染）
}
```

### Patient（患者数据，v3）

```javascript
{
  id, name, gender, age, phone,
  emergencyName, emergencyPhone, history, allergy, medicine, mobility, insurance,
  relation, note, images,
  orders, satisfaction,
  active: true,                  // false = 已删除（软删除）
  source: 'admin'|'patient',     // 来源（含旧键迁移）
  createdAt, updatedAt
}
```

### Archive（就诊档案，v3）

```javascript
{
  id, patientId, patientName, needId,
  visitDate,                     // 就诊日期（具体日期）
  hospital, dept, doctor,        // 就诊医院 / 科室 / 主诊医生
  visitSummary,                  // 就诊情况
  careContent,                   // 基本诊疗内容
  needRecheck: bool, recheckDate, recheckStatus: '待复查'|'已复查'|'已逾期'|'无需复查',
  recheckNote, recheckedAt,
  fieldsSource: { doctor:'admin'|'patient', … },  // 字段级填写来源（双向填写）
  attachments: [], remindKeys: [], remindedAt,
  active: true, createdBy, updatedBy, createdAt, updatedAt
}
```

### Hospital（医院）

```javascript
{
  id, name, shortName, level, category, city, address,
  intro, advantage, phone, keyDepts, orders, hot, image, imageFallback, specialties,
  branches: [{ name, address }],
  source: { info, ranking, updated },
  imageUploaded: bool,           // v3：是否为管理员上传图（dataUrl）
  active: true,                  // false = 停用（患者端隐藏）
  createdAt, updatedAt
}
```

### Escort（陪诊师）

```javascript
{
  id, name, avatar, gender, age, phone,
  star, orders, status: '空闲'|'服务中'|'已派单'|'已停用', score, tags, region,
  joinDate, income, completionRate, note,
  active: true,                  // false = 停用/删除（不参与派单）
  deletedAt, createdAt, updatedAt
}
```

### Settings（系统配置，v3）

```javascript
{
  consultPhone: string,          // 咨询电话：患者端首页条 / 流程页卡 / 注意事项 / 客服中心 / AI 话术统一读取
  consultHours: string,
  bannerHospitalIds: [],         // v3.1 首页轮播指定医院（空 = 自动取"在架且带图"的热门医院，最多 6 张）
  bannerAutoPlay: true,          // v3.1 轮播自动播放开关（prefers-reduced-motion 时前端强制停播）
  updatedAt
}
```

> **v3.1 读取契约（重要）**：
> - 服务项编辑：`updatePriceItem(id, patch, { syncNeeds })` —— 支持改名/描述/单位/分组/价格；改名默认同步"未完成需求"的 `serviceType`（已完成需求走价格快照不受影响）
> - 医院一律经 `CareStore.activeHospitals()` 读取（首页列表与轮播 / 特色页 / 医院介绍页 / 需求表单下拉 / AI 医院列表五处必须一致）
> - 服务项一律经 `PriceTable.items`（过滤 `active !== false`），患者端按 `group` 分区渲染
> - 敏感操作（改价、删除、停用）必须经 `WUtil.confirm` 二次确认；"恢复"类操作免确认

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
| `huwuyou_store_v1` | 主数据（CareStore.state 全量，schema v3） |
| `huwuyou_store_corrupt_backup` | 损坏备份 |
| `huwuyou_patients` | 旧就诊人键：v3 已并入 `state.patients`，**保留作备份，不再读写** |

---

## API 规范

当前项目无后端，所有"API"均为本地函数调用。

### CareStore 核心方法（`store.js`）

| 方法 | 签名 | 职责 |
| --- | --- | --- |
| `addNeed(input)` | → Need | 创建订单，强制 `status='待处理'` 且清空已分配陪诊师字段，生成价格快照，通知 admin |
| `transitionNeed(id, next, extra)` | → Need | **唯一合法的状态变更入口**，非法跳转抛错，触发患者通知 |
| `createNeedFromDraft()` | → Need | 从草稿创建订单（含意向陪诊师），校验必填+医院申请状态，清空草稿 |
| `updateNeed(id, patch)` | → Need | 更新订单字段（**禁止直接改 status**） |
| `updatePrice(id, price)` | → PriceItem | 调价并记录变更 |
| `updateSettings(patch)` | → Settings | 更新咨询电话等配置并通知患者 |
| `addPrice / setPriceActive / removePrice` | → PriceItem | 服务项新增 / 停用 / 删除（有未完成订单引用时抛错） |
| `addHospital / updateHospital / removeHospital / restoreHospital / deleteHospital` | → Hospital | 医院 CRUD（软删除 + 引用守卫；无引用才允许彻底删除） |
| `addPatient / updatePatient / removePatient / restorePatient` | → Patient | 患者数据 CRUD（软删除 + 未完成需求守卫） |
| `addArchive / updateArchive / markArchiveRechecked / removeArchive / archivesFor` | → Archive | 就诊档案 CRUD（字段级来源标记、双向填写、按患者名查询） |
| `checkRecheckReminders()` | → {due, overdue, remindDays} | 复查到期检查：到期前 N 天提醒（去重）、逾期标记 |
| `addEscort / updateEscort / setEscortActive / removeEscort / activeEscorts` | → Escort | 陪诊师 CRUD（停用后不参与派单） |
| `submitHospitalApplication(input)` | → {application, duplicate} | 提交医院申请，防重复 |
| `approveHospitalApplication(id)` / `rejectHospitalApplication(id, reason)` | → Application | 审批医院申请（通过时创建完整医院记录），通知患者 |
| `saveEscortReport(needId, data, publish)` | → Report | 保存/发布陪诊报告，发布时校验总结非空 |
| `notify(input)` | → Notification | 创建通知（角色+类型+去重键） |

---

## UI 设计规范

### 设计变量

沿用 `style.css` 全局变量（`:root`）：
- 主色：`--accent: #3b6cb5`
- 状态色：`--status-partial: #c4922e`（待处理）、`--status-covered: #16a34a`（服务中）、`--text-muted: #94a3b8`
- 圆角：`--radius: 8px`、`--radius-lg: 12px`
- 叠层 token（v3 新增）：`--scrim-white-soft` / `--amber-soft` / `--danger-soft` / `--green-soft`
- 字体：系统默认 + `Noto Serif SC`（品牌标题）

### 移动端布局

- 患者端：手机壳在 ≥768px 居中（max-width 420px），窄屏全宽
- `#screen` 独立滚动区，Tab 栏固定底部
- 预约时间选择使用范围按钮组（1-3天内 / 一周内 / 尽快）——禁止日期选择器；档案就诊/复查日期除外

### 样式写入规则

- 新组件样式优先写入 `style.css` 或 `workflow.css`
- **禁止在 JS 中注入大段样式**（patient.js 的注入样式为历史遗留）
- 所有用户输入渲染前必须转义（`App.escape` / `WUtil.escape`）
- 颜色一律用 CSS 变量；确需半透明叠层时新增 token，不散落 `rgba()`

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
- 正文低强调使用 `--text-tertiary: #64748b`
- 状态徽章统一：8% 同色底 + 20% 同色边框 + 同色文字 + 圆角 6px + 11-12px

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
- **卡片**：圆角 12px、白底、`--shadow-sm`；阴影代替描边表达浮起
- **时间选择**：预约用 Chip 组（`尽快`/`1-3天`/`一周内`），选中 = 主色底白字
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
- ❌ 禁止在患者端渲染陪诊师**浏览/联系方式**列表；仅允许"意向陪诊师"下拉（姓名 + 专长标签，无联系方式）
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
5. **陪诊师规则（v3）**：患者端仅可提交"意向陪诊师"，不得出现浏览/联系方式列表；`escortId/Name/Phone` 仅由后台派单写入
6. **时间使用范围**：预约用 1-3天内 / 一周内 / 尽快；档案日期用具体日期
7. **页面返回必须可靠**：使用明确的返回目标，不依赖 `history.back()`
8. **删除代码前确认无调用方**（含 workflow 覆盖 + 内联 onclick）
9. **脚本加载顺序不可变**；`index.html` 缓存版本号 `?v=` 随修改递增
10. **孤儿代码要么接线、要么清理**：不允许"写了不用"
11. **数据演进**：新增 `state.*` 字段必须在 `defaults()` 与 `merge()` 同步补齐（增量合并、不丢旧数据），必要时升 `CareStore.version`
12. **删除一律软删除优先**：`active=false` + 引用守卫（见"删除规则"）

### 禁止事项

- ❌ 禁止绕过 CareStore 直接改状态
- ❌ 禁止创建"已对接"状态订单
- ❌ 禁止患者端自动分配陪诊师 / 直接绑定陪诊师
- ❌ 禁止新增硬编码价格/第三套服务定义/第二套医院库/第二套患者数据源
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

1. `node --check` 全部 8 个 JS 文件（纯语法）
2. `node scripts/smoke-test.js` —— 零依赖回归（数据层迁移 / CRUD 守卫 / 双向档案 / 复查提醒 / 后台与患者端 UI / **数据流向端到端**，206 项断言）
3. 浏览器冒烟：患者全链路（登录→下单→查状态→我的档案）+ 管理员全链路（派单→推进→发报告→建档）
4. 状态机变更必须验证：合法流转、非法跳转报错、取消规则、通知触发
5. 数据兼容：结构升级后验证旧 localStorage 数据可加载（v2 → v3 迁移不得丢数据）

### 冒烟清单入口

见 `docs/testing/smoke-checklist.md`（人工冒烟清单）+ `scripts/smoke-test.js`（自动化回归）。

### 已知限制

- `scripts/smoke-test.js` 使用 DOM 桩，覆盖逻辑与渲染产物，不覆盖真实浏览器渲染与图片 canvas 压缩
- 图片以 dataUrl 存 localStorage，容量约 5MB（单张压缩至 ~200KB，约 20-25 张），配额超限由 `CareStore.save()` 提示

---

## 文档维护规则

1. 文档结构见 `docs/INDEX.md`
2. 新需求先存档原文到 `docs/requirements/`，再正式化
3. 方案被取代：旧文件移入 `docs/archive/`，不删除
4. 实现变更后：更新 README 功能清单、差距分析状态、路线图进度
5. 开发记录写入 `docs/development/`；测试结果写入 `docs/testing/`
6. **本文件（CLAUDE.md）变更需留痕**（见文末变更留痕）

---

## Git 规范

- 按功能小步提交
- Commit message 格式：`feat:` / `fix:` / `refactor:` / `docs:` / `test:`
- 新工作开始前先确认基线（`git status`）

---

## 当前开发阶段

**已完成（v3 迭代）**：
- 登录流程简化（启动直进主界面 + 隐蔽管理登录入口）
- 首页视觉增强（医院实景 Hero、实时数据条、区块标题、复查提醒条）
- 患者端医院介绍补图与图文排版
- 后台：咨询电话配置、医院 CRUD + 图片上传、服务收费 CRUD
- 档案管理（双向填写 + 复查到期自动提醒）、患者数据 CRUD
- 陪诊师 CRUD（停用/删除）与患者端"意向陪诊师"
- 零依赖回归脚本 `scripts/smoke-test.js`

**下一步（可选）**：
- 订单评价闭环、公告触达统计、档案附件（复诊单图片）上传
- 图片存储改 IndexedDB 以突破 localStorage 容量限制

---

## 后续路线

| Phase | 内容 | 优先级 |
| --- | --- | --- |
| **Phase 0** | 提交改版、更新 README、建立基线 | 已完成 |
| **Phase 1** | 首页双入口、预约流程重构（待处理+无陪诊师）、统一价格 | 已完成 |
| **Phase 2** | 人工/AI 共享草稿、医院申请接线 | 已完成 |
| **Phase 3** | 状态机收敛、订单详情/报告闭环、就诊档案与复查提醒 | 已完成 |
| **Phase 4** | 后台信息发布、实时统计、派单体验优化、医院/收费/陪诊师 CRUD | 已完成 |
| **Phase 5** | 评价闭环、审计留痕、IndexedDB 图片存储、测试体系扩展 | P2 |

---

## 变更留痕

| 日期 | 变更 | 说明 |
| --- | --- | --- |
| 2026-08-16 | 登录流程简化 | 启动直进患者主界面；登录按钮直达患者登录页；右上角新增隐蔽"管理登录"入口；停用角色选择页 |
| 2026-08-16 | 首页与医院介绍视觉 | Hero 使用医院实景图 + 品牌遮罩 + 信任标签；新增实时数据条与区块标题；医院介绍页补图（含无图降级） |
| 2026-08-16 | CareStore v2 → v3 | 新增 `settings`/`patients`/`archives`；`needs.preferredEscort*`；`hospitals.imageUploaded`；`escorts.active`；版本宽容增量迁移；旧键 `huwuyou_patients` 并入 |
| 2026-08-16 | 陪诊师规则修订（规则 5 / UI 禁止项） | 由"禁止任何陪诊师选择 UI"调整为"允许意向陪诊师（无联系方式、不构成指派），仍禁止直接绑定与浏览" |
| 2026-08-16 | 后台能力扩展 | 咨询电话配置、医院 CRUD + 图片上传、服务收费 CRUD、档案管理与患者数据 CRUD、陪诊师 CRUD |
| 2026-08-16 | 删除语义统一 | 软删除优先（`active=false`）+ 未完成订单引用守卫；医院无引用时允许彻底删除 |
| 2026-08-16 | 测试体系 | 新增 `scripts/smoke-test.js` 零依赖回归（128 项断言）；更新 `docs/testing/smoke-checklist.md` |
| 2026-08-16 | **v3.1 首页视觉** | 热门医院列表改为图文行（缩略图 + 三级降级链）；Hero 升级为医院实景**图片轮播**（5s 自动播放 / 指示点 / 箭头 / 触摸横滑；reduce 模式停播；带图医院 <2 家回退静态 Hero） |
| 2026-08-16 | **v3.1 轮播配置** | `settings.bannerHospitalIds` / `bannerAutoPlay`（merge 自动回填，版本仍为 v3）；后台「系统设置 → 首页轮播配置」（开关 + 参与医院多选） |
| 2026-08-16 | **v3.1 服务项编辑** | 新增 `updatePriceItem`（改名/描述/单位/分组/价格）；改名默认同步"未完成需求"的 `serviceType`，已完成需求保留价格快照 |
| 2026-08-16 | **v3.1 二次确认** | 新增 `WUtil.confirm` 统一确认弹窗；接入改价、保存服务项修改、删除/停用 医院·服务项·陪诊师·患者·档案；恢复类操作免确认 |
| 2026-08-16 | **v3.1 读取契约** | 医院读取全面收敛到 `CareStore.activeHospitals()`；修复特色页未过滤停用医院的缺陷；电话咨询覆盖至流程页注意事项与 AI 话术 |
| 2026-08-16 | **v3.1 清理与测试** | 删除 workflow.js 中 4 处被覆盖层取代的旧实现；回归扩展至 **206 项断言**（含"数据流向端到端"专项） |
