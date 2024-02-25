function doGet() {
  try {
    const faqSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID_FAQ);
    const faqSheet = faqSpreadsheet.getSheetByName(SHEET_NAME_FAQ);
    
    if (!faqSheet) {
      throw new Error('FAQ sheet not found');
    }
    
    const dataRange = faqSheet.getDataRange();
    const values = dataRange.getValues();
    const faqData = values.slice(1).map(row => ({
      ReferenceNumber: row[0],
      From: row[1],
      Question: row[2],
      Answer: row[3],
      Created_at: row[4],
      Category: row[5],
      ReferenceURL: row[6]
    }));
    
    return ContentService.createTextOutput(JSON.stringify(faqData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const faqSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID_FAQ);
    const faqSheet = faqSpreadsheet.getSheetByName(SHEET_NAME_FAQ);
    
    if (!faqSheet) {
      throw new Error('FAQ sheet not found');
    }

    switch (requestData.action) {
      case "createFAQ":
        createFAQ(requestData, faqSheet);
        break;
      case "deleteFAQ":
        deleteFAQ(requestData, faqSheet);
        break;
      default:
        throw new Error('Unsupported action');
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function createFAQ(requestData, faqSheet) {
  const qaSpreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID_QA);
  const qaSheet = qaSpreadsheet.getSheetByName(requestData.category);
  if (!qaSheet) {
    throw new Error('Category sheet not found');
  }

  const numberValue = requestData.number;
  const idValues = qaSheet.getRange("A:A").getValues();
  let foundRow = findRowByNumber(idValues, numberValue);

  if (foundRow === null) {
    throw new Error('Number not found in the category sheet');
  }

  // フラグ設定
  qaSheet.getRange(foundRow, 7).setValue(1);

  const formattedDate = formatDate(requestData.created_at);
  const nextRow = faqSheet.getLastRow() + 1;
  faqSheet.getRange(nextRow, 1, 1, 6).setValues([
    [requestData.number, requestData.from, requestData.question, requestData.answer, formattedDate, requestData.category]
  ]);

  // 行のURLを設定
  const rowUrl = generateRowUrl(qaSheet, foundRow);
  faqSheet.getRange(nextRow, 7).setValue(rowUrl);

  return ContentService.createTextOutput(JSON.stringify({ result: 'FAQ added successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function deleteFAQ(requestData, faqSheet) {
  const referenceNumber = requestData.referenceNumber;
  const faqValues = faqSheet.getDataRange().getValues();
  let faqRowToDelete = findRowToDelete(faqValues, referenceNumber, requestData.category);

  if (faqRowToDelete !== null) {
    faqSheet.deleteRow(faqRowToDelete);
    clearFlagInQASheet(requestData);
  } else {
    throw new Error('Reference number with specified category not found in FAQ sheet');
  }

  return ContentService.createTextOutput(JSON.stringify({ result: 'FAQ deleted successfully' }))
    .setMimeType(ContentService.MimeType.JSON);
}