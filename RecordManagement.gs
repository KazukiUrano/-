/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:16:52
 * 説明：勤怠管理アプリ - RecordManagement（機能別分割）
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