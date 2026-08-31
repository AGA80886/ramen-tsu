# 🍜 拉麵通 Ramen-Tsu v1.0.2 Release Notes

> **版本：v1.0.2**\
> **Release：Ramen Tsu v1.0.2**\
> **Tag：v1.0.2**\
> **Release PR：#148**\
> **相關 PR：#146、#147**

------------------------------------------------------------------------

## 1. 版本概要

v1.0.2 延續
v1.0.1，主要針對**文章內容圖片顯示、圖片比例與圖片裁切**進行改善。

本次主要完成：

-   文章內容中的直接圖片 URL 自動辨識與渲染
-   文章封面圖片維持原始比例
-   拉麵店圖片維持原始比例
-   圖片使用 Lazy Loading
-   整理本次圖片載入 Bug 與 Debug 流程

------------------------------------------------------------------------

## 2. Features

### 2.1 文章內容圖片自動顯示

原本文章內容使用：

``` vue
{{ article.content }}
```

因此圖片 URL 只會以文字顯示。

v1.0.2 新增 `ArticleContentBlock`：

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

文章內容會先依換行拆分，再判斷每一行是否為圖片 URL。

符合圖片 URL 時建立：

``` ts
{
  type: 'image',
  url: trimmed,
}
```

否則建立：

``` ts
{
  type: 'text',
  content: line,
}
```

Template 再依區塊類型渲染文字或 `<img>`。

### 2.2 支援的圖片格式

目前圖片 URL 判斷支援：

-   JPG
-   JPEG
-   PNG
-   GIF
-   WebP
-   SVG

使用的判斷規則：

``` ts
/^https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?$/i
```

### 2.3 圖片 Lazy Loading

文章圖片：

``` vue
<img
  :src="block.url"
  alt="文章圖片"
  loading="lazy"
/>
```

使用 `loading="lazy"`，讓非必要圖片延後載入。

------------------------------------------------------------------------

## 3. 圖片比例修正

### 3.1 文章封面

原本：

``` vue
fit="cover"
```

修改為：

``` vue
fit="contain"
```

避免原始圖片比例不同時被裁切。

### 3.2 拉麵店圖片

原本：

``` scss
object-fit: cover;
```

修改為：

``` scss
object-fit: contain;
```

讓圖片完整呈現在容器中。

### 3.3 文章內容圖片

``` scss
&__image {
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

主要確保：

-   保留原始比例
-   不超過文章容器
-   水平置中
-   避免圖片變形
-   維持一致的圓角與間距

------------------------------------------------------------------------

## 4. Bug Fix

### Bug 1：短網址無法直接顯示圖片

測試短網址：

``` text
https://myppt.cc/OsbRZ
```

前端即使將其視為圖片來源，實際載入仍失敗。

### Debug

使用：

``` bash
curl -I -L "https://myppt.cc/OsbRZ"
```

得到：

``` text
HTTP/1.1 403 Forbidden
Server: cloudflare
```

再使用：

``` bash
curl -L "https://myppt.cc/OsbRZ"
```

確認回傳的是 Cloudflare Block Page，而不是圖片。

因此定位問題不是 Vue Template 或 CSS，而是第三方短網址服務的請求限制。

進一步檢查：

``` bash
curl.exe -L "https://myppt.cc/OsbRZ" | grep -Ei 'og:image|twitter:image|<img|jpg|jpeg|png|webp'
```

沒有取得可直接使用的圖片 URL。

### 解決

改用圖片直連 URL，例如：

``` text
https://i.meee.com.tw/nFx3WCd.jpg
```

再透過 Chrome Console 驗證：

``` js
const img = new Image()

img.onload = () =>
  console.log(
    'IMAGE OK',
    img.naturalWidth,
    img.naturalHeight,
  )

img.onerror = () =>
  console.error('IMAGE FAILED')

img.src =
  'https://i.meee.com.tw/nFx3WCd.jpg'
```

成功得到：

``` text
IMAGE OK 1440 1920
```

因此確認：

-   圖片 URL 有效
-   Server 可以提供圖片
-   Browser 可以載入圖片
-   圖片本身有效
-   前端 `<img>` 渲染功能正常

------------------------------------------------------------------------

## 5. Debug 方法總結

本次採用由外而內的排查方式：

``` text
圖片沒有顯示
      ↓
確認 DOM 是否產生 <img>
      ↓
確認 src
      ↓
curl -I -L
      ↓
HTTP 403
      ↓
確認 Cloudflare / 第三方服務
      ↓
改用圖片直連 URL
      ↓
Chrome Image() 測試
      ↓
IMAGE OK
      ↓
確認前端圖片渲染正常
```

重要 Debug 原則：

> **圖片沒有顯示，不應立即判定是 Vue 或 CSS 問題。**

應依序確認：

1.  DOM 是否存在 `<img>`
2.  `src` 是否正確
3.  URL 是否真的回傳圖片
4.  HTTP Status 是否正常
5.  Browser 是否能載入
6.  最後才檢查 CSS

------------------------------------------------------------------------

## 6. 短網址支援狀態

短網址目前不列入 v1.0.2 的正式支援範圍。

原因包括：

-   Redirect
-   Cookie
-   Cloudflare Challenge
-   防盜鏈
-   Referer 限制
-   不一定直接回傳圖片 Content-Type

目前版本採用：

> **直接圖片 URL 優先**

------------------------------------------------------------------------

## 7. 遠期目標：短網址自動解析

未來可由 Backend 解析短網址：

``` text
文章內容
   ↓
偵測短網址
   ↓
Backend Resolver
   ↓
取得真正 URL
   ↓
確認 Content-Type
   ↓
回傳圖片 URL
   ↓
Frontend 渲染
```

短網址自動解析屬於**後續版本的遠期規劃**，不屬於 v1.0.2。

------------------------------------------------------------------------

## 8. 相關 Pull Requests

### PR #146

**fix: preserve article and shop image aspect ratio**

處理：

-   文章圖片比例
-   拉麵店圖片比例
-   `cover` → `contain`

### PR #147

**feat: render direct image URLs in article content**

處理：

-   文章內容圖片 URL 辨識
-   文字 / 圖片區塊拆分
-   `<img>` 渲染
-   Lazy Loading

### PR #148

**Release v1.0.2**

將 v1.0.2 正式合併至 `main`。

------------------------------------------------------------------------

## 9. Release / Git 流程

本次 Release 過程也處理了 GitHub Branch Protection。

原本直接：

``` bash
git push origin main
```

遭 GitHub 拒絕：

``` text
GH006: Protected branch update failed
```

原因：

``` text
This branch must not contain merge commits.
Changes must be made through a pull request.
```

因此改採：

``` text
release/v1.0.2
        ↓
Push
        ↓
Pull Request #148
        ↓
main
        ↓
Merge
        ↓
GitHub Release
        ↓
Tag v1.0.2
```

目前 GitHub Tags 已確認：

``` text
v1.0.0
v1.0.1
v1.0.2
```

其中 `v1.0.2` 為目前最新 Release。

------------------------------------------------------------------------

## 10. 版本歷史

``` text
v1.0.0
   │
   └── v1.0.1
          │
          └── v1.0.2
```

### v1.0.0

專案第一個主要穩定版本。

### v1.0.1

既有功能穩定化與 Release 整理。

### v1.0.2

主要改善：

-   文章圖片顯示
-   圖片原始比例
-   拉麵店圖片比例
-   圖片 URL 自動辨識
-   Lazy Loading
-   圖片載入問題 Debug

------------------------------------------------------------------------

## 11. 測試 Checklist

### Frontend

-   [x] 文章頁面正常載入
-   [x] 文章文字正常顯示
-   [x] JPG URL 自動渲染
-   [x] JPEG URL 自動渲染
-   [x] PNG URL 自動渲染
-   [x] GIF URL 自動渲染
-   [x] WebP URL 自動渲染
-   [x] SVG URL 自動渲染
-   [x] 圖片維持原始比例
-   [x] 圖片不超出文章容器
-   [x] 圖片 Lazy Loading
-   [x] 拉麵店圖片維持原始比例
-   [x] 文章封面維持原始比例

### External Image Source

-   [x] 確認短網址 HTTP 403
-   [x] 確認 Cloudflare Block Page
-   [x] 改用直連圖片 URL
-   [x] Chrome `Image()` 載入測試成功

------------------------------------------------------------------------

## 12. 已知限制

目前文章圖片自動顯示主要依賴：

> **直接圖片 URL + 副檔名判斷**

因此以下情況目前不保證可以自動顯示：

-   URL 沒有副檔名
-   短網址
-   Authorization 保護
-   Cookie 限制
-   Referer 限制
-   Cloudflare Challenge

------------------------------------------------------------------------

## 13. 後續改善方向

### 中期

-   [ ] 支援沒有副檔名的圖片 URL
-   [ ] Backend 驗證圖片 Content-Type
-   [ ] Backend 解析圖片 URL
-   [ ] 支援短網址自動解析
-   [ ] 圖片載入失敗提供更完整提示

### 長期

-   [ ] 文章編輯器直接插入圖片
-   [ ] 圖片上傳功能
-   [ ] 圖片 CDN 統一管理
-   [ ] 圖片預覽 / Lightbox
-   [ ] 圖片壓縮與最佳化

------------------------------------------------------------------------

## 14. Release Checklist

-   [x] 功能開發完成
-   [x] 圖片顯示測試
-   [x] 圖片比例測試
-   [x] 短網址問題 Debug
-   [x] 直連圖片測試
-   [x] Release Notes 完成
-   [x] Feature branch 合併
-   [x] Release branch 建立
-   [x] Pull Request #148
-   [x] Merge 至 `main`
-   [x] GitHub Release 建立
-   [x] Tag `v1.0.2` 建立
-   [x] GitHub Latest Release 確認

------------------------------------------------------------------------

## 15. Release Summary

v1.0.2 讓拉麵通的文章內容從：

``` text
文章
 ↓
圖片網址
 ↓
純文字
```

改善為：

``` text
文章
 ↓
URL 判斷
 ↓
ArticleContentBlock
 ↓
文字 / 圖片區塊
 ↓
<img>
 ↓
圖片顯示
```

同時修正文章與拉麵店圖片因 `cover` 導致的裁切問題。

本次也完成完整的問題定位流程：

``` text
問題發生
 ↓
HTTP Debug
 ↓
第三方服務分析
 ↓
Browser 驗證
 ↓
程式修正
 ↓
功能驗證
 ↓
PR
 ↓
Release
```

> **v1.0.2
> 的核心目標，是讓拉麵通文章內容支援「文字＋圖片」的混合呈現，同時改善圖片比例與裁切問題。**

短網址自動解析則保留為後續版本的遠期目標。

------------------------------------------------------------------------

**Ramen Tsu（拉麵通）**\
**Release v1.0.2**
