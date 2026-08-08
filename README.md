# 护无忧 · 智陪诊全链路平台

这是一个面向智能陪诊业务的纯前端交互原型，包含患者端、管理端、本地规则型 AI 助手、陪诊需求流转、医院审批、收费配置和陪诊报告等演示功能。

> 当前版本仅用于产品与流程演示，不是可直接上线的生产系统。数据只保存在当前浏览器的 LocalStorage 中。请勿输入或上传真实身份证、病历、检查报告、手机号等敏感资料。

## 快速开始

项目没有 npm 依赖，也不需要编译。

推荐在项目根目录启动本地静态服务器：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000/
```

也可以直接双击 `index.html`，但部分浏览器对 `file://` 页面存在安全限制；遇到资源、上传或存储异常时，请使用 HTTP 方式运行。

## 演示登录

### 患者端

- 手机号：页面已预填，可使用任意非空测试手机号
- 验证码：`8888`
- 也可点击“一键演示登录”

### 管理端

- 账号：`admin@huwuyou`
- 密码：`huwuyou2026`
- 验证码：`8888`
- 也可点击“一键演示登录”

当前登录校验仅用于演示：管理员账号和密码只检查是否为空，不具备真实身份认证能力。

## 项目结构

```text
.
├── index.html                         # 应用入口和脚本加载顺序
├── src/
│   ├── scripts/
│   │   ├── data.js                    # 模拟数据、需求池、价格、医院与通知
│   │   ├── store.js                   # LocalStorage 状态层与服务适配器
│   │   ├── app.js                     # 登录、路由、患者端外框和旧 AI 兼容逻辑
│   │   ├── patient.js                 # 患者端页面与交互
│   │   ├── admin.js                   # 管理后台页面与交互
│   │   └── workflow.js                # 统一工作流增强、状态流转和最终初始化
│   └── styles/
│       ├── style.css                  # 全局设计变量、布局与组件样式
│       └── workflow.css               # AI、资料上传和跨端工作流样式
├── deploy/
│   └── nginx-huwuyou-demo.conf        # `/huwuyou-demo/` 演示站配置片段
└── docs/
    ├── INDEX.md                       # 文档归档总索引（唯一入口）
    ├── requirements/                  # 产品需求与需求分析
    ├── architecture/                  # 架构设计与 UI 设计体系
    ├── development/                   # 开发记录、完成报告与工作规范
    ├── planning/                      # 实施路线图与开发计划
    ├── reports/                       # 代码审查、流程审计与 UI 评估报告
    ├── testing/                       # 冒烟测试清单
    ├── presentations/                 # HTML/PPTX 演示稿、演讲稿和渲染检查产物
    ├── screenshots/
    │   ├── product/                   # 产品页面截图
    │   └── references/                # 设计参考图
    └── archive/                       # 历史分析、废弃设计与被替代规范
```

> 全部项目文档已归档至 `docs/` 分类目录，总索引见 [docs/INDEX.md](docs/INDEX.md)。

## 代码加载顺序

项目使用传统 `<script>` 和全局对象，没有 ES Module 或打包器，加载顺序不能随意调整：

1. `data.js` 创建 `NeedPool`、`PriceTable`、`MockData` 等基础对象。
2. `store.js` 创建 `CareStore`、图片/OCR/AI 适配器，并初始化持久化状态。
3. `app.js` 创建 `App`，负责登录和顶层路由。
4. `patient.js` 创建 `Patient` 和患者端页面。
5. `admin.js` 创建 `Admin` 和管理后台页面。
6. `workflow.js` 基于前述对象追加统一工作流，并覆盖部分旧渲染方法。

若准备改造成模块化工程，建议先为这些全局对象建立明确的导入导出边界和自动化回归测试，再逐步拆分。

## 核心业务与数据流

```text
患者填写表单或与 AI 对话
        ↓
CareStore 创建需求并保存价格快照
        ↓
管理端收到通知、分配陪诊师并推进状态
        ↓
患者端同步看到进度
        ↓
管理端完成服务、填写并发布陪诊报告
        ↓
患者查看报告并提交评价
```

需求的主要状态为：

```text
待处理 → 已分配 → 服务中 → 已完成
   └────────────────→ 已取消
```

`CareStore` 是当前有效的数据入口。`NeedPool`、`PriceTable` 等早期对象仍被保留用于初始化和兼容，后续开发应尽量通过 `CareStore` 修改状态，避免患者端和管理端数据不同步。

## 本地数据

主要 LocalStorage 键：

- `huwuyou_store_v1`：当前演示状态。
- `huwuyou_store_corrupt_backup`：解析失败时保存的原始数据备份。

重置方式：

- 管理端进入“系统设置”，点击“重置演示数据”；或
- 在浏览器开发者工具中执行：

```js
localStorage.removeItem('huwuyou_store_v1');
location.reload();
```

上传图片会转成压缩后的 Data URL 存进 LocalStorage，容量有限。大量或较大的图片可能触发浏览器存储配额错误。

## 主要功能入口

> ⚠️ 标注「规划中」的功能代码已存在但当前 UI 不可达，将在后续版本接入。

患者端包括：

- 首页（Banner + AI 智能下单入口 + 四服务 2×2 网格 + 热门医院区）
- 服务二级目录 → 流程步骤 → 立即预约 → 填写患者信息 → 提交订单
- 订单查看（状态筛选 / 详情时间线）
- 个人中心（统计 / 就诊人管理）
- 医院列表 / 搜索 / 详情
- AI 陪诊助手（本地状态机，不使用外部模型）
- 通知提醒
- 身份证上传与演示 OCR（规划中，UI 待接入）
- 陪诊进度页（规划中，UI 待接入）
- 医院介绍与新增医院申请（规划中，UI 待接入）
- 患者评价（规划中）
- 紧急联系（规划中）

管理端包括：

- 工作台（KPI 概览 / 待处理 / 服务中列表）
- 需求处理（查看 / 分配陪诊师 / 推进状态）
- 服务跟踪（已分配 / 服务中订单管理）
- 陪诊师管理（查看 / 编辑）
- 医院审批与资料维护
- 服务收费（价格调整 + 变更记录）
- 陪诊报告编辑与发布
- 评价反馈
- 系统设置（数据重置）

## 部署

静态文件可部署到任意静态 Web 服务器。仓库内的 `deploy/nginx-huwuyou-demo.conf` 是 Nginx `server` 块内使用的配置片段，默认目录为：

```text
/var/www/huwuyou-demo/
```

示例部署步骤：

```bash
sudo mkdir -p /var/www/huwuyou-demo
sudo cp -R index.html src docs deploy README.md /var/www/huwuyou-demo/
```

将配置片段包含进目标 `server` 块后执行：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

访问地址为 `/huwuyou-demo/`。实际服务器路径、用户权限、域名、HTTPS 和缓存策略需由部署环境负责人确认。

## 交接材料

- 文档归档总索引：[docs/INDEX.md](docs/INDEX.md)
- 原始需求：[docs/requirements/智陪护需求.docx](docs/requirements/智陪护需求.docx)
- 需求正式化与差距分析：[docs/requirements/PRODUCT_REQUIREMENTS_ANALYSIS.md](docs/requirements/PRODUCT_REQUIREMENTS_ANALYSIS.md)
- UI 设计体系与执行规范：[docs/architecture/UI_DESIGN_SYSTEM.md](docs/architecture/UI_DESIGN_SYSTEM.md)
- 代码审查与最终验证报告：[docs/reports/FINAL_PROJECT_VALIDATION_AND_UI_REPORT.md](docs/reports/FINAL_PROJECT_VALIDATION_AND_UI_REPORT.md)
- HTML 技术汇报：[docs/presentations/ppt.html](docs/presentations/ppt.html)
- PowerPoint 技术汇报：[docs/presentations/护无忧-技术交接汇报.pptx](docs/presentations/护无忧-技术交接汇报.pptx)
- 汇报演讲稿：[docs/presentations/护无忧-技术交接汇报-演讲稿.md](docs/presentations/护无忧-技术交接汇报-演讲稿.md)
- 产品截图：[docs/screenshots/product/](docs/screenshots/product/)
- 开发计划与完成报告：[docs/planning/](docs/planning/) 与 [docs/development/](docs/development/)
- 历史分析与旧方案：[docs/archive/](docs/archive/)

`docs/presentations/rendered/` 和 `.inspect.ndjson` 是 PowerPoint 视觉检查产物，便于后续确认演示稿渲染是否变化。

## 已知限制

- 没有后端、数据库、真实短信、支付、地图、消息推送或文件存储服务。
- 所有角色共享同一浏览器中的模拟数据，刷新不会丢失，但换浏览器或域名不会同步。
- 登录、权限和数据隔离都是演示级实现，不能用于真实用户。
- AI 助手当前是本地关键词和状态机，不会调用外部模型。
- OCR、图片处理和医院信息均为演示逻辑，不应据此作医疗判断。
- 大型 JavaScript 文件仍通过全局对象耦合，缺少单元测试、端到端测试和类型检查。
- 原有演示 PPT 反映阶段性实现，代码行为与细节以当前仓库和本 README 为准。

## 建议的后续开发顺序

1. 明确隐私合规、数据保存期限、用户授权和医疗免责声明。
2. 建立后端 API、数据库、对象存储和真实身份认证，浏览器不再保存敏感资料。
3. 把 `CareStore` 替换为 API 仓储层，并保留统一的状态流转校验。
4. 将全局脚本迁移为 ES Modules 或框架工程，拆分患者端、管理端和共享领域模型。
5. 补充单元测试、状态流转测试和患者/管理员端到端测试。
6. 接入短信、通知、支付、审计日志和运行监控。
7. 如需真实大模型能力，只允许通过后端代理调用，并增加脱敏、内容审核和人工确认。

## 接手开发检查清单

- 使用本地 HTTP 服务启动项目，而不是只测试 `file://`。
- 分别登录患者端和管理端，确认核心页面正常显示。
- 修改前先清楚 `workflow.js` 是否覆盖了目标文件中的同名方法。
- 改动状态时优先使用 `CareStore`，不要直接改页面 DOM 或仅修改旧数据池。
- 调整入口脚本时保持依赖顺序，检查浏览器控制台错误。
- 测试图片上传时只使用虚构测试资料。
- 部署前移除演示账号提示，并完成真实认证、权限、隐私与安全评审。

## 许可证与责任

仓库当前未声明开源许可证。未经项目所有者明确授权，不应按开源项目对外再分发或商用。医疗相关内容只用于功能演示，不构成诊断、治疗或用药建议。
