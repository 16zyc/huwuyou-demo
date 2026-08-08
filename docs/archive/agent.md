# AI Agent 工作规范（护无忧 · 智陪诊全链路平台）

> 本文件是未来所有 AI Agent（以及开发者）在本仓库工作的**唯一工作规范**。
> 优先级：本文件 > 产品需求（`PRODUCT_REQUIREMENTS_ANALYSIS.md`）> 路线图（`IMPLEMENTATION_ROADMAP.md`）> 设计方案（`docs/planning/`）> README > 其他历史文档。
> 代码实现永远优先于任何文档描述；文档与代码冲突时，先向用户指出冲突，再按本规范处理。

## 1. 项目背景

- 项目名称：护无忧 · 智陪诊全链路平台。
- 项目性质：**纯前端演示原型**，不是生产系统。
- 技术形态：原生 HTML/CSS/JavaScript，零 npm 依赖、零构建；浏览器 LocalStorage 持久化；Nginx 静态托管。
- 数据边界：单浏览器、单演示患者 + 单演示管理员；禁止录入真实身份证、病历、手机号等敏感资料。
- 代码规模：`index.html` + `src/scripts/{data,store,app,patient,admin,workflow}.js`（约 5,100 行）+ 2 个 CSS。
- 当前状态：患者端改版（首页/特色/订单/我的）为 2026-08-08 未提交修改；`workflow.js` 为已提交的工作流覆盖层，二者尚未完成集成（详见 `PROJECT_REORGANIZATION_SUMMARY.md`）。

## 2. 产品目标

按 `PRODUCT_REQUIREMENTS_ANALYSIS.md`（REQ-01 ~ REQ-13）执行，核心目标：

1. 首页保留"**人工下单 / AI下单**"双入口（REQ-01）。
2. 四个服务入口 **2×2 两排**，下方保留医院介绍区与扩展空间（REQ-02）。
3. 预约流程 = **患者填写个人信息 → 提交订单（待处理）→ 后台审核 → 管理员配置陪诊师 → 患者查看**（REQ-03/04/05/11）。
4. 就诊时间使用范围：**1-3天内 / 一周内 / 尽快**（REQ-07）。
5. 陪诊师信息**匹配前不可见、匹配后可见**（REQ-08）。
6. "诊前咨询"承担**患者情况采集**职责，支撑陪诊师匹配（REQ-09）。
7. 管理后台持续可用：数据维护、统计、人员配置、调价、**信息发布**（REQ-10）。
8. 订单状态闭环：待处理 → 已分配 → 服务中 → 已完成（待处理/已分配 → 已取消），只经状态机流转（REQ-11/12）。

## 3. 用户角色

- **患者**：填写就诊需求与个人信息；查看订单进展与陪诊师匹配结果；接收通知；查看陪诊报告。不参与陪诊师选择。
- **管理者**：后台数据维护、订单审核与派单、陪诊师配置、价格调整、医院/医院申请管理、信息发布、运营统计。
- **陪诊师**：当前无独立端，是后台可配置的资源对象（姓名/电话/专长/状态）；信息仅对已匹配患者可见。

## 4. 核心业务逻辑

### 目标主流程

```text
首页（人工下单 / AI下单）
  → 服务二级目录 → 立即预约
  → 患者信息 + 就诊信息（医院/科室/时间范围）→ 提交（状态：待处理）
  → "我的"查看进展（是否接单）
  → 管理员派单（已分配）→ 通知患者 → 患者可见陪诊师信息
  → 服务中 → 已完成 → 陪诊报告发布 → 患者查看 → 评价
```

### 状态机（唯一允许的状态流转）

```text
待处理 → 已分配 → 服务中 → 已完成
   └────→ 已取消（仅 待处理/已分配）
```

- 所有状态变更必须经 `CareStore.transitionNeed`（`store.js`）；禁止 `NeedPool.update` 直接改状态、禁止创建"已对接"状态。
- 派单只能由管理端完成；患者端提交订单状态必须为"待处理"，且不得携带陪诊师字段。

### 关键不变式

- 订单创建统一走 `CareStore.addNeed` / `CareStore.createNeedFromDraft`，并生成与 `amount` 一致的价格快照。
- 价格唯一来源：`PriceTable`（`CareStore.state.prices`）；禁止在页面硬编码价格。
- 医院唯一来源：`CareStore.state.hospitals`；医院别名与目录必须同一地域口径。
- 通知走 `CareStore.notify()`（角色 + 去重）；两端只读自己的通知。

## 5. 当前架构

### 加载顺序（不可调整）

```text
data.js → store.js → app.js → patient.js → admin.js → workflow.js
```

`workflow.js` 会**覆盖** `app.js`/`patient.js`/`admin.js` 的多个方法（AI 面板、通知、需求页、后台需求/收费/医院/系统设置、状态流转按钮等）。修改被覆盖方法时，必须同时确认 workflow.js 中的同名覆盖。

### 分层

- 数据定义层：`data.js`（NeedPool/PriceTable/MockData 等基础对象与模拟数据）。
- 状态层：`store.js`（CareStore：LocalStorage、版本合并、损坏恢复、旧池重绑、状态机、通知、报告；MediaService/IdentityOcrService/AiAssistantService）。
- 应用外壳：`app.js`（登录状态机、路由、手机壳、AI 浮球、toast/转义）。
- 患者端：`patient.js`（首页/特色/订单/我的 + 二级页面）。
- 管理端：`admin.js`（SaaS 后台页面）。
- 覆盖层：`workflow.js`（最新业务闭环的覆盖实现）。

### 已知遗留（修改前必读）

- workflow 患者页（`renderNeed`/`renderProgress`/`renderHospitals`）当前无 Tab 入口（孤儿代码，待按路线图接线或重构）。
- 孤儿数据：`ServiceCategories`/`ServiceCatalog`/`FeaturedHospitals`、陪诊师详情/下单页、旧 `renderFinance`（引用不存在的 `MockData.finance`）、DeepSeek `aiReply`（死代码）。
- `AIConfig.setKey` 为空实现；DeepSeek 路径不可用且不属于当前产品承诺。

## 6. 开发原则

1. **先看代码，再动手**：不假设功能存在、不信任旧文档；以工作区代码为准。
2. **单一事实源**：状态经 CareStore；价格经 PriceTable；医院经 CareStore.state.hospitals；文档以 docs/ 体系为准。
3. **状态机唯一**：任何状态变更走 `transitionNeed`；任何绕过都必须视为 Bug。
4. **演示边界**：不引入后端/数据库/真实认证；不保存真实敏感资料；不把模拟能力描述为生产能力。
5. **小步提交**：当前有未提交改版，新工作开始前先确认基线；改动按功能拆分提交。
6. **不扩大范围**：未获用户确认前，不做超出任务的产品性变更。

## 7. UI 规范

- 沿用现有设计变量：`style.css` 全局变量（`--accent`、`--radius-*`、`--status-*` 等），对齐"科研2"SaaS 视觉。
- 移动端：患者端手机壳在 ≥768px 居中显示（max-width 420px），窄屏全宽；`screen` 独立滚动，Tab 高度稳定。
- 后台：左侧导航 + 顶栏 + 主内容区；菜单与页面命名以 workflow 版为准（服务收费 = `pricing`）。
- 所有用户输入渲染前必须转义（`App.escape` / `WUtil.escape`）。
- 新页面样式优先写入对应 CSS 文件，避免在 JS 中注入大段样式（现有 patient.js 注入样式为历史遗留，新代码不再沿用）。
- 首页布局约束：四服务 2×2，医院介绍区在其下，为扩展保留空间。

## 8. 数据规范

- 主存储键：`huwuyou_store_v1`（`CareStore.version = 2`；升级结构时同步递增并实现 `merge` 兼容）。
- 损坏备份键：`huwuyou_store_corrupt_backup`；就诊人管理独立键：`huwuyou_patients`（计划并入 CareStore，见路线图）。
- 新增字段必须同步更新：`defaults()`、`merge()`、相关渲染与 workflow 覆盖。
- 图片：仅 JPEG/PNG/WebP；原图 ≤10MB；压缩后最长边 ≤1600px、目标 ≤800KB；报告/报告图片最多 6 张；身份证状态 `unconfirmed → confirmed`，重传回退。
- 需求必填：医院、科室、日期（范围）、服务类型；身份证与报告可后补。
- 通知去重键：`recipientRole + type + targetId + eventKey`。

## 9. 修改代码规则

1. 修改前定位所有相关方：全局搜索同名方法（尤其 `workflow.js` 覆盖）与调用点。
2. 患者端下单：只允许创建"待处理"订单；删除自动随机派单逻辑；陪诊师字段仅由后台写入。
3. 时间选择：使用 1-3天内/一周内/尽快；清理"今天/明天/后天"遗留。
4. 价格：读 `PriceTable.items`（`CareStore.state.prices`），不得新增硬编码价格表；提交时保存快照。
5. 状态：只经 `CareStore.transitionNeed`；迁移存量"已对接"数据为"已分配"。
6. 页面跳转：二级/三级页面提供可靠返回（明确"上一级"目标，不依赖 `history.back()`）。
7. 后台能力：信息发布、统计等新功能写入现有菜单结构（workflow 版），不复活旧 `renderFinance` 等死代码。
8. 删除代码前先确认无调用方（含 workflow 覆盖与内联 onclick）；删除后运行全局检索。
9. 保持脚本加载顺序；`index.html` 缓存版本号 `?v=` 随文件修改同步递增。

## 10. 测试要求

- 每次 JS 修改后：`node --check` 全部脚本（6 个文件）。
- 每次修改后完成浏览器冒烟：患者（登录/首页/人工下单/AI下单/预约提交/我的订单/通知）、管理员（登录/需求处理派单/推进状态/报告发布/调价/重置）。
- 状态机变更必须验证：合法流转、非法跳转报错、取消规则、通知触发。
- 数据兼容：结构升级后验证旧 `huwuyou_store_v1` 数据可加载（merge 不丢字段）。
- 图片链路：类型/大小/数量上限、压缩、配额失败提示、身份确认/回退。
- 响应式：375x812、430x932、桌面视口；Tab 切换与 AI 面板不改变外框尺寸。
- 自动化测试缺失是已知限制；本阶段至少维持人工清单 + 语法检查。

## 11. 文档维护规则

- 文档结构见 `docs/INDEX.md`：requirements / architecture / development / testing / planning / reports / archive。
- 新需求先存档原文到 `docs/requirements/`，再正式化到 `PRODUCT_REQUIREMENTS_ANALYSIS.md`（REQ 编号）。
- 方案被取代：旧文件移入 `docs/archive/`，不删除；移动后同步更新引用。
- 实现变更后：更新 README 功能清单、`REQUIREMENT_GAP_ANALYSIS.md` 状态、路线图进度。
- 开发记录写入 `docs/development/`；测试结果写入 `docs/testing/`；阶段审查写入 `docs/reports/`。
- 本文件（agent.md）变更需在 `PROJECT_REORGANIZATION_SUMMARY.md` 或开发记录中留痕。

## 12. 禁止事项

- ❌ 禁止直接修改代码完成"分析/规划"类任务；分析任务只输出文档。
- ❌ 禁止绕过 CareStore 直接改状态/创建"已对接"订单/患者端任意状态变更。
- ❌ 禁止新增硬编码价格、第三套服务/价格定义、第二套医院库。
- ❌ 禁止恢复已废弃能力（DeepSeek 前端直连、财务结算、医院对接人/绿色通道、陪诊师端选择）。
- ❌ 禁止在页面中展示未匹配订单的陪诊师信息（含随机分配）。
- ❌ 禁止引入 npm 依赖、打包器、后端服务或修改脚本加载顺序。
- ❌ 禁止删除/覆盖任何文档（归档代替删除）；禁止覆盖未提交的工作区改版。
- ❌ 禁止保存、展示或要求输入真实敏感资料（演示约束）。
- ❌ 禁止在没有基线确认（git status）的情况下开始修改。
