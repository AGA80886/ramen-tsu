# 系統架構（System Architecture）

> 專案名稱：**拉麵通（Ramen Tsu）**  
> 技術架構：Vue 3 + Express + MongoDB + TypeScript

---

# 1. 系統概覽

拉麵通採用 **前後端分離（Frontend / Backend Separation）** 架構。

前端負責：

- UI 顯示
- 使用者互動
- 呼叫 API
- 狀態管理

後端負責：

- 商業邏輯
- 身分驗證
- 資料存取
- 資料庫操作

資料則儲存在 MongoDB Atlas。

```text
                Browser
                    │
                    │
        Vue3 + TypeScript
                    │
        ───────── Axios ─────────
                    │
             Express API Server
                    │
              Business Logic
                    │
                Mongoose ODM
                    │
              MongoDB Atlas
```

---

# 2. 系統分層

整個專案可分成四個層級：

```
Presentation Layer
        │
Application Layer
        │
Business Layer
        │
Data Layer
```

---

## Presentation Layer（前端）

負責：

- 顯示畫面
- 表單驗證
- Router
- 狀態管理
- API 呼叫

使用技術：

- Vue 3
- TypeScript
- Element Plus
- Pinia
- Pinia Colada
- Vue Router
- Axios

```
pages
layouts
components
stores
queries
router
```

---

## Application Layer（後端 API）

Express 提供 REST API。

```
Browser
     │
 Axios
     │
Express Router
```

例如：

```
GET /products

POST /auth/login

POST /orders
```

---

## Business Layer（商業邏輯）

主要由：

```
controllers
services
middlewares
```

負責：

例如：

```
登入

↓

驗證帳號密碼

↓

產生 JWT

↓

建立 Refresh Token

↓

回傳使用者資訊
```

---

## Data Layer（資料層）

資料由 MongoDB 儲存。

透過

```
Mongoose
```

操作：

```
User

Product

Order

RefreshToken
```

---

# 3. 系統架構圖

```text
                   ┌──────────────┐
                   │   Browser    │
                   └──────┬───────┘
                          │
                          ▼
              Vue 3 + TypeScript
                          │
         ┌──────────────────────────┐
         │ Components / Pages       │
         │ Layouts                  │
         │ Router                   │
         │ Pinia                    │
         │ Pinia Colada             │
         └───────────┬──────────────┘
                     │
                     ▼
                  Axios
                     │
─────────────────────API─────────────────────
                     │
                     ▼
            Express + TypeScript
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Controllers     Middlewares     Services
                     │
                     ▼
                  Mongoose
                     │
                     ▼
              MongoDB Atlas
```

---

# 4. 前端架構

```
src
│
├── auth
├── components
├── composables
├── config
├── css
├── layouts
├── pages
├── plugins
├── queries
├── router
├── services
├── stores
├── styles
├── types
└── utils
```

---

## Components

放置可重複使用的 UI 元件。

例如：

```
AppButton

AppCard

AppDialog

AppPagination

DarkModeToggle
```

---

## Pages

每一個檔案代表一個路由頁面。

例如：

```
pages

login.vue

register.vue

product/

admin/

dev/
```

---

## Layouts

共用版型。

```
default.vue

admin.vue
```

---

## Router

負責：

- 自動路由
- Navigation Guard
- 權限控制

```
router

guards.ts

index.ts
```

---

## Stores（Pinia）

管理：

```
User

Snackbar

Theme
```

---

## Queries（Pinia Colada）

所有 API Query 都集中管理。

例如：

```
auth.ts

product.ts

order.ts
```

每個 Query 都負責：

- Cache
- Mutation
- Query

---

## Services

Service 為真正呼叫 API 的地方。

例如：

```
auth.ts

product.ts

order.ts
```

Service 不包含 UI 邏輯。

---

# 5. 後端架構

```
back
│
├── configs
├── controllers
├── middlewares
├── models
├── routes
├── services
└── index.ts
```

---

## Controllers

負責：

- 接收 Request
- 回傳 Response

例如：

```
Product Controller

User Controller

Order Controller
```

---

## Models

Mongoose Schema。

例如：

```
User

Product

Order

RefreshToken
```

---

## Middlewares

共用處理流程。

例如：

```
JWT 驗證

權限驗證

圖片上傳

Error Handler
```

---

## Configs

初始化：

```
Cloudinary

Passport

Environment
```

---

# 6. API 呼叫流程

```text
User Click

      │

      ▼

Vue Component

      │

      ▼

Pinia Colada Query

      │

      ▼

Service

      │

      ▼

Axios

      │

      ▼

Express API

      │

      ▼

Controller

      │

      ▼

Mongoose

      │

      ▼

MongoDB
```

---

# 7. 登入流程

```text
使用者登入

      │

      ▼

Login Page

      │

      ▼

authService.login()

      │

      ▼

POST /auth/login

      │

      ▼

Passport 驗證

      │

      ▼

JWT

Refresh Token

      │

      ▼

MongoDB

      │

      ▼

回傳 Access Token

      │

      ▼

Pinia 更新 User Store

      │

      ▼

登入完成
```

---

# 8. 商品查詢流程

```text
Product Page

      │

      ▼

useProductsQuery()

      │

      ▼

productService.getProducts()

      │

      ▼

GET /products

      │

      ▼

Product Controller

      │

      ▼

Product Model

      │

      ▼

MongoDB

      │

      ▼

JSON Response

      │

      ▼

畫面更新
```

---

# 9. 專案設計原則

本專案遵循以下設計原則：

- **前後端分離（Frontend / Backend Separation）**
- **元件化設計（Component-Based Architecture）**
- **單一職責原則（Single Responsibility Principle）**
- **服務層（Service Layer）封裝 API 呼叫**
- **Pinia 作為全域狀態管理**
- **Pinia Colada 負責 Query 與 Cache 管理**
- **Vue Router 自動路由與權限控制**
- **TypeScript 型別安全**
- **SCSS 主題化樣式管理**
- **RESTful API 設計**

---

# 10. 未來擴充方向

後續可持續擴充：

- 購物車（Cart）
- 收藏（Favorite）
- 評價系統（Review）
- 第三方登入（Google、LINE）
- 通知系統（Notification）
- Elasticsearch 搜尋
- Redis 快取
- Docker 容器化部署
- CI/CD 自動化部署
- 微服務（Microservices）拆分
