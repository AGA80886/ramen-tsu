# ADR-0001：採用 Monorepo 專案結構

## Status

Accepted

## Context

拉麵通包含 Vue 前端、Express 後端與專案文件，需要統一管理版本、Issue、Pull Request 與發布流程。

## Decision

採用單一 Git Repository 管理：

- `front/`：Vue 3 前端
- `back/`：Express 後端
- `docs/`：專案文件
- `.github/`：GitHub 協作與自動化設定

## Consequences

### 優點

- 前後端版本容易同步
- Issue 與 PR 集中管理
- 適合畢業專題與小型團隊
- 文件與程式碼能一起維護

### 缺點

- Repository 容量會逐漸增加
- CI 必須區分前端與後端
- 前後端發布流程需要額外規劃
