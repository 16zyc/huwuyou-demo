# 项目接管分析报告

> 版本：v1.0（2026-08-08）
> 角色：项目技术负责人 · 接管分析
> 原则：**代码是唯一事实来源**；Codex 分析报告经逐项验证后作为本报告参考基线
> 前置阅读：`PROJECT_ANALYSIS_REPORT.md`（Codex 完整代码分析，已验证准确）

---

## 1. 项目当前状态

### 1.1 项目是什么

**护无忧 · 智陪诊全链路平台** — 一个纯前端交互演示原型。

| 维度 | 事实 |
| --- | --- |
| 技术栈 | 原生 HTML/CSS/JS，零依赖，零构建 |
| 持久化 | 浏览器 LocalStorage（`huwuyou_store_v1` + `huwuyou_patients`） |
| 代码规模 | index.html + 6 JS 文件（约 5,100 行）+ 2 CSS 文件（约 1,532 行） |
| 运行方式 | 任意静态 Web 服务器托管；Nginx 参考配置见 `deploy/` |
| Git 状态 | 分支 `main`，2 个已提交 commit（2026-08-06）；工作区有 5 个文件未提交修改（2026-08-08） |
| 版本标记 | 页面自称 v2.0；CareStore.version = 2 |
| 性质 | **演示原型，明确不可生产**（无后端/无认证/无安全/无测试） |

### 1.2 已完成什么

**已正确实现的核心骨架：**

1. **CareStore 统一状态层** (`store.js:1-283`)：版本管理、LocalStorage 持久化、损坏恢复、旧池重绑、状态机、通知、报告——这些基础能力设计良好、实现完整。

2. **管理后台闭环** (`workflow.js:160-193` + `admin.js`)：
   - 需求处理（查看/筛选/分配陪诊师/推进状态）
   - 服务跟踪（已分配/服务中列表）
   - 陪诊报告编辑与发布
   - 价格管理（调整 + 变更记录）
   - 医院审批与资料维护
   - 通知系统（admin + patient 双角色）
   - 系统设置 + 数据重置

3. **AI 下单流程** (`workflow.js:71-103`)：本地状态机驱动的 AI 对话（idle→collecting→confirm_details→upload_identity→upload_reports→final_confirm→submitted），通过 CareStore.createNeedFromDraft 正确创建待处理订单。

4. **患者端新版 UI 外观** (`patient.js` 工作区版本)：
   - 首页 2×2 服务网格 + AI 下单横幅 + 热门医院区
   - 特色医院 Tab（列表/详情）
   - 服务二级目录 → 流程步骤页 → 统一预约表单
   - 订单 Tab（状态筛选/详情时间线）
   - 我的 Tab（头像/统计/就诊人管理/菜单）

5. **媒体与模拟服务** (`store.js:288-361`)：图片压缩、演示 OCR、本地 AI 解析——均可用。

### 1.3 未完成什么

**结构性缺陷（按严重程度排序）：**

| # | 缺陷 | 影响 |
| --- | --- | --- |
| 1 | 首页缺少"人工下单"入口，仅有"AI智能下单"横幅 | REQ-01 未实现；用户无法通过 UI 找到手动下单路径 |
| 2 | `_submitBooking` 绕过状态机：直接创建 `已分配` 订单 + 自动随机分配陪诊师 | REQ-04/05/08/11 违反；患者本该不可见陪诊师，提交本该是"待处理" |
| 3 | `_submitEscortOrder` 创建 `已对接` 状态订单 | 后台 transitionNeed 不支持此状态，订单永久卡死 |
| 4 | workflow 患者端 3 个页面（`renderNeed`/`renderProgress`/`renderHospitals`）无 Tab 入口 | 合规流程（草稿表单/AI双入口/进度页/OCR/医院申请）全部不可达 |
| 5 | `_openAddressManager()` 被调用但从未定义 | `patient.js:1674` 点击"地址管理"即抛 TypeError |
| 6 | `toggleHospitalApply()` 被引用但从未定义 | `workflow.js:155` 医院申请页一旦接入即崩溃 |
| 7 | 价格体系两套并存 | patient.js 硬编码价格（¥98-298）与 PriceTable（¥98-598）不一致；服务名不匹配导致快照回退 |
| 8 | 医院数据北京/上海混用 | AI 别名返回北京医院名，但医院库全是上海医院，下拉框无匹配项 |
| 9 | 患者信息采集不完整 | 预约表单仅有"病史"一项，缺过敏/用药/行动能力/紧急联系人（REQ-09） |
| 10 | 后台"信息发布"功能不存在 | REQ-10 未实现；旧版公告为 toast 占位 |

### 1.4 当前最大问题

**系统处于"新 UI 可用但不合规 + 合规流程不可达"的中间态。**

```
患者端新版 UI（工作区未提交）
  ├── 首页 2×2 服务入口 ✅
  ├── AI下单横幅 ✅
  ├── 预约表单（直接创建"已分配"）❌ 绕过状态机
  └── 订单/我的页面 ⚠️ 部分可用

workflow 覆盖层（已提交）
  ├── AI 状态机 → createNeedFromDraft ✅ 合规
  ├── 草稿人工表单（renderNeed）❌ 无 Tab 入口
  ├── 陪诊进度页（renderProgress）❌ 无 Tab 入口
  ├── 医院介绍/申请（renderHospitals）❌ 无 Tab 入口
  └── 管理后台闭环 ✅ 完整可用
```

**根因**：患者端改版（2026-08-08 未提交）与 workflow 覆盖层（2026-08-06 已提交）没有完成集成。两套代码各自实现了下单能力，但走的是完全不同的路径，且互不知晓。

---

## 2. 产品目标重新确认

### 2.1 用户角色与能力

#### 患者（Patient）

**能力（目标状态）：**

| 操作 | 当前状态 | 目标 |
| --- | --- | --- |
| 浏览服务 | ✅ 首页 2×2 入口 → 二级目录 → 流程步骤 | 保持 |
| 人工下单 | ❌ 首页无入口 | 首页新增"人工下单"按钮 |
| AI 下单 | ✅ AI 浮球（需登录）+ 首页 AI 横幅 | 保持并增强 |
| 填写预约信息 | ⚠️ 仅有病史字段 | 补全：过敏/用药/行动能力/紧急联系人 |
| 选择时间范围 | ✅ 1-3天内/一周内/尽快 | 保持 |
| 提交订单 | ❌ 直接"已分配"+随机派单 | 改为"待处理"，不含陪诊师 |
| 查看订单进展 | ⚠️ 订单 Tab 可看，但无独立进展页 | 订单 Tab + "我的"增加进展入口 |
| 查看陪诊师信息 | ❌ 提交即显示 | 仅匹配后可见 |
| 查看陪诊报告 | ⚠️ 仅通知点击可达 | 订单详情中增加入口 |
| 评价服务 | ❌ toast "开发中" | 实现星级+标签+文字评价 |
| 管理就诊人 | ⚠️ 独立 localStorage 键 | 并入 CareStore 或保持关联 |
| 申请新医院 | ❌ 页面不可达 | 接入可达 UI |

**禁止事项（目标状态）：**

- ❌ 浏览/选择陪诊师
- ❌ 查看未匹配订单的陪诊师信息
- ❌ 查看他人数据
- ❌ 自主推进订单状态

#### 管理者（Admin）

**能力（目标状态）：**

| 操作 | 当前状态 | 目标 |
| --- | --- | --- |
| 后台登录 | ✅ 角色选择页可达 | 保持 |
| 查看/筛选订单 | ✅ 需求处理页 | 保持 |
| 查看患者情况 | ⚠️ 缺诊前咨询信息 | 订单详情展示完整患者情况 |
| 分配陪诊师 | ✅ assignEscortV2 | 保持，增加匹配推荐 |
| 推进订单状态 | ✅ transitionNeed | 保持 |
| 编辑发布陪诊报告 | ✅ 报告编辑器 | 保持 |
| 价格管理 | ✅ 价格调整 + 变更记录 | 保持 |
| 医院审批与资料 | ✅ 审批 + 编辑 | 保持 |
| 数据统计 | ⚠️ 静态 KPI | 改为实时聚合 |
| 信息发布 | ❌ 不存在 | 新增公告管理 |
| 重置数据 | ✅ 系统设置 | 保持 |

#### 陪诊师（Escort）

**当前阶段**：无独立端/独立登录。陪诊师是后台可配置的**资源对象**（姓名/电话/专长/状态）。

**能力（目标状态）**：
- 被管理员分配订单
- 信息（姓名/电话/简介）在匹配后对患者可见
- 未来可扩展为独立端（本次不实施）

### 2.2 核心业务流程（目标 vs 实际）

#### 目标流程

```text
患者浏览服务（首页 2×2）
        ↓
选择服务 → 二级目录 → 立即预约
        ↓
填写患者信息（姓名/性别/年龄/电话/病史/过敏/用药/行动能力/紧急联系人）
+ 就诊信息（医院/科室/时间范围：1-3天/一周内/尽快）
        ↓
提交订单 → 状态：待处理（无陪诊师信息）
        ↓
后台收到订单 → 管理员查看患者情况（诊前咨询信息）
        ↓
管理员审核 → 配置陪诊师 → 状态：已分配 → 通知患者
        ↓
患者"我的"查看进展 → 看到陪诊师信息（姓名/电话）
        ↓
服务开始（服务中）→ 服务完成（已完成）
        ↓
管理员发布陪诊报告 → 患者查看 → 评价
```

#### 当前实际流程（工作区未提交版）

```text
首页 → 2×2 服务入口 → 二级目录 → 流程步骤 → 立即预约
        ↓
填写患者信息（仅有病史）+ 就诊信息（时间范围正确）
        ↓
提交 → NeedPool.add(status='已分配') ← ❌ 绕过状态机
        ↓
自动随机选择陪诊师 ← ❌ 患者不该参与选择
        ↓
toast "预约成功！陪诊师XXX已为您分配" ← ❌ 患者未匹配即看到陪诊师
        ↓
跳转订单 Tab
```

**差距总结**：

| 差距点 | 当前行为 | 目标行为 |
| --- | --- | --- |
| 提交状态 | `已分配`（直接派单） | `待处理`（等待审核） |
| 陪诊师分配 | 前端随机选择 | 仅后台管理员分配 |
| 陪诊师可见性 | 提交即显示 | 匹配后才可见 |
| 患者信息 | 仅病史 | 完整诊前咨询信息 |
| 首页入口 | 仅 AI下单 | 人工下单 + AI下单 双入口 |

---

## 3. 技术架构确认

### 3.1 脚本加载顺序（不可变）

```
data.js → store.js → app.js → patient.js → admin.js → workflow.js
```

`workflow.js` 通过**方法覆盖**扩展前面的模块——这是系统的"扩展机制"，也是最大的维护陷阱。

### 3.2 数据流

```
CareStore（单一状态源，LocalStorage 持久化）
  ├── state.draft         ← AI/人工共享草稿
  ├── state.needs[]       ← 所有订单
  ├── state.prices[]      ← 价格表（PriceTable）
  ├── state.hospitals[]   ← 医院库
  ├── state.hospitalApplications[] ← 医院申请
  ├── state.notifications[] ← 双角色通知
  ├── state.escortReports[] ← 陪诊报告
  ├── state.priceChanges[]  ← 价格变更记录
  └── state.ai            ← AI 对话状态
```

### 3.3 关键约束

1. **状态机唯一**：`CareStore.transitionNeed` 只允许 `待处理→已分配→服务中→已完成`（+取消）
2. **价格唯一**：`PriceTable` (`CareStore.state.prices`) 是唯一价格源
3. **医院唯一**：`CareStore.state.hospitals` 是唯一医院源
4. **通知去重**：`recipientRole + type + targetId + eventKey`
5. **数据边界**：单浏览器、演示数据、禁止真实敏感资料

---

## 4. 文档真实性评估

Codex 的 `DOCUMENT_REQUIREMENT_AUDIT.md` 审计结论已验证准确：

| 文档 | 可信度 | 关键问题 |
| --- | --- | --- |
| `PROJECT_ANALYSIS_REPORT.md` | ✅ 准确 | 已逐项验证，无错误 |
| `README.md` | ⚠️ 部分过时 | 患者端功能清单夸大（OCR/进度/医院申请不可达）；结构描述准确 |
| `agent.md` | ✅ 准确 | 工作规范正确，可直接沿用 |
| `PRODUCT_REQUIREMENTS_ANALYSIS.md` | ✅ 准确 | REQ-01~13 正式化正确 |
| `REQUIREMENT_GAP_ANALYSIS.md` | ✅ 准确 | 差距分析正确 |
| `IMPLEMENTATION_ROADMAP.md` | ✅ 基本正确 | Phase 划分合理，可作为参考 |
| `docs/planning/2026-07-17-*.md` | ⚠️ 设计基线 | 活跃设计方案，但患者 UI 已改版 |
| `docs/presentations/ppt.html` | ❌ 严重过时 | 描述旧版实现（DeepSeek/财务/已对接），仅作历史快照 |
| `docs/presentations/演讲稿.md` | ⚠️ 部分错误 | Store 版本号错误（1 vs 2），患者入口不可达 |

---

## 5. 代码问题清单（经验证）

### 5.1 阻塞级（必须修复才能演示）

| # | 文件:行 | 问题 | 触发条件 |
| --- | --- | --- | --- |
| 1 | patient.js:1674 | `_openAddressManager()` 未定义 | 点击"地址管理" |
| 2 | workflow.js:155 | `toggleHospitalApply()` 未定义 | 医院申请页渲染时 |
| 3 | patient.js:957 | `_submitBooking` 创建 status='已分配' | 正常预约提交 |
| 4 | patient.js:1397 | `_submitEscortOrder` 创建 status='已对接' | 陪诊师详情页下单（孤儿页，但代码仍在） |
| 5 | admin.js:928 | `renderFinance` 引用不存在的 `MockData.finance` | 菜单改为 pricing 后已不可达 |

### 5.2 严重级（影响业务正确性）

| # | 文件:行 | 问题 |
| --- | --- | --- |
| 6 | patient.js:920-940 | 硬编码价格（priceMap），不与 PriceTable 同步 |
| 7 | patient.js:942-947 | 前端随机选陪诊师 |
| 8 | store.js:149-154 | 新服务类型不在 PriceTable 时快照回退 prices[0]，金额不一致 |
| 9 | store.js:331 | AI 医院别名指向北京，与上海医院库不匹配 |

### 5.3 中等级（影响完整性）

| # | 文件:行 | 问题 |
| --- | --- | --- |
| 10 | patient.js:851 | 预约表单仅收集病史，缺 4 个关键字段 |
| 11 | patient.js:724 | `_openServiceSteps` 返回用 `history.back()`，不可靠 |
| 12 | patient.js:1746-1761 | 就诊人管理使用独立 localStorage 键 `huwuyou_patients` |
| 13 | data.js:126,717 | `FeaturedHospitals`（21 家）只入库不渲染 |
| 14 | admin.js:884 | 工作台 KPI 含"已对接"计数（基于旧状态流） |

### 5.4 孤儿代码

| 文件:行 | 内容 | 说明 |
| --- | --- | --- |
| workflow.js:116-135 | `Patient.renderNeed` | 草稿人工表单，无 Tab 入口 |
| workflow.js:152 | `Patient.renderProgress` | 陪诊进度页，无 Tab 入口 |
| workflow.js:155 | `Patient.renderHospitals` | 医院介绍/申请页，无 Tab 入口 |
| patient.js:1123-1405 | 陪诊师详情/下单/聊天 | orphan，render() 不调用 renderEscorts |
| admin.js:926 | `Admin.renderFinance` | 引用不存在数据，菜单已替换 |
| data.js:126-134 | `ServiceCategories` | 数据完整但无消费方 |
| data.js:708-735 | `ServiceCatalog` | 数据完整但无消费方 |
| data.js:717-739 | `FeaturedHospitals` | 21 家医院数据，无渲染 |

---

## 6. 立即行动建议

### 第一优先级（Phase 0 + Phase 1）

1. **提交工作区改版**：将当前未提交的 index.html/app.js/data.js/patient.js/style.css 变更提交，建立基线
2. **首页新增"人工下单"入口**：与"AI智能下单"并列
3. **修复 `_submitBooking`**：状态改为"待处理"，移除自动派单，移除陪诊师字段
4. **补全患者信息表单**：增加过敏/用药/行动能力/紧急联系人
5. **修复未定义方法**：实现 `_openAddressManager` 和 `toggleHospitalApply` 或改为 toast 占位
6. **清理或迁移"已对接"**：全局替换为状态机允许的状态

### 第二优先级（Phase 2 + Phase 3）

7. **接线 workflow 患者页**：将 renderNeed/renderProgress/renderHospitals 接入新版 Tab 或迁移能力
8. **统一价格体系**：删除 patient.js 硬编码价格，统一读 PriceTable
9. **统一医院数据**：解决北京/上海冲突，删除 FeaturedHospitals 或合并
10. **实现评价功能**

### 第三优先级（Phase 4 + Phase 5）

11. **后台信息发布**：公告系统
12. **统计实时化**
13. **建立测试**

---

## 附录：验证记录

- ✅ 已通读全部 6 个 JS 源文件（data/store/app/patient/admin/workflow）
- ✅ 已通读全部 7 个 Codex 分析文件
- ✅ 已通读 README.md、agent.md、docs/INDEX.md
- ✅ 已逐项验证 Codex 报告中的 24 项文档审计 + 5 项代码冲突 + 14 项问题
- ✅ 已全局检索 `_openAddressManager`、`toggleHospitalApply`、`renderFinance`、`已对接` 调用点
- ✅ 验证结论：**Codex 分析报告准确，无实质性错误**
- ⏳ 4 个子 Agent 并行分析中（frontend / business_flow / backend / testing）
