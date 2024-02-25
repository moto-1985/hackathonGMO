const MESSAGES = {
  // エラーメッセージ
  PARSE_ERROR: "リクエストボディの解析に失敗しました。",
  SHEET_NAME_REQUIRED: "sheetName パラメータは必須です。",
  GENERIC_ERROR: "内部サーバーエラーが発生しました。",
  ERROR_OCCURRED: "エラー: {{errorMessage}}",
  TEMPLATE_NOT_EXIST: "テンプレートシート \"{{templateName}}\" が存在しません。",
  SHEET_ALREADY_EXISTS: "シート \"{{sheetName}}\" はすでに存在します。",
  SHEET_NOT_CREATED: "新しいシートが作成されていません。",
  SHEET_NOT_EXISTED: "シートが存在しません。",
  INVALID_TYPE_PARAMETER: "typeパラメータが不適切です",
  ACTION_NOT_EXIST: "POSTメソッドのアクションが存在しません",
  ROW_NOT_EXIST: "行が存在しません",
  TEST_FAIL_NO_DATA: "データがありませんでした",
  TEST_FAIL_PARSE_ERROR: "データの解析に失敗しました。",

  // 通常メッセージ
  SHEET_CREATED_SUCCESSFULLY: "シート \"{{sheetName}}\" が正常に作成されました。",
  SHEET_CREATED: "新しいシートが正しく作成されました。",
  CLEANUP_COMPLETED: "テストで作成されたシートを削除しました。",
  TEST_SUCCESS: "テストは成功しました。",
  ADD_POINT: "ポイントを追加しました",
  ADD_ROW: "データを追加しました",
};

const getMessage = (key, replacements = {}) => {
  let message = MESSAGES[key];
  Object.keys(replacements).forEach(placeholder => {
    message = message.replace(`{{${placeholder}}}`, replacements[placeholder]);
  });
  return message;
}
