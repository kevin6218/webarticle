# 電商文案生成器

AI 驅動的電商文案工具，自動生成符合台灣廣告法規的文案。

## 功能

- 📸 上傳產品圖片或輸入描述，AI 自動分析
- ✅ 依產品類別套用對應法規（化妝品衛管法、食安法、公平交易法）
- 📝 一鍵生成 4 種格式：電商商品頁、FB/IG 貼文、蝦皮/momo、SEO 關鍵字
- 🔍 自動嵌入 SEO 搜尋關鍵字
- 📋 所有文案一鍵複製

## 部署到 Vercel（5分鐘完成）

### 步驟 1：上傳程式碼到 GitHub
1. 到 [github.com](https://github.com) 新建一個 repository（可設定為 private）
2. 把整個資料夾的檔案上傳進去

### 步驟 2：部署到 Vercel
1. 到 [vercel.com](https://vercel.com) 用 GitHub 帳號登入
2. 點「New Project」→ 選剛才的 repository
3. Framework 會自動偵測為 Vite，直接按「Deploy」

### 步驟 3：設定 API Key（重要！）
1. 部署完成後，進入 Vercel 專案設定
2. 左邊選「Environment Variables」
3. 新增一筆：
   - Name: `ANTHROPIC_API_KEY`
   - Value: 你的 Claude API Key（到 console.anthropic.com 取得）
4. 按「Save」後，到 Deployments 頁面重新部署一次（Redeploy）

### 完成！
你會得到一個 `https://你的專案名稱.vercel.app` 的網址，分享給同事即可使用。

## 本地開發

```bash
npm install
npm run dev
```

需要在根目錄建立 `.env.local` 檔案：
```
ANTHROPIC_API_KEY=你的API_KEY
```

## 支援的產品類別與法規對應

| 類別 | 適用法規 |
|------|---------|
| 保養品/化妝品 | 化妝品衛生安全管理法 |
| 食品/飲品 | 食品安全衛生管理法第28條 |
| 清潔用品 | 公平交易法 |
| 服飾/配件 | 公平交易法 |
| 家電/寵物/日用百貨/家具 | 廣告不實相關規範 |
| 其他消費品 | 公平交易法第21條 |
