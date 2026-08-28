# 🍜 拉麵通（Ramen Tsu）v1.0.1 更新紀錄

> Release：`v1.0.1`
>
> 本版本主要針對 **Admin 後台管理、店家管理、商城 UI、文章管理版面**進行功能新增與介面優化。

---

## 📌 版本資訊

| 項目 | 內容 |
|---|---|
| Version | `v1.0.1` |
| Release Branch | `release/v1.0.1` |
| Production Branch | `main` |
| 開發分支 | `develop` |
| 主要更新 | Admin 店家刪除、Admin 店家管理、商城與文章管理 UI 優化 |

---

## ✨ 1. Admin 店家管理

本版本新增 Admin 後台的店家刪除功能，讓管理員可以直接在店家管理頁面移除不需要的店家資料。

### 新增功能

- Admin 店家管理頁面新增刪除操作
- Admin 可以刪除任意店家
- 前端新增刪除店家的操作流程
- 刪除成功後更新店家列表
- 刪除操作與一般會員的店家刪除權限分開

### Backend

新增 Admin 專用店家刪除 API：

```http
DELETE /admin/shop/:id
```

相關檔案：

```text
back/src/controllers/shop.ts
back/src/routes/adminShop.ts
```

Admin 刪除功能由獨立的 Controller 與 Route 處理，與一般店家 Owner 權限的刪除流程區隔。

### Frontend

相關檔案：

```text
front/src/pages/admin/shops/index.vue
front/src/stores/adminShop.ts
```

Admin Shop Store 負責與後端 API 溝通，Admin Shops 頁面提供管理員實際操作介面。

---

## 🎨 2. 商城 UI 優化

針對商城商品卡片進行版面調整，使商城與論壇使用更一致的網站 UI。

### 調整內容

- 統一商品卡片整體高度
- 調整商品圖片區域高度
- 優化商品名稱與商品描述的版面
- 調整售價位置
- 統一「查看商品」與「加入購物車」按鈕高度
- 調整卡片內部間距
- 讓三張商品卡片保持一致的視覺高度
- 改善商城與論壇卡片的整體視覺一致性

相關元件：

```text
front/src/components/ProductCard.vue
```

---

## 📝 3. Admin 文章管理 UI 優化

修正 Admin 文章管理頁面因文字內容過長造成版面被撐寬的問題。

### 原本問題

文章標題、Slug 或摘要文字過長時，可能造成：

- 表格內容超出頁面寬度
- 出現水平捲軸
- 網頁需要拖曳才能查看完整內容
- Admin 後台版面不容易維持在瀏覽器視窗內

### 本次調整目標

讓 Admin 文章管理頁面：

- 維持在網頁可視範圍內
- 避免長文字直接撐開整個版面
- 降低水平溢出的情況
- 保持表格欄位的整體比例
- 提升 Admin 後台操作體驗

相關頁面：

```text
front/src/pages/admin/articles/index.vue
```

---

## 🖥️ 4. Admin 後台整體 UI 一致性

除了功能新增，也同步整理 Admin 後台的視覺與操作方式。

- Admin 店家管理與文章管理採用一致的管理介面
- 統一按鈕與操作區域配置
- 改善資料表格可讀性
- 減少內容造成的版面溢出
- 保持後台在不同內容長度下的穩定版面

---

## 📚 5. 文件與作品集更新

本版本包含專案文件與 Portfolio 相關內容更新。

```text
docs/api.md
docs/architecture.md
docs/backend.md
docs/frontend.md
docs/contributing.md
docs/demo.md
docs/deployment.md
docs/future-enhancements.md
docs/git-flow.md
```

Portfolio 截圖：

```text
docs/assets/portfolio/
├── 01-Home.png
├── 02-Forum.png
├── 03-Shop.png
├── 04-Map.png
├── 05-Store.png
└── 06-Admin.png
```

---

## 🚀 6. 部署相關更新

本版本包含 GitHub Pages 部署設定：

```text
.github/workflows/deploy.yml
front/.env.production
```

讓正式版本可以配合 GitHub Pages 進行前端部署。

---

## 🧪 7. 測試與驗證

### Admin 店家管理

- [x] Admin 店家列表正常顯示
- [x] Admin 可以執行刪除店家
- [x] Delete API 正常呼叫
- [x] MongoDB 店家資料可以正常刪除
- [x] 刪除後前端列表正常更新

### Admin 文章管理

- [x] 長文字不應造成整體頁面異常撐寬
- [x] 表格維持在頁面可視範圍
- [x] 文章資料正常顯示

### 商城

- [x] 三張商品卡片高度一致
- [x] 商品圖片區域一致
- [x] 商品資訊區域排列正常
- [x] 價格與操作按鈕位置一致
- [x] 商城 UI 與論壇卡片風格一致

### Git / Release

- [x] 建立 `release/v1.0.1`
- [x] Release branch 與 `main` 完成整合
- [x] `main` 更新至 v1.0.1
- [x] Working tree clean
- [x] `v1.0.1` Release 準備發布

---

## 🌿 8. Git Flow

本次 v1.0.1 採用：

```text
feature/*
    │
    ▼
develop
    │
    ▼
release/v1.0.1
    │
    │  Release 整合與衝突處理
    ▼
main
    │
    ▼
v1.0.1
    │
    ▼
GitHub Release
```

正式發布前確認：

```bash
git status
```

結果：

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

代表正式發布前 Git working tree 已經乾淨。

---

## 📊 9. v1.0.0 → v1.0.1

| 類別 | v1.0.1 更新 |
|---|---|
| Admin | 新增店家刪除功能 |
| Shop Management | 新增 Admin 店家管理 Store |
| Backend API | 新增 Admin Delete Shop API |
| Article Management | 修正文字造成版面撐寬 |
| Online Store | 優化商品卡片高度與間距 |
| Product Card | 統一商品卡片 UI |
| Documentation | 更新專案文件與 Portfolio 資料 |
| Deployment | 更新 GitHub Pages 部署設定 |

---

## 🎯 10. 本版本重點

### ① 功能完整度

補上 Admin 店家管理中的「刪除」功能，使後台 CRUD 管理能力更加完整。

### ② UI / UX

改善商城與 Admin 後台的版面一致性，並處理長文字造成的水平溢出問題。

### ③ Production Release

將 `develop` 中完成的功能經由：

```text
release/v1.0.1
        ↓
main
        ↓
v1.0.1
```

正式整理成可發布版本。

---

## 🏷️ Release Tag

```text
v1.0.1
```

## 🍜 Project

**Ramen Tsu（拉麵通）**

整合：

- 👤 會員系統
- 💬 拉麵論壇
- 🍜 拉麵店家地圖
- 🛒 電子商城
- 📦 訂單系統
- 🛠️ Admin 後台管理
