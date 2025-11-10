/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:16:52
 * 説明：勤怠管理アプリ - SheetOperations（機能別分割）
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
function getSpreadsheetId() {
  try {
    const properties = PropertiesService.getScriptProperties();
    let spreadsheetId = properties.getProperty('SPREADSHEET_ID');
    
    // スクリプトプロパティに保存されていない場合は、現在のスプレッドシートのIDを取得して保存
    if (!spreadsheetId) {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (spreadsheet) {
        spreadsheetId = spreadsheet.getId();
        properties.setProperty('SPREADSHEET_ID', spreadsheetId);
        Logger.log('スプレッドシートIDを自動設定しました: ' + spreadsheetId);
      } else {
        throw new Error('スプレッドシートが取得できませんでした');
      }
    }
    
    return spreadsheetId;
  } catch (error) {
    Logger.log('getSpreadsheetId エラー: ' + error.toString());
    throw new Error('スプレッドシートIDの取得に失敗しました: ' + error.toString());
  }
}

/**
 * 現在の年月からシート名を生成
 */
function getCurrentSheetName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-11なので+1
  return year + '年' + month + '月';
}

/**
 * 出勤時刻を記録
 * @return {Object} 成功時は{success: true, message: string, data: {date: string, clockIn: string}}、失敗時は{success: false, message: string}
 */
function getSheet() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheetName = getCurrentSheetName();
    let sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      // シートが存在しない場合は作成
      sheet = spreadsheet.insertSheet(sheetName);
      
      // ヘッダー行を設定
      const headers = ['稼働日', '費目', '開始時刻', '終了時刻', '休憩時間', '数量', '業務内容'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // ヘッダー行のスタイルを設定
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4CAF50');
      headerRange.setFontColor('#FFFFFF');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      
      // 列幅を調整
      sheet.setColumnWidth(1, 100); // 稼働日
      sheet.setColumnWidth(2, 100); // 費目
      sheet.setColumnWidth(3, 80);  // 開始時刻
      sheet.setColumnWidth(4, 80);  // 終了時刻
      sheet.setColumnWidth(5, 80);  // 休憩時間
      sheet.setColumnWidth(6, 60);  // 数量
      sheet.setColumnWidth(7, 300); // 業務内容
      
      // シートを先頭に移動
      spreadsheet.setActiveSheet(sheet);
      spreadsheet.moveActiveSheet(1);
      
      Logger.log('新しい月次シートを作成しました: ' + sheetName);
    }
    
    return sheet;
  } catch (error) {
    Logger.log('getSheet エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    throw new Error('シートの取得に失敗しました: ' + error.toString());
  }
}

/**
 * スプレッドシートのURLを取得
 * @return {Object} 成功時は{success: true, url: string}、失敗時は{success: false, message: string}
 */
function getSpreadsheetUrl() {
  try {
    const spreadsheetId = getSpreadsheetId();
    if (!spreadsheetId) {
      Logger.log('getSpreadsheetUrl エラー: スプレッドシートIDが取得できませんでした');
      return {
        success: false,
        message: 'スプレッドシートIDが取得できませんでした'
      };
    }
    const url = 'https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit';
    return {
      success: true,
      url: url
    };
  } catch (error) {
    Logger.log('getSpreadsheetUrl エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: 'スプレッドシートURLの取得中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * WebアプリのURLを取得
 * @return {Object} 成功時は{success: true, url: string}、失敗時は{success: false, message: string}
 */
function getWebAppUrl() {
  try {
    const service = ScriptApp.getService();
    if (!service) {
      Logger.log('getWebAppUrl エラー: Webアプリがデプロイされていません');
      return {
        success: false,
        message: 'Webアプリがデプロイされていません'
      };
    }
    const url = service.getUrl();
    return {
      success: true,
      url: url
    };
  } catch (error) {
    Logger.log('getWebAppUrl エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: 'WebアプリURLの取得中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 現在の月のシートにCSV形式でデータを出力
 * @return {void}
 */