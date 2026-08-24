# 🍜 拉麵通（Ramen Tsu）

> 一個以拉麵文化為主題的全端 Web Application，整合會員、論壇、拉麵店家地圖、商城、訂單與 Admin 後台管理功能。

[🌐 Live Demo](https://aga80886.github.io/ramen-tsu/) ·
[📦 v1.0.0 Release](https://github.com/AGA80886/ramen-tsu/releases/tag/v1.0.0)

---

## 📌 Project Overview

拉麵通（Ramen Tsu）是一個以日本拉麵文化為主題的全端 Web Application。

專案整合：

- 會員系統
- 拉麵論壇
- 拉麵店家地圖
- 拉麵商城
- 購物車
- 訂單
- Admin 後台管理

本專案涵蓋從前端 UI、REST API、會員認證、資料庫、
圖片上傳、權限管理到正式環境部署的完整開發流程。

---

## 🌐 Production

### Frontend

GitHub Pages

https://aga80886.github.io/ramen-tsu/

### Backend API

Render

https://ramen-tsu.onrender.com

### Infrastructure

- Frontend: GitHub Pages
- Backend: Render
- Database: MongoDB Atlas
- Image Storage: Cloudinary

---

## ✨ Core Features

### 👤 Member

- Register / Login / Logout
- JWT + Refresh Token authentication
- Profile / Avatar management
- Password change / reset
- Shopping cart

### 💬 Forum

- Article CRUD
- Comments
- Likes
- Favorites
- Admin moderation
- Article ownership protection

### 🍜 Ramen Shops / Map

- Shop submission
- Shop editing
- Likes / Favorites
- Admin approval
- Map integration

### 🛒 Store / Orders

- Product browsing
- Product detail
- Shopping cart
- Quantity management
- Order creation
- Order history
- Admin product management
- Product publish / unpublish
- Product deletion
- Admin order management

### 🛠️ Admin

- Dashboard
- Member management
- Product management
- Order management
- Article moderation
- Shop moderation
- Role-based access control

### 🎨 UI

- Responsive layout
- Dark Mode
- Shared UI components
- Element Plus

---

## 🧰 Tech Stack

### Frontend

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- SCSS

### Backend

- Node.js
- Express
- TypeScript
- Mongoose
- JWT
- REST API
- Cookie-based authentication

### Database & Storage

- MongoDB Atlas
- Cloudinary

### Deployment & CI/CD

- GitHub Pages
- Render
- GitHub Actions

### Development Tools

- Git
- GitHub
- Postman

---

## 🏗️ System Architecture

```text
                    User Browser
                         │
                         ▼
              ┌────────────────────┐
              │    GitHub Pages    │
              │ Vue 3 + TypeScript │
              │      + Vite        │
              └─────────┬──────────┘
                        │
                  HTTPS / REST API
                        │
                        ▼
              ┌────────────────────┐
              │       Render       │
              │ Express + Node.js  │
              │    + TypeScript    │
              └─────────┬──────────┘
                        │
                 ┌──────┴──────┐
                 ▼             ▼
        ┌──────────────┐ ┌─────────────┐
        │ MongoDB Atlas│ │  Cloudinary  │
        │   Database   │ │    Images    │
        └──────────────┘ └─────────────┘
```
