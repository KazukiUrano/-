/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:02:23
 * 説明：勤怠管理アプリ - Google Apps Script（スプレッドシートとの連携処理）
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

/**
 * スプレッドシートIDを取得（スクリプトプロパティから取得、なければ現在のスプレッドシートのIDを使用）
 * @return {string} スプレッドシートID
 * @throws {Error} スプレッドシートIDが取得できない場合
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
function recordClockIn() {
  try {
    const sheet = getSheet();
    const now = new Date();
    const today = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
    const time = Utilities.formatDate(now, 'Asia/Tokyo', 'HH:mm');
    
    // 常に新しい行を追加（1日に複数回の業務に対応）
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;
    
    // 新しい業務の行を作成
    sheet.getRange(newRow, 1).setValue(today);
    sheet.getRange(newRow, 2).setValue('業務委託費');
    // 時刻を文字列として明示的に設定
    sheet.getRange(newRow, 3).setNumberFormat('@').setValue(time);
    // 休憩時間を0:00に設定
    sheet.getRange(newRow, 5).setNumberFormat('@').setValue('0:00');
    
    Logger.log('出勤記録成功: ' + today + ' ' + time);
    
    return {
      success: true,
      message: '出勤時刻を記録しました: ' + time,
      data: {
        date: today,
        clockIn: time
      }
    };
  } catch (error) {
    Logger.log('recordClockIn エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '出勤記録中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 退勤時刻と業務内容を記録
 * @param {string} workContent - 業務内容
 * @return {Object} 成功時は{success: true, message: string, data: Object}、失敗時は{success: false, message: string}
 */
function recordClockOut(workContent) {
  try {
    const sheet = getSheet();
    const now = new Date();
    const today = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
    const time = Utilities.formatDate(now, 'Asia/Tokyo', 'HH:mm');
    
    // 出勤記録を探す（今日または昨日）
    const lastRow = sheet.getLastRow();
    let clockInRow = null;
    let clockInDate = null;
    let clockInTime = null;
    
    // 今日の出勤記録を探す
    for (let i = 2; i <= lastRow; i++) {
      const dateValue = sheet.getRange(i, 1).getValue();
      const startTime = sheet.getRange(i, 3).getValue();
      const endTime = sheet.getRange(i, 4).getValue();
      
      if (dateValue && startTime && !endTime) {
        const recordDate = Utilities.formatDate(new Date(dateValue), 'Asia/Tokyo', 'yyyy/MM/dd');
        if (recordDate === today) {
          clockInRow = i;
          clockInDate = recordDate;
          clockInTime = startTime;
          break;
        }
      }
    }
    
    // 今日の記録がない場合は昨日の記録を探す（日付をまたぐ場合）
    if (!clockInRow) {
      const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      const yesterdayStr = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy/MM/dd');
      
      for (let i = 2; i <= lastRow; i++) {
        const dateValue = sheet.getRange(i, 1).getValue();
        const startTime = sheet.getRange(i, 3).getValue();
        const endTime = sheet.getRange(i, 4).getValue();
        
        if (dateValue && startTime && !endTime) {
          const recordDate = Utilities.formatDate(new Date(dateValue), 'Asia/Tokyo', 'yyyy/MM/dd');
          if (recordDate === yesterdayStr) {
            clockInRow = i;
            clockInDate = recordDate;
            clockInTime = startTime;
            break;
          }
        }
      }
    }
    
    if (!clockInRow) {
      Logger.log('recordClockOut エラー: 出勤記録が見つかりません');
      return {
        success: false,
        message: '出勤記録が見つかりません。先に出勤を記録してください。'
      };
    }
    
    // 日付をまたぐ場合の処理
    if (clockInDate !== today) {
      // 前日の記録を24:00で終了
      sheet.getRange(clockInRow, 4).setNumberFormat('@').setValue('24:00');
      
      // 前日の業務内容を記録
      if (workContent && workContent.trim()) {
        sheet.getRange(clockInRow, 7).setValue(workContent.trim());
      }
      
      // 今日の新しい記録を作成
      const newRow = lastRow + 1;
      sheet.getRange(newRow, 1).setValue(today);
      sheet.getRange(newRow, 2).setValue('業務委託費');
      sheet.getRange(newRow, 3).setNumberFormat('@').setValue('00:00');
      sheet.getRange(newRow, 4).setNumberFormat('@').setValue(time);
      // 休憩時間を0:00に設定
      sheet.getRange(newRow, 5).setNumberFormat('@').setValue('0:00');
      sheet.getRange(newRow, 7).setValue(workContent.trim());
      
      Logger.log('退勤記録成功（日付をまたぐ）: ' + today + ' ' + time);
      
      return {
        success: true,
        message: '退勤時刻を記録しました（日付をまたぐ場合）: ' + time,
        data: {
          date: today,
          clockOut: time,
          workContent: workContent || '',
          crossDate: true
        }
      };
    } else {
      // 通常の退勤処理
      sheet.getRange(clockInRow, 4).setNumberFormat('@').setValue(time);
      
      // 業務内容を記録
      if (workContent && workContent.trim()) {
        sheet.getRange(clockInRow, 7).setValue(workContent.trim());
      }
      
      Logger.log('退勤記録成功: ' + today + ' ' + time);
      
      return {
        success: true,
        message: '退勤時刻を記録しました: ' + time,
        data: {
          date: today,
          clockOut: time,
          workContent: workContent || ''
        }
      };
    }
  } catch (error) {
    Logger.log('recordClockOut エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '退勤記録中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 今日の勤怠状況を取得（最新の業務状況のみ）
 * @return {Object} 成功時は{success: true, data: Object}、失敗時は{success: false, message: string}
 */
function getTodayStatus() {
  try {
    const sheet = getSheet();
    const now = new Date();
    const today = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
    const lastRow = sheet.getLastRow();
    
    let latestRecord = null;
    
    // 今日の記録を全て確認し、最新のものを取得
    for (let i = lastRow; i >= 2; i--) {
      const dateValue = sheet.getRange(i, 1).getValue();
      if (dateValue) {
        const recordDate = Utilities.formatDate(new Date(dateValue), 'Asia/Tokyo', 'yyyy/MM/dd');
        
        if (recordDate === today) {
          const clockInRaw = sheet.getRange(i, 3).getValue();
          const clockOutRaw = sheet.getRange(i, 4).getValue();
          const workContent = sheet.getRange(i, 7).getValue();
          
          // 時刻を文字列に変換（Dateオブジェクトの場合）
          let clockIn = '';
          let clockOut = '';
          
          if (clockInRaw) {
            if (clockInRaw instanceof Date) {
              clockIn = Utilities.formatDate(clockInRaw, 'Asia/Tokyo', 'HH:mm');
            } else {
              clockIn = clockInRaw.toString();
            }
          }
          
          if (clockOutRaw) {
            if (clockOutRaw instanceof Date) {
              clockOut = Utilities.formatDate(clockOutRaw, 'Asia/Tokyo', 'HH:mm');
            } else {
              clockOut = clockOutRaw.toString();
            }
          }
          
          latestRecord = {
            date: today,
            clockIn: clockIn,
            clockOut: clockOut,
            workContent: workContent || '',
            isClockedIn: !!clockIn,
            isClockedOut: !!clockOut
          };
          break;
        }
      }
    }
    
    // 今日の記録がない場合は昨日の未完了記録を探す（日付をまたぐ場合）
    if (!latestRecord) {
      const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      const yesterdayStr = Utilities.formatDate(yesterday, 'Asia/Tokyo', 'yyyy/MM/dd');
      
      for (let i = lastRow; i >= 2; i--) {
        const dateValue = sheet.getRange(i, 1).getValue();
        const clockInRaw = sheet.getRange(i, 3).getValue();
        const clockOutRaw = sheet.getRange(i, 4).getValue();
        
        if (dateValue && clockInRaw && !clockOutRaw) {
          const recordDate = Utilities.formatDate(new Date(dateValue), 'Asia/Tokyo', 'yyyy/MM/dd');
          if (recordDate === yesterdayStr) {
            // 時刻を文字列に変換
            let clockIn = '';
            if (clockInRaw instanceof Date) {
              clockIn = Utilities.formatDate(clockInRaw, 'Asia/Tokyo', 'HH:mm');
            } else {
              clockIn = clockInRaw.toString();
            }
            
            latestRecord = {
              date: today,
              clockIn: clockIn,
              clockOut: '',
              workContent: '',
              isClockedIn: true,
              isClockedOut: false,
              crossDate: true
            };
            break;
          }
        }
      }
    }
    
    // 記録がない場合はデフォルト値を返す
    if (!latestRecord) {
      latestRecord = {
        date: today,
        clockIn: '',
        clockOut: '',
        workContent: '',
        isClockedIn: false,
        isClockedOut: false
      };
    }
    
    return {
      success: true,
      data: latestRecord
    };
  } catch (error) {
    Logger.log('getTodayStatus エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '勤怠状況の取得中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 今日の全業務記録を取得
 * @return {Object} 成功時は{success: true, data: {date: string, records: Array, totalRecords: number}}、失敗時は{success: false, message: string}
 */
function getTodayAllRecords() {
  try {
    const sheet = getSheet();
    const now = new Date();
    const today = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
    const lastRow = sheet.getLastRow();
    
    const records = [];
    
    // 今日の記録を全て取得
    for (let i = 2; i <= lastRow; i++) {
      const dateValue = sheet.getRange(i, 1).getValue();
      if (dateValue && Utilities.formatDate(new Date(dateValue), 'Asia/Tokyo', 'yyyy/MM/dd') === today) {
        const clockIn = sheet.getRange(i, 3).getValue();
        const clockOut = sheet.getRange(i, 4).getValue();
        const workContent = sheet.getRange(i, 7).getValue();
        
        records.push({
          clockIn: clockIn || '',
          clockOut: clockOut || '',
          workContent: workContent || '',
          isCompleted: !!(clockIn && clockOut)
        });
      }
    }
    
    return {
      success: true,
      data: {
        date: today,
        records: records,
        totalRecords: records.length
      }
    };
  } catch (error) {
    Logger.log('getTodayAllRecords エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '今日の記録取得中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 時刻文字列（HH:mm形式）を分に変換
 * @param {string} timeStr - 時刻文字列（例: "09:00"）
 * @return {number} 分（例: 540）
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
function getAllRecords() {
  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      // データがない場合
      return {
        success: true,
        data: []
      };
    }
    
    const records = [];
    
    // ヘッダー行を除いて、2行目から最終行まで処理
    for (let i = 2; i <= lastRow; i++) {
      const dateValue = sheet.getRange(i, 1).getValue(); // 稼働日
      const expenseItem = sheet.getRange(i, 2).getValue(); // 費目
      const startTime = sheet.getRange(i, 3).getValue(); // 開始時刻
      const endTime = sheet.getRange(i, 4).getValue(); // 終了時刻
      const breakTime = sheet.getRange(i, 5).getValue(); // 休憩時間
      const quantity = sheet.getRange(i, 6).getValue(); // 数量
      const workContent = sheet.getRange(i, 7).getValue(); // 業務内容
      
      // 日付を文字列に変換
      let dateStr = '';
      if (dateValue) {
        if (dateValue instanceof Date) {
          dateStr = Utilities.formatDate(dateValue, 'Asia/Tokyo', 'yyyy/MM/dd');
        } else {
          dateStr = dateValue.toString();
        }
      }
      
      // 時刻を文字列に変換
      let startTimeStr = '';
      let endTimeStr = '';
      let breakTimeStr = breakTime ? breakTime.toString() : '0:00';
      
      if (startTime) {
        if (startTime instanceof Date) {
          startTimeStr = Utilities.formatDate(startTime, 'Asia/Tokyo', 'HH:mm');
        } else {
          startTimeStr = startTime.toString();
        }
      }
      
      if (endTime) {
        if (endTime instanceof Date) {
          endTimeStr = Utilities.formatDate(endTime, 'Asia/Tokyo', 'HH:mm');
        } else {
          endTimeStr = endTime.toString();
        }
      }
      
      records.push({
        row: i, // 行番号（更新・削除時に使用）
        date: dateStr,
        expenseItem: expenseItem || '',
        startTime: startTimeStr,
        endTime: endTimeStr,
        breakTime: breakTimeStr,
        quantity: quantity || '',
        workContent: workContent || ''
      });
    }
    
    return {
      success: true,
      data: records
    };
  } catch (error) {
    Logger.log('getAllRecords エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '記録一覧取得中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 記録を更新
 * @param {number} row - 行番号
 * @param {Object} recordData - 更新データ {date, startTime, endTime, breakTime, workContent}
 * @return {Object} 成功時は{success: true, message: string}、失敗時は{success: false, message: string}
 */
function updateRecord(row, recordData) {
  try {
    // バリデーション
    if (!row || row < 2) {
      return {
        success: false,
        message: '無効な行番号です'
      };
    }
    
    if (!recordData) {
      return {
        success: false,
        message: '更新データが指定されていません'
      };
    }
    
    // 日付のバリデーション
    if (recordData.date && !validateDate(recordData.date)) {
      return {
        success: false,
        message: '日付の形式が正しくありません（yyyy/MM/dd形式で入力してください）'
      };
    }
    
    // 時刻のバリデーション（文字列に変換してからチェック）
    let startTimeStr = '';
    let endTimeStr = '';
    let breakTimeStr = '';
    
    if (recordData.startTime) {
      if (typeof recordData.startTime === 'string') {
        startTimeStr = recordData.startTime.trim();
      } else if (recordData.startTime instanceof Date) {
        startTimeStr = Utilities.formatDate(recordData.startTime, 'Asia/Tokyo', 'HH:mm');
      } else {
        startTimeStr = String(recordData.startTime).trim();
      }
      
      if (!validateTime(startTimeStr)) {
        return {
          success: false,
          message: '開始時刻の形式が正しくありません（HH:mm形式で入力してください）'
        };
      }
    }
    
    if (recordData.endTime) {
      if (typeof recordData.endTime === 'string') {
        endTimeStr = recordData.endTime.trim();
      } else if (recordData.endTime instanceof Date) {
        endTimeStr = Utilities.formatDate(recordData.endTime, 'Asia/Tokyo', 'HH:mm');
      } else {
        endTimeStr = String(recordData.endTime).trim();
      }
      
      if (!validateTime(endTimeStr)) {
        return {
          success: false,
          message: '終了時刻の形式が正しくありません（HH:mm形式で入力してください）'
        };
      }
    }
    
    if (recordData.breakTime) {
      if (typeof recordData.breakTime === 'string') {
        breakTimeStr = recordData.breakTime.trim();
      } else if (recordData.breakTime instanceof Date) {
        breakTimeStr = Utilities.formatDate(recordData.breakTime, 'Asia/Tokyo', 'HH:mm');
      } else {
        breakTimeStr = String(recordData.breakTime).trim();
      }
      
      if (!validateTime(breakTimeStr)) {
        return {
          success: false,
          message: '休憩時間の形式が正しくありません（HH:mm形式で入力してください）'
        };
      }
    }
    
    // 開始時間と終了時間の妥当性チェック（同じ日付内で開始時間が終了時間より遅い場合はエラー）
    if (startTimeStr && endTimeStr) {
      const startMinutes = timeStringToMinutes(startTimeStr);
      const endMinutes = timeStringToMinutes(endTimeStr);
      
      // 日付をまたぐ場合（例：22:00-02:00）は許可する
      // 日付をまたぐ場合は、開始時間が22:00以降で終了時間が02:00以前の場合のみ許可
      // それ以外で開始時間が終了時間より大きい場合はエラー
      if (startMinutes > endMinutes) {
        // 日付をまたぐ可能性をチェック
        const isCrossDate = (startMinutes >= 22 * 60 && endMinutes <= 2 * 60);
        
        if (!isCrossDate) {
          // 日付をまたがない場合で、開始時間が終了時間より遅い場合はエラー
          return {
            success: false,
            message: '開始時刻が終了時刻より遅い時間になっています。開始時刻は終了時刻より早い時間を入力してください。'
          };
        }
      }
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // 行番号の妥当性チェック
    if (row > lastRow) {
      return {
        success: false,
        message: '指定された行が存在しません'
      };
    }
    
    // データを更新
    if (recordData.date !== undefined) {
      sheet.getRange(row, 1).setValue(recordData.date);
    }
    
    if (recordData.startTime !== undefined) {
      sheet.getRange(row, 3).setNumberFormat('@').setValue(startTimeStr || recordData.startTime);
    }
    
    if (recordData.endTime !== undefined) {
      sheet.getRange(row, 4).setNumberFormat('@').setValue(endTimeStr || recordData.endTime);
    }
    
    if (recordData.breakTime !== undefined) {
      sheet.getRange(row, 5).setNumberFormat('@').setValue(breakTimeStr || recordData.breakTime || '0:00');
    }
    
    if (recordData.workContent !== undefined) {
      sheet.getRange(row, 7).setValue(recordData.workContent || '');
    }
    
    return {
      success: true,
      message: '記録を更新しました'
    };
  } catch (error) {
    Logger.log('updateRecord エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '記録更新中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 記録を削除
 * @param {number} row - 行番号
 * @return {Object} 成功時は{success: true, message: string}、失敗時は{success: false, message: string}
 */
function deleteRecord(row) {
  try {
    // バリデーション
    if (!row || row < 2) {
      return {
        success: false,
        message: '無効な行番号です'
      };
    }
    
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    
    // 行番号の妥当性チェック
    if (row > lastRow) {
      return {
        success: false,
        message: '指定された行が存在しません'
      };
    }
    
    // 行を削除
    sheet.deleteRow(row);
    
    return {
      success: true,
      message: '記録を削除しました'
    };
  } catch (error) {
    Logger.log('deleteRecord エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    return {
      success: false,
      message: '記録削除中にエラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * スプレッドシートを取得（年月ごとにシートを分ける）
 * @return {Sheet} 現在の月のシート
 * @throws {Error} シートの取得または作成に失敗した場合
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
function exportCSVToSheet() {
  try {
    const ui = SpreadsheetApp.getUi();
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // 現在の月のシート名を取得
    const currentSheetName = getCurrentSheetName();
    const sheet = spreadsheet.getSheetByName(currentSheetName);
    
    if (!sheet) {
      ui.alert('エラー', '現在の月のシート（' + currentSheetName + '）が見つかりません。', ui.ButtonSet.OK);
      return;
    }
    
    // シートデータを取得
    const sheetDataResult = getSheetData(currentSheetName);
    
    if (!sheetDataResult.success) {
      ui.alert('エラー', sheetDataResult.message, ui.ButtonSet.OK);
      return;
    }
    
    const headers = sheetDataResult.data.headers;
    const rows = sheetDataResult.data.rows;
    
    // CSV出力用のシートを作成または取得
    const csvSheetName = currentSheetName + '_CSV出力';
    let csvSheet = spreadsheet.getSheetByName(csvSheetName);
    
    if (!csvSheet) {
      csvSheet = spreadsheet.insertSheet(csvSheetName);
    } else {
      csvSheet.clear();
    }
    
    // ヘッダー行を出力
    csvSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // データ行を出力
    if (rows.length > 0) {
      csvSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
    
    // ヘッダー行を太字にする
    csvSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    
    // 列幅を自動調整
    for (let i = 1; i <= headers.length; i++) {
      csvSheet.autoResizeColumn(i);
    }
    
    // CSV出力シートに移動
    csvSheet.activate();
    
    ui.alert('完了', 'CSV出力が完了しました。\nシート名: ' + csvSheetName + '\n行数: ' + (rows.length + 1) + '行', ui.ButtonSet.OK);
    
    Logger.log('CSV出力成功: ' + csvSheetName + ' (' + rows.length + '行)');
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
function doGet(e) {
  // CSVダウンロードのリクエストかチェック
  if (e.parameter && e.parameter.sheetName) {
    return downloadCSV(e);
  }
  
  // 通常のWebアプリ表示
  return HtmlService.createHtmlOutput(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>勤怠管理アプリ</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    color: #333;
                    font-size: 24px;
                }
                .container {
                    width: 90%;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 20px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                header {
                    text-align: center;
                    margin-bottom: 40px;
                    color: white;
                }
                header h1 {
                    font-size: 48px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }
                .date-display {
                    font-size: 24px;
                    opacity: 0.9;
                    background: rgba(255,255,255,0.2);
                    padding: 16px 28px;
                    border-radius: 24px;
                    display: inline-block;
                    backdrop-filter: blur(10px);
                }
                main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 28px;
                }
                .status-card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }
                .status-card h2 {
                    font-size: 32px;
                    margin-bottom: 32px;
                    color: #333;
                    text-align: center;
                }
                .status-info {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .status-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 0;
                    border-bottom: 2px solid #f0f0f0;
                }
                .status-item:last-child {
                    border-bottom: none;
                }
                .status-item .label {
                    font-weight: 500;
                    color: #666;
                    font-size: 26px;
                }
                .status-item .value {
                    font-weight: 600;
                    color: #333;
                    text-align: right;
                    max-width: 250px;
                    word-wrap: break-word;
                    font-size: 26px;
                }
                .action-section {
                    text-align: center;
                }
                .action-btn {
                    width: 100%;
                    padding: 32px;
                    border: none;
                    border-radius: 20px;
                    font-size: 30px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                }
                .clock-in-btn {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                }
                .clock-in-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                }
                .clock-out-btn {
                    background: linear-gradient(135deg, #FF5722, #E64A19);
                    color: white;
                }
                .clock-out-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 87, 34, 0.4);
                }
                .spreadsheet-link-btn {
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                    color: white;
                }
                .spreadsheet-link-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
                }
                .spreadsheet-link-section {
                    text-align: center;
                    margin-top: 20px;
                }
                .csv-download-section {
                    margin-top: 28px;
                }
                .csv-download-card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }
                .csv-download-card h2 {
                    font-size: 32px;
                    margin-bottom: 32px;
                    color: #333;
                    text-align: center;
                }
                .csv-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .csv-label {
                    font-weight: 500;
                    color: #333;
                    font-size: 26px;
                }
                .csv-select {
                    width: 100%;
                    padding: 24px;
                    border: 3px solid #e0e0e0;
                    border-radius: 16px;
                    font-size: 24px;
                    font-family: inherit;
                    background: white;
                    cursor: pointer;
                    transition: border-color 0.3s ease;
                }
                .csv-select:focus {
                    outline: none;
                    border-color: #2196F3;
                    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
                }
                .csv-download-btn {
                    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
                    color: white;
                }
                .csv-download-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(156, 39, 176, 0.4);
                }
                .csv-download-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .btn-icon {
                    font-size: 36px;
                }
                .btn-text {
                    font-size: 30px;
                }
                .clock-out-section {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }
                .work-content-input {
                    margin-bottom: 28px;
                }
                .work-content-input label {
                    display: block;
                    font-weight: 500;
                    color: #333;
                    margin-bottom: 16px;
                    font-size: 26px;
                }
                .work-content-input textarea {
                    width: 100%;
                    padding: 24px;
                    border: 3px solid #e0e0e0;
                    border-radius: 16px;
                    font-size: 24px;
                    font-family: inherit;
                    resize: vertical;
                    min-height: 160px;
                    transition: border-color 0.3s ease;
                }
                .work-content-input textarea:focus {
                    outline: none;
                    border-color: #2196F3;
                    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
                }
                .message-area {
                    text-align: center;
                    padding: 24px;
                    border-radius: 16px;
                    font-weight: 500;
                    min-height: 20px;
                    font-size: 24px;
                }
                .message-success {
                    background: #E8F5E8;
                    color: #2E7D32;
                    border: 1px solid #C8E6C9;
                }
                .message-error {
                    background: #FFEBEE;
                    color: #C62828;
                    border: 1px solid #FFCDD2;
                }
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    color: white;
                    font-weight: 500;
                    font-size: 24px;
                }
                .spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .fade-in {
                    animation: fadeIn 0.5s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .slide-up {
                    animation: slideUp 0.3s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .records-section {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                }
                .records-section h2 {
                    font-size: 32px;
                    margin-bottom: 32px;
                    color: #333;
                    text-align: center;
                }
                .records-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 20px;
                }
                .records-table th,
                .records-table td {
                    padding: 16px;
                    text-align: left;
                    border-bottom: 1px solid #e0e0e0;
                }
                .records-table th {
                    background: #f5f5f5;
                    font-weight: 600;
                    color: #333;
                    position: sticky;
                    top: 0;
                }
                .records-table tr:hover {
                    background: #f9f9f9;
                }
                .records-table td {
                    color: #666;
                }
                .action-buttons {
                    display: flex;
                    gap: 12px;
                }
                .edit-btn, .delete-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    font-size: 18px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .edit-btn {
                    background: #2196F3;
                    color: white;
                }
                .edit-btn:hover {
                    background: #1976D2;
                    transform: translateY(-1px);
                }
                .delete-btn {
                    background: #F44336;
                    color: white;
                }
                .delete-btn:hover {
                    background: #D32F2F;
                    transform: translateY(-1px);
                }
                .modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.5);
                    overflow: auto;
                }
                .modal-content {
                    background-color: white;
                    margin: 5% auto;
                    padding: 40px;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 600px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }
                .modal-header {
                    font-size: 32px;
                    font-weight: 600;
                    margin-bottom: 32px;
                    color: #333;
                }
                .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .form-group label {
                    font-weight: 500;
                    color: #333;
                    font-size: 24px;
                }
                .form-group input,
                .form-group textarea,
                .form-group select {
                    width: 100%;
                    padding: 20px;
                    border: 3px solid #e0e0e0;
                    border-radius: 16px;
                    font-size: 22px;
                    font-family: inherit;
                    transition: border-color 0.3s ease;
                }
                .form-group select {
                    font-size: 28px;
                    cursor: pointer;
                }
                .form-group .time-select-container {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .form-group .time-select-container select {
                    flex: 1;
                    font-size: 28px;
                }
                .form-group .time-select-container span {
                    font-size: 28px;
                    font-weight: bold;
                }
                .form-group .date-select-container {
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }
                .form-group .date-select-container select {
                    flex: 1;
                    font-size: 24px;
                }
                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: #2196F3;
                    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
                }
                .form-group textarea {
                    resize: vertical;
                    min-height: 120px;
                }
                .form-actions {
                    display: flex;
                    gap: 16px;
                    margin-top: 24px;
                }
                .form-btn {
                    flex: 1;
                    padding: 24px;
                    border: none;
                    border-radius: 16px;
                    font-size: 24px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .form-btn-cancel {
                    background: #e0e0e0;
                    color: #333;
                }
                .form-btn-cancel:hover {
                    background: #d0d0d0;
                }
                .form-btn-submit {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                }
                .form-btn-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
                }
                .error-message {
                    color: #F44336;
                    font-size: 20px;
                    margin-top: 8px;
                }
                .no-records {
                    text-align: center;
                    padding: 40px;
                    color: #999;
                    font-size: 24px;
                }
                /* ナビゲーションタブ */
                .nav-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 28px;
                    background: rgba(255,255,255,0.1);
                    padding: 8px;
                    border-radius: 16px;
                    backdrop-filter: blur(10px);
                }
                .nav-tab {
                    flex: 1;
                    padding: 16px 24px;
                    border: none;
                    border-radius: 12px;
                    font-size: 22px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: rgba(255,255,255,0.2);
                    color: white;
                }
                .nav-tab:hover {
                    background: rgba(255,255,255,0.3);
                    transform: translateY(-2px);
                }
                .nav-tab.active {
                    background: white;
                    color: #667eea;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                /* ページコンテンツ */
                .page-content {
                    display: none;
                }
                .page-content.active {
                    display: block;
                    animation: fadeIn 0.3s ease-in;
                }
                /* 月選択セクション */
                .month-select-section {
                    margin-bottom: 28px;
                }
                .month-select-label {
                    font-weight: 500;
                    color: #333;
                    font-size: 26px;
                    margin-bottom: 16px;
                    display: block;
                }
                .month-select {
                    width: 100%;
                    padding: 24px;
                    border: 3px solid #e0e0e0;
                    border-radius: 16px;
                    font-size: 24px;
                    font-family: inherit;
                    background: white;
                    cursor: pointer;
                    transition: border-color 0.3s ease;
                }
                .month-select:focus {
                    outline: none;
                    border-color: #2196F3;
                    box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.1);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>勤怠管理アプリ</h1>
                    <div class="date-display" id="currentDate"></div>
                </header>

                <main>
                    <!-- ナビゲーションタブ -->
                    <div class="nav-tabs">
                        <button class="nav-tab active" data-page="0">業務入力</button>
                        <button class="nav-tab" data-page="1">労働時間</button>
                        <button class="nav-tab" data-page="2">記録一覧</button>
                    </div>

                    <!-- ページ0: 業務入力 -->
                    <div class="page-content active" id="page0">
                        <div class="status-card" id="statusCard">
                            <h2>現在の業務状況 <span style="font-size: 22px; color: #666; font-weight: normal;" id="currentMonth"></span></h2>
                            <div class="status-info">
                                <div class="status-item">
                                    <span class="label">出勤時刻:</span>
                                    <span class="value" id="clockInTime">-</span>
                                </div>
                                <div class="status-item">
                                    <span class="label">退勤時刻:</span>
                                    <span class="value" id="clockOutTime">-</span>
                                </div>
                                <div class="status-item">
                                    <span class="label">業務内容:</span>
                                    <span class="value" id="workContent">-</span>
                                </div>
                            </div>
                        </div>

                        <div class="action-section">
                            <button id="clockInBtn" class="action-btn clock-in-btn">
                                <span class="btn-icon">🕐</span>
                                <span class="btn-text">出勤</span>
                            </button>
                        </div>

                        <div class="clock-out-section" id="clockOutSection" style="display: none;">
                            <div class="work-content-input">
                                <label for="workContentInput">業務内容を入力してください:</label>
                                <textarea 
                                    id="workContentInput" 
                                    placeholder="今日の業務内容を入力..."
                                    rows="4"
                                ></textarea>
                            </div>
                            <button id="clockOutBtn" class="action-btn clock-out-btn">
                                <span class="btn-icon">🏁</span>
                                <span class="btn-text">この業務を終了</span>
                            </button>
                        </div>

                        <div class="message-area" id="messageArea"></div>

                        <div class="spreadsheet-link-section">
                            <button id="openSpreadsheetBtn" class="action-btn spreadsheet-link-btn">
                                <span class="btn-icon">📊</span>
                                <span class="btn-text">スプレッドシートを開く</span>
                            </button>
                        </div>
                    </div>

                    <!-- ページ1: 労働時間 -->
                    <div class="page-content" id="page1">
                        <div class="status-card" id="workHoursCard">
                            <h2>労働時間</h2>
                            <div class="month-select-section">
                                <label for="monthSelect" class="month-select-label">月を選択:</label>
                                <select id="monthSelect" class="month-select">
                                    <option value="">読み込み中...</option>
                                </select>
                            </div>
                            <div class="status-info">
                                <div class="status-item">
                                    <span class="label">総労働時間:</span>
                                    <span class="value" id="monthlyWorkHours" style="color: #2196F3; font-size: 32px;">-</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- ページ2: 記録一覧 -->
                    <div class="page-content" id="page2">
                        <div class="records-section">
                            <h2>記録一覧</h2>
                            <div id="recordsContainer">
                                <div class="no-records">読み込み中...</div>
                            </div>
                        </div>
                    </div>

                </main>

                <footer>
                    <div class="loading" id="loading" style="display: none;">
                        <div class="spinner"></div>
                        <span>処理中...</span>
                    </div>
                </footer>
            </div>

            <!-- 編集モーダル -->
            <div id="editModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">記録を編集</div>
                    <form class="modal-form" id="editForm">
                        <div class="form-group">
                            <label for="editDate">稼働日</label>
                            <div class="date-select-container">
                                <select id="editDateYear" required>
                                    <option value="">年</option>
                                </select>
                                <select id="editDateMonth" required>
                                    <option value="">月</option>
                                </select>
                                <select id="editDateDay" required>
                                    <option value="">日</option>
                                </select>
                            </div>
                            <div class="error-message" id="editDateError"></div>
                        </div>
                        <div class="form-group">
                            <label for="editStartTime">開始時刻</label>
                            <div class="time-select-container">
                                <select id="editStartTimeHour" required>
                                    <option value="">時</option>
                                </select>
                                <span>:</span>
                                <select id="editStartTimeMinute" required>
                                    <option value="">分</option>
                                </select>
                            </div>
                            <div class="error-message" id="editStartTimeError"></div>
                        </div>
                        <div class="form-group">
                            <label for="editEndTime">終了時刻</label>
                            <div class="time-select-container">
                                <select id="editEndTimeHour">
                                    <option value="">時</option>
                                </select>
                                <span>:</span>
                                <select id="editEndTimeMinute">
                                    <option value="">分</option>
                                </select>
                            </div>
                            <div class="error-message" id="editEndTimeError"></div>
                        </div>
                        <div class="form-group">
                            <label for="editBreakTime">休憩時間</label>
                            <div class="time-select-container">
                                <select id="editBreakTimeHour">
                                    <option value="0">0</option>
                                </select>
                                <span>:</span>
                                <select id="editBreakTimeMinute">
                                    <option value="00">00</option>
                                </select>
                            </div>
                            <div class="error-message" id="editBreakTimeError"></div>
                        </div>
                        <div class="form-group">
                            <label for="editWorkContent">業務内容</label>
                            <textarea id="editWorkContent" placeholder="業務内容を入力..."></textarea>
                        </div>
                        <input type="hidden" id="editRow">
                        <div class="form-actions">
                            <button type="button" class="form-btn form-btn-cancel" onclick="closeEditModal()">キャンセル</button>
                            <button type="submit" class="form-btn form-btn-submit">更新</button>
                        </div>
                    </form>
                </div>
            </div>

            <script>
                // 日付選択用のセレクトボックスを初期化
                function initializeDateSelects() {
                    const currentYear = new Date().getFullYear();
                    
                    // 年（現在の年から前後5年）
                    const yearSelect = document.getElementById('editDateYear');
                    if (yearSelect) {
                        while (yearSelect.children.length > 1) {
                            yearSelect.removeChild(yearSelect.lastChild);
                        }
                        for (let i = currentYear - 5; i <= currentYear + 5; i++) {
                            const option = document.createElement('option');
                            option.value = i;
                            option.textContent = i + '年';
                            yearSelect.appendChild(option);
                        }
                    }
                    
                    // 月（1-12）
                    const monthSelect = document.getElementById('editDateMonth');
                    if (monthSelect) {
                        while (monthSelect.children.length > 1) {
                            monthSelect.removeChild(monthSelect.lastChild);
                        }
                        for (let i = 1; i <= 12; i++) {
                            const option = document.createElement('option');
                            option.value = String(i).padStart(2, '0');
                            option.textContent = i + '月';
                            monthSelect.appendChild(option);
                        }
                    }
                    
                    // 日（1-31）は月が選択されたときに動的に更新
                    updateDaySelect();
                }
                
                // 日付の日選択を更新（月と年に基づいて）
                function updateDaySelect() {
                    const yearSelect = document.getElementById('editDateYear');
                    const monthSelect = document.getElementById('editDateMonth');
                    const daySelect = document.getElementById('editDateDay');
                    
                    if (!yearSelect || !monthSelect || !daySelect) {
                        return;
                    }
                    
                    const year = parseInt(yearSelect.value, 10);
                    const month = parseInt(monthSelect.value, 10);
                    
                    // 日選択をクリア
                    while (daySelect.children.length > 1) {
                        daySelect.removeChild(daySelect.lastChild);
                    }
                    
                    if (year && month) {
                        // その月の日数を取得
                        const daysInMonth = new Date(year, month, 0).getDate();
                        for (let i = 1; i <= daysInMonth; i++) {
                            const option = document.createElement('option');
                            option.value = String(i).padStart(2, '0');
                            option.textContent = i + '日';
                            daySelect.appendChild(option);
                        }
                    }
                }
                
                // 日付文字列（yyyy/MM/dd）を年・月・日に分割
                function parseDate(dateStr) {
                    if (!dateStr || typeof dateStr !== 'string') {
                        return { year: '', month: '', day: '' };
                    }
                    const parts = dateStr.split('/');
                    if (parts.length !== 3) {
                        return { year: '', month: '', day: '' };
                    }
                    return {
                        year: parts[0] || '',
                        month: parts[1] || '',
                        day: parts[2] || ''
                    };
                }
                
                // 年・月・日から日付文字列（yyyy/MM/dd）を生成
                function formatDate(year, month, day) {
                    if (!year || !month || !day) {
                        return '';
                    }
                    return year + '/' + month + '/' + day;
                }
                
                // 時刻選択用のセレクトボックスを初期化
                function initializeTimeSelects() {
                    // 時間（0-23）のオプションを生成
                    const hourSelects = ['editStartTimeHour', 'editEndTimeHour', 'editBreakTimeHour'];
                    hourSelects.forEach(function(selectId) {
                        const select = document.getElementById(selectId);
                        if (select) {
                            // 既存のオプションをクリア（最初のオプション以外）
                            while (select.children.length > 1) {
                                select.removeChild(select.lastChild);
                            }
                            // 0-23のオプションを追加
                            for (let i = 0; i <= 23; i++) {
                                const option = document.createElement('option');
                                option.value = i;
                                option.textContent = i;
                                select.appendChild(option);
                            }
                        }
                    });
                    
                    // 分（0-59）のオプションを生成
                    const minuteSelects = ['editStartTimeMinute', 'editEndTimeMinute', 'editBreakTimeMinute'];
                    minuteSelects.forEach(function(selectId) {
                        const select = document.getElementById(selectId);
                        if (select) {
                            // 既存のオプションをクリア（最初のオプション以外）
                            while (select.children.length > 1) {
                                select.removeChild(select.lastChild);
                            }
                            // 0-59のオプションを追加
                            for (let i = 0; i <= 59; i++) {
                                const option = document.createElement('option');
                                option.value = String(i).padStart(2, '0');
                                option.textContent = String(i).padStart(2, '0');
                                select.appendChild(option);
                            }
                        }
                    });
                }
                
                // 時刻文字列（HH:mm）を時間と分に分割
                function parseTime(timeStr) {
                    if (!timeStr || typeof timeStr !== 'string') {
                        return { hour: '', minute: '' };
                    }
                    const parts = timeStr.split(':');
                    if (parts.length !== 2) {
                        return { hour: '', minute: '' };
                    }
                    const hour = parseInt(parts[0], 10);
                    const minute = parts[1];
                    return {
                        hour: (isNaN(hour) || hour < 0 || hour > 23) ? '' : String(hour),
                        minute: minute || ''
                    };
                }
                
                // 時間と分から時刻文字列（HH:mm）を生成
                function formatTime(hour, minute) {
                    if (hour === '' || minute === '') {
                        return '';
                    }
                    const h = String(hour).padStart(2, '0');
                    const m = String(minute).padStart(2, '0');
                    return h + ':' + m;
                }
                
                // 状態管理
                let currentStatus = {
                    isClockedIn: false,
                    isClockedOut: false,
                    clockIn: '',
                    clockOut: '',
                    workContent: ''
                };

                // 初期化関数
                function initializeApp() {
                    try {
                        console.log('=== initializeApp 開始 ===');
                        initializeDateSelects();
                        initializeTimeSelects();
                        updateCurrentDate();
                        loadTodayStatus();
                        setupEventListeners();
                        setupPageNavigation();
                        console.log('=== initializeApp 完了 ===');
                    } catch (error) {
                        console.error('初期化エラー:', error);
                        console.error('エラースタック:', error.stack);
                    }
                }

                function updateCurrentDate() {
                    try {
                        const now = new Date();
                        const options = { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            weekday: 'long'
                        };
                        const currentDateEl = document.getElementById('currentDate');
                        if (currentDateEl) {
                            currentDateEl.textContent = now.toLocaleDateString('ja-JP', options);
                        }
                        
                        // 現在の年月を表示
                        const year = now.getFullYear();
                        const month = now.getMonth() + 1;
                        const currentMonthEl = document.getElementById('currentMonth');
                        if (currentMonthEl) {
                            currentMonthEl.textContent = '(' + year + '年' + month + '月シート)';
                        }
                    } catch (error) {
                        console.error('updateCurrentDate エラー:', error);
                    }
                }

                function setupEventListeners() {
                    try {
                        // 各要素が存在するかチェックしてからイベントリスナーを設定
                        const clockInBtn = document.getElementById('clockInBtn');
                        const clockOutBtn = document.getElementById('clockOutBtn');
                        const openSpreadsheetBtn = document.getElementById('openSpreadsheetBtn');
                        const monthSelect = document.getElementById('monthSelect');
                        const editForm = document.getElementById('editForm');
                        const editModal = document.getElementById('editModal');
                        
                        console.log('setupEventListeners: 要素チェック', {
                            clockInBtn: !!clockInBtn,
                            clockOutBtn: !!clockOutBtn,
                            openSpreadsheetBtn: !!openSpreadsheetBtn,
                            monthSelect: !!monthSelect,
                            editForm: !!editForm,
                            editModal: !!editModal
                        });
                        
                        if (clockInBtn) {
                            clockInBtn.addEventListener('click', handleClockIn);
                            console.log('clockInBtn イベントリスナー設定完了');
                        } else {
                            console.warn('clockInBtn が見つかりません');
                        }
                        if (clockOutBtn) {
                            clockOutBtn.addEventListener('click', handleClockOut);
                            console.log('clockOutBtn イベントリスナー設定完了');
                        } else {
                            console.warn('clockOutBtn が見つかりません');
                        }
                        if (openSpreadsheetBtn) {
                            openSpreadsheetBtn.addEventListener('click', handleOpenSpreadsheet);
                            console.log('openSpreadsheetBtn イベントリスナー設定完了');
                        } else {
                            console.warn('openSpreadsheetBtn が見つかりません');
                        }
                        if (monthSelect) {
                            monthSelect.addEventListener('change', handleMonthSelectChange);
                            console.log('monthSelect イベントリスナー設定完了');
                        } else {
                            console.warn('monthSelect が見つかりません（ページ1にのみ存在）');
                        }
                        if (editForm) {
                            editForm.addEventListener('submit', handleEditSubmit);
                            console.log('editForm イベントリスナー設定完了');
                        } else {
                            console.warn('editForm が見つかりません');
                        }
                        
                        // 日付選択の年月変更時に日の選択を更新
                        const editDateYear = document.getElementById('editDateYear');
                        const editDateMonth = document.getElementById('editDateMonth');
                        if (editDateYear) {
                            editDateYear.addEventListener('change', updateDaySelect);
                            console.log('editDateYear イベントリスナー設定完了');
                        }
                        if (editDateMonth) {
                            editDateMonth.addEventListener('change', updateDaySelect);
                            console.log('editDateMonth イベントリスナー設定完了');
                        }
                        
                        // モーダルの外側をクリックしたら閉じる
                        if (editModal) {
                            editModal.addEventListener('click', function(e) {
                                if (e.target === this) {
                                    closeEditModal();
                                }
                            });
                            console.log('editModal イベントリスナー設定完了');
                        } else {
                            console.warn('editModal が見つかりません');
                        }
                        
                        console.log('setupEventListeners 完了');
                    } catch (error) {
                        console.error('setupEventListeners エラー:', error);
                        console.error('エラースタック:', error.stack);
                    }
                }

                // ページネーション機能
                function setupPageNavigation() {
                    const navTabs = document.querySelectorAll('.nav-tab');
                    navTabs.forEach(function(tab) {
                        tab.addEventListener('click', function() {
                            const pageIndex = parseInt(this.getAttribute('data-page'));
                            switchPage(pageIndex);
                        });
                    });
                }

                function switchPage(pageIndex) {
                    // すべてのタブとページを非アクティブにする
                    document.querySelectorAll('.nav-tab').forEach(function(tab) {
                        tab.classList.remove('active');
                    });
                    document.querySelectorAll('.page-content').forEach(function(page) {
                        page.classList.remove('active');
                    });
                    
                    // 選択されたタブとページをアクティブにする
                    document.querySelectorAll('.nav-tab')[pageIndex].classList.add('active');
                    document.getElementById('page' + pageIndex).classList.add('active');
                    
                    // ページに応じてデータを読み込む
                    if (pageIndex === 1) {
                        // 労働時間ページを開いたときに月選択を読み込む
                        loadMonthSelect();
                    } else if (pageIndex === 2) {
                        // 記録一覧ページを開いたときに記録を読み込む
                        loadAllRecords();
                    }
                }

                function handleClockIn() {
                    console.log('=== handleClockIn 開始 ===');
                    const clientNow = new Date();
                    console.log('クライアント側の現在時刻:', clientNow);
                    console.log('クライアント側の時刻（ローカル）:', clientNow.toLocaleString('ja-JP'));
                    console.log('現在のステータス:', currentStatus);
                    
                    // 退勤済みの場合は新しい業務開始を許可
                    if (currentStatus.isClockedIn && !currentStatus.isClockedOut) {
                        console.log('エラー: すでに出勤済み（退勤前）');
                        showMessage('既に出勤済みです', 'error');
                        return;
                    }

                    setLoading(true);
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            setLoading(false);
                            console.log('出勤記録結果:', result);
                            console.log('サーバーから返された時刻:', result.data ? result.data.clockIn : 'なし');
                            if (result.success) {
                                showMessage(result.message, 'success');
                                // 状態を再読み込みして最新の情報を取得
                                loadTodayStatus();
                                // 労働時間も更新
                                loadMonthlyWorkHours();
                                // 記録一覧も更新
                                loadAllRecords();
                            } else {
                                showMessage(result.message, 'error');
                            }
                        })
                        .withFailureHandler(function(error) {
                            setLoading(false);
                            console.error('出勤記録エラー:', error);
                            showMessage('エラーが発生しました: ' + error.message, 'error');
                        })
                        .recordClockIn();
                }

                function handleClockOut() {
                    console.log('=== handleClockOut 開始 ===');
                    console.log('現在のステータス:', currentStatus);
                    
                    if (!currentStatus.isClockedIn) {
                        showMessage('先に出勤を記録してください', 'error');
                        return;
                    }

                    if (currentStatus.isClockedOut) {
                        showMessage('既に退勤済みです', 'error');
                        return;
                    }

                    const workContent = document.getElementById('workContentInput').value.trim();
                    if (!workContent) {
                        showMessage('業務内容を入力してください', 'error');
                        document.getElementById('workContentInput').focus();
                        return;
                    }

                    setLoading(true);
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            setLoading(false);
                            console.log('退勤記録結果:', result);
                            if (result.success) {
                                showMessage(result.message, 'success');
                                // 状態を再読み込みして最新の情報を取得
                                loadTodayStatus();
                                // 労働時間も更新
                                loadMonthlyWorkHours();
                                // 記録一覧も更新
                                loadAllRecords();
                            } else {
                                showMessage(result.message, 'error');
                            }
                        })
                        .withFailureHandler(function(error) {
                            setLoading(false);
                            console.error('退勤記録エラー:', error);
                            showMessage('エラーが発生しました: ' + error.message, 'error');
                        })
                        .recordClockOut(workContent);
                }

                function handleOpenSpreadsheet() {
                    console.log('=== handleOpenSpreadsheet 開始 ===');
                    setLoading(true);
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            setLoading(false);
                            console.log('スプレッドシートURL取得結果:', result);
                            if (result.success) {
                                // 新しいタブでスプレッドシートを開く
                                window.open(result.url, '_blank');
                                showMessage('スプレッドシートを開きました', 'success');
                            } else {
                                showMessage(result.message || 'スプレッドシートURLの取得に失敗しました', 'error');
                            }
                        })
                        .withFailureHandler(function(error) {
                            setLoading(false);
                            console.error('スプレッドシートURL取得エラー:', error);
                            showMessage('エラーが発生しました: ' + (error.message || error.toString()), 'error');
                        })
                        .getSpreadsheetUrl();
                }


                function loadTodayStatus() {
                    console.log('=== loadTodayStatus 開始 ===');
                    setLoading(true);
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            setLoading(false);
                            console.log('getTodayStatus結果:', result);
                            console.log('resultの型:', typeof result);
                            console.log('resultがnull?', result === null);
                            
                            if (!result) {
                                console.error('resultがnullまたはundefined');
                                showMessage('サーバーから応答がありませんでした', 'error');
                                return;
                            }
                            
                            if (result.success) {
                                currentStatus = {
                                    isClockedIn: result.data.isClockedIn,
                                    isClockedOut: result.data.isClockedOut,
                                    clockIn: result.data.clockIn,
                                    clockOut: result.data.clockOut,
                                    workContent: result.data.workContent
                                };
                                console.log('currentStatus更新:', currentStatus);
                                updateUI();
                            } else {
                                console.error('状態取得失敗:', result.message);
                                showMessage('勤怠状況の取得に失敗しました: ' + (result.message || ''), 'error');
                            }
                        })
                        .withFailureHandler(function(error) {
                            setLoading(false);
                            console.error('getTodayStatusエラー:', error);
                            console.error('エラーの型:', typeof error);
                            console.error('エラー内容:', JSON.stringify(error));
                            showMessage('エラーが発生しました: ' + (error.message || error.toString()), 'error');
                        })
                        .getTodayStatus();
                }

                function loadMonthlyWorkHours(sheetName) {
                    console.log('=== loadMonthlyWorkHours 開始 ===');
                    if (sheetName) {
                        console.log('指定されたシート名:', sheetName);
                    }
                    
                    // 労働時間表示要素が存在するかチェック
                    const monthlyWorkHours = document.getElementById('monthlyWorkHours');
                    if (!monthlyWorkHours) {
                        console.warn('monthlyWorkHoursが見つかりません（ページ1が表示されていない可能性があります）');
                        return;
                    }
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            console.log('getMonthlyWorkHours結果:', result);
                            
                            if (!result) {
                                console.error('resultがnullまたはundefined');
                                monthlyWorkHours.textContent = '取得失敗';
                                return;
                            }
                            
                            if (result.success && result.data) {
                                const formatted = result.data.formatted || '0時間0分';
                                monthlyWorkHours.textContent = formatted;
                                console.log('労働時間:', formatted);
                            } else {
                                console.error('労働時間取得失敗:', result.message);
                                monthlyWorkHours.textContent = '取得失敗';
                            }
                        })
                        .withFailureHandler(function(error) {
                            console.error('getMonthlyWorkHoursエラー:', error);
                            monthlyWorkHours.textContent = 'エラー';
                        })
                        .getMonthlyWorkHours(sheetName);
                }

                // 月選択ドロップダウンを読み込む
                function loadMonthSelect() {
                    console.log('=== loadMonthSelect 開始 ===');
                    const monthSelect = document.getElementById('monthSelect');
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            console.log('シート一覧取得結果:', result);
                            if (result.success) {
                                const sheets = result.data.sheets;
                                
                                // ドロップダウンをクリア
                                monthSelect.innerHTML = '';
                                
                                if (sheets.length === 0) {
                                    monthSelect.innerHTML = '<option value=\\"\\">シートが見つかりません</option>';
                                } else {
                                    // 現在の月を取得
                                    const now = new Date();
                                    const currentYear = now.getFullYear();
                                    const currentMonth = now.getMonth() + 1;
                                    const currentSheetName = currentYear + '年' + currentMonth + '月';
                                    
                                    // シート一覧を追加
                                    for (let i = 0; i < sheets.length; i++) {
                                        const option = document.createElement('option');
                                        option.value = sheets[i];
                                        option.textContent = sheets[i];
                                        // 現在の月をデフォルト選択
                                        if (sheets[i] === currentSheetName) {
                                            option.selected = true;
                                        }
                                        monthSelect.appendChild(option);
                                    }
                                    
                                    // デフォルトで現在の月の労働時間を読み込む
                                    loadMonthlyWorkHours(currentSheetName);
                                }
                            } else {
                                monthSelect.innerHTML = '<option value=\\"\\">エラー: ' + (result.message || 'シート一覧の取得に失敗しました') + '</option>';
                            }
                        })
                        .withFailureHandler(function(error) {
                            console.error('シート一覧取得エラー:', error);
                            monthSelect.innerHTML = '<option value=\\"\\">エラーが発生しました</option>';
                        })
                        .getAvailableSheets();
                }

                // 月選択変更時の処理
                function handleMonthSelectChange() {
                    const monthSelect = document.getElementById('monthSelect');
                    const selectedSheet = monthSelect.value;
                    
                    if (selectedSheet) {
                        loadMonthlyWorkHours(selectedSheet);
                    } else {
                        document.getElementById('monthlyWorkHours').textContent = '-';
                    }
                }

                function updateUI() {
                    console.log('=== updateUI 開始 ===');
                    console.log('currentStatus:', currentStatus);
                    
                    // 勤怠情報を更新
                    document.getElementById('clockInTime').textContent = currentStatus.clockIn || '-';
                    document.getElementById('clockOutTime').textContent = currentStatus.clockOut || '-';
                    document.getElementById('workContent').textContent = currentStatus.workContent || '-';

                    const clockInBtn = document.getElementById('clockInBtn');
                    const clockOutSection = document.getElementById('clockOutSection');
                    const clockOutBtn = document.getElementById('clockOutBtn');
                    const workContentInput = document.getElementById('workContentInput');

                    // 出勤済み（退勤前）の場合 - 退勤ボタンのみ表示
                    if (currentStatus.isClockedIn && !currentStatus.isClockedOut) {
                        console.log('状態: 出勤済み（退勤前）');
                        clockInBtn.style.display = 'none';
                        clockOutSection.style.display = 'block';
                        clockOutSection.classList.add('slide-up');
                        clockOutBtn.disabled = false;
                        clockOutBtn.innerHTML = '<span class=\\"btn-icon\\">🏁</span><span class=\\"btn-text\\">この業務を終了</span>';
                        workContentInput.disabled = false;
                        workContentInput.value = '';
                    }
                    // 退勤済み or 未出勤の場合 - 出勤ボタンを表示
                    else {
                        console.log('状態: 退勤済みまたは未出勤');
                        clockInBtn.style.display = 'flex';
                        clockOutSection.style.display = 'none';
                        
                        // 退勤済みの場合はボタンのテキストを変更
                        if (currentStatus.isClockedOut) {
                            console.log('ボタン: 次の業務を開始');
                            clockInBtn.querySelector('.btn-text').textContent = '次の業務を開始';
                        } else {
                            console.log('ボタン: 出勤');
                            clockInBtn.querySelector('.btn-text').textContent = '出勤';
                        }
                    }
                }

                function showMessage(message, type = 'success') {
                    const messageArea = document.getElementById('messageArea');
                    messageArea.textContent = message;
                    messageArea.className = 'message-area message-' + type + ' fade-in';
                    
                    setTimeout(() => {
                        messageArea.textContent = '';
                        messageArea.className = 'message-area';
                    }, 3000);
                }

                function setLoading(isLoading) {
                    document.getElementById('loading').style.display = isLoading ? 'flex' : 'none';
                    document.getElementById('clockInBtn').disabled = isLoading;
                    document.getElementById('clockOutBtn').disabled = isLoading;
                }

                // 記録一覧を読み込む
                function loadAllRecords() {
                    console.log('=== loadAllRecords 開始 ===');
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            console.log('getAllRecords結果:', result);
                            
                            if (!result) {
                                console.error('resultがnullまたはundefined');
                                document.getElementById('recordsContainer').innerHTML = '<div class="no-records">データの取得に失敗しました</div>';
                                return;
                            }
                            
                            if (result.success && result.data) {
                                renderRecordsTable(result.data);
                            } else {
                                console.error('記録取得失敗:', result.message);
                                document.getElementById('recordsContainer').innerHTML = '<div class="no-records">データの取得に失敗しました: ' + (result.message || '') + '</div>';
                            }
                        })
                        .withFailureHandler(function(error) {
                            console.error('getAllRecordsエラー:', error);
                            document.getElementById('recordsContainer').innerHTML = '<div class="no-records">エラーが発生しました</div>';
                        })
                        .getAllRecords();
                }

                // 記録一覧テーブルを描画
                function renderRecordsTable(records) {
                    const container = document.getElementById('recordsContainer');
                    
                    if (!records || records.length === 0) {
                        container.innerHTML = '<div class="no-records">記録がありません</div>';
                        return;
                    }
                    
                    let html = '<table class="records-table">';
                    html += '<thead><tr>';
                    html += '<th>稼働日</th>';
                    html += '<th>開始時刻</th>';
                    html += '<th>終了時刻</th>';
                    html += '<th>休憩時間</th>';
                    html += '<th>業務内容</th>';
                    html += '<th>操作</th>';
                    html += '</tr></thead>';
                    html += '<tbody>';
                    
                    // 新しい記録が上に来るように逆順に表示
                    for (let i = records.length - 1; i >= 0; i--) {
                        const record = records[i];
                        html += '<tr>';
                        html += '<td>' + (record.date || '-') + '</td>';
                        html += '<td>' + (record.startTime || '-') + '</td>';
                        html += '<td>' + (record.endTime || '-') + '</td>';
                        html += '<td>' + (record.breakTime || '0:00') + '</td>';
                        html += '<td>' + (record.workContent || '-') + '</td>';
                        html += '<td><div class="action-buttons">';
                        html += '<button class="edit-btn" onclick="openEditModal(' + record.row + ')">編集</button>';
                        html += '<button class="delete-btn" onclick="handleDelete(' + record.row + ')">削除</button>';
                        html += '</div></td>';
                        html += '</tr>';
                    }
                    
                    html += '</tbody></table>';
                    container.innerHTML = html;
                }

                // 編集モーダルを開く
                function openEditModal(row) {
                    console.log('=== openEditModal 開始 ===', row);
                    
                    // 記録データを取得
                    google.script.run
                        .withSuccessHandler(function(result) {
                            if (result.success && result.data) {
                                const record = result.data.find(r => r.row === row);
                                if (record) {
                                    document.getElementById('editRow').value = record.row;
                                    
                                    // 日付をセレクトボックスに設定
                                    const date = parseDate(record.date || '');
                                    document.getElementById('editDateYear').value = date.year;
                                    document.getElementById('editDateMonth').value = date.month;
                                    // 月が設定されたら日の選択を更新
                                    if (date.month) {
                                        updateDaySelect();
                                    }
                                    document.getElementById('editDateDay').value = date.day;
                                    
                                    // 開始時刻をセレクトボックスに設定
                                    const startTime = parseTime(record.startTime || '');
                                    document.getElementById('editStartTimeHour').value = startTime.hour;
                                    document.getElementById('editStartTimeMinute').value = startTime.minute;
                                    
                                    // 終了時刻をセレクトボックスに設定
                                    const endTime = parseTime(record.endTime || '');
                                    document.getElementById('editEndTimeHour').value = endTime.hour;
                                    document.getElementById('editEndTimeMinute').value = endTime.minute;
                                    
                                    // 休憩時間をセレクトボックスに設定
                                    const breakTime = parseTime(record.breakTime || '0:00');
                                    document.getElementById('editBreakTimeHour').value = breakTime.hour || '0';
                                    document.getElementById('editBreakTimeMinute').value = breakTime.minute || '00';
                                    
                                    // セレクトボックスが存在しない場合のエラーハンドリング
                                    if (!document.getElementById('editStartTimeHour') || !document.getElementById('editStartTimeMinute')) {
                                        console.error('時刻選択セレクトボックスが見つかりません');
                                    }
                                    
                                    document.getElementById('editWorkContent').value = record.workContent || '';
                                    
                                    // エラーメッセージをクリア
                                    clearEditErrors();
                                    
                                    // モーダルを表示
                                    document.getElementById('editModal').style.display = 'block';
                                } else {
                                    showMessage('記録が見つかりません', 'error');
                                }
                            } else {
                                showMessage('記録の取得に失敗しました', 'error');
                            }
                        })
                        .withFailureHandler(function(error) {
                            console.error('記録取得エラー:', error);
                            showMessage('エラーが発生しました: ' + error.message, 'error');
                        })
                        .getAllRecords();
                }

                // 編集モーダルを閉じる
                function closeEditModal() {
                    document.getElementById('editModal').style.display = 'none';
                    clearEditErrors();
                }

                // 編集フォームのエラーメッセージをクリア
                function clearEditErrors() {
                    document.getElementById('editDateError').textContent = '';
                    document.getElementById('editStartTimeError').textContent = '';
                    document.getElementById('editEndTimeError').textContent = '';
                    document.getElementById('editBreakTimeError').textContent = '';
                }

                // 編集フォームのバリデーション
                function validateEditForm() {
                    let isValid = true;
                    clearEditErrors();
                    
                    const dateYear = document.getElementById('editDateYear').value;
                    const dateMonth = document.getElementById('editDateMonth').value;
                    const dateDay = document.getElementById('editDateDay').value;
                    const startTimeHour = document.getElementById('editStartTimeHour').value;
                    const startTimeMinute = document.getElementById('editStartTimeMinute').value;
                    const endTimeHour = document.getElementById('editEndTimeHour').value;
                    const endTimeMinute = document.getElementById('editEndTimeMinute').value;
                    const breakTimeHour = document.getElementById('editBreakTimeHour').value;
                    const breakTimeMinute = document.getElementById('editBreakTimeMinute').value;
                    
                    // 日付のバリデーション
                    if (!dateYear || !dateMonth || !dateDay) {
                        document.getElementById('editDateError').textContent = '日付を選択してください';
                        isValid = false;
                    }
                    
                    // 開始時刻のバリデーション
                    if (!startTimeHour || !startTimeMinute) {
                        document.getElementById('editStartTimeError').textContent = '開始時刻を選択してください';
                        isValid = false;
                    }
                    
                    // 終了時刻のバリデーション（任意だが、どちらか一方だけ入力されている場合はエラー）
                    if ((endTimeHour && !endTimeMinute) || (!endTimeHour && endTimeMinute)) {
                        document.getElementById('editEndTimeError').textContent = '終了時刻は時間と分の両方を選択してください';
                        isValid = false;
                    }
                    
                    // 休憩時間のバリデーション（任意だが、どちらか一方だけ入力されている場合はエラー）
                    if ((breakTimeHour && !breakTimeMinute) || (!breakTimeHour && breakTimeMinute)) {
                        document.getElementById('editBreakTimeError').textContent = '休憩時間は時間と分の両方を選択してください';
                        isValid = false;
                    }
                    
                    return isValid;
                }

                // 編集フォームの送信
                function handleEditSubmit(e) {
                    e.preventDefault();
                    console.log('=== handleEditSubmit 開始 ===');
                    
                    if (!validateEditForm()) {
                        return;
                    }
                    
                    const row = parseInt(document.getElementById('editRow').value);
                    
                    // セレクトボックスの値を結合して日付と時刻の文字列を作成
                    const dateYear = document.getElementById('editDateYear').value;
                    const dateMonth = document.getElementById('editDateMonth').value;
                    const dateDay = document.getElementById('editDateDay').value;
                    const startTimeHour = document.getElementById('editStartTimeHour').value;
                    const startTimeMinute = document.getElementById('editStartTimeMinute').value;
                    const endTimeHour = document.getElementById('editEndTimeHour').value;
                    const endTimeMinute = document.getElementById('editEndTimeMinute').value;
                    const breakTimeHour = document.getElementById('editBreakTimeHour').value;
                    const breakTimeMinute = document.getElementById('editBreakTimeMinute').value;
                    
                    const recordData = {
                        date: formatDate(dateYear, dateMonth, dateDay),
                        startTime: formatTime(startTimeHour, startTimeMinute),
                        endTime: (endTimeHour && endTimeMinute) ? formatTime(endTimeHour, endTimeMinute) : '',
                        breakTime: (breakTimeHour && breakTimeMinute) ? formatTime(breakTimeHour, breakTimeMinute) : '0:00',
                        workContent: document.getElementById('editWorkContent').value.trim()
                    };
                    
                    setLoading(true);
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            setLoading(false);
                            console.log('updateRecord結果:', result);
                            
                            if (result.success) {
                                showMessage(result.message, 'success');
                                closeEditModal();
                                // 記録一覧と労働時間を再読み込み
                                loadAllRecords();
                                loadMonthlyWorkHours();
                            } else {
                                showMessage(result.message, 'error');
                            }
                        })
                        .withFailureHandler(function(error) {
                            setLoading(false);
                            console.error('updateRecordエラー:', error);
                            showMessage('エラーが発生しました: ' + error.message, 'error');
                        })
                        .updateRecord(row, recordData);
                }

                // 削除処理
                function handleDelete(row) {
                    console.log('=== handleDelete 開始 ===', row);
                    
                    if (!confirm('この記録を削除しますか？この操作は取り消せません。')) {
                        return;
                    }
                    
                    setLoading(true);
                    
                    google.script.run
                        .withSuccessHandler(function(result) {
                            setLoading(false);
                            console.log('deleteRecord結果:', result);
                            
                            if (result.success) {
                                showMessage(result.message, 'success');
                                // 記録一覧と労働時間を再読み込み
                                loadAllRecords();
                                loadMonthlyWorkHours();
                            } else {
                                showMessage(result.message, 'error');
                            }
                        })
                        .withFailureHandler(function(error) {
                            setLoading(false);
                            console.error('deleteRecordエラー:', error);
                            showMessage('エラーが発生しました: ' + error.message, 'error');
                        })
                        .deleteRecord(row);
                }
                
                // すべての関数が定義された後に初期化を実行
                // GASのHTMLサービスでは、スクリプトタグ内のコードは即座に実行されるため、
                // スクリプトの最後で初期化を実行する
                (function() {
                    // 少し遅延させて、DOMが完全に読み込まれるのを待つ
                    setTimeout(function() {
                        if (typeof initializeApp === 'function') {
                            initializeApp();
                        } else {
                            console.error('initializeApp関数が見つかりません');
                        }
                    }, 100);
                })();
            </script>
        </body>
        </html>
      `);
}

/**
 * デバッグ用：スプレッドシート接続テスト
 * @return {string} 接続結果メッセージ
 */
function testConnection() {
  try {
    const spreadsheetId = getSpreadsheetId();
    const sheet = getSheet();
    const message = '接続成功！\nスプレッドシートID: ' + spreadsheetId + '\nシート名: ' + sheet.getName() + '\n最終行: ' + sheet.getLastRow();
    Logger.log(message);
    return message;
  } catch (error) {
    const errorMessage = 'エラー: ' + error.toString();
    Logger.log('testConnection エラー: ' + errorMessage);
    return errorMessage;
  }
}

/**
 * テスト用：出勤記録テスト
 * @return {Object} 出勤記録結果
 */
function testClockIn() {
  try {
    const result = recordClockIn();
    Logger.log('testClockIn 結果: ' + JSON.stringify(result));
    return result;
  } catch (error) {
    Logger.log('testClockIn エラー: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * スプレッドシートを開いたときにメニューを追加
 * @return {void}
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ 勤怠管理')
    .addItem('🔧 初期設定をする', 'setupInitialConfiguration')
    .addSeparator()
    .addItem('📊 スプレッドシート接続テスト', 'testConnection')
    .addSeparator()
    .addItem('📥 CSV最新版を出力', 'exportCSVToSheet')
    .addToUi();
}

/**
 * 初期設定：設定シートと使用方法シートを作成・設定
 * @return {Object} 成功時は{success: true, message: string}、失敗時は{success: false, message: string}
 */
function setupInitialConfiguration() {
  try {
    // 現在のスプレッドシートのIDを取得してスクリプトプロパティに保存
    const currentSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const currentSpreadsheetId = currentSpreadsheet.getId();
    const properties = PropertiesService.getScriptProperties();
    properties.setProperty('SPREADSHEET_ID', currentSpreadsheetId);
    
    const spreadsheet = SpreadsheetApp.openById(currentSpreadsheetId);
    const ui = SpreadsheetApp.getUi();
    
    // 設定シートを作成または取得
    let settingSheet = spreadsheet.getSheetByName('設定方法');
    if (!settingSheet) {
      settingSheet = spreadsheet.insertSheet('設定方法');
    } else {
      settingSheet.clear();
    }
    
    // 使用方法シートを作成または取得
    let usageSheet = spreadsheet.getSheetByName('使用方法');
    if (!usageSheet) {
      usageSheet = spreadsheet.insertSheet('使用方法');
    } else {
      usageSheet.clear();
    }
    
    // よくある質問シートを作成または取得
    let faqSheet = spreadsheet.getSheetByName('よくある質問');
    if (!faqSheet) {
      faqSheet = spreadsheet.insertSheet('よくある質問');
    } else {
      faqSheet.clear();
    }
    
    // 設定シートの内容を設定
    setupSettingSheet(settingSheet);
    
    // 使用方法シートの内容を設定
    setupUsageSheet(usageSheet);
    
    // よくある質問シートの内容を設定
    setupFaqSheet(faqSheet);
    
    // シートを先頭に移動
    spreadsheet.setActiveSheet(settingSheet);
    spreadsheet.moveActiveSheet(0);
    spreadsheet.setActiveSheet(usageSheet);
    spreadsheet.moveActiveSheet(1);
    spreadsheet.setActiveSheet(faqSheet);
    spreadsheet.moveActiveSheet(2);
    
    ui.alert('初期設定が完了しました！', 
             'このスプレッドシートのIDを自動的に設定しました。\n（ID: ' + currentSpreadsheetId + '）\n\n「設定方法」「使用方法」「よくある質問」シートを作成しました。\nそれぞれのシートを確認してください。', 
             ui.ButtonSet.OK);
    
    return {
      success: true,
      message: '初期設定が完了しました'
    };
  } catch (error) {
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', '初期設定中にエラーが発生しました: ' + error.toString(), ui.ButtonSet.OK);
    return {
      success: false,
      message: 'エラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 設定シートの内容を設定
 * @param {Sheet} sheet - 設定シート
 * @return {void}
 */
function setupSettingSheet(sheet) {
  const data = [
    ['勤怠管理アプリ - 設定方法'],
    [''],
    ['このシートでは、勤怠管理アプリの初期設定方法を説明します。'],
    [''],
    ['① 初期設定の実行'],
    [''],
    ['1. 上部メニューから「⚙️ 勤怠管理」→「🔧 初期設定をする」を選択'],
    [''],
    ['2. 初期設定が完了すると、このスプレッドシートのIDが自動的に設定されます'],
    [''],
    ['3. 「設定方法」シートと「使用方法」シートが自動的に作成されます'],
    [''],
    ['【重要】'],
    ['- 初期設定ボタンを押すだけで、スプレッドシートIDの設定は完了します'],
    ['- 手動でIDを入力する必要はありません'],
    ['- このスプレッドシートで初期設定を実行してください'],
    [''],
    ['② Webアプリとしてデプロイ'],
    [''],
    ['1. Apps Scriptエディタで「デプロイ」→「新しいデプロイ」を選択'],
    [''],
    ['2. 種類の選択で「ウェブアプリ」を選択'],
    [''],
    ['3. 説明に「初期デプロイ」など適切な説明を入力'],
    [''],
    ['4. 「次のユーザーとして実行」を「自分」に設定'],
    [''],
    ['5. 「アクセスできるユーザー」を「全員」に設定'],
    [''],
    ['6. 「デプロイ」ボタンをクリック'],
    [''],
    ['7. 表示されたWebアプリのURLをコピーして保存（後で使用します）'],
    [''],
    ['③ 動作確認'],
    [''],
    ['1. デプロイしたWebアプリのURLにアクセス'],
    [''],
    ['2. 「出勤」ボタンが表示されることを確認'],
    [''],
    ['3. 出勤ボタンをクリックして、正常に記録されることを確認'],
    [''],
    ['以上で初期設定は完了です！'],
    [''],
    ['④ スプレッドシートの共有設定'],
    [''],
    ['複数ユーザーで利用する場合は、スプレッドシートの共有設定を行ってください。'],
    [''],
    ['1. スプレッドシートを開きます'],
    [''],
    ['2. 右上の「共有」ボタンをクリックします'],
    [''],
    ['3. 共有したいユーザーのメールアドレスを入力します'],
    ['   - 個人のGoogleアカウントのメールアドレス'],
    ['   - 組織のGoogle Workspaceアカウントのメールアドレス'],
    [''],
    ['4. 権限を設定します'],
    ['   - 「編集者」: データの記録・編集が可能（推奨）'],
    ['   - 「閲覧者」: データの閲覧のみ可能'],
    ['   - 「コメント可」: コメントの追加のみ可能'],
    [''],
    ['5. 「通知」の設定（任意）'],
    ['   - チェックを入れると、共有されたユーザーにメール通知が送信されます'],
    ['   - チェックを外すと、通知なしで共有されます'],
    [''],
    ['6. 「送信」ボタンをクリックします'],
    [''],
    ['【共有設定の注意事項】'],
    ['- 複数ユーザーで同時に記録する場合は、データの整合性に注意してください'],
    ['- 各ユーザーは自分の出勤・退勤記録のみを編集することを推奨します'],
    ['- 管理者権限を持つユーザーは、全データの確認・編集が可能です'],
    ['- Webアプリは共有設定とは別に、デプロイ時に「アクセスできるユーザー」を「全員」に設定してください'],
    [''],
    ['【注意事項】'],
    ['- 初期設定ボタンを押すと、自動的にこのスプレッドシートのIDが設定されます'],
    ['- WebアプリのURLは安全に保管してください'],
    ['- 月次シート（例: 2025年11月）は自動的に作成されます'],
    ['- 既存の月次シートは削除しても問題ありません'],
    ['- スプレッドシートをコピーした場合は、新しいスプレッドシートで再度初期設定を実行してください'],
    ['- 複数ユーザーで利用する場合は、共有設定を行ってから各ユーザーにWebアプリのURLを配布してください'],
  ];
  
  // データを書き込み
  sheet.getRange(1, 1, data.length, 1).setValues(data.map(row => [row[0]]));
  
  // スタイル設定
  const headerRange = sheet.getRange(1, 1);
  headerRange.setFontSize(16);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4CAF50');
  headerRange.setFontColor('#FFFFFF');
  
  // 列幅を調整
  sheet.setColumnWidth(1, 800);
  
  // セクション見出しのスタイル
  const sectionHeaders = [5, 14, 30, 50, 72, 90]; // ①、②、③、④、共有設定の注意事項、注意事項の行番号
  sectionHeaders.forEach(row => {
    if (row <= data.length) {
      const range = sheet.getRange(row, 1);
      range.setFontWeight('bold');
      range.setFontSize(12);
      range.setBackground('#E8F5E9');
    }
  });
}

/**
 * 使用方法シートの内容を設定
 * @param {Sheet} sheet - 使用方法シート
 * @return {void}
 */
function setupUsageSheet(sheet) {
  const data = [
    ['勤怠管理アプリ - 使用方法'],
    [''],
    ['このシートでは、勤怠管理アプリの使い方を説明します。'],
    [''],
    ['① シートを出す'],
    [''],
    ['1. WebアプリのURLにアクセスします'],
    ['   （デプロイ時に取得したURLを使用）'],
    [''],
    ['2. ブラウザでアプリが開きます'],
    [''],
    ['3. 現在の日付と時刻が表示されます'],
    [''],
    ['② 出勤記録'],
    [''],
    ['1. 「出勤」ボタンをクリックします'],
    [''],
    ['2. 出勤時刻が自動的に記録されます'],
    [''],
    ['3. 画面に「出勤時刻を記録しました」と表示されます'],
    [''],
    ['③ 退勤記録'],
    [''],
    ['1. 業務内容を入力します（任意）'],
    ['   - 「業務内容」欄のテキストエリアに、今日の業務内容を記入'],
    ['   - 例: 「Webサイトのデザイン修正」「資料作成」など'],
    [''],
    ['2. 「退勤」ボタンをクリックします'],
    [''],
    ['3. 退勤時刻と業務内容が自動的に記録されます'],
    [''],
    ['4. 画面に「退勤時刻を記録しました」と表示されます'],
    [''],
    ['④ 1日に複数回の業務を行う場合'],
    [''],
    ['1. 退勤後、再度「出勤」ボタンをクリック'],
    [''],
    ['2. 新しい出勤時刻が記録されます'],
    [''],
    ['3. 業務終了時に、再度退勤記録を行います'],
    [''],
    ['⑤ スプレッドシートでの確認'],
    [''],
    ['1. このスプレッドシートを開きます'],
    [''],
    ['2. 現在の年月のシート（例: 2025年11月）を確認'],
    [''],
    ['3. 記録されたデータが表示されます'],
    ['   - 稼働日: 記録した日付'],
    ['   - 費目: 業務委託費'],
    ['   - 開始時刻: 出勤時刻'],
    ['   - 終了時刻: 退勤時刻'],
    ['   - 休憩時間: 0:00（デフォルト）'],
    ['   - 業務内容: 入力した業務内容'],
    [''],
    ['⑤ 拡張機能の使い方'],
    [''],
    ['【今月の労働時間の確認】'],
    ['- Webアプリの画面上部に「今月の労働時間」が自動表示されます'],
    ['- 出勤・退勤記録後も自動的に更新されます'],
    ['- 表示形式: "120時間30分"（休憩時間を考慮した実労働時間）'],
    [''],
    ['【スプレッドシートを開く】'],
    ['- 「スプレッドシートを開く」ボタンをクリック'],
    ['- 新しいタブでスプレッドシートが開きます'],
    [''],
    ['【CSVダウンロード】'],
    ['1. 「月次シートを選択」ドロップダウンからダウンロードしたい月を選択'],
    ['2. 「CSVダウンロード」ボタンをクリック'],
    ['3. CSVファイルがダウンロードされます'],
    [''],
    ['【記録の編集・削除】'],
    ['1. 「記録一覧」セクションで記録を確認'],
    ['   - すべての記録がテーブル形式で表示されます'],
    ['   - 新しい記録が上に表示されます'],
    ['2. 編集したい記録の「編集」ボタンをクリック'],
    ['3. モーダルフォームで以下の項目を修正可能:'],
    ['   - 日付（yyyy/MM/dd形式）'],
    ['   - 開始時刻（HH:mm形式）'],
    ['   - 終了時刻（HH:mm形式）'],
    ['   - 休憩時間（HH:mm形式）'],
    ['   - 業務内容（テキスト）'],
    ['4. 「更新」ボタンをクリック'],
    ['   - バリデーション機能により、不正な日付・時刻形式はエラー表示されます'],
    ['   - 更新後、記録一覧と労働時間が自動的に更新されます'],
    ['5. 削除したい記録の「削除」ボタンをクリック'],
    ['6. 確認ダイアログで「OK」をクリック'],
    ['   - 削除後、記録一覧と労働時間が自動的に更新されます'],
    ['   - ※注意: 削除したデータは復元できません'],
    [''],
    ['【よくある質問】'],
    [''],
    ['Q: 出勤時刻を間違えて記録してしまいました'],
    ['A: Webアプリの「記録一覧」から編集できます。'],
    ['   1. 「記録一覧」セクションで該当する記録を探す'],
    ['   2. 「編集」ボタンをクリック'],
    ['   3. モーダルフォームで開始時刻を修正'],
    ['   4. 「更新」ボタンをクリック'],
    ['   または、スプレッドシートで直接編集することも可能です'],
    [''],
    ['Q: 月が変わったらどうなりますか？'],
    ['A: 自動的に新しい月のシートが作成されます（例: 2025年12月）。'],
    [''],
    ['Q: 過去のデータを確認したいです'],
    ['A: スプレッドシートで過去の月のシートを確認してください。'],
    ['   または、Webアプリの「記録一覧」で過去の記録も確認できます'],
    [''],
    ['Q: Webアプリにアクセスできません'],
    ['A: デプロイが正しく行われているか、URLが正しいか確認してください。'],
    [''],
    ['以上で使用方法の説明は終わりです。'],
    ['不明な点があれば、設定方法シートを確認するか、管理者に問い合わせてください。'],
  ];
  
  // データを書き込み
  sheet.getRange(1, 1, data.length, 1).setValues(data.map(row => [row[0]]));
  
  // スタイル設定
  const headerRange = sheet.getRange(1, 1);
  headerRange.setFontSize(16);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#2196F3');
  headerRange.setFontColor('#FFFFFF');
  
  // 列幅を調整
  sheet.setColumnWidth(1, 800);
  
  // セクション見出しのスタイル
  const sectionHeaders = [5, 14, 25, 36, 47, 58]; // ①〜⑤、よくある質問の行番号
  sectionHeaders.forEach(row => {
    if (row <= data.length) {
      const range = sheet.getRange(row, 1);
      range.setFontWeight('bold');
      range.setFontSize(12);
      range.setBackground('#E3F2FD');
    }
  });
}

/**
 * よくある質問シートの内容を設定
 */
function setupFaqSheet(sheet) {
  const data = [
    ['勤怠管理アプリ - よくある質問（FAQ）'],
    [''],
    ['このシートでは、勤怠管理アプリに関するよくある質問と回答をまとめています。'],
    [''],
    ['【基本操作について】'],
    [''],
    ['Q1: 出勤時刻を間違えて記録してしまいました'],
    ['A1: Webアプリから修正できます。'],
    ['   【Webアプリから修正する方法】'],
    ['   1. Webアプリの「記録一覧」セクションで該当する記録を探す'],
    ['   2. 「編集」ボタンをクリック'],
    ['   3. モーダルフォームで開始時刻を修正'],
    ['   4. 「保存」ボタンをクリック'],
    ['   【スプレッドシートから修正する方法】'],
    ['   1. 該当する月のシート（例: 2025年11月）を開く'],
    ['   2. 間違えた行の「開始時刻」セルを直接編集'],
    ['   3. 正しい時刻を入力（例: 09:00）'],
    [''],
    ['Q2: 退勤時刻を間違えて記録してしまいました'],
    ['A2: Webアプリから修正できます。'],
    ['   【Webアプリから修正する方法】'],
    ['   1. Webアプリの「記録一覧」セクションで該当する記録を探す'],
    ['   2. 「編集」ボタンをクリック'],
    ['   3. モーダルフォームで終了時刻を修正'],
    ['   4. 「保存」ボタンをクリック'],
    ['   【スプレッドシートから修正する方法】'],
    ['   1. 該当する月のシートを開く'],
    ['   2. 間違えた行の「終了時刻」セルを直接編集'],
    ['   3. 正しい時刻を入力'],
    [''],
    ['Q3: 業務内容を間違えて入力してしまいました'],
    ['A3: Webアプリから修正できます。'],
    ['   【Webアプリから修正する方法】'],
    ['   1. Webアプリの「記録一覧」セクションで該当する記録を探す'],
    ['   2. 「編集」ボタンをクリック'],
    ['   3. モーダルフォームで業務内容を修正'],
    ['   4. 「保存」ボタンをクリック'],
    ['   【スプレッドシートから修正する方法】'],
    ['   1. 該当する月のシートを開く'],
    ['   2. 間違えた行の「業務内容」セルを直接編集'],
    ['   3. 正しい業務内容を入力'],
    [''],
    ['【月次シートについて】'],
    [''],
    ['Q4: 月が変わったらどうなりますか？'],
    ['A4: 自動的に新しい月のシートが作成されます。'],
    ['   - 例: 2025年11月 → 2025年12月'],
    ['   - シート名は「YYYY年M月」の形式です'],
    ['   - 初回の出勤記録時に自動的に作成されます'],
    [''],
    ['Q5: 過去の月のデータを確認したいです'],
    ['A5: スプレッドシートで過去の月のシートを確認してください。'],
    ['   - シート一覧から該当する月のシートを選択'],
    ['   - 例: 2025年10月のデータを見る場合は「2025年10月」シートを開く'],
    [''],
    ['Q6: 月次シートを手動で作成できますか？'],
    ['A6: 手動で作成する必要はありません。'],
    ['   - 初回の出勤記録時に自動的に作成されます'],
    ['   - ただし、手動で作成したい場合は、シート名を「YYYY年M月」形式で作成してください'],
    [''],
    ['【Webアプリについて】'],
    [''],
    ['Q7: Webアプリにアクセスできません'],
    ['A7: 以下の点を確認してください。'],
    ['   1. デプロイが正しく行われているか確認'],
    ['   2. WebアプリのURLが正しいか確認'],
    ['   3. ブラウザのキャッシュをクリアして再試行'],
    ['   4. 別のブラウザで試す'],
    [''],
    ['Q8: 出勤ボタンを押しても記録されません'],
    ['A8: 以下の点を確認してください。'],
    ['   1. スプレッドシートIDが正しく設定されているか確認'],
    ['   2. Apps Scriptの権限が正しく設定されているか確認'],
    ['   3. ブラウザのコンソールでエラーがないか確認（F12キーで開発者ツールを開く）'],
    [''],
    ['Q9: エラーメッセージが表示されます'],
    ['A9: エラーメッセージの内容を確認してください。'],
    ['   - 「スプレッドシートIDが設定されていません」→ 初期設定を実行してください'],
    ['   - 「権限がありません」→ Apps Scriptの権限設定を確認してください'],
    ['   - その他のエラー → 設定方法シートを確認するか、管理者に問い合わせてください'],
    [''],
    ['【データ管理について】'],
    [''],
    ['Q10: データをバックアップしたいです'],
    ['A10: スプレッドシートをコピーすることでバックアップできます。'],
    ['   1. スプレッドシートを開く'],
    ['   2. 「ファイル」→「コピーを作成」を選択'],
    ['   3. コピーしたスプレッドシートに名前を付けて保存'],
    [''],
    ['Q11: データを削除したいです'],
    ['A11: Webアプリから削除できます。'],
    ['   【Webアプリから削除する方法】'],
    ['   1. Webアプリの「記録一覧」セクションで該当する記録を探す'],
    ['   2. 「削除」ボタンをクリック'],
    ['   3. 確認ダイアログで「OK」をクリック'],
    ['   【スプレッドシートから削除する方法】'],
    ['   1. 該当する月のシートを開く'],
    ['   2. 削除したい行を選択'],
    ['   3. 右クリック→「行を削除」を選択'],
    ['   ※注意: 削除したデータは復元できません'],
    [''],
    ['Q12: 複数のスプレッドシートで同じアプリを使いたいです'],
    ['A12: 各スプレッドシートで初期設定を実行してください。'],
    ['   1. スプレッドシートをコピー'],
    ['   2. 新しいスプレッドシートで「⚙️ 勤怠管理」→「🔧 初期設定をする」を実行'],
    ['   3. 各スプレッドシートで独立して動作します'],
    [''],
    ['【その他】'],
    [''],
    ['Q13: 休憩時間を記録したいです'],
    ['A13: Webアプリから記録の編集時に休憩時間を設定できます。'],
    ['   【Webアプリから設定する方法】'],
    ['   1. Webアプリの「記録一覧」セクションで該当する記録を探す'],
    ['   2. 「編集」ボタンをクリック'],
    ['   3. モーダルフォームで「休憩時間」を入力（例: 1:00）'],
    ['   4. 「保存」ボタンをクリック'],
    ['   【スプレッドシートから設定する方法】'],
    ['   1. 該当する月のシートを開く'],
    ['   2. 「休憩時間」列を直接編集'],
    ['   3. 例: 1時間の休憩の場合は「1:00」と入力'],
    ['   ※注意: 休憩時間を設定すると、労働時間が自動的に再計算されます'],
    [''],
    ['Q14: 複数人で同じスプレッドシートを使いたいです'],
    ['A14: スプレッドシートの共有設定を行ってください。'],
    ['   1. スプレッドシートを開く'],
    ['   2. 右上の「共有」ボタンをクリック'],
    ['   3. 共有したいユーザーのメールアドレスを入力'],
    ['   4. 権限を「編集者」に設定'],
    ['   5. 「送信」をクリック'],
    ['   ※注意: 複数人で同時に記録する場合は、データの整合性に注意してください'],
    [''],
    ['Q15: もっと詳しい情報が欲しいです'],
    ['A15: 以下のシートを確認してください。'],
    ['   - 「設定方法」シート: 初期設定の手順'],
    ['   - 「使用方法」シート: アプリの使い方'],
    ['   - それでも解決しない場合は、管理者に問い合わせてください'],
    [''],
    ['以上がよくある質問です。'],
    ['不明な点があれば、設定方法シートや使用方法シートも確認してください。'],
  ];
  
  // データを書き込み
  sheet.getRange(1, 1, data.length, 1).setValues(data.map(row => [row[0]]));
  
  // スタイル設定
  const headerRange = sheet.getRange(1, 1);
  headerRange.setFontSize(16);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#FF9800');
  headerRange.setFontColor('#FFFFFF');
  
  // 列幅を調整
  sheet.setColumnWidth(1, 800);
  
  // セクション見出しのスタイル
  const sectionHeaders = [5, 19, 35, 51, 75, 95]; // 各セクションの行番号
  sectionHeaders.forEach(row => {
    if (row <= data.length) {
      const range = sheet.getRange(row, 1);
      range.setFontWeight('bold');
      range.setFontSize(12);
      range.setBackground('#FFF3E0');
    }
  });
  
  // Q&Aのスタイル
  for (let i = 0; i < data.length; i++) {
    const row = i + 1;
    const cellValue = data[i][0];
    if (cellValue && cellValue.startsWith('Q')) {
      const range = sheet.getRange(row, 1);
      range.setFontWeight('bold');
      range.setFontColor('#E65100');
    } else if (cellValue && cellValue.startsWith('A')) {
      const range = sheet.getRange(row, 1);
      range.setFontColor('#333');
    }
  }
}