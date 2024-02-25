const insertValuesIntoSheetAndCopyTemplate = (valueForSheetName) => {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  appendValueToMasterSheet(spreadsheet, valueForSheetName);
  createSheetIfNotExists(spreadsheet, valueForSheetName, SHEET_NAMES.TEMPLATE);
};

const createSheetIfNotExists = (spreadsheet, sheetName, templateSheetName) => {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (sheet) {
    throw new Error(getMessage("SHEET_ALREADY_EXISTS", { sheetName }));
  }
  const templateSheet = spreadsheet.getSheetByName(templateSheetName);
  if (!templateSheet) {
    throw new Error(getMessage("TEMPLATE_NOT_EXIST", { templateName: templateSheetName }));
  }
  sheet = templateSheet.copyTo(spreadsheet);
  sheet.setName(sheetName);
  return sheet;
};

const appendValueToMasterSheet = (spreadsheet, value) => {
  const masterSheet = spreadsheet.getSheetByName(SHEET_NAMES.MASTER);
  const lastRow = masterSheet.getLastRow();
  const nextRow = lastRow + 1;
  masterSheet.getRange(`${COLUMN.A}${nextRow}`).setFormula("=ROW()-1");
  masterSheet.getRange(`${COLUMN.B}${nextRow}`).setValue(value);
};

const createTextResponse = (message, statusCode) => {
  const fullMessage = `${message} (Status Code: ${statusCode})`;
  return ContentService.createTextOutput(fullMessage).setMimeType(ContentService.MimeType.TEXT);
}
