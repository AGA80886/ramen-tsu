# Vuetify → Element Plus 移植說明

## 已完成

- 移除所有 Vuetify 元件、型別與樣式引用。
- 修正 `vite.config.mts` 中殘留的 `transformAssetUrls`。
- 使用 Element Plus 重寫預設版型、管理版型、登入、註冊、首頁、商品詳情與商品管理頁。
- 使用 `ElMessage` 取代 `v-snackbar-queue`。
- 使用 `@element-plus/icons-vue` 取代 MDI 圖示。
- 使用 Element Plus 的 Table、Dialog、Form、Image、Pagination、Menu、Container 與 Grid API。

## 安裝與啟動

```bash
npm install
npm run dev
```

建置檢查：

```bash
npm run type-check
npm run build-only
```

> 專案壓縮檔不包含 `node_modules`。請在自己的作業系統重新執行 `npm install`，避免原生套件跨平台不相容。
