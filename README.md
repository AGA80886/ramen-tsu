# 拉麵通（Ramen Tsu）

拉麵通是一個以 **Vue 3 + TypeScript + Express + MongoDB** 開發的全端拉麵資訊平台，整合會員、論壇、店家地圖、商城、訂單與後台管理功能。

## Production

### Frontend
GitHub Pages  
https://aga80886.github.io/ramen-tsu/

### Backend
Render  
https://ramen-tsu.onrender.com

### Infrastructure
- Frontend: Vue 3 + Vite + TypeScript + Element Plus
- Backend: Node.js + Express + TypeScript
- Database: MongoDB Atlas
- Image Storage: Cloudinary
- Frontend Hosting: GitHub Pages
- Backend Hosting: Render

## Core Features

### Member
- Register / Login / Logout
- JWT + Refresh Token authentication
- Profile / Avatar management
- Password change / reset
- Shopping cart

### Forum
- Article CRUD
- Comments
- Likes
- Favorites
- Admin moderation

### Ramen Shops / Map
- Shop submission
- Shop editing
- Likes / Favorites
- Admin approval
- Map integration

### Store / Orders
- Product browsing
- Shopping cart
- Order creation
- Order history
- Admin product management
- Product publish / unpublish
- Product deletion
- Admin order management

### Admin
- Dashboard
- Member management
- Product management
- Order management
- Article moderation
- Shop moderation

### UI
- Responsive layout
- Dark Mode
- Shared UI components

## Security / Release Status

- M7-1 Final Project Audit / Release Checklist ✅
- M7-2 Security Hardening ✅
- M7-3 Release QA / Regression Testing ✅
- M7-4 Deployment / Release ✅

主要安全驗證包含：

- JWT / Refresh Token lifecycle
- Admin RBAC
- Ownership protection
- Input validation
- Mass assignment protection
- CORS / environment security
- Error handling
- Sensitive data exposure audit

## Deployment

```text
使用者瀏覽器
      │
      ▼
GitHub Pages
https://aga80886.github.io/ramen-tsu/
      │
      │ HTTPS / REST API
      ▼
Render
https://ramen-tsu.onrender.com
      │
      ├── MongoDB Atlas
      └── Cloudinary
```

詳細部署方式請參考：

- `docs/deployment.md`
- `docs/demo.md`
- `docs/future-enhancements.md`

## Demo Accounts

正式 Demo 可準備：

- Member Demo Account
- Admin Demo Account

> 為避免帳號密碼外洩，公開 Repository 不保存 Demo 密碼。展示時請由現場或私人文件提供。

## Future Enhancements

目前 MVP 未納入：

- 正式線上付款流程
- 庫存 / Stock Management
- 真實會員 Email Verification 郵件寄送
- 進階會員停權 / 啟用狀態
- Admin 最後一位管理員保護
- Notification system
- Automated testing / CI security scanning
- Performance optimization / code splitting

詳細內容請參考 `docs/future-enhancements.md`。

## 文件

詳細文件請參考：

- `docs/architecture.md`
- `docs/frontend.md`
- `docs/backend.md`
- `docs/api.md`
- `docs/git-flow.md`
- `docs/deployment.md`
- `docs/demo.md`
- `docs/future-enhancements.md`
- `docs/contributing.md`
