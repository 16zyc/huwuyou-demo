# 护无忧项目工程化整理与交接设计

## 背景

当前项目是一个无构建依赖的纯前端演示应用，入口为 `index.html`，业务代码分布在根目录下的 `js/` 与 `css/`，需求文档、演示页面和截图也散落在根目录。项目缺少 README、忽略规则、运行说明和模块交接信息，不利于新的开发者快速接手。

## 目标

1. 将运行代码、部署配置、需求材料、演示材料和截图按用途分类。
2. 保持现有业务行为、全局对象加载顺序和无构建依赖的运行方式不变。
3. 提供一份可独立完成项目理解、启动、部署和继续开发的 README。
4. 对重构后的资源路径和 JavaScript 语法进行基础验证。
5. 生成一个不包含 Git 元数据和系统垃圾文件的完整桌面交接压缩包。

## 非目标

- 不修改患者端、管理端或 AI 工作流的业务逻辑。
- 不引入 Vite、Webpack、npm 依赖或新的后端服务。
- 不拆分现有大型 JavaScript 文件，不改变其全局对象接口。
- 不删除原始需求、截图、演示资料或现有设计记录。

## 目标目录结构

```text
智能陪护/
├── index.html
├── src/
│   ├── scripts/
│   │   ├── data.js
│   │   ├── store.js
│   │   ├── app.js
│   │   ├── patient.js
│   │   ├── admin.js
│   │   └── workflow.js
│   └── styles/
│       ├── style.css
│       └── workflow.css
├── docs/
│   ├── requirements/
│   ├── presentations/
│   │   └── rendered/
│   ├── screenshots/
│   │   ├── product/
│   │   └── references/
│   └── superpowers/specs/
├── deploy/
├── README.md
└── .gitignore
```

## 迁移规则

- `js/` 整体迁移到 `src/scripts/`，保持文件名及脚本加载顺序。
- `css/` 整体迁移到 `src/styles/`。
- 根目录需求文档迁移到 `docs/requirements/`。
- 演示文件和生成检查产物迁移到 `docs/presentations/`；幻灯片渲染图迁移到其 `rendered/` 子目录。
- 根目录参考图片迁移到 `docs/screenshots/references/`，产品页面截图迁移到 `docs/screenshots/product/`。
- `index.html` 中的样式和脚本地址更新为新路径。
- `deploy/` 与已有 `docs/superpowers/specs/` 保留原用途。
- 迁移完成并确认内容齐全后，删除空的 `js/`、`css/` 和 `outputs/` 目录。

### 逐项迁移表

| 现有路径 | 目标路径 | 说明 |
| --- | --- | --- |
| `js/*.js` | `src/scripts/*.js` | 保持原文件名与入口加载顺序 |
| `css/*.css` | `src/styles/*.css` | 保持原文件名 |
| `智陪护需求.docx` | `docs/requirements/智陪护需求.docx` | 原始需求文档 |
| `ppt.html` | `docs/presentations/ppt.html` | HTML 演示稿；同步更新其本地引用 |
| `outputs/护无忧-技术交接汇报.pptx` | `docs/presentations/护无忧-技术交接汇报.pptx` | PowerPoint 演示稿 |
| `outputs/护无忧-技术交接汇报-演讲稿.md` | `docs/presentations/护无忧-技术交接汇报-演讲稿.md` | 演讲稿 |
| `outputs/护无忧-技术交接汇报.pptx.inspect.ndjson` | `docs/presentations/护无忧-技术交接汇报.pptx.inspect.ndjson` | 演示稿生成检查记录 |
| `outputs/护无忧-技术交接汇报/slide-*.png` | `docs/presentations/rendered/slide-*.png` | 17 张幻灯片渲染图，不重命名 |
| `outputs/assets/*.png` | `docs/screenshots/product/*.png` | 4 张产品页面截图，不重命名 |
| `微信图片_20260707004938_1004.jpg` | `docs/screenshots/references/reference-ui-20260707.jpg` | 参考界面图；唯一重命名项之一 |
| `微信图片_2026-07-15_111601_171.jpg` | `docs/screenshots/references/reference-ui-20260715.jpg` | 参考界面图；唯一重命名项之一 |

重名冲突时不得覆盖文件；应保留原文件并在目标文件名末尾追加短日期或递增序号，同时把最终映射记录到 README。所有 HTML/CSS/Markdown 中指向迁移文件的相对路径必须同步更新并通过引用检查。

## 运行时约束

脚本依赖全局对象且顺序敏感，入口页必须按以下顺序加载：

1. `data.js`：模拟数据和基础数据池。
2. `store.js`：LocalStorage 状态层和服务适配器。
3. `app.js`：登录、路由和应用主控。
4. `patient.js`：患者端界面与交互。
5. `admin.js`：管理后台界面与交互。
6. `workflow.js`：跨端工作流增强和初始化逻辑。

整理过程中不得通过文件名排序替代上述显式顺序。

## README 内容

README 至少覆盖：

- 项目定位、当前状态和演示性质声明。
- 技术栈与目录结构。
- 无依赖快速启动方式，以及不能直接运行时的本地静态服务器方案。
- 患者端和管理端演示登录方式。
- 核心模块职责、加载顺序和关键数据流。
- LocalStorage 键、重置演示数据的方法和敏感数据注意事项。
- Nginx 部署配置说明。
- 已知限制、生产化缺口和建议后续开发优先级。
- 交接材料索引与继续开发检查清单。

## 验证方案

1. 对所有 JavaScript 文件执行语法检查。
2. 检查 `index.html` 引用的本地脚本和样式文件均存在。
3. 检查 `ppt.html` 的本地资源引用均存在。
4. 通过本地静态 HTTP 服务和浏览器完成烟雾测试：入口页加载后控制台无致命错误；患者端可使用演示账号进入并打开首页、我的需求和 AI 助手；管理端可使用演示账号进入并打开工作台与需求处理页面。
5. 检查 ZIP 顶层只有 `智能陪护-开发交接包-20260720/`，其中必须包含 `index.html`、`src/` 全部代码、`deploy/`、`README.md`、`.gitignore`、需求 DOCX、HTML/PPTX 演示稿、演讲稿、检查记录、17 张幻灯片渲染图、4 张产品截图、2 张参考图片和全部设计规范。
6. ZIP 必须排除 `.git/`、`.DS_Store`、既有 ZIP 文件和临时日志。生成后解压到独立临时目录，再次执行 JavaScript 语法、本地引用和 HTTP 可访问性检查。

## 风险与回退

- 主要风险是移动文件后资源路径失效；通过引用扫描和 HTTP 启动检查降低风险。
- JavaScript 使用全局对象，加载顺序变化会导致运行错误；入口页保持原顺序。
- 演示数据存储在浏览器 LocalStorage 中，目录迁移不会迁移浏览器数据；README 明确说明清理与初始化方法。
- 迁移前依赖当前 Git 工作树保留原始受控文件，未跟踪的 `outputs/` 在移动时采用逐项校验；如验证失败，暂停打包并按迁移表逆向移回，不执行破坏性清理。完成后的 ZIP 也可作为独立只读交付副本，不依赖后续 Git 提交。

## 交付物

- 整理后的完整项目目录。
- 根目录 `README.md` 与 `.gitignore`。
- 桌面压缩包 `智能陪护-开发交接包-20260720.zip`，其顶层目录为 `智能陪护-开发交接包-20260720/`。
- 基础验证结果与压缩包路径说明。
