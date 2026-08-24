# 部署指南（Deployment Guide）

> 專案名稱：**拉麵通（Ramen Tsu）**  
> 專案架構：Vue 3 前端 + Express 後端 + MongoDB Atlas + Cloudinary  
> 建議部署方式：前端與後端分開部署

---

# 1. 部署架構概覽

拉麵通採用前後端分離架構，正式環境可部署為：

```text
使用者瀏覽器
      │
      ▼
前端靜態網站
Vercel / Netlify / Cloudflare Pages
      │
      ▼
後端 REST API
Render / Railway / Fly.io
      │
      ├── MongoDB Atlas
      └── Cloudinary
```

建議分工：

| 服務          | 用途                                 |
| ------------- | ------------------------------------ |
| Vercel        | 部署 Vue 前端                        |
| Render        | 部署 Express 後端                    |
| MongoDB Atlas | 儲存會員、商品、訂單與 Refresh Token |
| Cloudinary    | 儲存商品圖片                         |
| GitHub        | 程式碼管理與部署來源                 |

---

# 2. 部署前準備

部署前應先確認：

- 前端 `npm run build` 成功
- 後端 `npm run build` 成功
- 前端環境變數已設定
- 後端環境變數已設定
- MongoDB Atlas 可連線
- Cloudinary 帳號可使用
- CORS 已允許正式前端網域
- Cookie 設定符合 HTTPS 環境
- GitHub Repository 已推送最新版本
- `main` 分支為穩定版本

建議部署前執行：

```bash
cd front
npm run type-check
npm run lint
npm run build
```

```bash
cd back
npm run type-check
npm run lint
npm run build
```

---

# 3. 建議 Git 部署流程

專案平時採用：

```text
feature
  ↓
develop
  ↓
main
```

正式部署應以 `main` 為基礎。

流程：

```text
功能完成
→ PR 到 develop
→ 整合測試
→ develop PR 到 main
→ main 自動部署
```

若部署平台支援 Preview Deployment，可將：

```text
feature/*
develop
```

設為預覽環境，而 `main` 作為正式環境。

---

# 4. 前端部署準備

前端目錄：

```text
front/
```

主要建置指令：

```bash
npm install
npm run build
```

建置輸出：

```text
front/dist/
```

正式環境需要設定：

```env
VITE_API_URL=https://你的後端網域
```

例如：

```env
VITE_API_URL=https://ramen-tsu-api.onrender.com
```

注意：

> 所有 `VITE_` 開頭的變數都會被打包到前端程式中，不可放入密碼、Token Secret、資料庫連線字串或 Cloudinary Secret。

---

# 5. 前端部署到 Vercel

## 5.1 建立專案

1. 登入 Vercel
2. 選擇 **Add New Project**
3. 匯入 GitHub Repository
4. 選擇拉麵通專案
5. 設定 Root Directory：

```text
front
```

---

## 5.2 Build 設定

建議設定：

| 項目             | 值              |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Root Directory   | `front`         |
| Install Command  | `npm install`   |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |

---

## 5.3 環境變數

在 Vercel 專案設定中新增：

```env
VITE_API_URL=https://你的後端網域
```

例如：

```env
VITE_API_URL=https://ramen-tsu-api.onrender.com
```

新增後需重新部署。

---

## 5.4 Hash Router

目前前端若使用：

```ts
createWebHashHistory();
```

網址會是：

```text
https://example.vercel.app/#/product/123
```

這種模式通常不需要額外 Rewrite 設定。

若未來改成：

```ts
createWebHistory();
```

則必須設定所有路由回到：

```text
/index.html
```

否則重新整理子路由會出現 404。

---

# 6. 前端部署到 Netlify

Root Directory：

```text
front
```

Build Command：

```text
npm run build
```

Publish Directory：

```text
front/dist
```

若部署設定已將 Base Directory 設為 `front`，Publish Directory 可填：

```text
dist
```

環境變數：

```env
VITE_API_URL=https://你的後端網域
```

若使用 History Router，可新增：

```text
front/public/_redirects
```

內容：

```text
/* /index.html 200
```

目前使用 Hash Router 時通常不需要。

---

# 7. 後端部署準備

後端目錄：

```text
back/
```

後端需確認：

- TypeScript 可編譯
- Express 可正常啟動
- 使用 `process.env.PORT`
- MongoDB 在伺服器啟動前成功連線
- CORS 使用正式前端網址
- Cookie 支援 HTTPS
- 不依賴本機路徑
- `.env` 未提交到 Git

建議伺服器啟動方式：

```ts
const port = Number(process.env.PORT) || 4000;

async function startServer(): Promise<void> {
  if (!process.env.DB_URL) {
    throw new Error("Missing DB_URL");
  }

  await mongoose.connect(process.env.DB_URL);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

void startServer();
```

不要將正式環境埠號寫死為：

```ts
app.listen(4000);
```

部署平台通常會透過：

```env
PORT
```

提供埠號。

---

# 8. 後端部署到 Render

## 8.1 建立 Web Service

1. 登入 Render
2. 選擇 **New Web Service**
3. 連接 GitHub Repository
4. 選擇拉麵通 Repository
5. 設定 Root Directory：

```text
back
```

---

## 8.2 Build 與啟動指令

實際指令應依 `back/package.json` 為準。

常見設定：

| 項目           | 值                             |
| -------------- | ------------------------------ |
| Root Directory | `back`                         |
| Runtime        | Node                           |
| Build Command  | `npm install && npm run build` |
| Start Command  | `npm start`                    |

若 `package.json` 使用：

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

則部署後會執行：

```text
node dist/index.js
```

若目前沒有 `start` script，應補上。

---

# 9. 後端環境變數

Render 需設定以下環境變數。

```env
NODE_ENV=production
DB_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=https://你的前端網域
```

例如：

```env
FRONTEND_URL=https://ramen-tsu.vercel.app
```

`PORT` 通常由 Render 自動提供，不需要手動設定。

---

# 10. MongoDB Atlas 設定

## 10.1 建立 Cluster

在 MongoDB Atlas：

```text
Database
→ Create Cluster
```

可先使用免費方案。

---

## 10.2 建立 Database User

路徑：

```text
Security
→ Database Access
```

建立：

- Username
- Password
- Database Role

開發或小型專案可使用：

```text
readWriteAnyDatabase
```

更安全的方式是只授權特定資料庫。

---

## 10.3 Network Access

路徑：

```text
Security
→ Network Access
```

部署平台 IP 可能會變動。

測試期間可使用：

```text
0.0.0.0/0
```

代表允許所有 IP。

正式環境應評估：

- 是否可限制部署平台固定 IP
- 是否使用 Private Network
- 是否使用更嚴格的網路規則

---

## 10.4 連線字串

範例：

```env
DB_URL=mongodb+srv://username:password@cluster.example.mongodb.net/ramen-tsu?retryWrites=true&w=majority
```

若密碼包含特殊字元，需 URL Encode。

例如：

```text
@ → %40
# → %23
% → %25
/ → %2F
```

---

# 11. Cloudinary 設定

Cloudinary 用於儲存商品圖片。

需要：

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

設定檔概念：

```ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

注意：

- API Secret 只能放後端
- 不可放入前端 `VITE_*`
- `.env.example` 只放欄位名稱，不放真實值

---

# 12. CORS 正式環境設定

後端應允許正式前端網址。

```ts
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

環境變數：

```env
FRONTEND_URL=https://ramen-tsu.vercel.app
```

若同時支援本機與正式環境，可建立允許清單：

```ts
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS"));
    },
    credentials: true,
  }),
);
```

若 TypeScript 無法正確推斷 `filter(Boolean)` 的型別，可明確定義：

```ts
const allowedOrigins: string[] = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));
```

---

# 13. Cookie 正式環境設定

Refresh Token 若使用 Cookie，正式環境通常需要：

```ts
res.cookie("refreshToken", token, {
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
```

本機開發則通常使用：

```ts
res.cookie("refreshToken", token, {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
});
```

可依環境切換：

```ts
const isProduction = process.env.NODE_ENV === "production";

res.cookie("refreshToken", token, {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
});
```

若前端與後端網域不同：

```text
frontend.vercel.app
api.onrender.com
```

通常需要：

```text
sameSite: none
secure: true
```

---

# 14. Axios 正式環境設定

前端 Axios Client：

```ts
const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
});

export const apiAuth = axios.create({
  baseURL,
  withCredentials: true,
});
```

凡是需要 Cookie 的 Request，都必須使用：

```ts
withCredentials: true;
```

例如：

```text
/auth/refresh
/auth/logout
```

---

# 15. 前後端環境變數對照

## 前端

```env
VITE_API_URL=https://api.example.com
```

## 後端

```env
NODE_ENV=production
FRONTEND_URL=https://www.example.com
DB_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# 16. `.env.example`

## 前端

```text
front/.env.example
```

```env
VITE_API_URL=http://localhost:4000
```

## 後端

```text
back/.env.example
```

```env
PORT=4000
NODE_ENV=development

FRONTEND_URL=http://localhost:3000

DB_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`.env.example` 不可包含真實資料。

---

# 17. 部署後驗證

前端部署完成後，確認：

- 首頁可開啟
- 子路由可進入
- 靜態圖片可載入
- Dark Mode 可使用
- API Base URL 正確
- Console 無 CORS Error

後端部署完成後，確認：

- 根路由或健康檢查可回應
- MongoDB 連線成功
- Login API 可使用
- Refresh Cookie 可寫入
- Product API 可讀取
- Cloudinary 可上傳
- CORS 只允許指定前端

---

# 18. 建議加入 Health Check

後端可加入：

```ts
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is healthy",
    result: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});
```

部署完成後測試：

```text
https://你的後端網域/health
```

可用於：

- Render Health Check
- Uptime Monitor
- CI 驗證
- 快速確認 API 狀態

---

# 19. Render 冷啟動

免費方案可能會在長時間沒有流量後休眠。

常見現象：

- 第一次 API Request 需要等待
- 前端短時間顯示 Loading
- Refresh Request 可能較慢
- 使用者誤以為 API 失敗

可改善：

- 使用 Loading 狀態
- 設定較合理 Axios Timeout
- 使用付費方案
- 使用健康檢查服務定期喚醒
- 在 UI 顯示伺服器啟動提示

不建議以過度頻繁請求規避平台限制。

---

# 20. MongoDB Buffering Timeout

若部署後出現：

```text
Operation buffering timed out after 10000ms
```

可能原因：

- `DB_URL` 錯誤
- Atlas Network Access 未開放
- Database User 錯誤
- 密碼未 URL Encode
- DNS 無法解析
- 伺服器先啟動，資料庫後連線

建議：

```ts
await mongoose.connect(databaseUrl);
app.listen(port);
```

確保資料庫連線成功後才接收 Request。

---

# 21. CORS 錯誤排查

若瀏覽器出現：

```text
Blocked by CORS policy
```

檢查：

1. `FRONTEND_URL` 是否為完整正式網址
2. 是否含有多餘 `/`
3. 後端是否 `credentials: true`
4. 前端 Axios 是否 `withCredentials: true`
5. 預覽網域是否與正式網域不同
6. Vercel Preview URL 是否在允許清單
7. 後端是否重新部署

例如：

```env
FRONTEND_URL=https://ramen-tsu.vercel.app
```

不要寫成：

```env
FRONTEND_URL=https://ramen-tsu.vercel.app/
```

除非後端比對邏輯有處理尾端斜線。

---

# 22. Cookie 無法保存

若登入成功但 Refresh 失敗，檢查：

- Response 是否有 `Set-Cookie`
- Cookie 是否為 HttpOnly
- 正式環境是否 `secure: true`
- 是否使用 `sameSite: 'none'`
- CORS 是否允許 credentials
- Axios 是否設定 withCredentials
- 前端與後端是否使用 HTTPS
- Cookie Domain 是否正確
- 瀏覽器是否阻擋第三方 Cookie

---

# 23. Cloudinary 上傳失敗

檢查：

- 三個 Cloudinary 環境變數
- API Key 是否正確
- API Secret 是否正確
- 上傳大小限制
- MIME Type
- Multer 設定
- Render 是否已重新部署
- Request 是否為 `multipart/form-data`

不要手動設定錯誤的 multipart boundary。

使用 Axios + FormData 時，通常讓瀏覽器自行處理 Header 即可。

---

# 24. 自訂網域

前端與後端可設定：

```text
www.ramen-tsu.com
api.ramen-tsu.com
```

優點：

- 品牌一致
- Cookie 與 CORS 設定較清楚
- 更適合正式展示
- API 網域容易辨識

需要設定：

- DNS Record
- HTTPS Certificate
- Vercel Domain
- Render Custom Domain
- CORS Allowed Origin
- Cookie Domain

---

# 25. CI/CD 建議

可使用 GitHub Actions。

前端流程：

```text
Push / PR
→ npm install
→ type-check
→ lint
→ build
```

後端流程：

```text
Push / PR
→ npm install
→ type-check
→ lint
→ build
```

只有全部通過才能合併。

---

# 26. GitHub Actions 範例

建立：

```text
.github/workflows/ci.yml
```

```yaml
name: CI

on:
  pull_request:
    branches:
      - develop
      - main
  push:
    branches:
      - develop
      - main

jobs:
  frontend:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: front

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: front/package-lock.json

      - name: Install
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build

  backend:
    runs-on: ubuntu-latest

    defaults:
      run:
        working-directory: back

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: back/package-lock.json

      - name: Install
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
```

實際 script 名稱需依前後端 `package.json` 調整。

---

# 27. Secrets 管理

GitHub Actions 或部署平台中的敏感資訊應放在 Secrets。

例如：

```text
DB_URL
JWT_SECRET
JWT_REFRESH_SECRET
CLOUDINARY_API_SECRET
```

不可：

- 寫入程式碼
- 放入 README
- 提交 `.env`
- 放進前端環境變數
- 輸出到 Build Log

---

# 28. Log 管理

正式環境不應只依賴：

```ts
console.log();
```

後續可導入：

- Pino
- Winston
- Sentry
- Logtail
- Axiom

建議記錄：

- API Request
- Status Code
- Error
- Database Connection
- Authentication Failure
- Upload Failure

但不可記錄：

- Password
- Access Token
- Refresh Token
- Cookie
- API Secret

---

# 29. 部署回滾

若新版本部署後出錯：

## Vercel

可在 Deployment 頁面選擇上一個成功版本並重新部署。

## Render

可選擇先前 Commit 重新部署。

## Git

可建立 Revert Commit：

```bash
git revert <commit-hash>
```

不建議在共享分支直接：

```bash
git reset --hard
git push --force
```

---

# 30. 發布檢查清單

## 前端

- [ ] `npm run type-check` 成功
- [ ] `npm run lint` 成功
- [ ] `npm run build` 成功
- [ ] `VITE_API_URL` 正確
- [ ] 子路由正常
- [ ] Dark Mode 正常
- [ ] Mobile Layout 正常
- [ ] API Request 正常
- [ ] Console 無重大錯誤

## 後端

- [ ] `npm run type-check` 成功
- [ ] `npm run lint` 成功
- [ ] `npm run build` 成功
- [ ] `DB_URL` 正確
- [ ] MongoDB 可連線
- [ ] CORS 正確
- [ ] Cookie 正確
- [ ] Login / Refresh / Logout 正常
- [ ] Product API 正常
- [ ] Cart API 正常
- [ ] Order API 正常
- [ ] Cloudinary 上傳正常

## Git

- [ ] 部署 Commit 位於 `main`
- [ ] PR 已 Review
- [ ] CI 全部通過
- [ ] 沒有敏感資料
- [ ] 版本 Tag 已建立
- [ ] 可回滾版本存在

---

# 31. 建議正式部署流程

```text
feature/*
   │
   ▼
develop
   │
   ▼
前後端測試
   │
   ▼
PR develop → main
   │
   ▼
GitHub Actions
   │
   ├── Frontend Build
   └── Backend Build
   │
   ▼
Vercel / Render 自動部署
   │
   ▼
部署後 Smoke Test
   │
   ▼
建立 Release Tag
```

---

# 32. 後續擴充方向

部署架構後續可加入：

- Docker
- Docker Compose
- Nginx
- Redis
- CI/CD
- Staging Environment
- Preview Environment
- Automated Database Backup
- Monitoring
- Error Tracking
- CDN
- Custom Domain
- Blue-Green Deployment
- Infrastructure as Code
- Kubernetes

目前畢業專題階段，建議優先完成：

```text
Vercel
+
Render
+
MongoDB Atlas
+
Cloudinary
+
GitHub Actions
```

即可建立一套完整且易維護的部署流程。
