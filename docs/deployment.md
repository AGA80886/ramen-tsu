# 部署指南（Deployment Guide）

> 專案名稱：**拉麵通（Ramen Tsu）**  
> 正式環境：**GitHub Pages + Render + MongoDB Atlas + Cloudinary**  
> Production Release：M7-4 Deployment / Release

---

# 1. 正式部署架構

```text
使用者瀏覽器
      │
      ▼
GitHub Pages
https://aga80886.github.io/ramen-tsu/
      │
      │ HTTPS / REST API
      ▼
Render / Express API
https://ramen-tsu.onrender.com
      │
      ├── MongoDB Atlas
      └── Cloudinary
```

| 服務 | 用途 |
| --- | --- |
| GitHub Pages | Vue 3 / Vite 前端正式網站 |
| Render | Express / TypeScript 後端 REST API |
| MongoDB Atlas | 會員、文章、店家、商品、訂單、Token 等資料 |
| Cloudinary | 商品、頭像與相關圖片 |
| GitHub | Source control、PR、GitHub Actions、Pages 部署 |

---

# 2. Production URLs

## Frontend

```text
https://aga80886.github.io/ramen-tsu/
```

## Backend

```text
https://ramen-tsu.onrender.com
```

---

# 3. Git 部署流程

日常開發：

```text
feature/*
   ↓ PR
develop
   ↓ Regression / Security / QA
release branch
   ↓ PR
main
```

正式部署以 `main` 為 Production branch。

本機目前採用兩個 worktree：

```text
C:/Project/ramen-tsu
→ 日常 develop / feature 開發

C:/Project/ramen-tsu-pages
→ main-based production / deployment 操作
```

---

# 4. Frontend：GitHub Pages

前端目錄：

```text
front/
```

## 4.1 Production Environment

`front/.env.production`

```env
VITE_API_URL=https://ramen-tsu.onrender.com
```

`VITE_*` 會進入瀏覽器 bundle，因此不可包含：

- JWT_SECRET
- DB_URL
- CLOUDINARY_API_SECRET
- Password / Token Secret

## 4.2 Vite Base Path

GitHub project Pages 網址包含 Repository path：

```text
/ramen-tsu/
```

因此 `front/vite.config.mts`：

```ts
export default defineConfig({
  base: '/ramen-tsu/',
  // ...
})
```

本機 Production Preview：

```bash
cd front
npm run build
npm run preview
```

預覽網址：

```text
http://localhost:4173/ramen-tsu/
```

## 4.3 GitHub Pages Workflow

Workflow：

```text
.github/workflows/deploy.yml
```

流程：

```text
Push main
→ Checkout
→ Setup Node
→ cd front
→ npm ci
→ npm run build
→ upload front/dist
→ GitHub Pages deploy
```

GitHub：

```text
Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions
```

---

# 5. Backend：Render

Backend Root Directory：

```text
back
```

Production Service URL：

```text
https://ramen-tsu.onrender.com
```

## 5.1 Render Build Settings

```text
Root Directory:
back

Build Command:
npm ci --include=dev && npm run build

Start Command:
npm start
```

目前 backend build：

```text
npm run build
→ tsc
```

Start：

```text
npm start
→ node dist/index.js
```

Render 提供 `PORT`，程式應使用：

```ts
const port = Number(process.env.PORT) || 4000
```

不要在正式環境固定寫死 `4000`。

## 5.2 Backend Environment Variables

Render Environment：

```env
NODE_ENV=production
DB_URL=
JWT_SECRET=
FRONTEND_URL=https://aga80886.github.io

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> 真實 Secret 不可提交到 GitHub。

`PORT` 由 Render 提供，通常不需手動設定。

---

# 6. MongoDB Atlas

Database：MongoDB Atlas。

後端透過：

```env
DB_URL=
```

連線。

正式部署前確認：

- Database User 正常
- Connection String 正確
- Password 特殊字元已 URL Encode
- Network Access 允許 Render 連線
- Backend 必須在 MongoDB 連線成功後再 `app.listen`

概念：

```ts
await mongoose.connect(databaseUrl)
app.listen(port)
```

---

# 7. Cloudinary

Cloudinary 用於圖片儲存。

Backend Environment：

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

注意：

- `CLOUDINARY_API_SECRET` 只放後端
- 不可放在 `VITE_*`
- `.env.example` 不放真實值

---

# 8. Production CORS

正式 Frontend Origin：

```text
https://aga80886.github.io
```

注意 CORS Origin **不包含**：

```text
/ramen-tsu/
```

Production backend whitelist 應允許：

```text
https://aga80886.github.io
```

並設定：

```ts
credentials: true
```

不可使用：

```text
Access-Control-Allow-Origin: *
```

搭配 credentials。

---

# 9. Refresh Token Cookie

目前 Production Refresh Cookie 已驗證：

```text
HttpOnly
Secure
SameSite=None
Path=/auth
```

用途：

```text
Login
→ Set-Cookie refresh

F5
→ POST /auth/refresh
→ Refresh Token Cookie
→ New Access Token

Logout
→ Cookie cleared
```

Frontend Axios：

```ts
withCredentials: true
```

Refresh Token 不回傳於 JSON Body。

---

# 10. Production Smoke Test

## Authentication

- [ ] Register
- [ ] Login
- [ ] F5 保持登入
- [ ] Logout
- [ ] F5 後維持登出
- [ ] Refresh Cookie 正常

## Member

- [ ] Profile
- [ ] Nickname
- [ ] Avatar

## Forum

- [ ] Article list / detail
- [ ] Create article
- [ ] Comment
- [ ] Like
- [ ] Favorite

## Shop / Map

- [ ] Shop list / detail
- [ ] Submit shop
- [ ] Like / Favorite
- [ ] Map / Marker

## Commerce

- [ ] Product list / detail
- [ ] Cart add / update / remove
- [ ] Order create
- [ ] Order history

## Admin

- [ ] Dashboard
- [ ] Member management
- [ ] Product create / edit / publish / delete
- [ ] Order status update
- [ ] Article moderation
- [ ] Shop moderation

## Browser

- [ ] No CORS error
- [ ] No unexpected 500
- [ ] No infinite refresh loop
- [ ] API requests point to Render
- [ ] No broken image

---

# 11. Render Free Instance 注意事項

Render Free instance 長時間沒有流量時可能 spin down。

可能造成：

- 第一次 API request 約需數十秒喚醒
- Login / Refresh 初次反應較慢
- 使用者可能誤以為 API 沒有回應

專題 Demo 前建議先開：

```text
https://ramen-tsu.onrender.com/product
```

喚醒 Backend。

不建議使用過度頻繁請求規避平台限制。

---

# 12. 常見問題

## Build：找不到 Node type definition

若 Render Production build：

```text
TS2688: Cannot find type definition file for 'node'
```

使用：

```text
npm ci --include=dev && npm run build
```

確保 TypeScript / `@types/*` build-time dependencies 有被安裝。

## CORS 403

若 Production preview 從：

```text
http://localhost:4173
```

呼叫 Render 被拒絕，屬正常 Production CORS 行為。

正式 GitHub Pages Origin：

```text
https://aga80886.github.io
```

才是 production whitelist。

## Cookie 無法保存

檢查：

- Response `Set-Cookie`
- `HttpOnly`
- `Secure`
- `SameSite=None`
- Backend `credentials: true`
- Frontend `withCredentials: true`
- HTTPS

## Cloudinary Upload

檢查：

- Cloudinary environment variables
- File MIME type
- Upload size
- multipart/form-data
- 不要手動設定錯誤 boundary

---

# 13. Security Notes

Production deployment 已完成：

- JWT / Refresh Token Audit
- Admin RBAC Audit
- Ownership Protection
- API Validation
- Mass Assignment Protection
- CORS / Environment Security
- Error Handling
- Sensitive Data Exposure Audit

敏感資料不可：

- commit `.env`
- 寫入 README
- 放入前端 VITE environment
- 輸出至 production log

---

# 14. Rollback

若 Production 發生重大問題：

- Render 可重新部署已知穩定 commit
- GitHub 可 Revert PR / Commit

Git：

```bash
git revert <commit-hash>
```

共享分支不建議：

```text
git reset --hard
git push --force
```

---

# 15. Release Status

```text
M7-1 Final Project Audit             ✅
M7-2 Security Hardening              ✅
M7-3 Release QA / Regression Test    ✅
M7-4 Deployment / Release            ✅
```

Production：

```text
Frontend → GitHub Pages
Backend  → Render
Database → MongoDB Atlas
Images   → Cloudinary
```
