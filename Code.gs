/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 02:42:44
 * 説明：勤怠管理アプリ - Google Apps Script（スプレッドシートとの連携処理）
 * 
 * 【修正履歴（詳細版）】
 * - 2025-11-11 02:32:19 [浦野一輝]：配布用スプレッドシートIDに更新、onOpen関数と初期設定機能を追加
 * - 2025-11-11 02:42:44 [浦野一輝]：スクリプトプロパティを使用してスプレッドシートIDを自動取得・設定するように変更
 * 
 * 【push時の変更履歴（大きな変更のみ）】
 * - 2025-11-11 [浦野一輝]：フェーズ0実装（配布用スプレッドシートセットアップ）
 */

/**
 * スプレッドシートIDを取得（スクリプトプロパティから取得、なければ現在のスプレッドシートのIDを使用）
 */
function getSpreadsheetId() {
  const properties = PropertiesService.getScriptProperties();
  let spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  
  // スクリプトプロパティに保存されていない場合は、現在のスプレッドシートのIDを取得して保存
  if (!spreadsheetId) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (spreadsheet) {
      spreadsheetId = spreadsheet.getId();
      properties.setProperty('SPREADSHEET_ID', spreadsheetId);
    }
  }
  
  return spreadsheetId;
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
 */
function recordClockIn() {
  try {
    const sheet = getSheet();
    const now = new Date();
    const scriptTimezone = Session.getScriptTimeZone();
    const today = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
    const time = Utilities.formatDate(now, 'Asia/Tokyo', 'HH:mm');
    
    Logger.log('============ 出勤記録デバッグ ============');
    Logger.log('スクリプトのタイムゾーン: ' + scriptTimezone);
    Logger.log('new Date()の値: ' + now);
    Logger.log('now.toString(): ' + now.toString());
    Logger.log('now.toLocaleString("ja-JP", {timeZone: "Asia/Tokyo"}): ' + now.toLocaleString('ja-JP', {timeZone: 'Asia/Tokyo'}));
    Logger.log('Utilities.formatDate(now, "Asia/Tokyo", "HH:mm"): ' + time);
    Logger.log('今日の日付: ' + today);
    Logger.log('==========================================');
    
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
    
    return {
      success: true,
      message: '出勤時刻を記録しました: ' + time,
      data: {
        date: today,
        clockIn: time
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
 * 退勤時刻と業務内容を記録
 */
function recordClockOut(workContent) {
  try {
    const sheet = getSheet();
    const now = new Date();
    const today = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
    const time = Utilities.formatDate(now, 'Asia/Tokyo', 'HH:mm');
    
    Logger.log('退勤記録 - 現在時刻: ' + now);
    Logger.log('退勤記録 - フォーマット後: ' + time);
    
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
    return {
      success: false,
      message: 'エラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 今日の勤怠状況を取得（最新の業務状況のみ）
 */
function getTodayStatus() {
  try {
    Logger.log('=== getTodayStatus 開始 ===');
    const sheet = getSheet();
    const now = new Date();
    const today = Utilities.formatDate(now, 'Asia/Tokyo', 'yyyy/MM/dd');
    const lastRow = sheet.getLastRow();
    Logger.log('今日の日付: ' + today);
    Logger.log('最終行: ' + lastRow);
    
    let latestRecord = null;
    
    // 今日の記録を全て確認し、最新のものを取得
    for (let i = lastRow; i >= 2; i--) {
      const dateValue = sheet.getRange(i, 1).getValue();
      if (dateValue) {
        const recordDate = Utilities.formatDate(new Date(dateValue), 'Asia/Tokyo', 'yyyy/MM/dd');
        Logger.log('行' + i + 'の日付: ' + recordDate);
        
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
          
          Logger.log('今日の記録発見 - 出勤: ' + clockIn + ', 退勤: ' + clockOut);
          
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
    
    Logger.log('latestRecord: ' + JSON.stringify(latestRecord));
    
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
      Logger.log('今日の記録なし - デフォルト値を返す');
      latestRecord = {
        date: today,
        clockIn: '',
        clockOut: '',
        workContent: '',
        isClockedIn: false,
        isClockedOut: false
      };
    }
    
    const result = {
      success: true,
      data: latestRecord
    };
    Logger.log('返却する結果: ' + JSON.stringify(result));
    return result;
  } catch (error) {
    Logger.log('エラー発生: ' + error.toString());
    Logger.log('スタックトレース: ' + error.stack);
    return {
      success: false,
      message: 'エラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * 今日の全業務記録を取得
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
    return {
      success: false,
      message: 'エラーが発生しました: ' + error.toString()
    };
  }
}

/**
 * スプレッドシートを取得（年月ごとにシートを分ける）
 */
function getSheet() {
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
  }
  
  return sheet;
}

/**
 * Webアプリ用のGETエンドポイント
 */
function doGet(e) {
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
            </style>
        </head>
        <body>
            <div class="container">
                <header>
                    <h1>勤怠管理アプリ</h1>
                    <div class="date-display" id="currentDate"></div>
                </header>

                <main>
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
                            <span class="btn-text">退勤</span>
                        </button>
                    </div>

                    <div class="message-area" id="messageArea"></div>
                </main>

                <footer>
                    <div class="loading" id="loading" style="display: none;">
                        <div class="spinner"></div>
                        <span>処理中...</span>
                    </div>
                </footer>
            </div>

            <script>
                // 状態管理
                let currentStatus = {
                    isClockedIn: false,
                    isClockedOut: false,
                    clockIn: '',
                    clockOut: '',
                    workContent: ''
                };

                // 初期化
                document.addEventListener('DOMContentLoaded', function() {
                    updateCurrentDate();
                    loadTodayStatus();
                    setupEventListeners();
                });

                function updateCurrentDate() {
                    const now = new Date();
                    const options = { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        weekday: 'long'
                    };
                    document.getElementById('currentDate').textContent = now.toLocaleDateString('ja-JP', options);
                    
                    // 現在の年月を表示
                    const year = now.getFullYear();
                    const month = now.getMonth() + 1;
                    document.getElementById('currentMonth').textContent = '(' + year + '年' + month + '月シート)';
                }

                function setupEventListeners() {
                    document.getElementById('clockInBtn').addEventListener('click', handleClockIn);
                    document.getElementById('clockOutBtn').addEventListener('click', handleClockOut);
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
                        clockOutBtn.innerHTML = '<span class="btn-icon">🏁</span><span class="btn-text">退勤</span>';
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
            </script>
        </body>
        </html>
      `);
}

/**
 * デバッグ用：スプレッドシート接続テスト
 */
function testConnection() {
  try {
    const spreadsheetId = getSpreadsheetId();
    console.log('スプレッドシートID:', spreadsheetId);
    const sheet = getSheet();
    console.log('シート名:', sheet.getName());
    console.log('最終行:', sheet.getLastRow());
    console.log('接続成功！');
    return '接続成功！';
  } catch (error) {
    console.error('エラー:', error.toString());
    return 'エラー: ' + error.toString();
  }
}

/**
 * テスト用：出勤記録テスト
 */
function testClockIn() {
  try {
    const result = recordClockIn();
    console.log('出勤記録結果:', result);
    return result;
  } catch (error) {
    console.error('出勤記録エラー:', error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * スプレッドシートを開いたときにメニューを追加
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ 勤怠管理')
    .addItem('🔧 初期設定をする', 'setupInitialConfiguration')
    .addSeparator()
    .addItem('📊 スプレッドシート接続テスト', 'testConnection')
    .addToUi();
}

/**
 * 初期設定：設定シートと使用方法シートを作成・設定
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
    
    // 設定シートの内容を設定
    setupSettingSheet(settingSheet);
    
    // 使用方法シートの内容を設定
    setupUsageSheet(usageSheet);
    
    // シートを先頭に移動
    spreadsheet.setActiveSheet(settingSheet);
    spreadsheet.moveActiveSheet(0);
    spreadsheet.setActiveSheet(usageSheet);
    spreadsheet.moveActiveSheet(1);
    
    ui.alert('初期設定が完了しました！', 
             'このスプレッドシートのIDを自動的に設定しました。\n（ID: ' + currentSpreadsheetId + '）\n\n「設定方法」シートと「使用方法」シートを作成しました。\nそれぞれのシートを確認してください。', 
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
    ['【注意事項】'],
    ['- 初期設定ボタンを押すと、自動的にこのスプレッドシートのIDが設定されます'],
    ['- WebアプリのURLは安全に保管してください'],
    ['- 月次シート（例: 2025年11月）は自動的に作成されます'],
    ['- 既存の月次シートは削除しても問題ありません'],
    ['- スプレッドシートをコピーした場合は、新しいスプレッドシートで再度初期設定を実行してください'],
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
  const sectionHeaders = [5, 14, 30, 50]; // ①、②、③、注意事項の行番号
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
    ['3. 記録が完了すると、退勤入力欄が表示されます'],
    [''],
    ['③ 退勤記録'],
    [''],
    ['1. 業務内容を入力します'],
    ['   - 退勤入力欄のテキストエリアに、今日の業務内容を記入'],
    ['   - 例: 「Webサイトのデザイン修正」「資料作成」など'],
    [''],
    ['2. 「退勤」ボタンをクリックします'],
    [''],
    ['3. 退勤時刻と業務内容が自動的に記録されます'],
    [''],
    ['4. 記録が完了すると、次の業務を開始できる状態になります'],
    [''],
    ['④ 1日に複数回の業務を行う場合'],
    [''],
    ['1. 退勤後、再度「次の業務を開始」ボタンをクリック'],
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
    ['【よくある質問】'],
    [''],
    ['Q: 出勤時刻を間違えて記録してしまいました'],
    ['A: 現在はアプリから直接修正できません。スプレッドシートで直接編集してください。'],
    [''],
    ['Q: 月が変わったらどうなりますか？'],
    ['A: 自動的に新しい月のシートが作成されます（例: 2025年12月）。'],
    [''],
    ['Q: 過去のデータを確認したいです'],
    ['A: スプレッドシートで過去の月のシートを確認してください。'],
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