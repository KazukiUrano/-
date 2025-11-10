/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:16:52
 * 説明：勤怠管理アプリ - CSVExport（機能別分割）
 * 
 * 【修正履歴（詳細版）】
 * - 2025-11-11 02:32:19 [浦野一輝]：配布用スプレッドシートIDに更新、onOpen関数と初期設定機能を追加
 * - 2025-11-11 02:42:44 [浦野一輝]：スクリプトプロパティを使用してスプレッドシートIDを自動取得・設定するように変更
 * - 2025-11-11 02:46:50 [浦野一輝]：よくある質問シートの作成機能を初期設定に追加
 * - 2025-11-11 02:55:38 [浦野一輝]：タスクグループB実装（スプレッドシートへのリンク機能）
 * - 2025-11-11 02:55:45 [浦野一輝]：タスクグループA実装（今月の労働時間表示機能）- バックエンド関数追加（timeStringToMinutes, calculateWorkHours, formatWorkHours, getMonthlyWorkHours）、フロントエンドUI追加
 * - 2025-11-11 02:59:06 [浦野一輝]：フェーズ2実装（CSVダウンロード機能）- バックエンド関数追加（getAvailableSheets, getSheetData, convertToCSV, downloadCSV）、フロントエンドUI追加
 * - 2025-11-11 03:02:12 [浦野一輝]：フェーズ4実装（シート共有設定・配布準備）- 設定方法シートに共有設定手順を追加、配布時の注意事項をドキュメント化
 * - 2025-11-11 03:02:24 [浦野一輝]：フェーズ3実装（記録修正機能）- バックエンド関数追加（validateDate, validateTime, getAllRecords, updateRecord, deleteRecord）、フロントエンドUI追加（記録一覧表示、編集モーダル、削除確認ダイアログ）
 * - 2025-11-11 03:03:52 [浦野一輝]：フェーズ5実装（コード改善・テスト・ドキュメント）- エラーハンドリング強化、ログ出力整理、JSDocコメント追加
 * - 2025-11-11 03:10:37 [浦野一輝]：フェーズ5-A実装（ドキュメント更新）- 使用方法・よくある質問・設定方法シートの記述修正（記録修正機能の反映）、README.mdの更新
 * - 2025-11-11 03:11:26 [浦野一輝]：フェーズ5-A実装（ドキュメント更新）- setupUsageSheetとsetupFaqSheet関数の記述を修正（記録編集機能、CSVダウンロード機能、労働時間表示機能の説明を追加・修正）
 * - 2025-11-11 03:17:21 [浦野一輝]：UI改善 - 「退勤」ボタンを「この業務を終了」に変更、ページネーション機能を追加（業務入力・労働時間・記録一覧・CSVダウンロードを別ページに分離）、労働時間ページで月を選択できるように改善、getMonthlyWorkHours関数を月を指定できるように修正
 * - 2025-11-11 03:25:36 [浦野一輝]：バリデーション改善 - updateRecord関数に開始時刻と終了時刻の妥当性チェックを追加（同じ日付内で開始時刻が終了時刻より遅い場合はエラー、日付をまたぐ場合は許可）
 * - 2025-11-11 03:18:26 [浦野一輝]：CSVダウンロード機能の修正 - window.open()からwindow.location.hrefに変更して、真っ白なページが開く問題を修正
 * - 2025-11-11 03:21:53 [浦野一輝]：CSVダウンロード機能の修正 - window.location.hrefからgetSheetData関数とBlobを使った方法に変更して、ページ遷移せずにダウンロードできるように修正
 * - 2025-11-11 03:29:34 [浦野一輝]：バグ修正 - 初期化時にloadAvailableSheets()が呼ばれてsheetSelectがnullでエラーになる問題を修正、setupEventListeners()とloadMonthlyWorkHours()に要素存在チェックを追加
 * - 2025-11-11 03:32:28 [浦野一輝]：バグ修正 - DOMContentLoadedイベントが発火しない問題を修正（readyStateチェックを追加）、setupEventListeners()とhandleDownloadCsv()、handleSheetSelectChange()にエラーハンドリングとデバッグログを追加、updateCurrentDate()に要素存在チェックを追加
 * - 2025-11-11 03:35:30 [浦野一輝]：バグ修正 - 初期化をスクリプトの最後で実行するように変更（setTimeoutで100ms遅延）、すべての関数が定義された後に初期化を実行するように修正
 * - 2025-11-11 03:36:38 [浦野一輝]：バグ修正 - 正規表現リテラルの構文エラーを修正（HTML文字列内のJavaScriptで正規表現リテラルが正しく解釈されない問題を、new RegExp()コンストラクタに変更して解決）
 * - 2025-11-11 03:39:09 [浦野一輝]：バグ修正 - HTML文字列内のinnerHTMLに設定する文字列内の引用符をエスケープ（シングルクォートを\\"に変更して、テンプレートリテラル内での文字列の解釈エラーを修正）
 * - 2025-11-11 03:45:15 [浦野一輝]：CSVダウンロード機能を2025-11-11 03:18:26の時点に戻す - window.location.hrefを使った方法に戻す（getWebAppUrl関数を追加、handleDownloadCsv関数を修正）
 * - 2025-11-11 03:50:52 [浦野一輝]：バグ修正と機能改善 - 時間形式のバリデーションエラーを修正（validateTime関数とupdateRecord関数で時刻データを文字列に変換してからバリデーション）、CSVダウンロード機能を削除してメニューから「CSV最新版を出力」ボタンでシートに出力する方式に変更（exportCSVToSheet関数を追加、WebアプリからCSVダウンロードページと関連コードを削除）
 * - 2025-11-11 03:53:09 [浦野一輝]：UI改善 - 編集フォームの入力フィールドにtitle属性を追加して、HTML5バリデーションエラーメッセージを「HH:mm形式で入力してください」にカスタマイズ
 * - 2025-11-11 03:58:22 [浦野一輝]：UI改善 - 編集フォームの時刻入力フィールドを選択式（時間・分のドロップダウン）に変更（initializeTimeSelects関数、parseTime関数、formatTime関数を追加、バリデーションと送信処理を更新）
 * - 2025-11-11 04:02:23 [浦野一輝]：UI改善 - 編集フォームの日付入力フィールドを選択式（年・月・日のドロップダウン）に変更、時刻選択のフォントサイズを大きく（28px）に変更（initializeDateSelects関数、parseDate関数、formatDate関数、updateDaySelect関数を追加、年月変更時に日の選択を自動更新するイベントリスナーを追加）
 * - 2025-11-11 04:06:04 [浦野一輝]：UI改善 - エラーメッセージの表示を改善（フォントサイズ24px、太字、背景色とボーダーを追加）、開始時刻と終了時刻の関係エラーを終了時刻のエラーとして大きく表示（「終了時刻は開始時刻より遅い時間を入力してください」）
 * - 2025-11-11 04:07:36 [浦野一輝]：CSV出力機能改善 - Google Driveフォルダ作成機能追加、設定シートにGoogle DriveフォルダIDを記録、CSV出力時にシートを選択できるダイアログ追加、「出力CSV一覧」シートに履歴を上から追加、CSV形式でダウンロードできる機能追加
 * - 2025-11-11 04:10:57 [浦野一輝]：CSV出力シート選択UI改善 - 自由記述からプルダウン選択に変更、新しい順（降順）で表示
 * 
 * 【push時の変更履歴（大きな変更のみ）】
 * - 2025-11-11 [浦野一輝]：フェーズ0実装（配布用スプレッドシートセットアップ）
 * - 2025-11-11 [浦野一輝]：フェーズ1-B実装（スプレッドシートへのリンク機能）
 * - 2025-11-11 [浦野一輝]：フェーズ1-A実装（今月の労働時間表示機能）
 * - 2025-11-11 [浦野一輝]：フェーズ2実装（CSVダウンロード機能）
 * - 2025-11-11 [浦野一輝]：フェーズ3実装（記録修正機能）
 * - 2025-11-11 [浦野一輝]：フェーズ4実装（シート共有設定・配布準備）
 * - 2025-11-11 [浦野一輝]：フェーズ5実装（コード改善・テスト・ドキュメント）
 * - 2025-11-11 [浦野一輝]：UI改善（ページネーション機能追加、ボタン文言変更、月選択機能追加）
 * - 2025-11-11 [浦野一輝]：バリデーション改善（開始時刻と終了時刻の妥当性チェック追加）
 */
function exportCSVToSheet() {
  try {
    const ui = SpreadsheetApp.getUi();
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // 利用可能なシート一覧を取得
    const availableSheetsResult = getAvailableSheets();
    if (!availableSheetsResult.success) {
      ui.alert('エラー', availableSheetsResult.message, ui.ButtonSet.OK);
      return;
    }
    
    const availableSheets = availableSheetsResult.data.sheets;
    if (availableSheets.length === 0) {
      ui.alert('エラー', '出力できるシートが見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    // シート選択ダイアログを表示（プルダウン）
    const selectedSheetName = showSheetSelectDialog(availableSheets);
    if (!selectedSheetName) {
      return; // キャンセルされた場合
    }
    
    const sheetName = selectedSheetName;
    if (!sheetName || availableSheets.indexOf(sheetName) === -1) {
      ui.alert('エラー', '無効なシート名です。利用可能なシートから選択してください。', ui.ButtonSet.OK);
      return;
    }
    
    // シートデータを取得
    const sheetDataResult = getSheetData(sheetName);
    
    if (!sheetDataResult.success) {
      ui.alert('エラー', sheetDataResult.message, ui.ButtonSet.OK);
      return;
    }
    
    const headers = sheetDataResult.data.headers;
    const rows = sheetDataResult.data.rows;
    
    // CSV形式に変換
    const csvContent = convertToCSV(headers, rows);
    
    // Google DriveフォルダIDを取得
    const driveFolderId = getDriveFolderId();
    if (!driveFolderId) {
      ui.alert('エラー', 'Google Driveフォルダが設定されていません。初期設定を実行してください。', ui.ButtonSet.OK);
      return;
    }
    
    // Google DriveにCSVファイルを作成
    const folder = DriveApp.getFolderById(driveFolderId);
    const fileName = sheetName + '_勤怠記録_' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd_HHmmss') + '.csv';
    const file = folder.createFile(fileName, csvContent, MimeType.CSV);
    
    // 「出力CSV一覧」シートに履歴を追加（上に追加）
    addCsvOutputHistory(sheetName, fileName, file.getId(), file.getUrl(), rows.length);
    
    ui.alert('完了', 
      'CSV出力が完了しました。\n\n' +
      'シート名: ' + sheetName + '\n' +
      'ファイル名: ' + fileName + '\n' +
      '行数: ' + (rows.length + 1) + '行\n' +
      '保存先: Google Drive\n\n' +
      '「出力CSV一覧」シートでダウンロードリンクを確認できます。', 
      ui.ButtonSet.OK);
    
    Logger.log('CSV出力成功: ' + fileName + ' (' + rows.length + '行)');
  } catch (error) {
    const ui = SpreadsheetApp.getUi();
    Logger.log('exportCSVToSheet エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    ui.alert('エラー', 'CSV出力中にエラーが発生しました: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * 利用可能なシート一覧を取得（月次シートのみ）
 * @return {Object} 成功時は{success: true, data: {sheets: Array<string>}}、失敗時は{success: false, message: string}
 */
function getAvailableSheets() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const allSheets = spreadsheet.getSheets();
    const monthSheets = [];
    
    // 月次シートのパターン: "YYYY年M月" または "YYYY年MM月"
    const monthPattern = /^\d{4}年\d{1,2}月$/;
    
    for (let i = 0; i < allSheets.length; i++) {
      const sheetName = allSheets[i].getName();
      // 設定方法、使用方法、よくある質問などのシートは除外
      if (monthPattern.test(sheetName)) {
        monthSheets.push(sheetName);
      }
    }
    
    // 日付順にソート（新しい月が先頭）
    monthSheets.sort(function(a, b) {
      const aMatch = a.match(/^(\d{4})年(\d{1,2})月$/);
      const bMatch = b.match(/^(\d{4})年(\d{1,2})月$/);
      if (!aMatch || !bMatch) return 0;
      const aYear = parseInt(aMatch[1]);
      const aMonth = parseInt(aMatch[2]);
      const bYear = parseInt(bMatch[1]);
      const bMonth = parseInt(bMatch[2]);
      if (aYear !== bYear) return bYear - aYear; // 新しい年が先
      return bMonth - aMonth; // 新しい月が先
    });
    
    return {
      success: true,
      data: {
        sheets: monthSheets
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'エラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 選択したシートのデータを取得
 * @param {string} sheetName - シート名
 * @return {Object} 成功時は{success: true, data: {headers: Array, rows: Array}}、失敗時は{success: false, message: string}
 */
function getSheetData(sheetName) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return {
        success: false,
        message: 'シートが見つかりません: ' + sheetName
      };
    }
    
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 1) {
      return {
        success: true,
        data: {
          headers: [],
          rows: []
        }
      };
    }
    
    // ヘッダー行を取得
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // データ行を取得（ヘッダー行を除く）
    const rows = [];
    if (lastRow > 1) {
      const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
      const dataValues = dataRange.getValues();
      
      for (let i = 0; i < dataValues.length; i++) {
        const row = [];
        for (let j = 0; j < dataValues[i].length; j++) {
          const cellValue = dataValues[i][j];
          // Dateオブジェクトの場合は文字列に変換
          if (cellValue instanceof Date) {
            // 日付列（1列目）の場合は日付形式、時刻列（3,4,5列目）の場合は時刻形式
            if (j === 0) {
              row.push(Utilities.formatDate(cellValue, 'Asia/Tokyo', 'yyyy/MM/dd'));
            } else if (j === 2 || j === 3 || j === 4) {
              row.push(Utilities.formatDate(cellValue, 'Asia/Tokyo', 'HH:mm'));
            } else {
              row.push(cellValue.toString());
            }
          } else {
            row.push(cellValue ? cellValue.toString() : '');
          }
        }
        rows.push(row);
      }
    }
    
    return {
      success: true,
      data: {
        headers: headers,
        rows: rows
      }
    };
  } catch (error) {
    Logger.log('getSheetData エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: 'シートデータ取得中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * データをCSV形式に変換
 * @param {Array<string>} headers - ヘッダー行
 * @param {Array<Array>} rows - データ行
 * @return {string} CSV形式の文字列（BOM付き）
 */
function convertToCSV(headers, rows) {
  const csvRows = [];
  
  // ヘッダー行を追加
  csvRows.push(headers.map(function(header) {
    return '"' + String(header).replace(/"/g, '""') + '"';
  }).join(','));
  
  // データ行を追加
  for (let i = 0; i < rows.length; i++) {
    csvRows.push(rows[i].map(function(cell) {
      return '"' + String(cell).replace(/"/g, '""') + '"';
    }).join(','));
  }
  
  // BOMを追加（Excelで文字化けを防ぐため）
  return '\uFEFF' + csvRows.join('\n');
}

/**
 * Google DriveフォルダIDを取得（設定シートから取得）
 * @return {string|null} Google DriveフォルダID、取得できない場合はnull
 */
function getDriveFolderId() {
  try {
    // まずスクリプトプロパティから取得を試みる
    const properties = PropertiesService.getScriptProperties();
    const folderId = properties.getProperty('DRIVE_FOLDER_ID');
    if (folderId && folderId.trim().length > 0) {
      return folderId.trim();
    }
    
    // 設定シートから取得を試みる
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const settingSheet = spreadsheet.getSheetByName('設定方法');
    
    if (!settingSheet) {
      return null;
    }
    
    // 設定シートから「Google DriveフォルダID:」という行を探す
    const lastRow = settingSheet.getLastRow();
    for (let i = 1; i <= lastRow; i++) {
      const cellValue = settingSheet.getRange(i, 1).getValue();
      if (typeof cellValue === 'string') {
        // 同じ行にIDが含まれている可能性がある
        const match = cellValue.match(/Google DriveフォルダID:\s*([^\s\n]+)/);
        if (match && match[1] && match[1] !== '（未設定）') {
          const extractedId = match[1].trim();
          // スクリプトプロパティにも保存
          properties.setProperty('DRIVE_FOLDER_ID', extractedId);
          return extractedId;
        }
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('getDriveFolderId エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return null;
  }
}

/**
 * CSV出力履歴を「出力CSV一覧」シートに追加（上に追加）
 * @param {string} sheetName - 出力したシート名
 * @param {string} fileName - ファイル名
 * @param {string} fileId - Google DriveファイルID
 * @param {string} fileUrl - Google DriveファイルURL
 * @param {number} rowCount - データ行数
 * @return {void}
 */
function addCsvOutputHistory(sheetName, fileName, fileId, fileUrl, rowCount) {
  try {
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // 「出力CSV一覧」シートを作成または取得
    let historySheet = spreadsheet.getSheetByName('出力CSV一覧');
    if (!historySheet) {
      historySheet = spreadsheet.insertSheet('出力CSV一覧');
      
      // ヘッダー行を設定
      const headers = ['出力日時', 'シート名', 'ファイル名', 'データ行数', 'ダウンロードリンク'];
      historySheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      historySheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      historySheet.getRange(1, 1, 1, headers.length).setBackground('#E8F5E9');
      
      // 列幅を調整
      historySheet.setColumnWidth(1, 180); // 出力日時
      historySheet.setColumnWidth(2, 150); // シート名
      historySheet.setColumnWidth(3, 300); // ファイル名
      historySheet.setColumnWidth(4, 100); // データ行数
      historySheet.setColumnWidth(5, 400); // ダウンロードリンク
    }
    
    // 現在の日時を取得
    const now = new Date();
    const outputDateTime = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss');
    
    // 新しい行を2行目に挿入（上に追加）
    historySheet.insertRowBefore(2);
    
    // データを設定
    const linkFormula = '=HYPERLINK("' + fileUrl + '","ダウンロード")';
    historySheet.getRange(2, 1).setValue(outputDateTime);
    historySheet.getRange(2, 2).setValue(sheetName);
    historySheet.getRange(2, 3).setValue(fileName);
    historySheet.getRange(2, 4).setValue(rowCount);
    historySheet.getRange(2, 5).setFormula(linkFormula);
    
    Logger.log('CSV出力履歴を追加: ' + fileName);
  } catch (error) {
    Logger.log('addCsvOutputHistory エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
  }
}

/**
 * シート選択ダイアログを表示（プルダウン）
 * @param {Array<string>} availableSheets - 利用可能なシート一覧（新しい順）
 * @return {string|null} 選択されたシート名、キャンセル時はnull
 */
function showSheetSelectDialog(availableSheets) {
  try {
    const htmlTemplate = HtmlService.createTemplate(`
      <!DOCTYPE html>
      <html>
        <head>
          <base target="_top">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              width: 400px;
            }
            h2 {
              margin-top: 0;
              color: #1976D2;
            }
            label {
              display: block;
              margin-bottom: 10px;
              font-weight: bold;
            }
            select {
              width: 100%;
              padding: 8px;
              font-size: 14px;
              border: 1px solid #ccc;
              border-radius: 4px;
              margin-bottom: 20px;
            }
            .button-container {
              text-align: right;
            }
            button {
              padding: 10px 20px;
              font-size: 14px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              margin-left: 10px;
            }
            .btn-ok {
              background-color: #4CAF50;
              color: white;
            }
            .btn-ok:hover {
              background-color: #45a049;
            }
            .btn-cancel {
              background-color: #f44336;
              color: white;
            }
            .btn-cancel:hover {
              background-color: #da190b;
            }
          </style>
        </head>
        <body>
          <h2>CSV出力 - シート選択</h2>
          <label for="sheetSelect">出力するシートを選択してください：</label>
          <select id="sheetSelect" name="sheetSelect">
            <? for (var i = 0; i < sheets.length; i++) { ?>
              <option value="<?= sheets[i] ?>"><?= sheets[i] ?></option>
            <? } ?>
          </select>
          <div class="button-container">
            <button class="btn-cancel" onclick="google.script.host.close()">キャンセル</button>
            <button class="btn-ok" onclick="selectSheet()">OK</button>
          </div>
          <script>
            function selectSheet() {
              const select = document.getElementById('sheetSelect');
              const selectedSheet = select.value;
              google.script.host.setHeight(200);
              google.script.run.withSuccessHandler(function() {
                google.script.host.close();
              }).withFailureHandler(function(error) {
                alert('エラー: ' + error.message);
              }).returnSelectedSheet(selectedSheet);
            }
          </script>
        </body>
      </html>
    `);
    
    htmlTemplate.sheets = availableSheets;
    const html = htmlTemplate.evaluate()
      .setWidth(450)
      .setHeight(200);
    
    const ui = SpreadsheetApp.getUi();
    ui.showModalDialog(html, 'CSV出力 - シート選択');
    
    // 選択されたシート名を取得（スクリプトプロパティから）
    const properties = PropertiesService.getScriptProperties();
    const selectedSheet = properties.getProperty('SELECTED_SHEET_NAME');
    properties.deleteProperty('SELECTED_SHEET_NAME');
    
    return selectedSheet || null;
  } catch (error) {
    Logger.log('showSheetSelectDialog エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return null;
  }
}

/**
 * 選択されたシート名を保存（HTMLダイアログから呼び出される）
 * @param {string} sheetName - 選択されたシート名
 * @return {void}
 */
function returnSelectedSheet(sheetName) {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('SELECTED_SHEET_NAME', sheetName);
}

/**
 * Google Driveフォルダを作成
 * @return {string|null} 作成したフォルダのID、失敗時はnull
 */
function createDriveFolder() {
  try {
    const folderName = '勤怠管理_CSV出力';
    const folders = DriveApp.getFoldersByName(folderName);
    
    let folder;
    if (folders.hasNext()) {
      // 既に存在する場合は既存のフォルダを使用
      folder = folders.next();
      Logger.log('既存のGoogle Driveフォルダを使用: ' + folder.getId());
    } else {
      // 新規作成
      folder = DriveApp.createFolder(folderName);
      Logger.log('Google Driveフォルダを作成: ' + folder.getId());
    }
    
    return folder.getId();
  } catch (error) {
    Logger.log('createDriveFolder エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return null;
  }
}

/**
 * CSVダウンロード用のエンドポイント
 * @param {Object} e - リクエストパラメータ（sheetNameを含む）
 * @return {TextOutput} CSVファイルとしてダウンロード
 */
function downloadCSV(e) {
  try {
    const sheetName = e.parameter.sheetName;
    
    if (!sheetName) {
      Logger.log('downloadCSV エラー: シート名が指定されていません');
      return ContentService.createTextOutput('エラー: シート名が指定されていません')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // シートデータを取得
    const sheetDataResult = getSheetData(sheetName);
    
    if (!sheetDataResult.success) {
      Logger.log('downloadCSV エラー: ' + sheetDataResult.message);
      return ContentService.createTextOutput('エラー: ' + sheetDataResult.message)
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    const headers = sheetDataResult.data.headers;
    const rows = sheetDataResult.data.rows;
    
    // CSV形式に変換
    const csvContent = convertToCSV(headers, rows);
    
    // ファイル名を生成（例: "2025年11月_勤怠記録.csv"）
    const fileName = sheetName + '_勤怠記録.csv';
    
    Logger.log('CSVダウンロード成功: ' + fileName + ' (' + rows.length + '行)');
    
    return ContentService.createTextOutput(csvContent)
      .setMimeType(ContentService.MimeType.CSV)
      .downloadAsFile(fileName);
  } catch (error) {
    Logger.log('downloadCSV エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return ContentService.createTextOutput('CSVダウンロード中にエラーが発生しました: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

/**
 * Webアプリ用のGETエンドポイント
 * @param {Object} e - リクエストパラメータ
 * @return {HtmlOutput|TextOutput} HTMLページまたはCSVファイル
 */