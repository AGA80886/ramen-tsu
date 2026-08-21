# 貢獻指南（Contributing Guide）

> 專案名稱：**拉麵通（Ramen Tsu）**  
> 開發流程：Issue 驅動開發 + Pull Request Review  
> 分支策略：`feature → develop → main`

---

# 1. 文件目的

本文件用來統一拉麵通專案的開發方式，包含：

- Issue 建立方式
- Branch 命名
- Commit 規範
- Pull Request 流程
- 程式碼風格
- 前端與後端驗證
- 文件更新方式
- Merge 與分支清理
- 敏感資訊管理
- Code Review 原則

所有參與專案的人都應依照本文件進行開發。

---

# 2. 專案開發原則

拉麵通採用以下開發原則：

- 一個 Issue 對應一個主要功能
- 一個 Branch 只處理一個 Issue
- 不直接在 `main` 開發
- 不直接在 `develop` 開發
- 所有功能先 PR 到 `develop`
- `develop` 穩定後再 PR 到 `main`
- PR 內不混入無關修改
- 提交前需完成 TypeScript、Lint 與 Build 驗證
- 不提交密碼、Token、API Secret 或真實 `.env`
- 重大架構調整需補充文件

專案主要流程：

```text
Issue
  │
  ▼
Feature Branch
  │
  ▼
開發與測試
  │
  ▼
Pull Request
  │
  ▼
develop
  │
  ▼
整合測試
  │
  ▼
main
```

---

# 3. 開始開發前

開始新任務前，先切換到專案根目錄：

```bash
cd /c/Project/ramen-tsu
```

確認目前 Git 狀態：

```bash
git status
```

工作目錄應保持乾淨：

```text
nothing to commit, working tree clean
```

更新最新 `develop`：

```bash
git switch develop
git pull --ff-only origin develop
```

不要在尚有未提交內容時直接建立新分支。

---

# 4. Issue 規範

每個功能或修正應先建立 GitHub Issue。

Issue 建議包含：

```text
標題
背景
目標
完成條件
相關檔案
測試方式
備註
```

範例：

```markdown
## 背景

目前前端 API 呼叫分散於不同檔案，命名與錯誤處理不一致。

## 目標

建立統一 API Service 架構。

## 完成條件

- [ ] 建立 Axios Client
- [ ] 分離公開與授權 API
- [ ] 建立 Refresh Token 處理
- [ ] 統一 Product、Order、Cart Service
- [ ] 通過 type-check
- [ ] 通過 lint
- [ ] 通過 build
```

---

# 5. Branch 命名規範

Branch 命名格式：

```text
<type>/<issue-number>-<short-description>
```

例如：

```text
feature/9-api-service
feature/10-project-documentation
fix/21-login-redirect
docs/10-project-documentation
refactor/18-product-query
chore/update-dependencies
hotfix/refresh-token-error
```

---

## Branch Type

| Type       | 用途             |
| ---------- | ---------------- |
| `feature`  | 新功能           |
| `fix`      | 一般錯誤修正     |
| `hotfix`   | 正式環境緊急修正 |
| `docs`     | 文件             |
| `refactor` | 不改變功能的重構 |
| `chore`    | 套件、設定與維護 |
| `test`     | 測試相關         |
| `ci`       | CI/CD            |

---

## 建立 Feature Branch

例如開發 Issue #10：

```bash
git switch develop
git pull --ff-only origin develop
git switch -c feature/10-project-documentation
```

確認：

```bash
git branch --show-current
```

應顯示：

```text
feature/10-project-documentation
```

---

# 6. Commit 規範

本專案建議採用 Conventional Commits。

格式：

```text
<type>(<scope>): <description>
```

範例：

```text
feat(api): establish API service architecture
feat(ui): add shared UI components
fix(auth): prevent duplicate refresh requests
refactor(product): clarify query names
docs: add frontend and backend guides
chore: sync main changes into develop
```

---

## Commit Type

| Type       | 用途                 |
| ---------- | -------------------- |
| `feat`     | 新功能               |
| `fix`      | 錯誤修正             |
| `docs`     | 文件                 |
| `style`    | 格式調整，不影響功能 |
| `refactor` | 重構                 |
| `test`     | 測試                 |
| `chore`    | 套件、工具、設定     |
| `perf`     | 效能改善             |
| `build`    | 建置相關             |
| `ci`       | CI/CD                |

---

## Commit Scope

Scope 可依模組使用：

```text
api
auth
product
order
cart
theme
router
ui
docs
backend
frontend
```

例如：

```text
fix(router): preserve redirect query after login
refactor(cart): rename user service to cart service
```

---

## Commit Message 原則

建議：

- 使用英文小寫開頭
- 使用動詞描述變更
- 保持簡短明確
- 一個 Commit 處理單一目的
- 避免無意義訊息

不建議：

```text
update
fix
re
完成
123
test
```

建議：

```text
docs: add deployment guide
fix(api): handle missing error message
refactor(order): separate admin and user query keys
```

---

# 7. Stage 檔案規範

不建議直接使用：

```bash
git add .
```

因為可能把無關檔案、測試檔案或意外刪除一起加入。

建議依 Issue 範圍加入：

```bash
git add README.md
git add docs/
```

或：

```bash
git add front/src/services
git add front/src/queries
git add front/src/types
git add front/src/utils/api-error.ts
```

加入後確認：

```bash
git status
git diff --cached --stat
git diff --cached
```

---

# 8. 檔案刪除確認

如果 `git status` 顯示：

```text
deleted:
```

先確認是否真的要刪除。

如果是不小心刪除：

```bash
git restore <file>
```

例如：

```bash
git restore front/src/services/api.ts
```

不要在未確認時直接：

```bash
git add .
git commit
```

否則意外刪除會正式進入 Commit。

---

# 9. 前端開發規範

前端主要使用：

- Vue 3
- TypeScript
- Element Plus
- Pinia
- Pinia Colada
- Axios
- SCSS

---

## Vue 元件命名

元件檔案使用 PascalCase：

```text
AppButton.vue
AppCard.vue
ProductCard.vue
DarkModeToggle.vue
```

避免：

```text
appbutton.vue
product-card.vue
```

---

## 共用元件

共用 UI 元件放在：

```text
front/src/components/common/
```

例如：

```text
AppButton.vue
AppCard.vue
AppDialog.vue
AppEmpty.vue
AppLoading.vue
AppPagination.vue
```

頁面專用元件不要隨意放入 `common`。

---

## Page 與 Route

路由頁面放在：

```text
front/src/pages/
```

使用自動路由，不需手動新增 route。

例如：

```text
src/pages/product/[id].vue
→ /product/:id
```

頁面 Meta 使用：

```vue
<route lang="yaml">
meta:
  title: 商品詳細資料
</route>
```

---

## Service Layer

頁面不應直接呼叫 Axios：

```ts
axios.get("/product");
```

應透過：

```text
Page
→ Query
→ Service
→ Axios Client
```

例如：

```ts
const { data } = await productService.getProducts();
```

---

## Service 命名

避免：

```ts
get();
getAll();
getId();
create();
update();
```

建議：

```ts
getProducts();
getAdminProducts();
getProductById();
createProduct();
updateProduct();
```

---

## Query 命名

避免：

```ts
useGetQuery();
useCreateMutation();
```

建議：

```ts
useProductsQuery();
useAdminProductsQuery();
useCreateProductMutation();
```

---

## Query Key

不同用途的資料應使用不同 Key：

```ts
["product", "public"][("product", "admin")][("product", "detail", id)];
```

訂單：

```ts
["order", "mine"][("order", "admin")];
```

不要讓會員與管理員資料共用：

```ts
["order"];
```

---

## Composable 使用

Composable 應在 `<script setup>` 頂層建立：

```ts
const createProductMutation = useCreateProductMutation();
```

不要在事件函式中重複建立：

```ts
async function submit() {
  await useCreateProductMutation().mutateAsync(data);
}
```

---

## TypeScript 規範

避免：

```ts
any;
```

優先使用：

```ts
unknown;
```

並透過 Type Guard 縮小型別。

例如：

```ts
if (error instanceof Error) {
  return error.message;
}
```

API 型別放在：

```text
front/src/types/
```

---

## 樣式規範

共用主題使用 CSS Variables：

```scss
background-color: var(--color-surface);
color: var(--color-text);
border-color: var(--color-border);
```

避免寫死：

```scss
background-color: #fff;
color: #000;
```

共用 SCSS 放在：

```text
front/src/styles/
```

---

# 10. 後端開發規範

後端主要使用：

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- Passport
- JWT

---

## Route 職責

Route 應只負責：

- HTTP Method
- URL
- Middleware
- Controller

例如：

```ts
router.post("/product", auth, admin, upload.single("image"), createProduct);
```

不要在 Route 內放大量商業邏輯。

---

## Controller 職責

Controller 負責：

- 讀取 Request
- 呼叫 Model 或 Service
- 回傳 Response
- 傳遞 Error

建議：

```ts
try {
  // controller logic
} catch (error) {
  next(error);
}
```

---

## Service Layer

複雜邏輯應抽到 Service，例如：

- Refresh Token Rotation
- 訂單建立流程
- Cloudinary 圖片刪除
- Token 產生
- 多 Model 更新

---

## 資料庫連線

應先完成 MongoDB 連線，再啟動 Server：

```ts
await mongoose.connect(databaseUrl);
app.listen(port);
```

避免資料庫尚未連線時接收 Request。

---

## API Response

成功回應：

```json
{
  "success": true,
  "message": "操作成功",
  "result": {}
}
```

錯誤回應：

```json
{
  "success": false,
  "message": "請求失敗"
}
```

前後端應保持格式一致。

---

## 安全規範

後端不得：

- 回傳 Password
- 相信前端傳入的角色
- 相信前端傳入的價格
- 在程式碼中寫死 Secret
- 在 Log 輸出 Access Token
- 在 Log 輸出 Refresh Token
- 無限制開放正式環境 CORS

---

# 11. 文件規範

文件放在：

```text
docs/
```

例如：

```text
architecture.md
frontend.md
backend.md
api.md
git-flow.md
deployment.md
contributing.md
```

根目錄：

```text
README.md
```

文件更新原則：

- 新功能需要同步更新文件
- API 路徑修改需更新 `api.md`
- 目錄架構修改需更新前後端文件
- Git 流程修改需更新 `git-flow.md`
- 部署方式修改需更新 `deployment.md`
- 不在文件中放真實 Secret

---

# 12. Pull Request 前驗證

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

若專案目前存在已知 Warning，PR 說明應註明，且本次修改不可新增 Error。

---

# 13. 手動測試

前端功能建議測試：

- 首頁
- Login
- Register
- Logout
- Product List
- Product Detail
- Add Cart
- Admin Product
- Light Mode
- Dark Mode
- Mobile Layout

後端功能建議測試：

- MongoDB 連線
- Register
- Login
- Refresh
- Logout
- Product CRUD
- Cart
- Order
- 401
- 403
- Upload Error
- Validation Error

---

# 14. Push 規範

第一次 Push：

```bash
git push -u origin feature/10-project-documentation
```

後續：

```bash
git push
```

Push 前確認：

```bash
git status
git log --oneline -5
```

---

# 15. Pull Request 規範

Feature PR 設定：

```text
base: develop
compare: feature/<issue>-<name>
```

不要誤選：

```text
base: main
```

除非是 Release 或 Hotfix。

---

## PR 標題

建議：

```text
docs: 建立 README 與開發文件
```

```text
feat(api): 建立 API Service 基礎架構
```

避免：

```text
update
fix
re
完成
```

---

## PR 說明範本

```markdown
## Summary

- 建立專案 README
- 新增前端與後端開發文件
- 新增 API Reference
- 新增 Git Flow 與部署指南

## Validation

- [x] Markdown 格式檢查
- [x] 指令與路徑確認
- [x] 文件內容與目前專案一致

Closes #10
```

---

# 16. PR Review 原則

Review 時確認：

- 修改是否符合 Issue
- 是否混入無關檔案
- 是否有意外刪除
- 是否有敏感資訊
- 是否通過測試
- 命名是否清楚
- 型別是否正確
- API Response 是否一致
- 文件是否同步更新
- PR Base 是否為 `develop`

---

# 17. Merge 規範

建議專案統一使用其中一種方式：

```text
Squash and merge
```

或：

```text
Create a merge commit
```

個人專題若希望歷史簡潔，建議使用：

```text
Squash and merge
```

合併前確認：

- CI 通過
- 無 Merge Conflict
- Review 完成
- PR 說明完整

---

# 18. PR 合併後

切回 `develop`：

```bash
git switch develop
git pull --ff-only origin develop
```

刪除本地分支：

```bash
git branch -d feature/10-project-documentation
```

若使用 Squash Merge，Git 無法判斷已合併時：

```bash
git branch -D feature/10-project-documentation
```

刪除遠端分支：

```bash
git push origin --delete feature/10-project-documentation
```

清理：

```bash
git fetch --prune
```

---

# 19. Main 與 Develop

日常開發：

```text
feature → develop
```

正式發布：

```text
develop → main
```

不要直接將未經整合測試的 Feature 合併到 `main`。

---

# 20. Hotfix 規範

正式環境出現嚴重錯誤時：

```bash
git switch main
git pull --ff-only origin main
git switch -c hotfix/critical-error
```

修正後：

```text
hotfix → main
```

並同步：

```text
main → develop
```

避免正式環境修正遺漏在後續開發版本。

---

# 21. Merge Conflict 處理

出現：

```text
<<<<<<< HEAD
=======
>>>>>>> branch
```

處理方式：

1. 理解兩邊內容
2. 手動整合
3. 刪除衝突標記
4. 執行測試
5. `git add` 標記完成
6. 建立 Merge Commit

檢查殘留標記：

```bash
git grep -n \
  -e '^<<<<<<< ' \
  -e '^>>>>>>> ' \
  -e '^=======$'
```

---

# 22. Stash 規範

需要暫時切分支時：

```bash
git stash push -m "unfinished work"
```

恢復：

```bash
git stash pop
```

只暫存特定檔案：

```bash
git stash push \
  -m "backend local changes" \
  -- back/src/index.ts
```

Stash 不應作為長期備份。

---

# 23. Restore 規範

恢復尚未 Stage 的檔案：

```bash
git restore <file>
```

取消 Stage：

```bash
git restore --staged <file>
```

恢復意外刪除：

```bash
git restore front/src/services/api.ts
```

---

# 24. 敏感資訊規範

不可提交：

```text
.env
真實 DB_URL
JWT_SECRET
JWT_REFRESH_SECRET
Cloudinary API Secret
Access Token
Refresh Token
私人帳號密碼
```

可提交：

```text
.env.example
```

範例：

```env
DB_URL=
JWT_SECRET=
CLOUDINARY_API_SECRET=
```

提交前可搜尋：

```bash
git grep "mongodb+srv://"
git grep "JWT_SECRET="
git grep "CLOUDINARY_API_SECRET="
```

確認沒有真實值。

---

# 25. 不建議使用的 Git 指令

除非完全理解影響，否則不要隨意使用：

```bash
git reset --hard
git clean -fd
git push --force
```

更安全的替代方式：

```bash
git status
git diff
git restore <file>
git push --force-with-lease
```

---

# 26. Windows 注意事項

Windows 可能出現：

```text
Deletion of directory failed.
Should I try again? (y/n)
```

常見原因：

- VS Code 占用
- Vite Server 監看
- TypeScript Server 占用
- 檔案總管停在資料夾
- 防毒軟體鎖定

處理方式：

1. 輸入 `n`
2. 執行 `git status`
3. 停止 `npm run dev`
4. 關閉檔案與 VS Code
5. 重新開啟 Git Bash
6. 再切換分支

不要連續輸入 `y`。

---

# 27. 貢獻檢查清單

## 開發前

- [ ] Issue 已建立
- [ ] `develop` 已更新
- [ ] 工作目錄乾淨
- [ ] Branch 名稱正確

## 開發中

- [ ] 修改內容符合 Issue
- [ ] 沒有混入無關檔案
- [ ] 命名清楚
- [ ] 沒有使用 `any`
- [ ] API 與型別一致
- [ ] 文件同步更新

## PR 前

- [ ] Type-check 成功
- [ ] Lint 成功
- [ ] Build 成功
- [ ] 手動測試完成
- [ ] 沒有敏感資訊
- [ ] Git Status 正確
- [ ] PR Base 為 `develop`

## Merge 後

- [ ] 更新本地 `develop`
- [ ] 刪除本地 Branch
- [ ] 刪除遠端 Branch
- [ ] 執行 `git fetch --prune`

---

# 28. 貢獻流程總結

```text
建立 Issue
   │
   ▼
更新 develop
   │
   ▼
建立 Branch
   │
   ▼
開發與測試
   │
   ▼
確認 Git Diff
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
Review
   │
   ▼
Merge
   │
   ▼
刪除 Branch
```

專案長期遵循：

```text
feature → develop → main
```

所有貢獻都應以「變更範圍清楚、可測試、可 Review、可回滾」為原則。
