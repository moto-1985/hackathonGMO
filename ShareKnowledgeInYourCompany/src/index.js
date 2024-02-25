/**
 * doGet関数: GETリクエストを処理して、指定されたシートのA列とB列のデータをJSON形式で返す。
 * @param {Object} e - イベントパラメータ。
 * @return {GoogleAppsScript.Content.TextOutput} JSON形式のレスポンス。
 */
function doGet(e) {
  const { type } = e.parameter;
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  switch (type) {
    case "querySheet":
      return querySheet(spreadsheet, e.parameter);

    case "listMaster":
      return handleListMaster(spreadsheet);

    case "getFilteredSheetsData":
      return getFilteredSheetsData(spreadsheet);

    default:
      return handleDefaultCase();
  }
}

/**
 * doPost関数: POSTリクエストを処理して、新しいシートを作成し、テンプレートからデータをコピーする。
 * @param {Object} e - イベントパラメータ、postDataプロパティにJSON形式のリクエストボディが含まれる。
 * @return {GoogleAppsScript.Content.TextOutput} 処理結果を示すレスポンス。
 */
function doPost(e) {
  try {
    // リクエストボディからデータを解析
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;

    switch (action) {
      case "createSheet":
        // シート名が提供されているか確認
        if (!requestData.sheetName) {
          // シート名がない場合はエラーレスポンスを返す
          return createTextResponse(getMessage("SHEET_NAME_REQUIRED"), STATUS_CODE.BAD_REQUEST);
        }
        // シートを作成し、テンプレートからデータをコピー
        insertValuesIntoSheetAndCopyTemplate(requestData.sheetName);
        // 成功レスポンスを返す
        return createTextResponse(getMessage("SHEET_CREATED_SUCCESSFULLY", { sheetName: requestData.sheetName }), STATUS_CODE.OK);

      case "addQuestionPoint":
        // 質問ポイントを追加する処理
        return handleAddQuestionPoint(requestData);

      case "addRowInQA":
        // 新しいQA行を追加する処理
        return addRowInQA(requestData);

      default:
        // 未知のアクションタイプに対するエラーレスポンスを返す
        return createTextResponse(getMessage("ACTION_NO_EXIST"), STATUS_CODE.BAD_REQUEST);
    }
  } catch (error) {
    // その他のエラーの場合は、サーバーエラーレスポンスを返す
    return createTextResponse(getMessage("ERROR_OCCURRED", { errorMessage: error.message }), STATUS_CODE.INTERNAL_SERVER_ERROR);
  }
}

/**
 * 指定されたシートのクエリを処理し、フィルタリングされたデータをJSON形式で返す。
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - アクティブなスプレッドシート
 * @param {Object} params - イベントパラメータからのクエリとシート名
 * @return {GoogleAppsScript.Content.TextOutput} フィルタリングされたデータを含むJSON形式のレスポンス
 */
const querySheet = (spreadsheet, { sheetName, query }) => {
  if (!sheetName || !query) {
    // シート名またはクエリが未指定の場合
    return createErrorResponse(MESSAGES.SHEET_NAME_REQUIRED, STATUS_CODE.BAD_REQUEST);
  }

  const targetSheet = spreadsheet.getSheetByName(sheetName);
  if (!targetSheet) {
    // 指定されたシートが存在しない場合
    return createErrorResponse(MESSAGES.SHEET_NOT_EXISTED, STATUS_CODE.NOT_FOUND);
  }

  const lastRow = targetSheet.getLastRow();
  const dataRange = targetSheet.getRange(`${COLUMN.A2G}${lastRow}`);
  const data = dataRange.getValues();

  const filteredData = data.filter(row => row.some(cell => cell.toString().trim() !== ""));

  const jsonResponseData = filteredData.map(row => ({
    [FIELD_NAMES.NUMBER]: row[0],
    [FIELD_NAMES.ASKER_NAME]: row[1],
    [FIELD_NAMES.QUESTION]: row[2],
    [FIELD_NAMES.ANSWER]: row[3],
    [FIELD_NAMES.FAQ_POINTS]: row[4],
    [FIELD_NAMES.CREATED_DATE]: row[5],
    [FIELD_NAMES.FAQ_PUBLISHED]: row[6]
  }));

  return createJsonResponse({ data: jsonResponseData });
};

/**
 * JSON形式のレスポンスを作成する。
 * @param {Object} data - レスポンスとして返すデータ
 * @return {GoogleAppsScript.Content.TextOutput} JSON形式のレスポンス
 */
const createJsonResponse = (data) => {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
};

/**
 * エラーレスポンスを生成する。
 */
const createErrorResponse = (errorMessage, statusCode) => {
  return ContentService.createTextOutput(JSON.stringify({ error: errorMessage }))
    .setMimeType(ContentService.MimeType.JSON)
    .setStatusCode(statusCode);
};

/**
 * handleListMaster関数: マスターシートからA列とB列のデータを取得し、JSON形式で返します。
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - アクティブなスプレッドシートオブジェクト。
 * @return {GoogleAppsScript.Content.TextOutput} - A列とB列のデータを含むJSON形式のレスポンス。
 */
const handleListMaster = (spreadsheet) => {
  const masterSheet = spreadsheet.getSheetByName(SHEET_NAMES.MASTER);
  if (!masterSheet) {
    return createErrorResponse(MESSAGES.SHEET_NOT_EXISTED, STATUS_CODE.NOT_FOUND);
  }

  const lastRow = masterSheet.getLastRow();
  const range = masterSheet.getRange("A2:B" + lastRow);
  const values = range.getValues();

  const result = values.map((row) => ({
    [FIELD_NAMES.NUMBER]: row[0],
    [FIELD_NAMES.CATEGORY_NAME]: row[1] || ""
  }));

  return createJsonResponse({ data: result });
};

/**
 * デフォルトケースを処理する関数。
 * 不明または提供されていない type パラメータに対するエラーレスポンスを返します。
 * @return {GoogleAppsScript.Content.TextOutput} JSON形式のエラーレスポンス。
 */
function handleDefaultCase() {
  return createErrorResponse(MESSAGES.INVALID_TYPE_PARAMETER, STATUS_CODE.BAD_REQUEST);
}

/**
 * handleAddQuestionPoint関数: 指定されたNumberの行の質問ポイントを1ポイント追加する。
 * @param {Object} requestData - リクエストボディのデータ。
 * @return {GoogleAppsScript.Content.TextOutput} 処理結果を示すレスポンス。
 */
function handleAddQuestionPoint(requestData) {
  const sheetName = requestData.sheetName;
  const number = requestData.number;
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    return createErrorResponse(MESSAGES.SHEET_NOT_EXISTED, STATUS_CODE.NOT_FOUND);
  }

  const dataRange = sheet.getRange("A:E");
  const values = dataRange.getValues();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === number) { // A列（インデックス0）がNumber一致するか
      const currentPoints = values[i][4]; // E列（インデックス4）の値（現在のポイント）
      const newPoints = currentPoints + 1;
      sheet.getRange(i + 1, 5).setValue(newPoints); // E列の値を更新
      return createTextResponse(MESSAGES.ADD_POINT, STATUS_CODE.OK);
    }
  }

  return createErrorResponse(MESSAGES.ROW_NOT_EXIST, STATUS_CODE.NOT_FOUND);
}

/**
 * addRowInQA関数: QAシートに新しい行を追加する。
 * @param {Object} requestData - リクエストボディのデータ。
 * @return {GoogleAppsScript.Content.TextOutput} 処理結果を示すレスポンス。
 */
function addRowInQA(requestData) {
  const { sheetName, from, question, answer } = requestData;
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    return createErrorResponse(MESSAGES.SHEET_NOT_EXISTED, STATUS_CODE.NOT_FOUND);
  }

  // 最初の空白行を見つける
  const lastRow = sheet.getLastRow();
  const nextRow = lastRow + 1;

  // A列に行番号-1の値を設定
  const rowNumberMinusOne = nextRow - 1;
  sheet.getRange(nextRow, 1).setValue(rowNumberMinusOne);

  sheet.getRange(nextRow, 2).setValue(from);
  sheet.getRange(nextRow, 3).setValue(question);
  sheet.getRange(nextRow, 4).setValue(answer);
  sheet.getRange(nextRow, 5).setValue(1);
  // F列に現在の日時を設定
  sheet.getRange(nextRow, 6).setValue(new Date());

  return createTextResponse(MESSAGES.ADD_ROW, STATUS_CODE.OK);
}

/**
 * 全シートからフィルタリングされたデータを取得する（"master"と"template"を除く）。
 * フィルタリング条件: Manual_flagが1でない、ポイントが10点以上、データが存在するシートのみ。
 * 各シートのデータはシート名でグループ化し、行データにはキーを割り当てる。
 * Answerが512文字を超える場合、512文字で切り、末尾に「...（省略されました）」を追加する。
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} spreadsheet - アクティブなスプレッドシート
 * @return {GoogleAppsScript.Content.TextOutput} フィルタリングされたデータを含むJSON形式のレスポンス
 */
function getFilteredSheetsData(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  let allData = {};

  sheets.forEach(sheet => {
    const name = sheet.getName();
    if (name !== SHEET_NAMES.MASTER && name !== SHEET_NAMES.TEMPLATE) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const dataRange = sheet.getRange('A2:G' + lastRow);
        const data = dataRange.getValues();
        // フィルタリング条件: Manual_flagが1でない、ポイントが10点以上、データが存在するシートのみ。
        const filteredData = data.filter(row => row.some(cell => cell !== "") && row[6] != 1 && row[4] >= 10)
          .map(row => ({
            [FIELD_NAMES.NUMBER]: row[0],
            [FIELD_NAMES.ASKER_NAME]: row[1],
            [FIELD_NAMES.QUESTION]: row[2],
            [FIELD_NAMES.ANSWER]: row[3].length > 512 ? `${row[3].substring(0, 512)}...（省略されました）` : row[3],
            [FIELD_NAMES.FAQ_POINTS]: row[4],
            [FIELD_NAMES.CREATED_DATE]: row[5],
            [FIELD_NAMES.FAQ_PUBLISHED]: row[6]
          }));

        if (filteredData.length > 0) {
          allData[name] = filteredData;
        }
      }
    }
  });

  return createJsonResponse({ data: allData });

}
