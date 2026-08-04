# Git Flow 開發流程

> 專案名稱：**拉麵通（Ramen Tsu）**  
> 分支策略：`feature → develop → main`  
> 開發方式：Issue 驅動開發 + Pull Request Review

---

# 1. Git Flow 概覽

拉麵通採用下列分支流程：

```text
feature/*
    │
    ▼
develop
    │
    ▼
main
```

各分支用途如下：

| 分支         | 用途                       |
| ------------ | -------------------------- |
| `main`       | 穩定版本、正式發布版本     |
| `develop`    | 日常整合分支               |
| `feature/*`  | 單一功能開發               |
| `fix/*`      | 一般錯誤修正               |
| `hotfix/*`   | 正式環境緊急修正           |
| `docs/*`     | 文件更新                   |
| `chore/*`    | 套件、設定、同步等維護工作 |
| `refactor/*` | 不改變功能的程式重構       |

核心原則：

```text
所有新功能從 develop 建立分支

所有功能先合併回 develop

develop 穩定後才合併到 main
```

---

# 2. 分支角色

## 2.1 `main`

`main` 代表目前最穩定的版本。

適合放置：

- 已通過測試的功能
- 可部署版本
- 發布版本
- 正式環境程式碼
- Release Tag

不建議直接在 `main` 上開發。

錯誤做法：

```bash
git switch main

# 直接修改程式
git add .
git commit -m "feat: add product page"
```

正確做法：

```text
develop
→ feature branch
→ Pull Request
→ develop
→ Pull Request
→ main
```

---

## 2.2 `develop`

`develop` 是主要開發整合分支。

用途：

- 整合已完成的功能
- 作為新功能分支的基底
- 執行整合測試
- 準備下一次發布

每次建立新功能分支前，都應先同步最新 `develop`。

```bash
git switch develop
git pull --ff-only origin develop
```

---

## 2.3 `feature/*`

`feature/*` 用於開發單一功能。

命名格式：

```text
feature/<issue-number>-<feature-name>
```

例如：

```text
feature/8-shared-ui-components
feature/9-api-service
feature/10-project-documentation
```

建議每個 Feature Branch 只處理一個 Issue。

不要把以下內容混在同一個分支：

```text
Theme System
+
API Service
+
後端 CORS
+
README
```

應拆成不同 Issue 與不同 Branch。

---

## 2.4 `fix/*`

`fix/*` 用於一般錯誤修正。

例如：

```text
fix/21-login-redirect
fix/24-product-form-validation
fix/30-dark-mode-dialog
```

通常仍從 `develop` 建立，完成後 PR 回 `develop`。

---

## 2.5 `hotfix/*`

`hotfix/*` 用於正式環境緊急錯誤。

通常從 `main` 建立：

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/critical-login-error
```

修正後：

```text
hotfix
├── PR → main
└── PR → develop
```

原因是正式環境修正也必須同步回開發分支。

---

## 2.6 `docs/*`

`docs/*` 用於文件修改。

例如：

```text
docs/10-project-documentation
docs/api-reference
docs/update-readme
```

若文件更新與功能 Issue 同步進行，也可使用：

```text
feature/10-project-documentation
```

但純文件更新建議使用 `docs/*`。

---

## 2.7 `chore/*`

`chore/*` 用於：

- 分支同步
- 套件升級
- CI 設定
- ESLint 設定
- Build 設定
- 開發工具
- 專案維護

例如：

```text
chore/sync-main-into-develop
chore/update-dependencies
chore/configure-eslint
```

---

# 3. 標準開發流程

完整流程：

```text
GitHub Issue
     │
     ▼
更新 develop
     │
     ▼
建立 Feature Branch
     │
     ▼
開發功能
     │
     ▼
Type-check / Lint / Build
     │
     ▼
Commit
     │
     ▼
Push
     │
     ▼
Pull Request → develop
     │
     ▼
Review / Test
     │
     ▼
Merge
     │
     ▼
刪除 Feature Branch
```

---

# 4. 建立新功能分支

假設要開發 Issue #10：

```text
建立 README 與開發文件
```

先切到 Repository 根目錄：

```bash
cd /c/Project/ramen-tsu
```

更新 `develop`：

```bash
git switch develop
git pull --ff-only origin develop
```

建立分支：

```bash
git switch -c feature/10-project-documentation
```

確認目前分支：

```bash
git branch --show-current
```

應顯示：

```text
feature/10-project-documentation
```

---

# 5. 開發前檢查

開始修改前應確認工作目錄乾淨：

```bash
git status
```

理想結果：

```text
On branch feature/10-project-documentation
nothing to commit, working tree clean
```

若有未提交內容，不要直接開始新 Issue。

應先決定：

- 提交
- 還原
- Stash
- 移到其他分支

---

# 6. Git Status 判讀

## 未追蹤檔案

```text
Untracked files:
```

表示新檔案尚未加入 Git。

加入：

```bash
git add <file>
```

---

## 修改但未 Stage

```text
Changes not staged for commit:
```

表示檔案已修改，但尚未加入暫存區。

加入：

```bash
git add <file>
```

---

## 已加入 Stage

```text
Changes to be committed:
```

表示檔案已準備提交。

查看：

```bash
git diff --cached
```

---

## 刪除檔案

```text
deleted:
```

表示 Git 認為檔案被刪除。

若不是刻意刪除：

```bash
git restore <file>
```

不要直接：

```bash
git add .
```

否則意外刪除會被提交。

---

# 7. 查看變更

查看尚未 Stage 的變更：

```bash
git diff
```

查看單一檔案：

```bash
git diff front/src/services/api.ts
```

查看已 Stage 的變更：

```bash
git diff --cached
```

查看統計：

```bash
git diff --stat
git diff --cached --stat
```

---

# 8. Stage 變更

不建議每次都直接：

```bash
git add .
```

因為可能把無關檔案一起加入。

建議依 Issue 範圍加入：

```bash
git add README.md
git add docs/
```

API Service Issue：

```bash
git add front/src/services
git add front/src/queries
git add front/src/types
git add front/src/utils/api-error.ts
git add front/.env.example
```

加入後確認：

```bash
git status
git diff --cached --stat
```

---

# 9. Commit 規範

建議採用 Conventional Commits。

格式：

```text
<type>(<scope>): <description>
```

例如：

```text
feat(api): establish API service architecture
docs: add project development documentation
fix(auth): prevent duplicate refresh requests
refactor(product): clarify service function names
chore: sync main changes into develop
```

---

## Commit Type

| Type       | 用途                 |
| ---------- | -------------------- |
| `feat`     | 新功能               |
| `fix`      | 錯誤修正             |
| `docs`     | 文件                 |
| `style`    | 格式調整，不影響邏輯 |
| `refactor` | 重構，不新增功能     |
| `test`     | 測試                 |
| `chore`    | 工具、套件與設定     |
| `perf`     | 效能改善             |
| `ci`       | CI/CD                |
| `build`    | 建置設定             |

---

## Commit 範例

Theme System：

```bash
git commit -m "feat(theme): add dark mode support"
```

共用元件：

```bash
git commit -m "feat(ui): add shared UI components"
```

API Service：

```bash
git commit -m "feat(api): establish API service architecture"
```

文件：

```bash
git commit -m "docs: add project development guides"
```

---

# 10. 提交前驗證

前端：

```bash
cd front

npm run type-check
npm run lint
npm run build
```

後端：

```bash
cd back

npm run type-check
npm run lint
npm run build
```

最低標準：

```text
Type-check：無 Error
Lint：無 Error
Build：成功
```

若是文件 Issue，可至少確認：

- Markdown 標題層級正確
- 連結有效
- 指令路徑正確
- API 路徑符合目前專案
- 沒有洩漏環境變數與密碼

---

# 11. Push 分支

第一次推送：

```bash
git push -u origin feature/10-project-documentation
```

後續推送：

```bash
git push
```

`-u` 會建立本地分支與遠端分支的追蹤關係。

---

# 12. 建立 Pull Request

標準 Feature PR：

```text
base: develop
compare: feature/10-project-documentation
```

不要誤選：

```text
base: main
```

除非是：

- Release
- Hotfix
- 專案明確要求直接進 main

---

# 13. PR 標題

建議與 Commit 語意一致。

例如：

```text
docs: 建立 README 與開發文件
```

```text
feat(api): 建立 API Service 基礎架構
```

避免：

```text
update
re
fix
123
完成
```

---

# 14. PR 說明範本

```markdown
## Summary

- 建立根目錄 README
- 新增系統架構文件
- 新增前端開發文件
- 新增後端開發文件
- 新增 API Reference
- 新增 Git Flow 文件

## Validation

- [x] Markdown 格式檢查
- [x] 指令與路徑確認
- [x] 文件內容與目前專案架構一致

Closes #10
```

---

# 15. PR Review

Review 時應確認：

- 是否只修改本 Issue 相關檔案
- 是否包含無關後端或前端變更
- 是否有意外刪除
- 是否有敏感資訊
- Build 是否成功
- Commit Message 是否清楚
- PR Base 是否為 `develop`
- 是否有 Merge Conflict

---

# 16. Merge 方式

GitHub 常見 Merge 方式：

```text
Create a merge commit
Squash and merge
Rebase and merge
```

## Squash and merge

適合一個 Issue 內有多個小型 Commit。

優點：

- `develop` 歷史較乾淨
- 一個 PR 對應一個 Commit
- 容易回滾

## Create a merge commit

適合需要保留完整分支歷史。

## Rebase and merge

適合希望維持線性歷史，但要求 Commit 品質較高。

若是個人畢業專題，建議：

```text
Squash and merge
```

或統一使用：

```text
Create a merge commit
```

重點是整個專案保持一致。

---

# 17. PR 合併後

先切回 `develop`：

```bash
git switch develop
```

更新：

```bash
git pull --ff-only origin develop
```

確認：

```bash
git status
```

應顯示：

```text
nothing to commit, working tree clean
```

---

# 18. 刪除本地分支

PR 已合併後：

```bash
git branch -d feature/10-project-documentation
```

如果使用 Squash Merge，Git 有時無法判定分支已完全合併：

```text
branch is not fully merged
```

確認 GitHub PR 確實已合併後，可使用：

```bash
git branch -D feature/10-project-documentation
```

---

# 19. 刪除遠端分支

```bash
git push origin --delete feature/10-project-documentation
```

更新遠端清單：

```bash
git fetch --prune
```

確認：

```bash
git branch -a
```

---

# 20. 保留分支原則

日常狀態建議只長期保留：

```text
main
develop
```

短期分支：

```text
feature/*
fix/*
hotfix/*
docs/*
chore/*
refactor/*
```

PR 合併後應刪除，避免分支列表越來越混亂。

---

# 21. Develop 合併到 Main

當 `develop` 功能穩定並準備發布時，建立：

```text
base: main
compare: develop
```

PR。

流程：

```text
feature/*
    │
    ▼
develop
    │
    ▼
測試完成
    │
    ▼
PR develop → main
    │
    ▼
正式版本
```

PR 標題可使用：

```text
release: prepare v1.0.0
```

或：

```text
chore(release): merge develop into main
```

---

# 22. 發布 Tag

當版本合併到 `main` 後，可建立 Tag：

```bash
git switch main
git pull --ff-only origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

版本規則可使用 Semantic Versioning：

```text
MAJOR.MINOR.PATCH
```

例如：

```text
v1.0.0
v1.1.0
v1.1.1
v2.0.0
```

---

# 23. Hotfix 流程

正式環境出現嚴重問題時：

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/fix-refresh-token
```

修正後：

```bash
git add .
git commit -m "fix(auth): resolve refresh token failure"
git push -u origin hotfix/fix-refresh-token
```

建立 PR：

```text
hotfix/fix-refresh-token → main
```

合併後，還要同步回：

```text
main → develop
```

建議建立同步分支：

```bash
git switch develop
git pull --ff-only origin develop
git switch -c chore/sync-main-into-develop
git merge origin/main
```

測試後：

```bash
git push -u origin chore/sync-main-into-develop
```

再建立：

```text
chore/sync-main-into-develop → develop
```

的 PR。

---

# 24. Merge Conflict

合併時可能看到：

```text
<<<<<<< HEAD
develop 的內容
=======
其他分支的內容
>>>>>>> origin/main
```

處理原則：

1. 理解兩邊修改目的
2. 不要一律 Accept Current
3. 不要一律 Accept Incoming
4. 手動整合有效內容
5. 刪除衝突標記
6. 執行測試
7. `git add` 標記已解決
8. 完成 Merge Commit

檢查殘留衝突：

```bash
git grep -n -e '^<<<<<<< ' -e '^>>>>>>> ' -e '^=======$'
```

若沒有輸出，代表沒有殘留標記。

---

# 25. 中止 Merge

若合併過程出錯：

```bash
git merge --abort
```

這會回到合併前狀態。

不要在不確定時強行：

```bash
git add .
git commit
```

避免把未解完的衝突提交。

---

# 26. Stash

當有尚未完成的修改，但需要暫時切分支時：

```bash
git stash push -m "unfinished work"
```

查看：

```bash
git stash list
```

恢復：

```bash
git stash pop
```

只暫存特定檔案：

```bash
git stash push -m "backend local changes" -- back/src/index.ts
```

注意：

- Stash 不是永久備份
- 套用後應檢查衝突
- 不要長期堆積大量 Stash

---

# 27. Restore

還原尚未 Stage 的檔案：

```bash
git restore <file>
```

例如：

```bash
git restore front/.env.example
```

恢復意外刪除：

```bash
git restore front/src/services/api.ts
```

取消 Stage：

```bash
git restore --staged <file>
```

---

# 28. Reset 注意事項

不熟悉時不要隨意使用：

```bash
git reset --hard
```

它會直接丟棄尚未提交的修改。

更安全的方式：

```bash
git status
git diff
git restore <file>
```

只有確認不需要保留任何變更時，才考慮 `reset --hard`。

---

# 29. Force Push

修改已推送的 Commit 歷史時，可能需要 Force Push。

建議使用：

```bash
git push --force-with-lease
```

不要使用：

```bash
git push --force
```

`--force-with-lease` 會先確認遠端分支沒有其他人更新，相對安全。

---

# 30. 錯誤分支處理

如果 Feature Branch 從錯誤基底建立，例如：

```text
feature 從 main 建立
但 PR 要進 develop
```

可能造成：

- 大量無關檔案
- Merge Conflict
- PR 顯示數百個變更

較安全的做法：

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/new-branch
git cherry-pick <feature-commit>
```

不要直接硬解大量無關衝突。

---

# 31. PR 到錯誤 Base

若 Feature 本來應該進 `develop`，卻 PR 到 `main`：

尚未合併時：

- 修改 PR Base
- 或關閉後重新建立 PR

已合併時：

- 不直接重寫遠端歷史
- 建立同步分支
- 將 `main` 合併回 `develop`
- PR 同步分支到 `develop`

例如：

```bash
git switch develop
git pull --ff-only origin develop
git switch -c chore/sync-main-into-develop
git merge origin/main
```

---

# 32. Windows 切換分支失敗

Windows 可能出現：

```text
Deletion of directory failed.
Should I try again? (y/n)
```

常見原因：

- VS Code 占用檔案
- Vite Dev Server 正在監看
- TypeScript Server 占用
- 檔案總管停在該目錄
- 防毒軟體鎖定檔案

處理順序：

1. 輸入 `n`
2. 執行 `git status`
3. 停止 `npm run dev`
4. 關閉相關檔案
5. 關閉 VS Code
6. 重新開啟 Git Bash
7. 再執行 `git switch`

不要一直輸入 `y`。

---

# 33. 分支清理

查看本地分支：

```bash
git branch
```

查看遠端分支：

```bash
git branch -r
```

查看全部：

```bash
git branch -a
```

刪除本地：

```bash
git branch -d feature/example
```

強制刪除：

```bash
git branch -D feature/example
```

刪除遠端：

```bash
git push origin --delete feature/example
```

清理遠端追蹤：

```bash
git fetch --prune
```

---

# 34. 推薦日常指令

開始新 Issue：

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/<issue>-<name>
```

開發中：

```bash
git status
git diff
```

提交：

```bash
git add <files>
git diff --cached
git commit -m "feat(scope): description"
```

推送：

```bash
git push -u origin feature/<issue>-<name>
```

PR 合併後：

```bash
git switch develop
git pull --ff-only origin develop
git branch -d feature/<issue>-<name>
git push origin --delete feature/<issue>-<name>
git fetch --prune
```

---

# 35. 專案 Git Flow 總結

```text
Issue
  │
  ▼
develop 更新
  │
  ▼
feature/<issue>-<name>
  │
  ▼
開發與測試
  │
  ▼
Commit / Push
  │
  ▼
PR → develop
  │
  ▼
Review / Merge
  │
  ▼
刪除 Feature Branch
  │
  ▼
develop 穩定
  │
  ▼
PR → main
  │
  ▼
Release / Tag
```

本專案應長期遵守：

```text
feature → develop → main
```

避免直接在 `main` 開發，也避免將尚未整合測試的功能直接合併到正式分支。
