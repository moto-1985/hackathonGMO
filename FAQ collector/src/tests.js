function testDoGet() {
  // doGet関数を実行
  const response = doGet();

  // レスポンス内容をログに出力
  Logger.log(response.getContent());
}

// doPost関数のテストを行うための関数
function testDoPost() {
  // 模擬的なリクエストデータを作成
  const requestData = {
    action: "createFAQ",
    number: 3,
    from: "新井",
    question: "交通費精算について教えてください",
    answer: "電車の場合、領収証を発行してもらいましょう。車の場合は、会社のカードを使用してガソリンを給油し、ETCカードも社内のものを利用してください。",
    created_at: "2024/02/24 16:59:36",
    category: "営業"
  };

  // doPost関数に渡すための模擬的なイベントオブジェクトを作成
  const mockEvent = {
    postData: {
      contents: JSON.stringify(requestData),
      type: "application/json"
    }
  };

  // 模擬的なイベントオブジェクトを使用してdoPost関数を呼び出し
  const response = doPost(mockEvent);

  // レスポンスをログに出力（デバッグ用）
  Logger.log(response.getContent());
}

function testDeleteFaq() {
  // 削除するFAQ項目の参照番号とカテゴリを含むリクエストデータ
  const requestData = {
    action: "deleteFAQ",
    referenceNumber: 5,
    category: "営業"
  };

  // doPost関数に渡すための模擬的なイベントオブジェクトを作成
  const mockEvent = {
    postData: {
      contents: JSON.stringify(requestData),
      type: "application/json"
    }
  };

  // 模擬的なイベントオブジェクトを使用してdoPost関数を呼び出し
  const response = doPost(mockEvent);

  // レスポンスをログに出力（デバッグ用）
  Logger.log(response.getContent());
}
