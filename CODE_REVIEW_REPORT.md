# 代码质量审查报告

> 审查范围：`src/scripts/*.js`（8 个文件，约 5,406 行）与 `src/styles/*.css`（约 1,618 行）。
> 验证手段：逐文件通读 + `node --check` 语法校验 + Node 冒烟测试（状态机/价格/草稿/医院申请/通知/AI 解析）。
> 严重程度：P0 必须修复 / P1 高优先级 / P2 建议优化 / P3 长期优化。

## 一、总体结论

- 架构方向正确：单一状态层（CareStore）+ 覆盖层（workflow.js）+ 页面层（patient/admin）的分层清晰，状态机收敛到位。
- 语法质量良好：6 个 JS 文件 `node --check` 全部通过；`transition: all` 在 CSS 文件中已收敛（残留 8 处在 patient.js 注入样式中）。
- 主要问题集中在**业务一致性**（价格、日期、陪诊师状态）与**遗留死代码**，而非崩溃型 Bug。

---

## 二、问题清单

| 编号 | 位置 | 问题类型 | 严重程度 | 描述 | 建议 |
| --- | --- | --- | --- | --- | --- |
| C-01 | patient.js `_renderSubCategoryPage`（约 620-683）与 `_submitBooking`（972-1018） | 业务逻辑 | **P0** | 二级目录硬编码显示价（就诊咨询 ¥128/158、代取报告 ¥98/128、预约车辆 ¥158/188…），但提交时按 serviceKey 映射到 PriceTable 价格（半程 ¥298/全程 ¥598/代办 ¥98/复诊 ¥398）。7/8 个服务显示价 ≠ 订单价（如"就诊咨询"显示 ¥128 实收 ¥298；"特色专家"显示 ¥298 实收 ¥598）。违反"价格唯一来源 PriceTable"规则 | 二级目录价格从 PriceTable 读取；或为 8 个服务建立统一 serviceType 映射并显示 PriceTable 实际价 |
| C-02 | workflow.js `renderNeed`（req_date 为 `<input type="date">`）与 store.js `AiAssistantService.interpret`（生成固定日期）、app.js `parseSpokenNeed` | 需求符合性 | **P0** | 日期语义分裂：预约表单用范围 Chips（1-3天/一周/尽快，符合需求），但草稿表单用固定日期选择器，AI 解析生成固定日期（"下周二"→"2026-08-17"）。同一系统存在三种日期语义，订单 date 字段值混杂 | 统一为范围语义：草稿表单改用范围 Chips；AI 解析只识别"尽快/1-3天/一周内"或明确转化为范围；历史固定日期订单做兼容展示 |
| C-03 | workflow.js `Admin.assignEscortV2`（line 180）+ admin.js `renderEscorts`（667-666）+ store.js `defaults` | 状态生命周期 | **P0** | 1) 派单时把陪诊师状态置为"服务中"，语义错误（需求才"已分配"）；2) 服务完成后陪诊师状态永不释放回"空闲"，5 名陪诊师派完后再无推荐人选；3) 派单改的是 `MockData.escorts`，而持久化的是 `CareStore.state.escorts`（克隆），刷新后状态丢失，"陪诊师持久化"未实现 | 增加 escort 状态机：空闲→已派单→服务中→空闲；状态变更统一走 CareStore 并持久化；bindLegacy 重绑 escorts |
| C-04 | patient.js `renderOrders` statusMap（1467-1472） | 逻辑错误 | **P0** | "待服务" Tab 在 statusMap 中无映射 → filterStatus 为 undefined → 显示全部订单，用户误以为筛选失效 | 补充 `'待服务':'已分配'` 或删除该 Tab 并统一文案 |
| C-05 | patient.js `_submitBooking`（972-1018） | 校验不足 | P1 | 只校验姓名/年龄/科室；电话格式、紧急联系人、手机号、性别等未校验；`insurance` 硬编码为空字符串 | 增加手机号格式校验（11 位）、必填提示；insurance 从 MockData 带入 |
| C-06 | patient.js `_cancelOrder`（1653-1658） | 架构违规 | P1 | 取消订单直接 `NeedPool.update`（→ CareStore.updateNeed）绕过 `transitionNeed`：无状态守卫（任何状态可改）、不产生患者通知 | 改用 `CareStore.transitionNeed(id,'已取消')` 并捕获非法流转 |
| C-07 | app.js `createNeedFromAI`（约 497-518） | 数据一致性 | P1 | AI 创建的订单 `idCardFront/idCardBack/reportFiles` 全为 null，但回复文案承诺"上传身份证和检查报告"；`[立即上传证件]` 只切 Tab，无上传引导 | AI 提交后引导到"我的需求"表单的证件/报告区；或删除文案承诺 |
| C-08 | app.js `createNeedFromAI`（NotifyPool.add） | 数据污染 | P2 | AI 建单产生双通知：`CareStore.addNeed` 的正确 admin 通知 + `NotifyPool.add` 的无 `recipientRole` 孤儿通知（admin 列表不可见，污染存储） | 删除 `NotifyPool.add` 调用，统一走 CareStore.notify |
| C-09 | admin.js legacy `renderNeeds/openNeed/renderTrack/renderFinance/renderSystem`（402-664/890-940/1070+） | 死代码 | P2 | workflow.js 覆盖后不可达；其中 `renderFinance` 引用不存在的 `MockData.finance`，一旦被调用直接 TypeError | 标记 DEPRECATED 或删除；补上 `MockData.finance` 防御 |
| C-10 | patient.js `renderEscorts/openChatWithEscort/goEscortDetail/_submitEscortOrder`（1183-1465） | 死代码 | P3 | 患者端无任何 Tab/入口调用（"陪诊师入驻"入口为占位 toast），约 280 行不可达 | 标记 DEPRECATED 或接入实际入口 |
| C-11 | style.css `:root`（31-32 与 54-56） | 代码整洁 | P2 | `--shadow-sm/--shadow-md` 重复声明两次，旧值被覆盖，易误导 | 删除旧声明，保留一套 |
| C-12 | patient.js 注入样式（约 52/61/179/320/332/344/376/383 行） | 规范违规 | P2 | 8 处 `transition:all .15s`，违反 UI 规范"禁止 transition: all" | 改为指定属性 |
| C-13 | workflow.js `renderNeed` 中"申请新医院"按钮（line 120） | 路由错误 | P1 | `onclick="App.switchTab(3)"` 跳到"我的"Tab，而医院申请入口在"医院介绍"页（renderHospitals） | 改为 `Patient.navigateTo(el => Patient.renderHospitals(el), '医院介绍')` |
| C-14 | patient.js `_bookHospital`（1177-1181） | 交互 stub | P1 | 医院详情"立即预订/预约陪诊"只 `App.switchTab(1)`，无任何预约表单 | 接入 `_openBookingForm`，预填医院 |
| C-15 | patient.js `renderOrders` 游客可见王秀兰预置订单 | 隐私边界 | P2 | 游客态下订单列表直接展示演示患者（王秀兰）的已完成订单信息 | 游客态隐藏订单列表或显示空态 |
| C-16 | store.js `merge()` | 数据迁移 | P2 | `needs` 直接取 loaded 数组，旧版本"已对接"等历史状态不迁移（defaults 有迁移但 merge 没有） | merge 时对旧状态做映射 |
| C-17 | admin.js `renderPatients` toolbar | 功能 stub | P2 | 搜索/筛选/新建患者按钮无绑定逻辑（样式存在但不生效） | 补搜索过滤与新建表单，或移除按钮 |
| C-18 | admin.js `openEscort` "排班"按钮 | 功能 stub | P2 | 点击仅 toast"已打开排班编辑"，无实际功能 | 实现或移除 |
| C-19 | app.js `App.state` 不持久化 | 会话体验 | P3 | 刷新后登录态丢失，回到访客 | 演示可接受；如需可存 sessionStorage |
| C-20 | data.js 医院图片外链 `trae-api-cn.mchost.guru` | 稳定性 | P2 | 23 家医院图片依赖外部 API，离线/断网时全部隐藏（有 onerror 降级），且可能加载慢 | 演示包内置占位图或本地化图片 |
| C-21 | store.js `submitHospitalApplication` 后 draft 锁定 | 流程约束 | P2 | 申请新医院后 `draft.hospitalApplicationId` 被设置，审批通过前无法提交该医院需求（有意为之但无明确提示文案） | 在表单中提示"医院申请审批中"状态 |
| C-22 | patient.js 订单时间线"服务开始"显示 n.date | 信息展示 | P2 | 服务开始时间用 date 字段（现为"1-3天"等范围），语义错误 | 用 updatedAt 或状态变更时间 |
| C-23 | workflow.js `Admin.openNeed` 推荐陪诊师上限 3 人且仅"空闲" | 体验 | P3 | 全部派单后推荐区为空且无"查看全部陪诊师"入口 | 增加全部陪诊师列表选择 |
| C-24 | admin.js `renderReviews` 差评"创建回访工单" | 功能 stub | P2 | 仅 toast，无工单实体 | 实现工单状态或移除 |
| C-25 | workflow.css `.ai-panel`/`.ai-msg` 等 | 设计实现 | P1 | AI 面板无玻璃、无入场动画、无思考状态（详见 AI_PAGE_DESIGN_REVIEW.md） | 按 AI 页面专项方案执行 |
| C-26 | style.css `.ph-banner-placeholder` 紫色渐变 / patient.js 首页人工下单绿色渐变 | 品牌偏离 | P1 | 首页 Banner 使用 `#667eea→#764ba2` 紫色渐变、人工下单入口绿色渐变，与设计体系"主蓝+琥珀"不符 | 改回品牌蓝/琥珀渐变 |
| C-27 | style.css `.admin-topbar` | 设计实现 | P2 | 顶栏为纯白实底，未按规范做玻璃材质 | 加 `.glass-bar` 类 |
| C-28 | style.css `.screen` padding 等 | Token 使用 | P3 | space tokens 已定义但多数页面仍用硬编码 padding（14px/18px 等） | 分批替换为 `--space-*` |
| C-29 | patient.js `_renderServiceBigCard`（560-583） | 死代码 | P3 | 首页改用 `.ph-svc-tile` 网格后未调用 | 标记 DEPRECATED 或删除 |
| C-30 | workflow.js `App.closeAI` 中 `patientTab===1` 重渲染逻辑 | 逻辑冗余 | P3 | 关闭 AI 时对 Tab 1 重渲染无明确目的 | 复核后简化 |

---

## 三、模块级评审

### 3.1 store.js（状态层）— 质量较高

- 优点：状态机白名单、价格校验、医院申请去重、通知去重（dedupeKey）、数据损坏兜底（backupKey）、图片压缩均实现到位。
- 问题：escorts 未重绑（C-03）、merge 不迁移旧状态（C-16）、`createNeedFromDraft` 依赖 draft 但无时间范围校验（配合 C-02）。

### 3.2 workflow.js（覆盖层）— 结构正确但需收敛

- 优点：AI 确认式下单、共享草稿、进度条、后台状态流转/报告/公告全部在此，职责集中。
- 问题：单行超长（renderHospitals/renderPricing/renderSystem 均为一整行模板字符串），可维护性差（P3）；aiSend 同步返回无思考态（P1）。

### 3.3 patient.js — 页面多但职责混杂

- 问题：注入样式与 style.css 重复定义同名单类（`.ai-order-banner`、`.ph-svc-tile`），后者覆盖前者，排查困难（P2）；价格硬编码（C-01）；死代码多（C-10/C-29）。

### 3.4 admin.js — 新旧两套并存

- 问题：workflow 覆盖后大量 legacy 方法不可达但未标记（C-09）；toolbar 控件无绑定（C-17）。

### 3.5 数据层

- 问题：医院库上海 vs 北京文案矛盾（C-31 见 BUSINESS_FLOW_AUDIT.md）；外链图片（C-20）。

---

## 四、冒烟测试结果（Node）

```
✔ 状态机：待处理→已分配→服务中→已完成 全链路通过
✔ 状态机：非法回退（已完成→待处理）被拒绝
✔ 状态机：已取消分支通过
✔ 价格：负数/非数字被拒绝；有效改价产生变更记录
✔ 草稿：空医院/科室/日期被拒绝
✔ 医院申请：重复申请被去重
✔ 通知：admin/patient 通知自动生成
✔ AI 解析：'下周二去协和看心内科全程陪诊' → 医院/科室/服务类型/固定日期
✘ 确认：MockData.escorts !== CareStore.state.escorts（克隆分离，派单状态不持久）
```
