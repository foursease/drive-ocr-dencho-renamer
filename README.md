# 📄 Drive OCR Renamer

Google Driveの特定のフォルダ内にアップロードした **PDF・JPEG・PNG・GIF** 形式の画像ファイルを OCR 解析し、電子帳簿保存法に準拠したファイル名に自動でリネームする **Google Apps Script (GAS)** プロジェクトです。

このスクリプトは、GoogleのOCR機能とOpenAI（gpt-4o-mini）を連携させ、ファイル名に「書類種別・発行日・金額・発行者名」を自動的に含めます。


<br><br>

## 📌 特徴

- Google Driveの特定のフォルダ内の画像ファイルを自動処理
- Googleドキュメント経由でOCRテキストを取得
- OpenAI GPT-4を利用した書類情報の高精度抽出
- 電子帳簿保存法に準拠したファイル名への自動リネーム
- 元ファイルは元の名前のまま `[変換前]_` を付けて保持（上書き防止）

<br><br>

## 🚀 導入手順

### ① Google Apps Scriptプロジェクト作成
- 新規フォルダーを作成する（すでにあるフォルダー内で実行する場合は、そこのフォルダを開く）
- 作成からGoogle Apps Scriptを選択し、新規プロジェクトを作成します。
- 「サービス」から`Drive API`を追加します。
```
1, スクリプトエディタ左の🔌「サービス」をクリック
2, 「サービスを追加」→ Drive API を検索
3, 「Drive v2」を選んで追加
```


### ② ソースコードの貼り付け

- 本リポジトリの`Code.gs`内のコードを全てコピーし、GASエディタに貼り付けます。

### ③ 各種設定

以下の変数を自身の環境に合わせて設定してください。

```javascript
const TARGET_FOLDER_ID = "your-folder-id-here"; // Google DriveのフォルダID
const API_KEY = "your-openai-api-key";          // OpenAIのAPIキー
```

<br><br>

## 🎯 実行方法

1. GASエディタ上で関数`extractTextFromPdfsInFolder()`を選択し、実行します。
2. 対象フォルダ内のファイルが順次処理され、名前が自動変更されます。
3. 元ファイルは名前に`[変換前]_`が付き、同じフォルダ内に保持されます。

<br><br>

## 📑 ファイル名のルール

電子帳簿保存法に対応するため、以下の命名規則を用います。

```
{発行者名}_{書類種別}_{発行日(yyyyMMdd)}_{金額(数字のみ)}
```

<br><br>

## ⚠️ 利用上の注意

- **Google Drive API v2の有効化が必須**  

- OpenAI APIの利用には**APIキー（有料プラン）**が必要です。

- 書類のレイアウトによっては抽出精度が低下する場合があります。

- GPT-4 APIのトークン数制限に注意してください（デフォルト：`max_tokens = 2048`）。


<br><br>

## 📜 ライセンス

[MIT License](LICENSE)
