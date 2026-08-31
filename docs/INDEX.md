# docs 目录索引（2026-08-09 最终归档）

项目开发已全部完成，所有根目录文档已按分类归档至本目录。本文件是项目文档的唯一归档索引。
规则：**任何文档不得删除**；过时/废弃文档移入 `archive/`。

## 目录结构

| 目录 | 用途 | 内容 |
| --- | --- | --- |
| `requirements/` | 产品需求、用户需求原文 | `智陪护需求.docx`（原始需求）、`用户需求-2026-08-08.md`（用户白话需求原文）、`PRODUCT_REQUIREMENTS_ANALYSIS.md`（需求正式化 REQ-01~13）、`REQUIREMENT_GAP_ANALYSIS.md`（需求差距分析） |
| `architecture/` | 架构设计、UI 设计体系 | `APPLE_DESIGN_REFERENCE.md`（Apple 官方规范研究）、`UI_DESIGN_SYSTEM.md`（唯一设计系统定义）、`FINAL_UI_GUIDELINE_FOR_CLAUDE.md`（UI 执行规范与禁止事项）、`HOSPITAL_DATA_SOURCES.md`（23 家医院数据调研来源台账） |
| `development/` | 开发记录、完成报告、工作规范 | `CLAUDE.md`（AI Agent 最高工作规范）、`PHASE_0~3_COMPLETION_REPORT.md`、`PROJECT_COMPLETION_REPORT.md`（5 Phase 验收）、`FINAL_OPTIMIZATION_REPORT.md`（修复完成报告）、`HOSPITAL_DATA_RESEARCH_COMPLETION_REPORT.md`（23 家医院数据调研录入报告） |
| `planning/` | 实施路线图、开发计划、优化决策 | `IMPLEMENTATION_ROADMAP.md`（实施路线图）、`UI_OPTIMIZATION_ROADMAP.md`（逐页 UI 优化路线）、`FINAL_OPTIMIZATION_DECISION.md`（最终优化决策）、`2026-07-17-patient-ai-workflow-design.md`（患者-AI 工作流设计） |
| `reports/` | 代码审查、流程审计、UI 评估、验证报告 | `CURRENT_PROJECT_STATE_REVIEW.md`、`CODE_REVIEW_REPORT.md`、`BUSINESS_FLOW_AUDIT.md`、`AI_PAGE_DESIGN_REVIEW.md`、`FINAL_REVIEW_AND_FIX_PLAN.md`、`FIX_VALIDATION_REPORT.md`、`FINAL_UI_VISUAL_AUDIT.md`、`AI_PAGE_FINAL_DESIGN_REVIEW.md`、`FINAL_UI_ENHANCEMENT_PLAN.md`、`FINAL_PROJECT_VALIDATION_AND_UI_REPORT.md`、`FINAL_DELIVERY_REPORT.md` |
| `testing/` | 测试清单与验证记录 | `smoke-checklist.md`（人工冒烟测试清单） |
| `archive/` | 历史分析、废弃设计、被替代规范 | `PROJECT_ANALYSIS_REPORT.md`、`PROJECT_HANDOVER_ANALYSIS.md`、`CURRENT_UI_ANALYSIS.md`、`PROJECT_REORGANIZATION_SUMMARY.md`、`DOCUMENT_REQUIREMENT_AUDIT.md`、`UI_PLAN_INTEGRATION_REPORT.md`、`UI_DESIGN_INTEGRATION_ANALYSIS.md`、`agent.md`（被 CLAUDE.md 替代）、2 个 2026-07-20 旧方案 |
| `presentations/` | 技术汇报材料 | `ppt.html` / `pptx` / 演讲稿 / 渲染检查产物（保留原位） |
| `screenshots/` | 产品截图与设计参考图 | `product/`、`references/`（保留原位） |

## 文档定位速查

- 想了解产品做什么 → `requirements/PRODUCT_REQUIREMENTS_ANALYSIS.md`
- 想了解系统怎么实现 → `development/CLAUDE.md`（架构）或 `archive/PROJECT_ANALYSIS_REPORT.md`（历史分析）
- 想改 UI → `architecture/UI_DESIGN_SYSTEM.md` + `architecture/FINAL_UI_GUIDELINE_FOR_CLAUDE.md`
- 想了解质量与验证过程 → `reports/`（按时间顺序阅读）
- 想跑验收 → `testing/smoke-checklist.md`

## 归档规则

1. 新文档先判断分类再放入对应目录；拿不准的放入 `planning/` 并注明状态。
2. 方案被新方案取代后，旧文件移入 `archive/`，不要在文件名上标记"废弃"后留在原目录。
3. 所有移动/新增操作同步更新本索引与 README。
