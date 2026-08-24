# 拉麵通 Demo Guide

## Production

Frontend:

```text
https://aga80886.github.io/ramen-tsu/
```

Backend:

```text
https://ramen-tsu.onrender.com
```

## Demo Accounts

### Member

```text
Account: <DEMO_MEMBER_ACCOUNT>
```

### Admin

```text
Account: <DEMO_ADMIN_ACCOUNT>
```

> Demo 密碼不保存在公開 Repository。請於現場或私人文件提供。

## Demo 前準備

- [ ] 先開 Render API 喚醒 Free instance
- [ ] GitHub Pages 可正常開啟
- [ ] MongoDB Atlas 正常
- [ ] Cloudinary 圖片正常
- [ ] Member Demo 帳號可登入
- [ ] Admin Demo 帳號可登入
- [ ] Browser Console 無重大錯誤

## 建議 30 分鐘展示流程

### 1. 首頁 / 訪客
- 首頁 Hero
- 拉麵論壇
- 拉麵店家
- 拉麵地圖
- 拉麵商城

### 2. 會員
- Login
- Profile
- F5 Session Restore
- Article / Comment / Like / Favorite
- Shop Submit / Like / Favorite

### 3. Commerce
- Product
- Cart
- Quantity
- Order
- Order History

> 目前 MVP 訂單建立後為 `pending / unpaid`，正式付款流程屬 Future Enhancement。

### 4. Admin
- Dashboard
- Member Management
- Product Management
- Order Management
- Article Moderation
- Shop Moderation

### 5. Demo Highlight

推薦：

```text
會員建立文章
→ pending
→ Admin approve
→ 回公開論壇確認文章顯示
```

店家亦可使用相同流程。

## Demo 前最後檢查

- [ ] Render 已喚醒
- [ ] API 全部指向 Render
- [ ] Login / Refresh / Logout
- [ ] No CORS error
- [ ] No unexpected 500
- [ ] No broken images
- [ ] Cart +/- UI 正常
- [ ] Demo 帳號準備完成
