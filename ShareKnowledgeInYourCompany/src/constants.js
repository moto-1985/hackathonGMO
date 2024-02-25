const STATUS_CODE = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_EXIST: 404,
  INTERNAL_SERVER_ERROR: 500
};

const SHEET_NAMES = {
  MASTER: "master",
  TEMPLATE: "template",
};

const COLUMN = {
  A: "A",
  B: "B",
  A2G: "A2:G"
};

const RANGE = {
  START: "2",
};

const MIME_TYPE = {
  JSON: ContentService.MimeType.JSON,
  TEXT: ContentService.MimeType.TEXT
};

const FIELD_NAMES = {
  NUMBER: "number",
  ASKER_NAME: "質問者名",
  QUESTION: "質問",
  ANSWER: "回答",
  FAQ_POINTS: "よくある質問ポイント",
  CREATED_DATE: "作成日",
  FAQ_PUBLISHED: "FAQ掲載有無",
  CATEGORY_NAME: "カテゴリー名",
};