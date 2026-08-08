# 最终审查报告与修复计划

> 交付对象：Claude Code（最后一轮优化执行规范）。
> 依据：CURRENT_PROJECT_STATE_REVIEW.md（状态）、CODE_REVIEW_REPORT.md（代码问题清单 C-01~C-30）、BUSINESS_FLOW_AUDIT.md（流程走查）、AI_PAGE_DESIGN_REVIEW.md（AI 专项）。
> 优先级定义：**P0 必须立即修复（Bug/数据错误/流程错误）；P1 本阶段修复（明显交互问题/UI 严重问题）；P2 体验优化；P3 未来增强。**
> 约束：不得改变品牌主色（#3b6cb5/#2c5a9e/#c4922e/slate）；不得修改代码之外的文档体系；改动前先读 CLAUDE.md 与 UI_DESIGN_SYSTEM.md。

## 一、总体评价

**功能正确性：7.5/10**

13 项需求主体功能真实落地：人工/AI 双入口、四服务两排、预约填信息、无陪诊师选择、订单进展、时间范围（表单路径）、陪诊师信息权限、诊前咨询、后台全模块、状态机、通知、演示边界均存在且可运行（语法 6/6、状态机冒烟测试通过）。

**业务合理性：6.5/10**

存在 4 个 P0：价格显示与实收不一致、日期语义分裂（范围 vs 固定）、陪诊师状态生命周期断裂（含"持久化"失实）、订单"待服务"Tab 失效。这些不是崩溃 Bug，但直接影响用户信任与演示可信度。

**UI/UX：6.5/10**

Design Token 体系落地、reduced-motion 全局化、转场动画、Liquid Glass TabBar 已实现；但品牌色偏离（紫色 Banner、绿色人工下单）、后台顶栏无玻璃、AI 面板无玻璃无动效、若干 stub 按钮，整体"规范有、执行不彻底"。

**总体判断：可演示，不可交付。** 完成最后一轮 P0/P1 修复后达到"功能正确 + 业务合理 + UI 统一"。

---

## 二、必须修复问题（P0）

> 全部验证通过前不得进入下一阶段。每项修复后必须按第七节验收标准自查。

### P0-1 价格显示与实际订单价不一致

- 现象：二级目录显示 ¥128/158/98/198/158/198/98/298（硬编码），提交后按映射收 ¥298/598/98/398。
- 位置：patient.js `_renderSubCategoryPage`（约 620-683）、`_submitBooking`（972-1018）。
- 修复方向：二级目录价格改为从 PriceTable 读取；若 8 个服务项需保留独立定价，则在 PriceTable 中新增对应项并统一 serviceType 映射，确保"显示价 = 订单价 = 快照价"。
- 验收：任一服务从首页到提交，三处价格（二级目录/确认/订单详情）完全一致。

### P0-2 日期语义统一为"范围制"

- 现象：预约表单用 1-3天/一周/尽快；草稿表单用 `<input type="date">`；AI 解析生成固定日期（下周二/2026-08-17）。
- 位置：workflow.js `renderNeed`（req_date）、store.js `AiAssistantService.interpret`、app.js `parseSpokenNeed`、store.js `createNeedFromDraft`。
- 修复方向：草稿表单改为范围 Chips（与预约表单一致）；AI 解析只输出"尽快/1-3天/一周内"（无法判断时默认"尽快"并提示）；`createNeedFromDraft` 校验 date 必须是三个范围值之一；存量固定日期订单兼容展示为"已预约日期待确认"。
- 验收：系统内不再出现"今天/明天/下周二/2026-08-17"等固定日期；所有订单 date 值为三选一。

### P0-3 陪诊师状态生命周期与持久化

- 现象：派单即"服务中"；完成后不释放；改的是 MockData.escorts（克隆），刷新丢失。
- 位置：workflow.js `Admin.assignEscortV2`/`finishServiceV2`、store.js `defaults`/`bindLegacy`。
- 修复方向：
  1. escort 状态机：空闲 → 已派单（分配时）→ 服务中（需求进入服务中时）→ 空闲（需求完成/取消时释放）；
  2. 状态变更写入 `CareStore.state.escorts` 并 `save()`；
  3. `bindLegacy` 增加 `MockData.escorts = this.state.escorts` 重绑（与 hospitals 一致）；
  4. 推荐列表 filter 改为 `status==='空闲'`（含新状态兼容）。
- 验收：派单→完成→刷新页面，陪诊师状态与推荐恢复正确；连续派 5 单后完成 1 单该陪诊师重新可推荐。

### P0-4 订单"待服务"筛选失效

- 现象：statusMap 无 '待服务' 键 → 显示全部订单。
- 位置：patient.js `renderOrders`（1467-1472）。
- 修复：补 `'待服务':'已分配'`（与卡片文案统一）；同时统一 Tab 与卡片状态文案（建议：待处理=待审核、已分配=待服务、服务中=进行中）。
- 验收：每个 Tab 点击后列表严格过滤。

---

## 三、交互优化建议（P1）

| 编号 | 问题 | 位置 | 修复方向 |
| --- | --- | --- | --- |
| P1-1 | 表单校验不足（电话格式/年龄上限/必填完整性） | patient.js `_submitBooking` | 手机号 11 位校验、age 0-120、紧急联系人可选但格式校验；错误用字段红框而非仅 toast |
| P1-2 | 患者取消订单绕过状态机且无通知 | patient.js `_cancelOrder` | 改 `CareStore.transitionNeed(id,'已取消')` |
| P1-3 | AI 上传承诺落空（文案承诺上传，实际无入口） | app.js `createNeedFromAI` | 提交后引导到"我的需求"证件/报告区，或删除承诺文案 |
| P1-4 | "申请新医院"路由错误（跳到"我的"Tab） | workflow.js `renderNeed` | 改为 `Patient.navigateTo(el=>Patient.renderHospitals(el),'医院介绍')` |
| P1-5 | 医院详情"立即预订"为 stub | patient.js `_bookHospital` | 接入 `_openBookingForm` 并预填医院 |
| P1-6 | 医院数据矛盾（上海医院库 vs 北京 AI 文案） | data.js / app.js / patient.js | 二选一：医院库补北京医院（协和/同仁/北大第一/301），或 AI 别名改为上海医院；保证下拉、AI 解析、预置订单一致 |
| P1-7 | 首页品牌色偏离（紫色 Banner、绿色人工下单） | style.css `.ph-banner-placeholder`、patient.js 首页 | Banner 改品牌蓝渐变；人工下单=主蓝、AI 下单=琥珀 |
| P1-8 | AI 面板无玻璃无动效无思考态 | workflow.css / workflow.js | 按 AI_PAGE_DESIGN_REVIEW.md 第 3 节执行（P1 三项：玻璃、入场动画、三点脉冲） |
| P1-9 | 联系陪诊师聊天不可达（订单无 escortId） | workflow.js `Admin.assignEscortV2` | 派单时写入 `escortId`；患者端聊天入口打通或移除 |
| P1-10 | 草稿表单日期控件与 AI 时间范围冲突 | workflow.js `renderNeed` | 同 P0-2 |

---

## 四、UI 优化建议（P2）

| 编号 | 问题 | 位置 | 方向 |
| --- | --- | --- | --- |
| P2-1 | 后台顶栏无玻璃材质 | style.css `.admin-topbar` | 应用 `.glass-bar`（blur 20px + rgba(255,255,255,0.78) + @supports 降级） |
| P2-2 | patient.js 注入样式 8 处 `transition:all` | patient.js 注入 CSS | 改指定属性 |
| P2-3 | `--shadow-sm/md` 重复声明 | style.css `:root` | 删除旧声明 |
| P2-4 | 订单"服务开始"时间显示范围值 | patient.js 订单详情 | 用状态变更时间/updatedAt |
| P2-5 | 游客可见演示患者订单 | patient.js `renderOrders` | 游客显示空态提示登录 |
| P2-6 | 我的页面 3/4 快捷入口为占位 toast | patient.js `_svcAction` | 实现或标注"即将上线"灰态 |
| P2-7 | 后台 toolbar 控件无绑定（搜索/筛选/新建/排班/回访工单） | admin.js | 实现或移除，禁止"看着可点实际无效" |
| P2-8 | 医院外链图片离线不可用 | data.js | 演示包内置占位图（本地 base64 或 SVG 占位） |
| P2-9 | AI 孤儿通知（NotifyPool.add 双通知） | app.js `createNeedFromAI` | 移除，统一 CareStore.notify |
| P2-10 | 医院申请审批中无提示 | store.js/patient.js | 表单中提示"医院申请审批中，通过后可预约" |
| P2-11 | 死代码未标记（legacy 后台方法、患者陪诊师页） | admin.js/patient.js | 标 DEPRECATED 或删除；`renderFinance` 加 MockData.finance 防御 |

---

## 五、AI 页面专项优化方案

**完整方案见 AI_PAGE_DESIGN_REVIEW.md。** 本阶段必须执行（P1）：

1. AI 面板玻璃化（rgba(255,255,255,0.78) + blur(24px) saturate(180%) + 高光内描边 + 圆角 20px + @supports 降级）。
2. 面板入场：mask fade 180ms + translateY(24px)/scale(0.98)→1，350ms ease-out；关闭反向。
3. 思考状态：aiSend 追加"正在整理…"气泡 + 三点脉冲（600ms），结果返回后替换。
4. 步骤条强化：当前步骤品牌蓝胶囊高亮。

本阶段建议执行（P2）：消息逐条淡入、浮球呼吸光晕（2.4s 克制循环 + reduced-motion 关闭）、背景径向光晕（仅登录态两处渐变）、确认卡高光线质感。

**AI 页面红线**：禁止粒子/霓虹/旋转/整屏动态背景；玻璃上不放长文本；所有动画走 token；reduced-motion 下全部关闭。

---

## 六、实施优先级与顺序

### 第一轮（P0，先做）

1. P0-1 价格统一
2. P0-2 日期范围统一
3. P0-3 陪诊师状态机 + 持久化
4. P0-4 订单 Tab 修复

### 第二轮（P1，功能与交互）

5. P1-1 表单校验
6. P1-2 取消走状态机
7. P1-3 AI 上传承诺
8. P1-4/P1-5 医院入口
9. P1-6 医院数据一致
10. P1-7 品牌色修复
11. P1-8 AI 面板（玻璃+动画+思考态）
12. P1-9 escortId 打通

### 第三轮（P2，体验打磨）

13. P2-1 ~ P2-11 按上述列表逐项执行
14. AI 页面 P2 项（消息淡入/浮球光晕/背景光晕/确认卡）

### 第四轮（P3，未来增强，不阻塞交付）

- 正式公告编辑器、工单实体、排班、全量陪诊师选择、iPad 专项、会话持久化。

**每轮完成标准**：执行对应冒烟清单（docs/testing/smoke-checklist.md）+ 本节第七节验收 + `node --check` 全部通过 + 手动走查患者/管理员主链路各一遍。

---

## 七、验收标准

### 功能验收

- [ ] 任一服务：二级目录价 = 确认价 = 订单详情价 = 价格快照价。
- [ ] 全站无固定日期；所有订单 date 为 尽快/1-3天/一周内 之一。
- [ ] 派单→完成→刷新：陪诊师状态正确释放且持久。
- [ ] 订单 6 个 Tab 过滤均正确。
- [ ] 患者取消订单：状态机校验 + 患者收到取消通知（或明确不通知但记录一致）。
- [ ] AI 下单：日期为范围制；医院在下拉中可选；上传承诺有实际入口。
- [ ] 医院详情"立即预订"能进入预约表单并预填医院。
- [ ] 手动走查：访客→登录→人工下单全链路；管理员→派单→服务→报告→患者查看评价全链路；无 Console 报错。

### UI 验收

- [ ] 首页 Banner/双入口颜色回到品牌蓝/琥珀体系，无紫色、无绿色渐变。
- [ ] 后台顶栏玻璃 + 降级正常。
- [ ] 全站无 `transition: all`；无 10px 以下正文（标签除外）。
- [ ] AI 面板玻璃、入场动画、思考态、步骤条强化到位；reduced-motion 下全部关闭。
- [ ] 无"看着可点实际无效"的按钮（stub 全部实现或置灰）。

### 质量验收

- [ ] `node --check` 6/6 通过。
- [ ] 冒烟清单 24 项全部勾选通过。
- [ ] 无新增硬编码颜色（除玻璃底/遮罩/高光）。
- [ ] 死代码全部标记 DEPRECATED 或删除。

---

## 附：文档索引

| 文档 | 用途 |
| --- | --- |
| CURRENT_PROJECT_STATE_REVIEW.md | 当前状态与完成报告失实处 |
| CODE_REVIEW_REPORT.md | 问题清单 C-01~C-30（代码级定位） |
| BUSINESS_FLOW_AUDIT.md | 患者/管理员全流程走查与需求符合性 |
| AI_PAGE_DESIGN_REVIEW.md | AI 页面专项方案（本报告第五节引用） |
| UI_DESIGN_SYSTEM.md | 设计系统唯一规范（改 UI 前必读） |
