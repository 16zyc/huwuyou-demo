# docs 目录说明（2026-08-08 归档整理）

本目录是项目文档的唯一归档体系。规则：**任何文档不得删除**；过时/废弃文档移入 `archive/`，活跃文档留在对应分类。

## 目录约定

| 目录 | 用途 | 当前内容 |
| --- | --- | --- |
| `requirements/` | 产品需求、用户需求原文 | `智陪护需求.docx`（原始需求）、`用户需求-2026-08-08.md`（最新用户白话需求原文） |
| `architecture/` | 架构设计、技术方案 | （规划中，待 Phase 1 后沉淀） |
| `development/` | 开发记录、变更说明 | （规划中） |
| `testing/` | 测试报告、验证记录 | （规划中） |
| `planning/` | 实施路线图、开发计划、活跃设计 | `2026-07-17-patient-ai-workflow-design.md`（活跃设计方案） |
| `reports/` | 审查报告、差距分析 | （规划中；当前根目录的分析报告为本阶段交付物） |
| `archive/` | 旧版本方案、废弃设计、历史分析 | `2026-07-20-project-handover-organization-design.md`、`2026-07-20-technical-handover-presentation-design.md` |

## 未移动的历史交付物

- `presentations/`：技术汇报材料（ppt.html / pptx / 演讲稿 / 渲染检查图）。README 大量引用其路径，且属于阶段性汇报产物，保留原位。
- `screenshots/`：产品截图与设计参考图。保留原位。

## 归档规则

1. 新文档先判断分类再放入对应目录；拿不准的放入 `planning/` 并注明状态。
2. 方案被新方案取代后，将旧文件移动到 `archive/`，不要在文件名上标记"废弃"后留在原目录。
3. 所有移动/新增操作同步更新 README 与 agent.md 中的引用。
