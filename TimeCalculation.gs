/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:16:52
 * 説明：勤怠管理アプリ - TimeCalculation（機能別分割）
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
function timeStringToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return 0;
  }
  
  const parts = timeStr.split(':');
  if (parts.length !== 2) {
    return 0;
  }
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return 0;
  }
  
  return hours * 60 + minutes;
}

/**
 * 開始時刻と終了時刻から労働時間を計算（休憩時間を考慮）
 * @param {string} startTime - 開始時刻（HH:mm形式）
 * @param {string} endTime - 終了時刻（HH:mm形式）
 * @param {string} breakTime - 休憩時間（HH:mm形式、デフォルト: "0:00"）
 * @return {number} 労働時間（分）
 */
function calculateWorkHours(startTime, endTime, breakTime) {
  if (!startTime || !endTime) {
    return 0;
  }
  
  // 時刻文字列を分に変換
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  const breakMinutes = breakTime ? timeStringToMinutes(breakTime) : 0;
  
  // 日付をまたぐ場合の処理（24:00を超える場合）
  let workMinutes = endMinutes - startMinutes;
  if (workMinutes < 0) {
    // 日付をまたぐ場合（例: 22:00 - 02:00 = 4時間）
    workMinutes = (24 * 60 - startMinutes) + endMinutes;
  }
  
  // 休憩時間を差し引く
  workMinutes = workMinutes - breakMinutes;
  
  // 負の値にならないようにする
  return Math.max(0, workMinutes);
}

/**
 * 分を時間単位の表示形式に変換（例: "120時間30分"）
 * @param {number} minutes - 分
 * @return {string} 表示形式（例: "120時間30分"）
 */
function formatWorkHours(minutes) {
  if (!minutes || minutes < 0) {
    return '0時間0分';
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return hours + '時間' + mins + '分';
}

/**
 * 指定した月の総労働時間を計算（シート名が指定されない場合は今月）
 * @param {string} sheetName - シート名（例: "2025年11月"）。指定されない場合は今月のシートを使用
 * @return {Object} 成功時は{success: true, data: {totalMinutes: number, formatted: string}}、失敗時は{success: false, message: string}
 */
function getMonthlyWorkHours(sheetName) {
  try {
    let sheet;
    if (sheetName) {
      // 指定されたシート名でシートを取得
      const spreadsheetId = getSpreadsheetId();
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) {
        return {
          success: false,
          message: '指定されたシートが見つかりません: ' + sheetName
        };
      }
    } else {
      // シート名が指定されない場合は今月のシートを使用
      sheet = getSheet();
    }
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      // データがない場合
      return {
        success: true,
        data: {
          totalMinutes: 0,
          formatted: '0時間0分'
        }
      };
    }
    
    let totalMinutes = 0;
    
    // ヘッダー行を除いて、2行目から最終行まで処理
    for (let i = 2; i <= lastRow; i++) {
      const startTime = sheet.getRange(i, 3).getValue(); // 開始時刻
      const endTime = sheet.getRange(i, 4).getValue(); // 終了時刻
      const breakTime = sheet.getRange(i, 5).getValue(); // 休憩時間
      
      // 開始時刻と終了時刻の両方が存在する場合のみ計算
      if (startTime && endTime) {
        // 時刻を文字列に変換（Dateオブジェクトの場合は文字列に変換）
        let startTimeStr = '';
        let endTimeStr = '';
        let breakTimeStr = breakTime ? breakTime.toString() : '0:00';
        
        if (startTime instanceof Date) {
          startTimeStr = Utilities.formatDate(startTime, 'Asia/Tokyo', 'HH:mm');
        } else {
          startTimeStr = startTime.toString();
        }
        
        if (endTime instanceof Date) {
          endTimeStr = Utilities.formatDate(endTime, 'Asia/Tokyo', 'HH:mm');
        } else {
          endTimeStr = endTime.toString();
        }
        
        // 労働時間を計算
        const workMinutes = calculateWorkHours(startTimeStr, endTimeStr, breakTimeStr);
        totalMinutes += workMinutes;
      }
    }
    
    return {
      success: true,
      data: {
        totalMinutes: totalMinutes,
        formatted: formatWorkHours(totalMinutes)
      }
    };
  } catch (error) {
    Logger.log('getMonthlyWorkHours エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '今月の労働時間取得中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 日付の妥当性をチェック（yyyy/MM/dd形式）
 * @param {string} dateStr - 日付文字列
 * @return {boolean} 妥当な場合true
 */
function validateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }
  
  const datePattern = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!datePattern.test(dateStr)) {
    return false;
  }
  
  const parts = dateStr.split('/');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }
  
  // 月が1-12の範囲内か
  if (month < 1 || month > 12) {
    return false;
  }
  
  // 日が1-31の範囲内か（簡易チェック）
  if (day < 1 || day > 31) {
    return false;
  }
  
  // Dateオブジェクトで実際に有効な日付かチェック
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }
  
  return true;
}

/**
 * 時刻の妥当性をチェック（HH:mm形式）
 * @param {string} timeStr - 時刻文字列
 * @return {boolean} 妥当な場合true
 */
function validateTime(timeStr) {
  if (!timeStr) {
    return false;
  }
  
  // 文字列に変換（数値やDateオブジェクトの場合も対応）
  let timeString = '';
  if (typeof timeStr === 'string') {
    timeString = timeStr.trim();
  } else if (timeStr instanceof Date) {
    timeString = Utilities.formatDate(timeStr, 'Asia/Tokyo', 'HH:mm');
  } else {
    timeString = String(timeStr).trim();
  }
  
  if (!timeString) {
    return false;
  }
  
  const timePattern = /^\d{1,2}:\d{2}$/;
  if (!timePattern.test(timeString)) {
    return false;
  }
  
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return false;
  }
  
  // 時間が0-23の範囲内か（24:00も許可）
  if (hours < 0 || hours > 24) {
    return false;
  }
  
  // 分が0-59の範囲内か
  if (minutes < 0 || minutes > 59) {
    return false;
  }
  
  // 24:00の場合、分は00のみ
  if (hours === 24 && minutes !== 0) {
    return false;
  }
  
  return true;
}

/**
 * 今月の全記録を取得
 * @return {Object} 成功時は{success: true, data: Array}、失敗時は{success: false, message: string}
 */