# 後端開發文件（Backend Development Guide）

> 專案名稱：**拉麵通（Ramen Tsu）**  
> 後端技術：Node.js、Express、TypeScript、MongoDB、Mongoose、Passport、JWT、Cloudinary

---

# 1. 後端概覽

拉麵通後端採用 Node.js、Express 與 TypeScript 開發，主要負責：

- 提供 RESTful API
- 處理會員註冊、登入、登出與登入狀態恢復
- 驗證 Access Token 與 Refresh Token
- 管理商品、購物車與訂單資料
- 執行角色與權限驗證
- 操作 MongoDB 資料庫
- 處理圖片上傳
- 統一處理 API 錯誤與回應格式

後端與前端採用前後端分離架構：

```text
Vue Frontend
    │
    ▼
Axios Request
    │
    ▼
Express API
    │
    ▼
Middleware
    │
    ▼
Controller
    │
    ▼
Mongoose Model
    │
    ▼
MongoDB Atlas
```

---

# 2. 使用技術

## 執行環境

- Node.js
- TypeScript
- Express

## 資料庫

- MongoDB
- MongoDB Atlas
- Mongoose

## 身分驗證

- Passport
- Passport JWT
- JSON Web Token
- Refresh Token
- Cookie

## 檔案與圖片

- Multer
- Cloudinary
- multer-storage-cloudinary

## 輔助套件

- dotenv
- cors
- cookie-parser
- http-status-codes
- validator

---

# 3. 後端目錄結構

```text
back/
├── src/
│   ├── configs/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── index.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
└── eslint.config.mts
```

目前實際目錄可能仍在持續調整，若部分資料夾尚未建立，應依功能需求逐步補齊。

---

# 4. `src/index.ts`

`src/index.ts` 是後端應用程式入口。

主要負責：

- 載入環境變數
- 建立 Express App
- 連接 MongoDB
- 註冊全域 Middleware
- 註冊 Router
- 設定錯誤處理
- 啟動 HTTP Server

建議初始化順序：

```text
dotenv
→ Express App
→ Global Middleware
→ Routes
→ Error Middleware
→ MongoDB Connection
→ app.listen
```

建議資料庫成功連線後，再啟動伺服器：

```ts
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

const app = express();

async function startServer(): Promise<void> {
  const databaseUrl = process.env.DB_URL;

  if (!databaseUrl) {
    throw new Error("缺少 DB_URL");
  }

  await mongoose.connect(databaseUrl);

  const port = Number(process.env.PORT) || 4000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

void startServer();
```

這樣可以避免資料庫尚未連線時，就開始接收 API Request。

---

# 5. 環境變數

後端環境變數通常放在：

```text
back/.env
```

範例檔：

```text
back/.env.example
```

建議內容：

```env
PORT=4000

DB_URL=mongodb+srv://username:password@cluster.mongodb.net/ramen-tsu

JWT_SECRET=replace_with_access_token_secret
JWT_REFRESH_SECRET=replace_with_refresh_token_secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FRONTEND_URL=http://localhost:3000
```

注意：

- `.env` 不應提交到 Git
- `.env.example` 不可放入真實密碼
- MongoDB 密碼若包含特殊字元，需 URL Encode
- Access Token 與 Refresh Token 應使用不同 Secret
- 正式環境不可使用開發用 Secret

---

# 6. MongoDB 與 Mongoose

MongoDB 用於儲存：

```text
User
Product
Order
RefreshToken
```

Mongoose 負責：

- Schema 定義
- 型別驗證
- CRUD 操作
- 關聯欄位
- Timestamp
- Middleware
- Index

資料庫連線：

```ts
await mongoose.connect(process.env.DB_URL);
```

建議加入必要檢查：

```ts
const databaseUrl = process.env.DB_URL;

if (!databaseUrl) {
  throw new Error("DB_URL is not defined");
}
```

---

# 7. `src/models`

`models` 用來定義 Mongoose Schema 與 Model。

```text
src/models/
├── user.ts
├── product.ts
├── order.ts
└── refreshToken.ts
```

---

## 7.1 User Model

User Model 通常包含：

```ts
account;
email;
password;
role;
cart;
createdAt;
updatedAt;
```

可能的角色：

```ts
"user";
"admin";
```

注意：

- Password 不應直接回傳給前端
- Password 儲存前應雜湊
- Email 應驗證格式
- Account 與 Email 通常應建立唯一索引

---

## 7.2 Product Model

Product Model 通常包含：

```ts
name;
price;
description;
category;
image;
sell;
createdAt;
updatedAt;
```

欄位用途：

- `name`：商品名稱
- `price`：商品價格
- `description`：商品說明
- `category`：商品分類
- `image`：Cloudinary 圖片網址
- `sell`：是否上架

---

## 7.3 Order Model

Order Model 通常包含：

```ts
user;
cart;
total;
status;
createdAt;
updatedAt;
```

訂單內容通常應保存建立訂單當下的商品資訊，避免商品後續修改價格時影響歷史訂單。

例如：

```ts
{
  product: ObjectId,
  name: string,
  price: number,
  quantity: number
}
```

---

## 7.4 RefreshToken Model

Refresh Token Model 通常包含：

```ts
user;
token;
expiresAt;
createdAt;
```

建議：

- Refresh Token 應可撤銷
- 登出時刪除對應 Token
- 可為 `expiresAt` 建立 TTL Index
- 不建議永久保存失效 Token

---

# 8. `src/routes`

Routes 負責定義 URL 與對應 Controller。

```text
src/routes/
├── auth.ts
├── product.ts
├── order.ts
└── user.ts
```

概念：

```ts
router.post("/login", login);
router.get("/product", getProducts);
router.post("/order", auth, createOrder);
```

Route 應只負責：

- 路徑
- HTTP Method
- Middleware
- Controller 綁定

Route 不應直接放大量商業邏輯。

---

# 9. `src/controllers`

Controller 負責：

- 讀取 Request
- 呼叫 Model 或 Service
- 回傳 Response
- 將錯誤交給 Error Middleware

```text
src/controllers/
├── auth.ts
├── product.ts
├── order.ts
└── user.ts
```

建議結構：

```ts
export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const products = await Product.find({
      sell: true,
    });

    res.status(200).json({
      success: true,
      message: "",
      result: products,
    });
  } catch (error) {
    next(error);
  }
}
```

Controller 應避免：

- 重複驗證邏輯
- 重複格式化 Error
- 操作 DOM
- 包含前端顯示邏輯

---

# 10. `src/services`

Service Layer 可用來放置較複雜、可重複使用的商業邏輯。

例如：

```text
src/services/
├── auth.ts
├── token.ts
├── product.ts
└── order.ts
```

適合放入：

- Token 產生與驗證
- 訂單總額計算
- 商品庫存處理
- Refresh Token 輪替
- Cloudinary 刪除
- 多個 Model 的交易流程

資料流：

```text
Route
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Model
```

如果邏輯很簡單，Controller 可以直接操作 Model；若流程開始變複雜，建議抽到 Service。

---

# 11. `src/middlewares`

Middleware 用於處理所有 Request 之間可重複使用的流程。

```text
src/middlewares/
├── auth.ts
├── error.ts
└── upload.ts
```

---

## 11.1 Auth Middleware

主要負責：

- 解析 Access Token
- 驗證 JWT
- 確認登入狀態
- 驗證角色
- 將使用者資料放入 Request

概念：

```text
Request
  │
  ▼
Authorization Header
  │
  ▼
Passport JWT
  │
  ▼
User
  │
  ▼
Controller
```

若驗證失敗，應回傳：

```http
401 Unauthorized
```

角色不符則回傳：

```http
403 Forbidden
```

---

## 11.2 Error Middleware

統一處理錯誤：

```ts
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // 統一解析與回傳錯誤
}
```

建議統一 API Error Response：

```json
{
  "success": false,
  "message": "錯誤訊息"
}
```

若是欄位驗證錯誤，可回傳：

```json
{
  "success": false,
  "message": "資料驗證失敗",
  "errors": {
    "email": ["Email 格式錯誤"]
  }
}
```

---

## 11.3 Upload Middleware

圖片上傳流程通常使用：

```text
Multer
→ Cloudinary Storage
→ Controller
```

建議限制：

- MIME Type
- 檔案大小
- 支援格式
- 單檔或多檔數量

例如：

```ts
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    const allowedTypes = ["image/png", "image/jpeg"];

    callback(null, allowedTypes.includes(file.mimetype));
  },
});
```

---

# 12. `src/configs`

Configs 用於集中管理第三方套件設定。

```text
src/configs/
├── cloudinary.ts
└── passport.ts
```

---

## 12.1 Cloudinary Config

```ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

環境變數缺失時，應在伺服器啟動階段提早發現。

---

## 12.2 Passport Config

Passport 設定通常負責：

- 讀取 Bearer Token
- 驗證 Access Token
- 從 Payload 取得 User ID
- 查詢使用者
- 將 User 傳給 Middleware

JWT Payload 不應放入：

- Password
- 個人敏感資料
- 大量使用者資訊

通常只需要：

```ts
{
  sub: user._id,
  role: user.role
}
```

---

# 13. CORS

前後端分離時，後端需要正確設定 CORS。

```ts
import cors from "cors";

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
```

本地開發：

```env
FRONTEND_URL=http://localhost:3000
```

若 Refresh Token 使用 Cookie，前後端兩邊都必須允許 credentials。

前端 Axios：

```ts
withCredentials: true;
```

後端 CORS：

```ts
credentials: true;
```

兩者缺一不可。

---

# 14. Cookie

Refresh Token 若放在 Cookie，建議：

```ts
res.cookie("refreshToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});
```

注意：

- `httpOnly` 可防止前端 JavaScript 讀取
- HTTPS 正式環境通常需要 `secure: true`
- 跨站 Cookie 通常需要 `sameSite: 'none'`
- `sameSite: 'none'` 必須搭配 `secure: true`

---

# 15. JWT 與 Token 流程

建議採用：

```text
Access Token
├── 有效時間短
├── 放在前端記憶體或 Store
└── 用於 API Authorization

Refresh Token
├── 有效時間較長
├── 放在 HttpOnly Cookie
└── 用於重新取得 Access Token
```

登入流程：

```text
POST /auth/login
      │
      ▼
驗證帳號密碼
      │
      ▼
產生 Access Token
      │
      ▼
產生 Refresh Token
      │
      ▼
Refresh Token 寫入 Cookie
      │
      ▼
回傳 Access Token 與 User
```

Refresh 流程：

```text
POST /auth/refresh
      │
      ▼
讀取 HttpOnly Cookie
      │
      ▼
驗證 Refresh Token
      │
      ▼
查詢 RefreshToken Model
      │
      ▼
產生新的 Access Token
      │
      ▼
回傳登入資訊
```

Logout 流程：

```text
DELETE /auth/logout
      │
      ▼
刪除 Refresh Token
      │
      ▼
清除 Cookie
      │
      ▼
回傳登出成功
```

---

# 16. API Response 格式

成功回應建議統一為：

```json
{
  "success": true,
  "message": "操作成功",
  "result": {}
}
```

列表：

```json
{
  "success": true,
  "message": "",
  "result": []
}
```

錯誤回應：

```json
{
  "success": false,
  "message": "請求失敗"
}
```

前端目前使用的型別概念：

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  result: T;
}
```

因此後端應盡量維持一致格式。

---

# 17. HTTP Status Code

常用狀態碼：

| 狀態碼 | 用途                   |
| ------ | ---------------------- |
| `200`  | 查詢、更新成功         |
| `201`  | 建立成功               |
| `204`  | 成功但無 Response Body |
| `400`  | 請求資料錯誤           |
| `401`  | 尚未登入或 Token 無效  |
| `403`  | 權限不足               |
| `404`  | 找不到資源             |
| `409`  | 資料衝突               |
| `413`  | 上傳檔案過大           |
| `422`  | 驗證失敗               |
| `500`  | 伺服器內部錯誤         |

建議搭配：

```ts
import { StatusCodes } from "http-status-codes";
```

例如：

```ts
res.status(StatusCodes.CREATED).json(...)
```

---

# 18. API 命名

建議採 RESTful 路徑：

```text
/auth
/product
/order
/user
```

範例：

```http
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
DELETE /auth/logout

GET    /product
GET    /product/:id
GET    /product/all
POST   /product
PATCH  /product/:id

GET    /order
GET    /order/all
POST   /order

GET    /user/cart
PATCH  /user/cart
```

如果未來要標準化複數資源，也可規劃成：

```text
/products
/orders
/users
```

但現有前後端已使用單數路徑時，不建議在沒有遷移計畫的情況下直接改名。

---

# 19. Auth API

常見 Auth API：

## 註冊

```http
POST /auth/register
```

Request：

```json
{
  "account": "example",
  "email": "example@example.com",
  "password": "password"
}
```

---

## 登入

```http
POST /auth/login
```

Request：

```json
{
  "account": "example",
  "password": "password"
}
```

Response：

```json
{
  "success": true,
  "message": "登入成功",
  "result": {
    "accessToken": "...",
    "account": "example",
    "role": "user",
    "cart": 0
  }
}
```

---

## Refresh

```http
POST /auth/refresh
```

Refresh Token 由 HttpOnly Cookie 自動攜帶。

---

## 登出

```http
DELETE /auth/logout
```

後端應：

- 刪除資料庫內 Refresh Token
- 清除 Cookie
- 回傳登出成功

---

# 20. Product API

常見商品 API：

```http
GET /product
GET /product/:id
GET /product/all
POST /product
PATCH /product/:id
```

---

## 公開商品列表

```http
GET /product
```

只回傳：

```ts
sell: true;
```

的商品。

---

## 管理員商品列表

```http
GET /product/all
```

應需要：

```text
登入
+
admin 權限
```

---

## 建立商品

```http
POST /product
```

通常使用：

```text
multipart/form-data
```

欄位：

```text
name
price
description
category
sell
image
```

---

# 21. Cart API

目前購物車放在 User 資源下：

```http
GET /user/cart
PATCH /user/cart
```

PATCH Request：

```json
{
  "product": "product_id",
  "quantity": 1,
  "replace": false
}
```

欄位：

- `product`：商品 ID
- `quantity`：調整數量
- `replace`：是否直接取代數量

後端需驗證：

- Product 是否存在
- Quantity 是否合理
- 商品是否可購買
- 使用者是否登入

---

# 22. Order API

常見訂單 API：

```http
POST /order
GET /order
GET /order/all
```

---

## 建立訂單

```http
POST /order
```

建議流程：

```text
取得使用者購物車
→ 驗證商品
→ 重新取得商品價格
→ 建立 Order Snapshot
→ 計算總額
→ 清空購物車
→ 回傳訂單
```

不可完全信任前端傳入的價格。

---

## 我的訂單

```http
GET /order
```

只回傳目前登入者的訂單。

---

## 所有訂單

```http
GET /order/all
```

應限管理員使用。

---

# 23. Validation

後端應驗證所有外部輸入。

包括：

- Body
- Params
- Query
- Header
- Cookie
- Uploaded File

例如：

```ts
if (!validator.isEmail(req.body.email)) {
  throw new Error("EMAIL");
}
```

但長期建議使用集中式 Schema Validation，例如：

- Zod
- Joi
- Yup
- express-validator

避免 Controller 內散落大量驗證判斷。

---

# 24. 錯誤處理

Controller 不應自行重複撰寫所有 Error Response。

建議：

```ts
try {
  // controller logic
} catch (error) {
  next(error);
}
```

再交給全域 Error Middleware。

常見錯誤類型：

```text
MongoServerError
Mongoose ValidationError
CastError
JsonWebTokenError
TokenExpiredError
MulterError
```

應轉換成適當 Status Code 與 Message。

---

# 25. 開發指令

進入後端目錄：

```bash
cd back
```

安裝套件：

```bash
npm install
```

啟動開發伺服器：

```bash
npm run dev
```

型別檢查：

```bash
npm run type-check
```

Lint：

```bash
npm run lint
```

建置：

```bash
npm run build
```

實際可用指令應以 `back/package.json` 為準：

```bash
npm run
```

---

# 26. 資料庫連線問題排查

若出現：

```text
MongooseError:
Operation buffering timed out
```

代表 Mongoose 尚未成功連線，卻已經開始執行資料庫操作。

排查順序：

1. 確認 `back/.env` 存在
2. 確認 `DB_URL` 正確
3. 確認 MongoDB Atlas Database User
4. 確認 Network Access
5. 確認密碼特殊字元已編碼
6. 確認 DNS 與網路
7. 確認 `app.listen()` 在連線成功後執行

檢查環境變數：

```bash
node -e "require('dotenv').config(); console.log(Boolean(process.env.DB_URL))"
```

應輸出：

```text
true
```

---

# 27. 安全原則

後端應遵守：

- Password 必須雜湊
- 不回傳 Password
- JWT Secret 不可寫死
- Refresh Token 應可撤銷
- Cookie 使用 HttpOnly
- 正式環境啟用 Secure Cookie
- 驗證所有輸入
- 限制上傳格式與大小
- 管理員 API 必須驗證角色
- CORS 不應無限制開放正式環境
- 錯誤回應不應洩漏 Stack Trace
- 不信任前端提供的價格與權限資料

---

# 28. 開發規範

## Controller 命名

建議：

```ts
register;
login;
refresh;
logout;

getProducts;
getProductById;
createProduct;
updateProduct;

getMyOrders;
getAllOrders;
createOrder;
```

---

## Model 命名

Model 使用 PascalCase：

```ts
User;
Product;
Order;
RefreshToken;
```

檔名使用 camelCase 或小寫，專案內需統一：

```text
refreshToken.ts
```

---

## 型別規範

避免：

```ts
any;
```

優先使用：

```ts
unknown;
```

並透過 Type Guard 縮小型別。

---

## 非同步函式

所有資料庫操作應使用：

```ts
async / await;
```

並搭配：

```ts
try / catch
```

或統一 async error wrapper。

---

# 29. PR 前檢查

後端 Pull Request 前建議執行：

```bash
npm run type-check
npm run lint
npm run build
```

並實際測試：

- MongoDB 連線
- Register
- Login
- Refresh
- Logout
- Public Product List
- Admin Product List
- Product Create / Update
- Add Cart
- Create Order
- My Orders
- Admin Orders
- Unauthorized Request
- Forbidden Request
- Upload Error
- Validation Error

最低標準：

```text
Type-check：無 Error
Lint：無 Error
Build：成功
核心 API：可正常使用
```

---

# 30. 後續擴充方向

後端未來可加入：

- Service Layer 完整拆分
- Repository Pattern
- Zod Schema Validation
- Refresh Token Rotation
- Rate Limiting
- Helmet
- API Versioning
- OpenAPI / Swagger
- Unit Test
- Integration Test
- Docker
- Redis
- Queue
- Email Service
- Logging System
- CI/CD
- Audit Log
- Soft Delete
- Transaction
- Inventory Management
