/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:16:52
 * 説明：勤怠管理アプリ - Attendance（機能別分割）
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