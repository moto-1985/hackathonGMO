/**
 * ISO 8601形式の日付文字列（UTC）をスクリプト実行タイムゾーンの日付としてフォーマットする関数
 * @param {string} dateStr - フォーマットする日付の文字列（UTC）
 * @return {string} フォーマットされた日付の文字列（スクリプトタイムゾーン）
 */
const formatDate = (dateStr) => {
  // 日付文字列をUTCとして解釈し、Dateオブジェクトを作成
  const date = new Date(dateStr + 'Z');
  // スクリプトのタイムゾーンでフォーマット
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm:ss");
}


/**
 * 特定の番号が存在する行番号を返します。
 * @param {Array} values - 検索する列の値の配列
 * @param {string} numberValue - 検索する番号
 * @return {number|null} 見つかった行の番号（1から始まる）。見つからない場合はnull。
 */
const findRowByNumber = (values, numberValue) => {
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] == numberValue) {
      return i + 1; // スプレッドシートの行は1から始まるので+1
    }
  }
  return null;
}

/**
 * シートと行番号からその行のURLを生成します。
 * @param {Sheet} sheet - URLを生成する行が含まれるシート
 * @param {number} row - URLを生成する行番号
 * @return {string} 生成された行のURL
 */
const generateRowUrl = (sheet, row) => {
  const sheetUrl = sheet.getParent().getUrl();
  return `${sheetUrl}#gid=${sheet.getSheetId()}&range=${row}:${row}`;
}

/**
 * 削除すべきFAQの行を検索します。
 * @param {Array} values - FAQシートの全データ
 * @param {string} referenceNumber - 検索する参照番号
 * @param {string} category - カテゴリ
 * @return {number|null} 削除すべき行の番号（1から始まる）。見つからない場合はnull。
 */
const findRowToDelete = (values, referenceNumber, category) => {
  for (let i = 1; i < values.length; i++) { // ヘッダー行をスキップ
    if (values[i][0] == referenceNumber && values[i][5] == category) {
      return i + 1; // スプレッドシートの行は1から始まるので+1
    }
  }
  return null;
}

/**
 * Q&Aシートから特定の参照番号のフラグをクリアします。
 * @param {object} requestData - リクエストデータ
 */
const clearFlagInQASheet = (requestData) => {
  const qaSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID_QA);
  const qaSheet = qaSpreadsheet.getSheetByName(requestData.category);
  if (!qaSheet) {
    throw new Error('Category sheet not found in Q&A spreadsheet');
  }

  const qaValues = qaSheet.getDataRange().getValues();
  for (let i = 0; i < qaValues.length; i++) {
    if (qaValues[i][0] == requestData.referenceNumber) {
      qaSheet.getRange(i + 1, 7).clearContent(); // フラグクリア
      break;
    }
  }
}
