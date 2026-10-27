# 出流管制第四章計算工作台｜GitHub Pages 版

這是目前網站的獨立版本：保留 4.1～4.9 計算、圖表選色、Excel／Word／CSV／PNG／SVG 下載，改用 **Google 帳號登入 + Firebase Cloud Firestore 雲端案件**。

**不用 npm install、不用編譯。** 本資料夾的 index.html 就是網站入口。尚未填 Firebase 設定時，可先使用本機案件功能；Google 登入與跨裝置儲存需完成以下設定。原 ChatGPT 網站不會被修改或停用。

## 本次更新（2026/10/27）

- 已整合目前 GPT 網站的最新修改：4.2／4.3 欄位對齊、全站數學公式排版與字體縮小、4.4.2／4.4.3 公式收合及備註集中、4.9 移除公式說明。
- Google 登入與 Firebase 雲端案件設定方式不變；請先完成下方設定再測試跨裝置儲存。

## 先準備

- 一個 GitHub 帳號、一個 Google 帳號。
- 將 ZIP 解壓縮。上傳的是資料夾「裡面的檔案與子資料夾」，不要只上傳 ZIP，也不要把整個外層資料夾多包一層。
- 舊案件先回原網站，逐案按「儲存案件 JSON」下載。新版無法直接讀取原網站的雲端資料，即使用同一個 Gmail 也一樣。

## 第一部分：先把網頁放到 GitHub

1. 登入 https://github.com ，右上角 `＋` → `New repository`。
2. Repository name 可填 `runoff-chapter-four`，選 `Public`，勾選建立 README，再按 `Create repository`。Public 代表網站程式碼公開，不代表 Firebase 案件公開。
3. 進入剛建立的 repository，按 `Add file` → `Upload files`。
4. 將解壓縮後的**所有內容**拖到上傳區，包括 `sources`、`tests` 子資料夾。保留原本檔名與資料夾層級。按 `Commit changes`。
5. 確認 repository 第一層就看得到 `index.html`、`firebase-config.js`、`cloud.js` 等檔案。
6. `Settings` → 左側 `Pages` → `Build and deployment`。
7. `Source` 選 `Deploy from a branch`；Branch 選 `main`，資料夾選 `/(root)`，按 `Save`。
8. 等待部署完成，重新進入 Pages 頁面，按它顯示的網站連結。通常是：
   `https://你的GitHub帳號.github.io/runoff-chapter-four/`
9. 這時尚未設定 Firebase，看到「尚未設定 Google 登入」是正常的，接著做下一部分。

如果 Windows 隱藏 `.nojekyll`，可在檔案總管開啟隱藏項目後一併上傳；或在 GitHub 用 `Add file` → `Create new file` 新建 `.nojekyll`。此專案不用 GitHub Actions，也不用設定建置指令。

## 第二部分：建立 Firebase 專案

1. 用準備作為管理者的 Google 帳號進入 https://console.firebase.google.com/ 。
2. 按新增／建立專案，輸入名稱，例如 `出流管制計算工具`。不需要啟用 Google Analytics。
3. 進入專案總覽，新增網頁應用程式，按 `</>` 圖示，取名稱，例如 `runoff-web`。**不用勾選 Firebase Hosting**，網站已由 GitHub Pages 提供。
4. 登記後會顯示 `firebaseConfig`。之後也可在齒輪 → `Project settings` → `General` → `Your apps` 找回。
5. 取其中的 `apiKey`、`authDomain`、`projectId`、`appId` 四個值，照下一節填入。

### 修改 firebase-config.js

在 GitHub 點開 `firebase-config.js` → 鉛筆 `Edit`，將四個範例值替換成你的專案設定，再按 `Commit changes`。

```javascript
window.RUNOFF_FIREBASE_CONFIG = {
  apiKey: "你的 apiKey",
  authDomain: "你的專案.firebaseapp.com",
  projectId: "你的 projectId",
  appId: "你的 appId"
};
```

注意：保留 `window.RUNOFF_FIREBASE_CONFIG =`，不要整段貼成 `const firebaseConfig =`，也不用加入 `initializeApp`。這些是網頁端公開設定，**不要上傳 Google OAuth client secret、服務帳戶 JSON 或私鑰**。資料權限由登入狀態和 Firestore Rules 控制。

## 第三部分：開啟 Google 登入

1. Firebase 左側 `Build` → `Authentication` → `Get started`。
2. `Sign-in method`／`Sign-in providers` → `Google` → `Enable`。
3. 填寫支援電子郵件，按 `Save`。
4. 到 `Authentication` → `Settings` → `Authorized domains` → `Add domain`。
5. 加入 **`你的GitHub帳號.github.io`**。不要填 `https://`，也不要填 `/runoff-chapter-four/`。
6. 如果未來改自訂網域，也要在這裡加入那個網域。

本版本使用 Google 彈出式登入。請由 Safari／Chrome／Edge 的一般瀏覽器開啟正式網站；部分 App 內建瀏覽器可能不允許 Google 登入，請選「在瀏覽器開啟」。若登入視窗被擋，允許彈出視窗後再按登入。網站會在登入成功後重新載入。

## 第四部分：建立雲端案件資料庫（必要）

1. Firebase 左側 `Build` → `Firestore Database` → `Create database`。
2. 若要求版本，選 **Standard edition**；資料庫 ID 選預設 `(default)`。
3. 選地區，例如 `asia-east1`（若可選）。建立後地區通常不能直接更改，請先確認。
4. 選 `Production mode` 建立。不要用允許所有人讀寫的測試規則。
5. 建立後進入 `Rules` 分頁。
6. 打開本檔案包的 **`firestore.rules`**，複製全部內容，完整取代 Rules 編輯區的文字。
7. 按 `Publish`。不需要先手動新增集合或文件，第一次儲存案件時會自動建立。

案件儲存在 `users/Google登入UID/projects/案件ID`，每位登入使用者只能讀寫自己的案件。規則也會驗證版本遞增，避免另一台裝置覆寫較新的資料。刪除使用版本化刪除記錄，避免離線舊裝置復活已刪案件。

Firebase 用量、方案與可用配額依控制台為準。本程式不需要付費 Cloud Functions；請在控制台查看 Authentication／Firestore 的用量。案件單筆 JSON 上限為 850 KB，超過時會提示先備份，不會假裝已儲存。

## 第五部分：第一次測試

1. 等 GitHub 新部署完成，重新整理正式網站。
2. 按「使用 Google 帳號登入」，選自己的帳號。
3. 新建一個測試案件，在 4.1 新增集水區、輸入面積，確認狀態變成「已儲存至雲端」。
4. 在手機的一般瀏覽器開啟同一個網址，以相同 Google 帳號登入，確認看到案件與數據。
5. 手機修改後，等狀態顯示已儲存，再回電腦按「重新整理雲端」，確認更新。
6. 測試下載 JSON 備份及刪除測試案件。另一個 Google 帳號不應看到你的案件。

**驗證範圍：** 這份交付已完成 JavaScript 語法檢查、計算頁面回歸與 Firebase 介接的模擬檢查（包含帳號隔離、版本衝突、刪除保護）。因尚無你的 Firebase 專案設定，真實 Google 授權與正式 Firestore Rules 仍需依本節在部署後驗證。

## 第六部分：搬移現在的案件

1. 回原 ChatGPT 網站，逐案按「儲存案件 JSON」。
2. 開啟新版 GitHub 網站並用 Google 登入。
3. 按「載入案件」，選剛才下載的 JSON。每個檔案會載入為一筆案件。
4. 若顯示「本機案件尚未上傳」，按「上傳本機案件到我的雲端」；否則確認自動同步完成。
5. 等顯示已儲存至雲端後，於另一台裝置查看確認。
6. 資料確認完整前，保留原網站與 JSON 備份。

重新整理雲端＝讀取伺服器的新資料；儲存至雲端＝立即上傳本機修改。平時修改會自動儲存。若不同裝置同時改同一案件，會顯示版本衝突，讓你另存本機複本或改用雲端版本。

## 常見問題

| 畫面／問題 | 處理方式 |
| --- | --- |
| 網站 404 | 檢查 Pages 是否為 main + /(root)，且第一層有 index.html；等待部署完成。 |
| 網站有更新但畫面沒變 | 等 GitHub 部署完成，Windows 按 Ctrl+F5，手機重開分頁；先確認未同步修改有備份。 |
| 尚未設定 Google 登入 | 檢查 firebase-config.js 是否已替換四個範例值、且 JavaScript 引號與逗號正確。 |
| auth/unauthorized-domain | 在 Firebase Authentication 的 Authorized domains 加入你的帳號.github.io。 |
| auth/operation-not-allowed | 尚未在 Authentication 啟用 Google。 |
| 登入視窗一閃即關或被阻擋 | 改用正式網址及一般瀏覽器，允許彈出視窗，檢查授權網域。 |
| 無法讀寫雲端／permission-denied | 確認 Firestore 已建立 (default) 資料庫，並將 firestore.rules 全部貼入及 Publish。 |
| 手機沒有電腦的案件 | 確認登入相同 Google 帳號、電腦已顯示已儲存至雲端，手機再按重新整理雲端。 |
| 舊版案件沒出現 | 需用 JSON 匯出／匯入，兩套後端不共用資料。 |
| 本機離線 | 保留本機修改，連線後再同步；重要案件仍請下載 JSON。 |

## 檔案說明與後續更新

- `index.html`、`style.css`、其他計算 JS：網站介面與計算。
- `firebase-config.js`：你需要填寫的 Firebase 公開設定。
- `firebase-cloud.js`：Google 登入與 Firestore 存取。
- `cloud.js`：案件自動儲存、衝突處理與案件管理。
- `firestore.rules`：**務必部署到 Firebase Console 的安全規則**。只上傳 GitHub 不會自動發布規則。
- `sources/`：雨量係數與換算的來源文件。
- `tests/firebase-adapter.test.cjs`：模擬介接測試，有 Node.js 可執行 `npm test`。

未來修改網站：在 GitHub 編輯或上傳替換檔案 → Commit changes → 等 Pages 部署。計算功能不需要額外編譯。

本機預覽：用 VS Code Live Server，或在資料夾執行 `python -m http.server 8080`，再開 `http://localhost:8080`。Google 登入測試需在 Authorized domains 另外加入 `localhost`。不要直接雙擊 HTML 當成正式登入測試。

### 官方參考

- GitHub Pages：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Firebase 網頁設定：https://firebase.google.com/docs/web/setup
- Google 登入：https://firebase.google.com/docs/auth/web/google-signin
- Firestore 權限：https://firebase.google.com/docs/rules/basics
