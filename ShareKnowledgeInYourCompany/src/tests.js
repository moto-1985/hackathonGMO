function doPostTestCreateSheet() {
  const testSheetName = "TestSheet" + new Date().getTime(); // 一時的なシート名
  const mockRequest = {
    postData: {
      contents: JSON.stringify({
        action: "createSheet", // アクションタイプ
        sheetName: testSheetName // シート名
      })
    }
  };
  const response = doPost(mockRequest); // doPost関数をテストリクエストで実行
  Logger.log(response.getContent()); // レスポンスをログに記録

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const newSheet = spreadsheet.getSheetByName(testSheetName);
  if (newSheet) {
    spreadsheet.deleteSheet(newSheet); // テストで作成されたシートを削除
    Logger.log(getMessage("CLEANUP_COMPLETED"));
  }
}

function doPostTestAddQuestionPoint() {
  const testSheetName = "営業";
  const questionNo = 1;
  const mockRequest = {
    postData: {
      contents: JSON.stringify({
        action: "addQuestionPoint",
        sheetName: testSheetName,
        number: questionNo
      })
    }
  };
  const response = doPost(mockRequest);
  Logger.log(getMessage("ADD_POINT"));
}


/**
 * doGet関数をモックイベントオブジェクトでテストします。
 */
const testDoGetQuerySheet = () => {
  // "querySheet" タイプのリクエストをテストするためのモックイベントパラメータ
  const mockEvent = {
    parameter: {
      type: "querySheet",  // リクエストのタイプ
      sheetName: "営業",    // クエリするシート名
      query: "someQuery"   // 実際の関数がこれを使用すると仮定しています。必要に応じて調整してください。
    }
  };

  // モックイベントを使用してdoGet関数を呼び出し
  const response = doGet(mockEvent);

  // デバッグ目的でレスポンスをログに記録
  Logger.log(response.getContent());

  // レスポンスを解析して結果をログに記録しようと試みる
  try {
    const responseData = JSON.parse(response.getContent());
    if (responseData && responseData.data && responseData.data.length > 0) {
      // 成功ケース
      Logger.log(getMessage("TEST_SUCCESS"));
    } else {
      // データがないケース
      Logger.log(getMessage("TEST_FAIL_NO_DATA"));
    }
  } catch (e) {
    // 解析エラーケース
    Logger.log(getMessage("TEST_FAIL_PARSE_ERROR"));
  }
};

/**
 * doGet関数をモックイベントオブジェクトでテストし、listMasterタイプのリクエストをシミュレートします。
 */
const testDoGetListMaster = () => {
  // "listMaster" タイプのリクエストをテストするためのモックイベントパラメータ
  const mockEvent = {
    parameter: {
      type: "listMaster", // リクエストのタイプ
      // listMasterリクエストの場合、追加のパラメータは通常必要ありません
    }
  };

  // モックイベントを使用してdoGet関数を呼び出し
  const response = doGet(mockEvent);

  // デバッグ目的でレスポンスをログに記録
  Logger.log(response.getContent());

  // レスポンスを解析して結果をログに記録しようと試みる
  try {
    const responseData = JSON.parse(response.getContent());
    if (responseData && responseData.data && responseData.data.length > 0) {
      // 成功ケース
      Logger.log(getMessage("TEST_SUCCESS"));
    } else {
      // データがないケース
      Logger.log(getMessage("TEST_FAIL_NO_DATA"));
    }
  } catch (e) {
    // 解析エラーケース
    Logger.log(getMessage("TEST_FAIL_PARSE_ERROR"));
  }
};

function doPostTestAddRowInQA() {
  const testSheetName = "営業";
  const testFrom = "テストユーザ";
  const testQuestion = "これはテストの質問ですか？";
  const testAnswer = "はい、これはテストの回答です。";

  // テスト用のモックリクエストを作成
  const mockRequest = {
    postData: {
      contents: JSON.stringify({
        action: "addRowInQA", // アクションタイプ
        sheetName: testSheetName, // シート名
        from: testFrom, // 送信者名
        question: testQuestion, // 質問内容
        answer: testAnswer // 回答内容
      })
    }
  };

  // doPost関数をテストリクエストで実行
  const response = doPost(mockRequest);
  Logger.log(response.getContent());

  // 実行後のシートを確認して、期待される変更があるかを検証
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(testSheetName);
  const lastRow = sheet.getLastRow();
  const testData = sheet.getRange(lastRow, 2, 1, 3).getValues()[0]; // 最後の行からB列、C列、D列のデータを取得

  // 期待される値と実際の値を比較
  if (testData[0] === testFrom && testData[1] === testQuestion && testData[2] === testAnswer) {
    Logger.log("テスト成功: QA行が正しく追加されました。");
  } else {
    Logger.log("テスト失敗: QA行の追加に問題があります。");
  }
}

/**
 * getFilteredSheetsData機能をテストするための関数。
 */
function testDoGetFilteredSheetsData() {
  const mockEvent = {
    parameter: {
      type: "getFilteredSheetsData",
    }
  };

  const response = doGet(mockEvent);
  Logger.log(response.getContent());

  try {
    const responseData = JSON.parse(response.getContent());
    if (responseData && Object.keys(responseData.data).length > 0) {
      // 成功ケース：1つ以上のシートにデータが存在する場合
      Logger.log("テスト成功: フィルタリングされたデータが正しく取得されました。");
    } else {
      // データがないケース
      Logger.log("テスト失敗: 期待されるデータが取得されませんでした。");
    }
  } catch (e) {
    // 解析エラーケース
    Logger.log("テスト失敗: レスポンスの解析中にエラーが発生しました。");
  }
}
