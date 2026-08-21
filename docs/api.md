# API 開發文件（API Reference）

> 專案名稱：**拉麵通（Ramen Tsu）**  
> API 類型：RESTful API  
> 資料格式：JSON  
> 後端技術：Express、TypeScript、MongoDB、Mongoose  
> 前端請求：Axios、Pinia Colada

---

# 1. API 概覽

拉麵通採用前後端分離架構，前端透過 HTTP Request 呼叫 Express API。

```text
Vue Component
      │
      ▼
Pinia Colada Query
      │
      ▼
Service Layer
      │
      ▼
Axios Client
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

目前 API 主要分為：

```text
/auth
/product
/user
/order
```

功能包含：

- 會員註冊
- 會員登入
- Refresh Token
- 登出
- 商品查詢
- 商品管理
- 購物車管理
- 訂單建立
- 訂單查詢
- 管理員訂單查詢

---

# 2. Base URL

本地開發環境：

```text
http://localhost:4000
```

前端環境變數：

```env
VITE_API_URL=http://localhost:4000
```

前端使用：

```ts
const baseURL = import.meta.env.VITE_API_URL;
```

API 完整路徑範例：

```text
http://localhost:4000/auth/login
http://localhost:4000/product
http://localhost:4000/user/cart
```

---

# 3. Request 格式

一般 JSON Request：

```http
Content-Type: application/json
```

範例：

```json
{
  "account": "ramen_user",
  "password": "password123"
}
```

圖片上傳 Request：

```http
Content-Type: multipart/form-data
```

授權 API：

```http
Authorization: Bearer ACCESS_TOKEN
```

使用 Refresh Token Cookie 時：

```text
withCredentials: true
```

---

# 4. Response 格式

## 4.1 成功回應

```json
{
  "success": true,
  "message": "操作成功",
  "result": {}
}
```

TypeScript 型別：

```ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  result: T;
}
```

---

## 4.2 列表回應

```json
{
  "success": true,
  "message": "",
  "result": []
}
```

---

## 4.3 錯誤回應

```json
{
  "success": false,
  "message": "請求失敗"
}
```

TypeScript 型別：

```ts
export interface ApiErrorResponse {
  success?: false;
  message?: string;
  errors?: Record<string, string[]>;
}
```

---

## 4.4 欄位驗證錯誤

```json
{
  "success": false,
  "message": "資料驗證失敗",
  "errors": {
    "email": ["Email 格式錯誤"],
    "password": ["密碼長度不足"]
  }
}
```

---

# 5. HTTP Status Code

| 狀態碼                      | 說明                   |
| --------------------------- | ---------------------- |
| `200 OK`                    | 查詢、登入、更新成功   |
| `201 Created`               | 建立成功               |
| `204 No Content`            | 成功但不回傳內容       |
| `400 Bad Request`           | Request 資料錯誤       |
| `401 Unauthorized`          | 尚未登入或 Token 無效  |
| `403 Forbidden`             | 權限不足               |
| `404 Not Found`             | 找不到資源             |
| `409 Conflict`              | 帳號、Email 或資料重複 |
| `413 Payload Too Large`     | 上傳檔案過大           |
| `422 Unprocessable Entity`  | 欄位驗證失敗           |
| `500 Internal Server Error` | 後端未預期錯誤         |

---

# 6. 身分驗證機制

拉麵通採用：

```text
Access Token
+
Refresh Token
```

---

## 6.1 Access Token

用途：

- 呼叫需要登入的 API
- 驗證使用者身分
- 驗證使用者角色

Request Header：

```http
Authorization: Bearer ACCESS_TOKEN
```

前端 Axios Interceptor 自動加入：

```ts
apiAuth.interceptors.request.use((config) => {
  if (user.accessToken) {
    config.headers.set("Authorization", `Bearer ${user.accessToken}`);
  }

  return config;
});
```

---

## 6.2 Refresh Token

用途：

- Access Token 過期時重新取得登入狀態
- 維持使用者登入
- 登出時撤銷登入狀態

Refresh Token 建議存放於：

```text
HttpOnly Cookie
```

前端無法直接透過 JavaScript 讀取。

---

## 6.3 角色權限

目前角色概念：

```ts
type UserRole = "user" | "admin";
```

一般會員：

```text
user
```

管理員：

```text
admin
```

管理員 API 應同時驗證：

```text
已登入
+
role === admin
```

---

# 7. Auth API

Auth API 路徑：

```text
/auth
```

---

## 7.1 會員註冊

```http
POST /auth/register
```

### Request Body

```json
{
  "account": "ramen_user",
  "email": "ramen@example.com",
  "password": "password123"
}
```

### 欄位說明

| 欄位       |     型別 | 必填 | 說明     |
| ---------- | -------: | ---: | -------- |
| `account`  | `string` |   是 | 會員帳號 |
| `email`    | `string` |   是 | Email    |
| `password` | `string` |   是 | 會員密碼 |

### 成功回應

```json
{
  "success": true,
  "message": "註冊成功",
  "result": {}
}
```

### 常見錯誤

```text
400：輸入格式錯誤
409：帳號或 Email 已存在
500：伺服器錯誤
```

### 前端 Service

```ts
authService.register(data);
```

---

## 7.2 會員登入

```http
POST /auth/login
```

### Request Body

```json
{
  "account": "ramen_user",
  "password": "password123"
}
```

### 成功回應

```json
{
  "success": true,
  "message": "登入成功",
  "result": {
    "accessToken": "ACCESS_TOKEN",
    "account": "ramen_user",
    "role": "user",
    "cart": 0
  }
}
```

### 回應欄位

| 欄位          |     型別 | 說明           |
| ------------- | -------: | -------------- |
| `accessToken` | `string` | Access Token   |
| `account`     | `string` | 使用者帳號     |
| `role`        | `string` | 使用者角色     |
| `cart`        | `number` | 購物車商品數量 |

### 常見錯誤

```text
400：Request 格式錯誤
401：帳號或密碼錯誤
500：伺服器錯誤
```

### 前端 Service

```ts
authService.login(data);
```

---

## 7.3 恢復登入狀態

```http
POST /auth/refresh
```

Refresh Token 由 HttpOnly Cookie 自動攜帶。

前端不需要將 Refresh Token 放入 Request Body。

### Request

```http
POST /auth/refresh
Cookie: refreshToken=...
```

### 成功回應

```json
{
  "success": true,
  "message": "登入狀態恢復成功",
  "result": {
    "accessToken": "NEW_ACCESS_TOKEN",
    "account": "ramen_user",
    "role": "user",
    "cart": 2
  }
}
```

### 常見錯誤

```text
401：沒有 Refresh Token
401：Refresh Token 已過期
401：Refresh Token 無效
500：資料庫或伺服器錯誤
```

### 前端 Service

```ts
authService.refresh();
```

---

## 7.4 登出

```http
DELETE /auth/logout
```

### Request

Refresh Token Cookie 會自動攜帶。

### 後端處理

```text
取得 Refresh Token
→ 刪除資料庫 Token
→ 清除 Cookie
→ 回傳登出成功
```

### 成功回應

```json
{
  "success": true,
  "message": "登出成功",
  "result": {}
}
```

### 前端 Service

```ts
authService.logout();
```

---

# 8. Product API

商品 API 路徑：

```text
/product
```

---

## 8.1 取得前台商品列表

```http
GET /product
```

此 API 為公開 API，不需要登入。

通常只回傳：

```ts
sell: true;
```

的商品。

### 成功回應

```json
{
  "success": true,
  "message": "",
  "result": [
    {
      "_id": "PRODUCT_ID",
      "name": "豚骨拉麵",
      "price": 180,
      "description": "濃郁豚骨湯頭",
      "category": "食品",
      "image": "https://...",
      "sell": true,
      "createdAt": "2026-08-01T00:00:00.000Z",
      "updatedAt": "2026-08-01T00:00:00.000Z"
    }
  ]
}
```

### 前端 Service

```ts
productService.getProducts();
```

### 前端 Query

```ts
useProductsQuery();
```

### Query Key

```ts
["product", "public"];
```

---

## 8.2 取得單一商品

```http
GET /product/:id
```

此 API 為公開 API。

### Path Parameter

| 參數 |     型別 | 說明                  |
| ---- | -------: | --------------------- |
| `id` | `string` | 商品 MongoDB ObjectId |

### 範例

```http
GET /product/64f000000000000000000001
```

### 成功回應

```json
{
  "success": true,
  "message": "",
  "result": {
    "_id": "64f000000000000000000001",
    "name": "醬油拉麵",
    "price": 160,
    "description": "清爽醬油湯頭",
    "category": "食品",
    "image": "https://...",
    "sell": true
  }
}
```

### 常見錯誤

```text
400：商品 ID 格式錯誤
404：找不到商品
```

### 前端 Service

```ts
productService.getProductById(id);
```

### 前端 Query

```ts
useProductByIdQuery();
```

### Query Key

```ts
["product", "detail", id];
```

---

## 8.3 取得管理員商品列表

```http
GET /product/all
```

需要：

```text
Access Token
+
admin 權限
```

此 API 可包含：

- 已上架商品
- 未上架商品

### Header

```http
Authorization: Bearer ACCESS_TOKEN
```

### 成功回應

```json
{
  "success": true,
  "message": "",
  "result": [
    {
      "_id": "PRODUCT_ID",
      "name": "味噌拉麵",
      "price": 170,
      "sell": false
    }
  ]
}
```

### 常見錯誤

```text
401：尚未登入
403：非管理員
```

### 前端 Service

```ts
productService.getAdminProducts();
```

### 前端 Query

```ts
useAdminProductsQuery();
```

### Query Key

```ts
["product", "admin"];
```

---

## 8.4 建立商品

```http
POST /product
```

需要：

```text
Access Token
+
admin 權限
```

Request 格式：

```http
Content-Type: multipart/form-data
```

### FormData 欄位

| 欄位          |      型別 | 必填 | 說明     |
| ------------- | --------: | ---: | -------- |
| `name`        |  `string` |   是 | 商品名稱 |
| `price`       |  `number` |   是 | 商品價格 |
| `description` |  `string` |   是 | 商品說明 |
| `category`    |  `string` |   是 | 商品分類 |
| `sell`        | `boolean` |   是 | 是否上架 |
| `image`       |    `File` |   是 | 商品圖片 |

### 前端範例

```ts
const formData = new FormData();

formData.append("name", data.name);
formData.append("price", String(data.price));
formData.append("description", data.description);
formData.append("category", data.category);
formData.append("sell", String(data.sell));
formData.append("image", data.image);
```

### 成功回應

```json
{
  "success": true,
  "message": "商品建立成功",
  "result": {
    "_id": "PRODUCT_ID",
    "name": "鹽味拉麵",
    "price": 160,
    "description": "清爽鹽味湯頭",
    "category": "食品",
    "image": "https://...",
    "sell": true
  }
}
```

### 前端 Service

```ts
productService.createProduct(data);
```

### 前端 Mutation

```ts
useCreateProductMutation();
```

---

## 8.5 更新商品

```http
PATCH /product/:id
```

需要：

```text
Access Token
+
admin 權限
```

Request 格式：

```http
Content-Type: multipart/form-data
```

### FormData 欄位

```text
name
price
description
category
sell
image
```

更新時圖片可依後端規則設為非必填。

### 成功回應

```json
{
  "success": true,
  "message": "商品更新成功",
  "result": {
    "_id": "PRODUCT_ID",
    "name": "更新後商品名稱",
    "price": 190,
    "sell": true
  }
}
```

### 前端 Service

```ts
productService.updateProduct(id, data);
```

### 前端 Mutation

```ts
useUpdateProductMutation();
```

---

# 9. Cart API

購物車 API 目前放在：

```text
/user/cart
```

需要登入。

---

## 9.1 取得購物車

```http
GET /user/cart
```

### Header

```http
Authorization: Bearer ACCESS_TOKEN
```

### 成功回應

```json
{
  "success": true,
  "message": "",
  "result": [
    {
      "product": {
        "_id": "PRODUCT_ID",
        "name": "豚骨拉麵",
        "price": 180,
        "image": "https://..."
      },
      "quantity": 2
    }
  ]
}
```

### 前端 Service

```ts
cartService.getCartItems();
```

### 前端 Query

```ts
useCartItemsQuery();
```

### Query Key

```ts
["cart"];
```

---

## 9.2 新增或更新購物車商品

```http
PATCH /user/cart
```

需要登入。

### Request Body

```json
{
  "product": "PRODUCT_ID",
  "quantity": 1,
  "replace": false
}
```

### 欄位說明

| 欄位       |      型別 | 必填 | 說明             |
| ---------- | --------: | ---: | ---------------- |
| `product`  |  `string` |   是 | 商品 ID          |
| `quantity` |  `number` |   是 | 商品數量         |
| `replace`  | `boolean` |   是 | 是否直接取代數量 |

---

## `replace: false`

代表在原數量上增加或減少：

```text
原數量 + quantity
```

例如：

```json
{
  "product": "PRODUCT_ID",
  "quantity": 1,
  "replace": false
}
```

表示增加一件。

---

## `replace: true`

代表直接設定新的數量：

```text
數量 = quantity
```

例如：

```json
{
  "product": "PRODUCT_ID",
  "quantity": 3,
  "replace": true
}
```

表示購物車數量直接改成 3。

### 成功回應

目前前端預期 `result` 可回傳更新後的購物車總數：

```json
{
  "success": true,
  "message": "購物車更新成功",
  "result": 3
}
```

### 前端 Service

```ts
cartService.addCartItem(data);
```

### 前端 Mutation

```ts
useAddCartItemMutation();
```

---

# 10. Order API

訂單 API 路徑：

```text
/order
```

---

## 10.1 建立訂單

```http
POST /order
```

需要登入。

### Header

```http
Authorization: Bearer ACCESS_TOKEN
```

目前建立訂單通常直接使用使用者購物車內容，不需要由前端傳入商品價格。

### 後端流程

```text
取得登入使用者
→ 取得購物車
→ 驗證商品存在
→ 取得最新商品價格
→ 建立訂單快照
→ 計算總價
→ 儲存訂單
→ 清空購物車
→ 回傳訂單
```

### 成功回應

```json
{
  "success": true,
  "message": "訂單建立成功",
  "result": {
    "_id": "ORDER_ID",
    "user": "USER_ID",
    "cart": [
      {
        "product": "PRODUCT_ID",
        "name": "豚骨拉麵",
        "price": 180,
        "quantity": 2
      }
    ],
    "total": 360,
    "status": "pending",
    "createdAt": "2026-08-04T00:00:00.000Z"
  }
}
```

### 常見錯誤

```text
400：購物車為空
401：尚未登入
404：商品不存在
```

### 前端 Service

```ts
orderService.createOrder();
```

### 前端 Mutation

```ts
useCreateOrderMutation();
```

---

## 10.2 取得我的訂單

```http
GET /order
```

需要登入。

只回傳目前登入使用者的訂單。

### 成功回應

```json
{
  "success": true,
  "message": "",
  "result": [
    {
      "_id": "ORDER_ID",
      "total": 360,
      "status": "pending",
      "createdAt": "2026-08-04T00:00:00.000Z"
    }
  ]
}
```

### 前端 Service

```ts
orderService.getMyOrders();
```

### 前端 Query

```ts
useMyOrdersQuery();
```

### Query Key

```ts
["order", "mine"];
```

---

## 10.3 取得所有訂單

```http
GET /order/all
```

需要：

```text
Access Token
+
admin 權限
```

### 成功回應

```json
{
  "success": true,
  "message": "",
  "result": [
    {
      "_id": "ORDER_ID",
      "user": {
        "_id": "USER_ID",
        "account": "ramen_user"
      },
      "total": 360,
      "status": "pending",
      "createdAt": "2026-08-04T00:00:00.000Z"
    }
  ]
}
```

### 前端 Service

```ts
orderService.getAdminOrders();
```

### 前端 Query

```ts
useAdminOrdersQuery();
```

### Query Key

```ts
["order", "admin"];
```

---

# 11. Axios Client

前端 API Client：

```text
src/services/api.ts
```

目前概念上分為兩個 Axios Instance。

---

## 11.1 公開 API Client

```ts
export const api = axios.create({
  baseURL,
});
```

適用：

```text
GET /product
GET /product/:id
POST /auth/login
POST /auth/register
```

---

## 11.2 授權 API Client

```ts
export const apiAuth = axios.create({
  baseURL,
  withCredentials: true,
});
```

適用：

```text
GET /product/all
POST /product
PATCH /product/:id
GET /user/cart
PATCH /user/cart
POST /order
GET /order
GET /order/all
```

---

# 12. Request Interceptor

Request Interceptor 會自動加入 Access Token：

```ts
apiAuth.interceptors.request.use((config) => {
  const user = useUserStore(pinia);

  if (user.accessToken) {
    config.headers.set("Authorization", `Bearer ${user.accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});
```

---

# 13. Response Interceptor

當授權 API 回傳：

```http
401 Unauthorized
```

且請求不是 `/auth/refresh` 時，可嘗試 Refresh。

```text
原始請求失敗
→ 呼叫 /auth/refresh
→ 更新 Access Token
→ 重新發送原始請求
```

需避免：

- Refresh 無限循環
- 同時重複發送多個 Refresh Request
- 登出後仍重試原始請求

---

# 14. Refresh Promise Lock

當多個 API 同時收到 401 時，只允許一個 Refresh Request：

```ts
let refreshPromise:
  | Promise<AxiosResponse<ApiResponse<LoginResponse>>>
  | undefined;
```

概念：

```ts
refreshPromise ??= refreshClient.post("/auth/refresh");
```

其他請求共用相同 Promise，避免：

```text
同一時間發送 5 次 /auth/refresh
```

---

# 15. API Error Helper

檔案：

```text
src/utils/api-error.ts
```

用途：

- 處理 AxiosError
- 取得後端 message
- 處理一般 Error
- 提供預設錯誤訊息

```ts
import axios from "axios";

import type { ApiErrorResponse } from "@/types/api";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? "請求失敗";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "發生未知錯誤";
}
```

---

# 16. Pinia Colada Query Key

Query Key 應能明確區分資料用途。

商品：

```ts
["product", "public"][("product", "admin")][("product", "detail", productId)];
```

訂單：

```ts
["order", "mine"][("order", "admin")];
```

購物車：

```ts
["cart"];
```

避免將不同資料使用相同 Key，例如：

```ts
["order"];
```

同時代表會員訂單與管理員訂單。

---

# 17. Cache 更新

建立或更新商品成功後：

```ts
queryCache.invalidateQueries({
  key: ["product", "public"],
});

queryCache.invalidateQueries({
  key: ["product", "admin"],
});
```

更新單一商品快取：

```ts
queryCache.setQueryData(["product", "detail", id], response.data.result);
```

新增購物車後：

```ts
queryCache.invalidateQueries({
  key: ["cart"],
});
```

建立訂單後：

```ts
queryCache.invalidateQueries({
  key: ["order"],
});
```

---

# 18. API Service 命名規範

避免模糊名稱：

```ts
get();
getAll();
getId();
create();
update();
```

建議使用完整名稱。

Auth：

```ts
register();
login();
refresh();
logout();
```

Product：

```ts
getProducts();
getAdminProducts();
getProductById();
createProduct();
updateProduct();
```

Cart：

```ts
getCartItems();
addCartItem();
```

Order：

```ts
createOrder();
getMyOrders();
getAdminOrders();
```

---

# 19. Query 命名規範

避免：

```ts
useGetQuery();
useGetAllQuery();
useCreateMutation();
```

建議：

```ts
useProductsQuery();
useAdminProductsQuery();
useProductByIdQuery();
useCreateProductMutation();
useUpdateProductMutation();

useCartItemsQuery();
useAddCartItemMutation();

useCreateOrderMutation();
useMyOrdersQuery();
useAdminOrdersQuery();
```

---

# 20. API 權限總表

| Method | Path             | 訪客 | 會員 | 管理員 |
| ------ | ---------------- | :--: | :--: | :----: |
| POST   | `/auth/register` |  ✅  |  —   |   —    |
| POST   | `/auth/login`    |  ✅  |  —   |   —    |
| POST   | `/auth/refresh`  |  ✅  |  ✅  |   ✅   |
| DELETE | `/auth/logout`   |  —   |  ✅  |   ✅   |
| GET    | `/product`       |  ✅  |  ✅  |   ✅   |
| GET    | `/product/:id`   |  ✅  |  ✅  |   ✅   |
| GET    | `/product/all`   |  ❌  |  ❌  |   ✅   |
| POST   | `/product`       |  ❌  |  ❌  |   ✅   |
| PATCH  | `/product/:id`   |  ❌  |  ❌  |   ✅   |
| GET    | `/user/cart`     |  ❌  |  ✅  |   ✅   |
| PATCH  | `/user/cart`     |  ❌  |  ✅  |   ✅   |
| POST   | `/order`         |  ❌  |  ✅  |   ✅   |
| GET    | `/order`         |  ❌  |  ✅  |   ✅   |
| GET    | `/order/all`     |  ❌  |  ❌  |   ✅   |

---

# 21. API 測試方式

可使用：

- Postman
- Bruno
- Insomnia
- REST Client
- Thunder Client
- 前端頁面
- 自動化測試

---

## Postman 測試流程

建議依序測試：

```text
1. POST /auth/register
2. POST /auth/login
3. POST /auth/refresh
4. GET /product
5. GET /product/:id
6. GET /user/cart
7. PATCH /user/cart
8. POST /order
9. GET /order
10. DELETE /auth/logout
```

管理員測試：

```text
1. 管理員登入
2. GET /product/all
3. POST /product
4. PATCH /product/:id
5. GET /order/all
```

---

# 22. 常見錯誤排查

## 22.1 401 Unauthorized

可能原因：

- Access Token 缺失
- Access Token 過期
- Authorization Header 格式錯誤
- Refresh Token 不存在
- Cookie 未攜帶
- 使用者已登出

檢查：

```http
Authorization: Bearer TOKEN
```

並確認：

```ts
withCredentials: true;
```

---

## 22.2 403 Forbidden

可能原因：

- 已登入但不是管理員
- 使用者角色不符合 API 權限

---

## 22.3 CORS Error

確認後端：

```ts
cors({
  origin: "http://localhost:3000",
  credentials: true,
});
```

前端：

```ts
withCredentials: true;
```

---

## 22.4 MongoDB Buffering Timeout

例如：

```text
Operation `refreshtokens.findOneAndDelete()`
buffering timed out
```

代表資料庫未成功連線。

檢查：

- `DB_URL`
- MongoDB Atlas IP 白名單
- Database User
- 密碼特殊字元
- 網路與 DNS
- 是否在資料庫連線成功後才啟動伺服器

---

## 22.5 API Base URL 錯誤

確認：

```env
VITE_API_URL=http://localhost:4000
```

不要同時出現：

```env
VITE_API_URL=http://localhost:4000
VITE_API_URL=http://localhost:4000/api
```

---

# 23. 安全原則

API 開發應遵守：

- 不信任前端傳入的價格
- 不信任前端傳入的角色
- 不回傳 Password
- Access Token 有效時間應較短
- Refresh Token 應可撤銷
- Refresh Token 使用 HttpOnly Cookie
- 管理員 API 必須驗證角色
- 所有輸入都必須驗證
- 上傳檔案需限制格式與大小
- 正式環境應使用 HTTPS
- 錯誤回應不應洩漏 Stack Trace
- CORS 不應在正式環境無限制開放

---

# 24. API 版本規劃

目前 API 尚未加入版本前綴。

現況：

```text
/auth
/product
/user
/order
```

未來可規劃：

```text
/api/v1/auth
/api/v1/products
/api/v1/users
/api/v1/orders
```

加入版本後，可避免未來 API 改版直接影響舊版前端。

此項目建議另開 Issue 處理，不應直接修改現有路徑。

---

# 25. 後續擴充 API

未來可新增：

```text
GET    /user/profile
PATCH  /user/profile

GET    /favorite
POST   /favorite/:productId
DELETE /favorite/:productId

GET    /review
POST   /review
PATCH  /review/:id
DELETE /review/:id

PATCH  /order/:id/status

GET    /ramen-store
GET    /ramen-store/:id

GET    /search
```

---

# 26. PR 前 API 檢查

API 相關 Pull Request 建立前應執行：

前端：

```bash
npm run type-check
npm run lint
npm run build
```

後端：

```bash
npm run type-check
npm run lint
npm run build
```

實際測試：

- 註冊
- 登入
- Refresh
- 登出
- 公開商品
- 商品詳細頁
- 管理員商品
- 建立與更新商品
- 購物車
- 建立訂單
- 會員訂單
- 管理員訂單
- 401
- 403
- 404
- 檔案上傳錯誤

最低標準：

```text
TypeScript：無 Error
Lint：無 Error
Build：成功
核心 API：可正常使用
```
