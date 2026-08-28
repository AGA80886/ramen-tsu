# 🍜 拉麵通 Ramen-Tsu v1.0.1.1 Release Notes

> **版本：v1.0.1.1**\
> **原規劃版本：v1.0.2**\
> **Release 類型：Feature / UI Enhancement / Bug Fix**\
> **專案：Ramen-Tsu（拉麵通）**\
> **日期：2026-08-28**

------------------------------------------------------------------------

## 📌 Release Summary

本次 `v1.0.1.1` 主要針對**文章內容圖片顯示**與**圖片裁切方式**進行改善。

原本文章內文中的圖片網址會直接以文字顯示，例如：

``` text
https://i.meee.com.tw/nFx3WCd.jpg
```

本版本新增圖片網址自動辨識功能，當文章內容出現符合條件的圖片直連網址時，前端會自動將其轉換為圖片元件並顯示。

同時調整文章與店家頁面的圖片
`object-fit`，避免圖片因固定容器比例而被裁切。

------------------------------------------------------------------------

# ✨ Features

## 1. 文章內文圖片直連網址自動渲染

### 功能說明

文章內容現在會逐行解析：

-   一般文字 → 以文字區塊顯示
-   圖片直連網址 → 自動轉換為圖片區塊

目前支援的圖片網址格式：

``` text
https://i.meee.com.tw/xxxx.jpg
```

例如：

``` text
今天來到二郎系拉麵店……

https://i.meee.com.tw/nFx3WCd.jpg

店家主打二郎系豚骨風格……

https://i.meee.com.tw/XZKtOaV.jpg
```

前端會自動呈現為：

``` text
文字
↓
圖片
↓
文字
↓
圖片
```

不需要文章作者額外輸入 HTML。

------------------------------------------------------------------------

## 2. Article Content Block Parser

新增 `ArticleContentBlock` 型別：

``` ts
type ArticleContentBlock =
  | {
      type: 'text'
      content: string
    }
  | {
      type: 'image'
      url: string
    }
```

並透過 `articleContentBlocks` computed 將文章內容轉換成可渲染的區塊。

處理流程：

``` text
article.content
      ↓
content.split('\n')
      ↓
逐行判斷
      ↓
是否為圖片直連 URL？
   ↙           ↘
 是             否
 ↓              ↓
image block    text block
 ↓              ↓
<img>          <p>
```

------------------------------------------------------------------------

## 3. 圖片 RWD 與版面改善

文章內文圖片採用：

``` scss
.article__image {
  display: flex;
  justify-content: center;
  margin: 24px 0;

  img {
    display: block;
    width: auto;
    max-width: 100%;
    height: auto;
    border-radius: 12px;
  }
}
```

設計目的：

-   `max-width: 100%` 避免圖片超出文章容器
-   `height: auto` 保持原始圖片比例
-   圖片置中
-   手機版可自動縮小
-   圖片具有圓角
-   使用 `loading="lazy"` 降低初始載入負擔

------------------------------------------------------------------------

# 🖼️ UI / Image Rendering Changes

## 4. Article Cover Image

文章封面圖片由：

``` css
object-fit: cover;
```

調整為：

``` css
object-fit: contain;
```

### 原本問題

`cover` 會強制圖片填滿固定比例的容器。

當原始圖片比例與容器比例不同時，圖片可能被裁切。

### 修改後

使用：

``` css
object-fit: contain;
```

可以保留完整圖片內容，避免重要畫面被裁掉。

------------------------------------------------------------------------

## 5. Shop Gallery Image

店家圖片也同步調整：

``` css
.shop-gallery__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

讓店家圖片與文章圖片的呈現邏輯更加一致。

------------------------------------------------------------------------

# 🧪 Testing

## 1. Frontend Build

已執行：

``` bash
npm run build
```

Build 流程包含：

``` text
vue-tsc --build --force
        ↓
vite build
```

本次修改未造成 TypeScript / Vite Build 阻斷。

> Build 過程仍會出現既有的 Sass `@import` deprecation
> warnings，以及既有的 `DarkModeToggle` component naming conflict
> warning；這些不是本次功能新增的錯誤。

------------------------------------------------------------------------

## 2. Browser Test

已在瀏覽器實際確認文章頁面：

-   [x] 一般文章文字正常顯示
-   [x] 直連圖片 URL 可以自動轉換成圖片
-   [x] 圖片可以正常載入
-   [x] `i.meee.com.tw` 圖片實測成功
-   [x] 圖片維持原始比例
-   [x] 圖片不會超出文章內容區域
-   [x] 多張圖片可以依照文章內容順序顯示

------------------------------------------------------------------------

## 3. Direct Image URL Verification

實際測試圖片：

``` text
https://i.meee.com.tw/nFx3WCd.jpg
```

瀏覽器測試結果：

``` text
IMAGE OK
1440 × 1920
```

確認圖片來源本身可以正常載入。

------------------------------------------------------------------------

# ⚠️ Known Limitations

## 短網址圖片目前不支援

本次原先規劃過：

``` text
https://myppt.cc/OsbRZ
```

這類短網址自動解析。

但實際測試：

``` bash
curl -I -L "https://myppt.cc/OsbRZ"
```

回應：

``` text
HTTP/1.1 403 Forbidden
Server: cloudflare
```

而直接取得內容時取得的是 Cloudflare Block Page，而不是圖片資源。

因此本版本**不將短網址圖片解析納入正式功能**。

這不是前端 `<img>` 本身的問題，而是短網址服務端存在：

-   Redirect
-   Cloudflare
-   防盜鏈
-   Bot protection
-   非圖片 Content-Type

等限制。

------------------------------------------------------------------------

# 📋 Future Roadmap

## Short URL Image Resolver

列入遠期功能：

``` text
文章短網址
    ↓
後端 / Resolver
    ↓
取得最終 URL
    ↓
確認 Content-Type
    ↓
確認為圖片
    ↓
回傳可用圖片 URL
    ↓
前端顯示
```

未來可以評估：

-   後端解析短網址
-   Redirect URL 取得
-   HTTP `Content-Type` 判斷
-   Open Graph / metadata 解析
-   圖片 proxy
-   Cloudflare / 防盜鏈處理
-   第三方圖片服務相容性

### 目前策略

> **先支援穩定的圖片直連 URL，短網址解析列為遠期目標。**

避免為了單一第三方短網址服務增加不穩定的前端邏輯。

------------------------------------------------------------------------

# 📁 Modified Files

本次主要修改：

``` text
front/src/pages/articles/[slug].vue
front/src/pages/shops/[slug].vue
```

以及 Release Documentation：

``` text
docs/Ramen-Tsu-v1.0.1.1-Release-Notes.md
```

------------------------------------------------------------------------

# 🔀 Git Workflow

本次 Feature Branch：

``` text
feature/article-image-render
```

目標 Branch：

``` text
develop
```

建議 Commit：

``` bash
git commit -m "feat(article): render direct image URLs in content"
```

Push：

``` bash
git push -u origin feature/article-image-render
```

Pull Request：

``` text
base: develop
compare: feature/article-image-render
```

------------------------------------------------------------------------

# 🎯 Versioning Note

本次版本原先規劃為：

``` text
v1.0.2
```

後續為了配合目前專案版本演進與既有 Release 編號，調整正式版本名稱為：

``` text
v1.0.1.1
```

因此：

``` text
原 v1.0.2
      ↓
正式 v1.0.1.1
```

後續版本以 `v1.0.1.1` 作為本次 Release 的正式識別。

------------------------------------------------------------------------

# ✅ Release Checklist

-   [x] Article 文章圖片 URL 自動辨識
-   [x] Article 文章圖片自動渲染
-   [x] Direct Image URL 實測成功
-   [x] Article Image RWD
-   [x] Article Cover Image 調整為 `contain`
-   [x] Shop Gallery Image 調整為 `contain`
-   [x] Browser 測試
-   [x] Frontend Build
-   [x] TypeScript Check
-   [x] 短網址問題確認
-   [x] 短網址解析列入遠期目標
-   [ ] Commit
-   [ ] Push
-   [ ] Pull Request
-   [ ] Merge to `develop`
-   [ ] 建立正式 Git Tag / GitHub Release

------------------------------------------------------------------------

# 🚀 Next Step

完成 PR Merge 後，建議：

``` bash
git checkout develop
git pull origin develop
```

確認 `develop` 已包含本次功能後，再進入下一個 Feature。

------------------------------------------------------------------------

**Ramen-Tsu / 拉麵通**\
`v1.0.1.1`
