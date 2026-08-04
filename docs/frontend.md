# 前端開發文件（Frontend Development Guide）

> 專案名稱：**拉麵通（Ramen Tsu）**  
> 前端技術：Vue 3、TypeScript、Element Plus、Pinia、Pinia Colada、Vue Router、Axios、SCSS

---

# 1. 前端概覽

拉麵通前端採用 Vue 3 與 TypeScript 開發，主要負責：

- 顯示網站頁面
- 處理使用者互動
- 管理登入狀態
- 呼叫後端 API
- 管理 API 快取
- 顯示表單驗證結果
- 控制前台與後台 Layout
- 支援淺色與深色模式
- 提供響應式版面

前端與後端採用前後端分離架構：

```text
Browser
   │
   ▼
Vue 3 Application
   │
   ▼
Pinia Colada Query
   │
   ▼
Service Layer
   │
   ▼
Axios API Client
   │
   ▼
Express Backend API
```

---

# 2. 使用技術

## 核心框架

- Vue 3
- TypeScript
- Vite
- Vue Router

## UI 與樣式

- Element Plus
- Element Plus Icons
- Bootstrap 5
- SCSS
- CSS Variables
- Dark Mode

## 狀態與資料請求

- Pinia
- Pinia Colada
- Axios
- VueUse

## 表單與驗證

- VeeValidate
- Yup
- Validator

## 其他套件

- Vue File Agent
- Vue Boring Avatars
- unplugin-auto-import
- unplugin-vue-components
- vite-plugin-vue-layouts-next
- 自動路由

---

# 3. 前端目錄結構

```text
front/
├── public/
├── src/
│   ├── assets/
│   ├── auth/
│   ├── components/
│   ├── composables/
│   ├── config/
│   ├── css/
│   ├── layouts/
│   ├── pages/
│   ├── plugins/
│   ├── queries/
│   ├── router/
│   ├── services/
│   ├── stores/
│   ├── styles/
│   ├── types/
│   ├── utils/
│   ├── App.vue
│   └── main.ts
├── .env.example
├── components.d.ts
├── package.json
├── tsconfig.app.json
└── vite.config.mts
```

---

# 4. `src/assets`

`assets` 用來存放會被 Vite 打包處理的靜態資源。

```text
src/assets/
└── images/
    └── logo.png
```

適合放置：

- Logo
- 網站圖片
- 背景圖片
- 本地字型
- SVG
- 圖示素材

使用方式：

```ts
import logo from "@/assets/images/logo.png";
```

模板：

```vue
<img :src="logo" alt="拉麵通 Logo" />
```

---

# 5. `src/components`

`components` 放置可重複使用的 Vue 元件。

```text
src/components/
├── common/
├── providers/
└── ProductCard.vue
```

---

## 5.1 `components/common`

共用 UI 元件集中放置於：

```text
src/components/common/
```

目前包含：

```text
AppButton.vue
AppCard.vue
AppDialog.vue
AppEmpty.vue
AppLoading.vue
AppPagination.vue
DarkModeToggle.vue
index.ts
```

這些元件主要負責：

- 統一視覺樣式
- 統一 Element Plus 元件包裝
- 支援 Theme Token
- 支援 Dark Mode
- 降低頁面重複程式碼

---

## AppButton

統一按鈕：

```vue
<AppButton type="primary" :loading="isSubmitting" @click="submit">
  儲存
</AppButton>
```

適合處理：

- 按鈕類型
- Loading
- Disabled
- Round
- Plain
- Native Type

---

## AppCard

統一卡片樣式：

```vue
<AppCard title="商品資訊">
  商品內容
</AppCard>
```

支援：

- 標題
- Header 插槽
- Actions 插槽
- Element Plus Shadow
- Theme Token

---

## AppDialog

統一對話框：

```vue
<AppDialog
  v-model="dialogVisible"
  title="刪除商品"
  confirm-type="danger"
  @confirm="deleteProduct"
>
  確定要刪除這筆商品嗎？
</AppDialog>
```

支援：

- `v-model`
- 確認與取消按鈕
- Loading
- Footer 插槽
- Dialog 尺寸

---

## AppEmpty

顯示空資料狀態：

```vue
<AppEmpty description="目前沒有商品資料">
  <AppButton>
    新增商品
  </AppButton>
</AppEmpty>
```

---

## AppLoading

顯示區塊載入狀態：

```vue
<AppLoading :loading="isLoading" text="正在載入商品...">
  <ProductList />
</AppLoading>
```

---

## AppPagination

統一分頁功能：

```vue
<AppPagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :total="total"
/>
```

---

## DarkModeToggle

切換 Light Mode 與 Dark Mode：

```vue
<DarkModeToggle />
```

目前可放置於：

- 前台 Navbar
- 後台 Header
- 共用 Layout

---

## 5.2 `components/providers`

Provider 元件用來集中管理全域 UI 設定。

```text
src/components/providers/
└── AppConfigProvider.vue
```

例如：

```vue
<template>
  <ElConfigProvider
    :locale="elementPlusConfig.locale"
    :size="elementPlusConfig.size"
  >
    <slot />
  </ElConfigProvider>
</template>
```

`App.vue` 會使用 Provider 包住整個應用程式：

```vue
<AppConfigProvider>
  <RouterView />
</AppConfigProvider>
```

---

# 6. `src/layouts`

`layouts` 放置頁面共用版型。

```text
src/layouts/
├── default.vue
└── admin.vue
```

---

## 6.1 `default.vue`

前台 Layout，主要包含：

- Logo
- 網站名稱
- Navbar
- 使用者功能
- 購物車
- 訂單
- 登出
- Dark Mode
- Sidebar
- Router View

主要結構：

```text
Header
├── Brand
├── Account Menu
└── Dark Mode

Body
├── Sidebar
└── Main Content
```

頁面內容透過：

```vue
<router-view />
```

顯示。

---

## 6.2 `admin.vue`

後台管理 Layout，主要包含：

- 後台 Sidebar
- 收合按鈕
- 管理選單
- 使用者帳號
- Dark Mode
- Breadcrumb
- Router View

主要結構：

```text
Admin Layout
├── Sidebar
│   ├── Dashboard
│   ├── Users
│   ├── Products
│   ├── Orders
│   └── Frontend
└── Content
    ├── Header
    ├── Breadcrumb
    └── Router View
```

---

# 7. `src/pages`

`pages` 是自動路由掃描目錄。

```text
src/pages/
├── index.vue
├── login.vue
├── register.vue
├── forbidden.vue
├── product/
├── user/
├── admin/
└── dev/
```

每個 Vue 檔案會自動產生對應的路由。

---

## 自動路由規則

```text
src/pages/index.vue
→ /

src/pages/login.vue
→ /login

src/pages/register.vue
→ /register

src/pages/product/[id].vue
→ /product/:id

src/pages/admin/product.vue
→ /admin/product

src/pages/dev/components.vue
→ /dev/components
```

不需要手動在 `router/index.ts` 新增 route。

---

## Route Block

頁面可透過：

```vue
<route lang="yaml">
meta:
  layout: default
  title: 商品頁面
</route>
```

設定：

- Layout
- Title
- Access
- Roles

例如後台頁面：

```vue
<route lang="yaml">
meta:
  layout: admin
  access: authenticated
  roles:
    - admin
  title: 商品管理
</route>
```

---

# 8. `src/router`

```text
src/router/
├── index.ts
├── guards.ts
├── meta.ts
└── title.ts
```

---

## 8.1 `router/index.ts`

負責建立 Router。

目前採用：

- 自動路由
- Hash History
- 自動 Layout
- Router Guard

概念：

```ts
import { routes } from "vue-router/auto-routes";

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});
```

---

## 8.2 `router/guards.ts`

負責：

- 初始化登入狀態
- 訪客頁面限制
- 登入頁面限制
- 角色權限驗證
- 未登入時導向登入頁
- 無權限時導向禁止頁

存取設定：

```yaml
access: guest
```

代表僅訪客可以進入。

```yaml
access: authenticated
```

代表必須登入。

```yaml
roles:
  - admin
```

代表必須具備管理員角色。

---

# 9. `src/stores`

Pinia Store 負責管理全域狀態。

```text
src/stores/
├── user.ts
└── snackbar.ts
```

---

## 9.1 User Store

主要管理：

- Access Token
- 使用者帳號
- 使用者角色
- 登入狀態
- 購物車數量

概念：

```ts
const user = useUserStore();

user.login(loginResponse);

user.logout();

user.isLoggedIn;

user.isAdmin;
```

---

## 9.2 Snackbar Store

統一顯示提示訊息。

```ts
snackbar.add({
  text: "儲存成功",
  color: "success",
});
```

錯誤處理：

```ts
snackbar.addError(error);
```

---

# 10. `src/plugins`

`plugins` 用來集中初始化 Vue Plugin。

```text
src/plugins/
├── index.ts
├── pinia.ts
└── theme.ts
```

---

## 10.1 `plugins/pinia.ts`

建立 Pinia Instance：

```ts
export const pinia = createPinia();
```

在 Vue 元件外使用 Store 時，應明確傳入：

```ts
const user = useUserStore(pinia);
```

適用場景：

- Axios Interceptor
- Router Guard
- Session Helper
- 一般模組檔案

---

## 10.2 `plugins/theme.ts`

負責初始化主題：

- 讀取 localStorage
- 設定 HTML Class
- 套用 Dark Mode
- 初始化 Theme State

入口檔案只需要：

```ts
initTheme();
```

---

## 10.3 `plugins/index.ts`

集中註冊 Vue Plugin。

```ts
registerPlugins(app);
```

適合統一註冊：

- Pinia
- Router
- Element Plus
- 其他 Plugin

需避免同一個 Plugin 在 `main.ts` 與 `registerPlugins()` 中重複註冊。

---

# 11. `src/composables`

Composable 用來封裝可重複使用的 Composition API 邏輯。

```text
src/composables/
├── useDark.ts
└── useTheme.ts
```

---

## useTheme

可提供：

```ts
theme;
isDark;
setTheme();
toggleTheme();
initTheme();
```

使用方式：

```ts
const { isDark, toggleTheme } = useTheme();
```

---

## useDark

可作為 Dark Mode 的相容入口，或包裝 `useTheme()`。

應避免 `useDark.ts` 與 `useTheme.ts` 各自維護不同的狀態。

---

# 12. `src/styles`

全域 SCSS 與 Theme Token 集中放置於：

```text
src/styles/
├── _bootstrap.scss
├── _colors.scss
├── _element-plus.scss
├── _spacing.scss
├── _theme.scss
├── _typography.scss
├── _variables.scss
└── main.scss
```

---

## 12.1 `_variables.scss`

定義一般變數，例如：

- Breakpoint
- Font
- Spacing
- Layout Width

---

## 12.2 `_colors.scss`

定義品牌色與顏色階。

例如：

```scss
$brand-primary: #8b4513;
```

---

## 12.3 `_theme.scss`

定義 CSS Variables：

```scss
:root {
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-text: #303133;
  --color-text-secondary: #606266;
  --color-border: #dcdfe6;
}
```

深色模式：

```scss
.dark {
  --color-background: #181818;
  --color-surface: #242424;
  --color-text: #f5f5f5;
  --color-text-secondary: #c0c4cc;
  --color-border: #414243;
}
```

元件應避免寫死：

```scss
background-color: #fff;
```

應改成：

```scss
background-color: var(--color-surface);
```

---

## 12.4 `_element-plus.scss`

覆蓋 Element Plus Theme Token：

```scss
:root {
  --el-color-primary: #8b4513;
  --el-border-radius-base: var(--radius-md);
  --el-bg-color: var(--color-surface);
}
```

這能統一：

- Button
- Menu
- Dialog
- Card
- Form
- Pagination
- Dark Mode

---

## 12.5 `_bootstrap.scss`

負責 Bootstrap 變數覆蓋與 SCSS 匯入。

例如：

```scss
$primary: #8b4513;

@import "bootstrap/scss/bootstrap";
```

Bootstrap 目前可能產生 Sass Deprecation Warning，但只要 Build 成功，通常不阻擋開發。

---

## 12.6 `main.scss`

全域樣式入口：

```scss
@use "./variables";
@use "./theme";
@use "./element-plus";
@use "./bootstrap";
```

在 `main.ts` 匯入：

```ts
import "@/styles/main.scss";
```

---

# 13. `src/services`

Service Layer 是真正發送 HTTP Request 的位置。

```text
src/services/
├── api.ts
├── auth.ts
├── cart.ts
├── order.ts
└── product.ts
```

---

## 13.1 `services/api.ts`

負責：

- 建立 Axios Client
- API Base URL
- Credentials
- Authorization Header
- Response Interceptor
- Refresh Token
- Request Retry

概念：

```ts
export const api = axios.create({
  baseURL,
});

export const apiAuth = axios.create({
  baseURL,
  withCredentials: true,
});
```

公開 API：

```ts
api.get("/product");
```

授權 API：

```ts
apiAuth.get("/product/all");
```

---

## 13.2 `services/auth.ts`

負責：

```ts
register();
login();
refresh();
logout();
```

---

## 13.3 `services/product.ts`

建議命名：

```ts
getProducts();
getAdminProducts();
getProductById();
createProduct();
updateProduct();
```

---

## 13.4 `services/order.ts`

建議命名：

```ts
createOrder();
getMyOrders();
getAdminOrders();
```

---

## 13.5 `services/cart.ts`

建議命名：

```ts
addCartItem();
getCartItems();
```

---

# 14. `src/queries`

Query Layer 使用 Pinia Colada 管理 Server State。

```text
src/queries/
├── auth.ts
├── cart.ts
├── order.ts
└── product.ts
```

Query Layer 負責：

- API Query
- Mutation
- Cache
- Stale Time
- Invalidate
- Query Data 更新

---

## Product Query

```ts
useProductsQuery();
useAdminProductsQuery();
useProductByIdQuery();
useCreateProductMutation();
useUpdateProductMutation();
```

---

## Order Query

```ts
useCreateOrderMutation();
useMyOrdersQuery();
useAdminOrdersQuery();
```

快取 Key 應分開：

```ts
["order", "mine"][("order", "admin")];
```

不要讓會員訂單和管理員訂單使用相同 Key。

---

## Cart Query

```ts
useAddCartItemMutation();
useCartItemsQuery();
```

---

## Auth Query

```ts
useLoginMutation();
useRegisterMutation();
useLogoutMutation();
```

Router Guard 不建議直接呼叫 Mutation Composable，應直接呼叫 Auth Service 或 Session Helper。

---

# 15. `src/auth`

```text
src/auth/
└── session.ts
```

`session.ts` 負責初始化登入狀態。

例如：

```ts
await ensureAuthInitialized();
```

它應避免和 Router Guard 重複維護：

```ts
let isAuthInitialized = false;
```

建議統一由 Session Helper 管理登入初始化 Promise。

---

# 16. `src/types`

所有 TypeScript 型別集中放置於：

```text
src/types/
├── api.ts
├── auth.ts
├── cart.ts
├── order.ts
└── product.ts
```

---

## API 型別

```ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  result: T;
}
```

錯誤回應：

```ts
export interface ApiErrorResponse {
  success?: false;
  message?: string;
  errors?: Record<string, string[]>;
}
```

---

## Product 型別

包含：

- 商品資料
- 商品表單
- 商品分類

---

## Cart 型別

包含：

- Cart Item
- Add Cart Payload
- Quantity
- Replace

---

## Order 型別

包含：

- Order
- Order Item
- Order Status
- User Reference

---

# 17. `src/utils`

工具函式應保持單純，不承擔業務 Service 責任。

例如：

```text
src/utils/
└── api-error.ts
```

API Client 不應放在：

```text
src/utils/api.ts
```

而應放在：

```text
src/services/api.ts
```

---

## API Error Helper

```ts
export function getApiErrorMessage(error: unknown): string;
```

使用：

```ts
const message = getApiErrorMessage(error);
```

適合統一處理 Axios Error。

---

# 18. `App.vue`

`App.vue` 是根元件。

目前主要職責：

```vue
<AppConfigProvider>
  <RouterView />
</AppConfigProvider>
```

不建議在 `App.vue` 放置：

- 頁面業務邏輯
- API 請求
- Layout 細節
- 大量全域樣式

---

# 19. `main.ts`

`main.ts` 是前端入口。

建議初始化順序：

```text
createApp
→ initTheme
→ Element Plus
→ Pinia
→ Pinia Colada
→ Router
→ mount
```

範例：

```ts
const app = createApp(App);

initTheme();

app.use(ElementPlus);
app.use(pinia);
app.use(PiniaColada);
app.use(router);

app.mount("#app");
```

需確認 `registerPlugins(app)` 不會重複註冊同一批 Plugin。

---

# 20. 環境變數

前端範例檔：

```text
front/.env.example
```

內容：

```env
VITE_API_URL=http://localhost:4000
```

本地開發可建立：

```text
front/.env
```

```env
VITE_API_URL=http://localhost:4000
```

Vite 只有以：

```text
VITE_
```

開頭的變數可在前端使用。

使用：

```ts
import.meta.env.VITE_API_URL;
```

注意：

> 前端環境變數會被打包到瀏覽器，不可放入密碼、API Secret 或資料庫連線字串。

---

# 21. 開發指令

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

自動修正：

```bash
npm run lint:fix
```

正式建置：

```bash
npm run build
```

預覽正式建置：

```bash
npm run preview
```

---

# 22. PR 前檢查

每次建立 Pull Request 前應執行：

```bash
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

並實際測試：

- 首頁
- 登入
- 註冊
- 登出
- Product List
- Product Detail
- Add Cart
- Admin Product
- Light Mode
- Dark Mode
- Mobile Layout

---

# 23. 開發規範

## 元件命名

共用元件使用 PascalCase：

```text
AppButton.vue
AppCard.vue
ProductCard.vue
```

---

## Service 命名

避免：

```ts
get();
getAll();
getId();
create();
```

建議：

```ts
getProducts();
getAdminProducts();
getProductById();
createProduct();
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
useCreateProductMutation();
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

或建立明確 Interface。

---

## Composable 使用

Composable 應在：

```text
<script setup>
setup()
effect scope
```

內建立。

不建議在事件函式內重複建立：

```ts
useCreateMutation();
```

應先在 setup 頂層：

```ts
const createMutation = useCreateMutation();
```

---

# 24. 資料流

前端資料流建議保持：

```text
Page / Component
       │
       ▼
Query / Mutation
       │
       ▼
Service
       │
       ▼
Axios Client
       │
       ▼
Backend API
```

不要讓頁面直接呼叫：

```ts
axios.get(...)
```

也不要讓 Service 操作：

- Router
- Snackbar
- Dialog
- DOM

Service 應只負責 API Request。

---

# 25. 後續擴充方向

前端後續可加入：

- 會員中心
- 收藏功能
- 拉麵店地圖
- 評論系統
- 搜尋與篩選
- Skeleton Loading
- Error Boundary
- API Mock
- 單元測試
- E2E 測試
- Storybook
- PWA
- i18n
- 第三方登入
- CI/CD
