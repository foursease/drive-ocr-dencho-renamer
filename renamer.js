const TARGET_FOLDER_ID = "TARGET_FOLDER_ID"; // 書類をアップロードしているフォルダIDをここに入力

//ChatGPTに必要な情報の設定
const API_KEY = "API_KEY"
const MODEL = "gpt-4o-mini"; 
const TEMPERATURE = 0;
const AI_URL = "https://api.openai.com/v1/chat/completions";

function extractTextFromPdfsInFolder() {
  const folder = DriveApp.getFolderById(TARGET_FOLDER_ID);
  
  // PDF、JPG、PNG、GIFファイルを取得する
  processFilesOfType(folder, MimeType.PDF);
  processFilesOfType(folder, MimeType.JPEG);
  processFilesOfType(folder, MimeType.PNG);
  processFilesOfType(folder, MimeType.GIF);
}

function processFilesOfType(folder, mimeType) {
  const files = folder.getFilesByType(mimeType);
  const fileTypeName = getFileTypeName(mimeType);
  
  Logger.log(`処理開始: ${fileTypeName}ファイル`);
  
  while (files.hasNext()) {
    const file = files.next();
    const fileName = file.getName();
    
    // "[変換前]_"が名前に含まれているファイルは処理をスキップ
    if (fileName.indexOf("[変換前]_") !== -1) {
      Logger.log(`⏭️ スキップ: ${fileName} (すでに処理済み)`);
      continue;
    }
    
    const blob = file.getBlob();

    try {
      const resource = {
        title: fileName,
        mimeType: MimeType.GOOGLE_DOCS,
      };

      // ファイル → Googleドキュメントに変換
      const convertedFile = Drive.Files.insert(resource, blob, {
        convert: true
      });

      const doc = DocumentApp.openById(convertedFile.id);
      const text = doc.getBody().getText();

      // ChatGPTにOCR結果を投げる
      const prompt = `
以下のOCRテキストから、以下の項目を抽出して、指定の形式でファイル名を1つ出力してください。

【抽出する項目】
- 書類の種類（見積書、請求書、納品書、領収書のいずれか）
- 発行日（yyyyMMDD形式の日付）
- 金額（例：1万円→10000）
- 作成した企業名（宛先ではなく、この書類を発行した企業。株式会社などの会社形態は除く）

【注意事項】
- 「御中」などの表現がある企業名は宛先（受取側）の可能性が高いので、作成者として選ばないでください。
- 「発行者」「発行元」「提出者」「振込先」などのキーワードの近くにある企業名を優先して抽出してください。
- 作成者が複数書かれている場合は、最後に記載されたものを優先してください。

【出力形式】
{作成した企業名}_{書類種別}_{日付}_{金額}

【OCRしたテキスト】
${text}
`;

      const response = gpt(prompt);

      // ファイル名に使用できるよう整形
      const sanitizedName = response.replace(/[\\/:*?"<>|]/g, '').trim(); // 禁止文字削除
      const newFileName = `${sanitizedName}.${getFileExtension(mimeType)}`;
      
      // ファイルを複製して新しいファイル名を設定
      const newFile = file.makeCopy(newFileName, folder);
      
      // 元のファイルの名前を変更する（同じフォルダ内に残す）
      const prefixName = `[変換前]_${fileName}`;
      file.setName(prefixName);
      
      Logger.log(`✅ ${fileName} → 新規: ${newFileName}, 元ファイル: ${prefixName}`); 
      
      // ゴミ箱へ
      DriveApp.getFileById(convertedFile.id).setTrashed(true);

    } catch (e) {
      Logger.log(`❌ エラー（${file.getName()}）: ${e}`);
    }
  }
}

// MIMEタイプからファイルタイプ名を取得する補助関数
function getFileTypeName(mimeType) {
  switch(mimeType) {
    case MimeType.PDF: return "PDF";
    case MimeType.JPEG: return "JPEG";
    case MimeType.PNG: return "PNG";
    case MimeType.GIF: return "GIF";
    default: return "未知";
  }
}

// MIMEタイプからファイル拡張子を取得する補助関数
function getFileExtension(mimeType) {
  switch(mimeType) {
    case MimeType.PDF: return "pdf";
    case MimeType.JPEG: return "jpg";
    case MimeType.PNG: return "png";
    case MimeType.GIF: return "gif";
    default: return "txt";
  }
}

function gpt(prompt = null, maxTokens=2048) { 
  if(!!prompt){
    const   requestBody   = {  
      model: MODEL,   
      messages: [{ role: 'user', content: prompt }],   
      "temperature": TEMPERATURE,   
      "max_tokens": maxTokens   
    };       

    const   requestOptions   = {   
      "method":   "POST",   
      "headers":   {   
        "Content-Type": "application/json",   
        "Authorization": "Bearer " + API_KEY   
      },   
      "payload": JSON.stringify(requestBody)   
    };       

    let   response   = JSON.parse(UrlFetchApp.fetch(AI_URL,requestOptions).getContentText());

    return response.choices[0].message.content.trim();

  }else{   
    return "no result";   
  }   
}
