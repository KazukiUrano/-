/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:27:24
 * 説明：勤怠管理アプリ - Setup（機能別分割）
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
 * - 2025-11-11 04:18:49 [浦野一輝]：設定シートにGoogleドライブURLとアプリURLを追加（A1-B1にGoogleドライブURL、A2-B2にアプリURL）、取得できない場合は注釈でメモできる旨を記載
 * - 2025-11-11 04:23:30 [浦野一輝]：updateWebAppUrlInSettingSheet関数を追加 - WebアプリURLを取得して設定シートに自動反映する機能を追加
 * - 2025-11-11 04:25:15 [浦野一輝]：openScriptEditor関数を追加 - Apps Scriptエディタを開いてデプロイ手順を案内する機能を追加
 * - 2025-11-11 04:27:24 [浦野一輝]：使用方法・よくある質問・設定方法シートの内容を最新版に更新 - Apps Scriptエディタを開く機能、アプリURL自動取得機能、CSV出力機能（メニューから）、編集フォーム（選択式）などの最新機能を反映
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
    
    // Google Driveフォルダを作成
    const driveFolderId = createDriveFolder();
    if (!driveFolderId) {
      ui.alert('警告', 'Google Driveフォルダの作成に失敗しました。CSV出力機能を使用する場合は、手動でフォルダを作成して設定シートにIDを記録してください。', ui.ButtonSet.OK);
    } else {
      // スクリプトプロパティに保存
      properties.setProperty('DRIVE_FOLDER_ID', driveFolderId);
      Logger.log('Google DriveフォルダIDを保存: ' + driveFolderId);
    }
    
    // 設定シートの内容を設定
    setupSettingSheet(settingSheet, driveFolderId);
    
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
    
    let alertMessage = '初期設定が完了しました！\n\nこのスプレッドシートのIDを自動的に設定しました。\n（ID: ' + currentSpreadsheetId + '）\n\n';
    if (driveFolderId) {
      alertMessage += 'Google Driveフォルダを作成しました。\n（フォルダID: ' + driveFolderId + '）\n\n';
    }
    alertMessage += '「設定方法」「使用方法」「よくある質問」シートを作成しました。\nそれぞれのシートを確認してください。';
    
    ui.alert('初期設定が完了しました！', alertMessage, ui.ButtonSet.OK);
    
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
 * @param {string|null} driveFolderId - Google DriveフォルダID（オプション）
 * @return {void}
 */
function setupSettingSheet(sheet, driveFolderId) {
  // スプレッドシートのURLを取得
  const spreadsheetUrlResult = getSpreadsheetUrl();
  const spreadsheetUrl = spreadsheetUrlResult.success ? spreadsheetUrlResult.url : '';
  
  // WebアプリのURLを取得
  const webAppUrlResult = getWebAppUrl();
  const webAppUrl = webAppUrlResult.success ? webAppUrlResult.url : '';
  
  // Google DriveフォルダのURLを取得
  let driveFolderUrl = '';
  if (driveFolderId) {
    driveFolderUrl = 'https://drive.google.com/drive/folders/' + driveFolderId;
  }
  
  // 先頭にURL情報を追加
  sheet.getRange(1, 1).setValue('Googleドライブ');
  if (driveFolderUrl) {
    sheet.getRange(1, 2).setValue(driveFolderUrl);
    sheet.getRange(1, 2).setFormula('=HYPERLINK("' + driveFolderUrl + '","' + driveFolderUrl + '")');
  } else {
    sheet.getRange(1, 2).setValue('（未設定）');
    sheet.getRange(1, 2).setNote('Google DriveフォルダのURLをここに入力できます');
  }
  
  sheet.getRange(2, 1).setValue('アプリURL');
  if (webAppUrl) {
    sheet.getRange(2, 2).setValue(webAppUrl);
    sheet.getRange(2, 2).setFormula('=HYPERLINK("' + webAppUrl + '","' + webAppUrl + '")');
  } else {
    sheet.getRange(2, 2).setValue('（未設定）');
    sheet.getRange(2, 2).setNote('デプロイしたアプリのURLをここにメモできます');
  }
  
  // URL情報行のスタイル設定
  sheet.getRange(1, 1, 2, 1).setFontWeight('bold');
  sheet.getRange(1, 1, 2, 1).setBackground('#E3F2FD');
  sheet.getRange(1, 2, 2, 1).setBackground('#FFF9C4');
  
  const data = [
    [''],
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
    ['8. 取得したWebアプリのURLを「設定方法」シートのB2セルにメモしてください'],
    [''],
    ['【便利な機能】'],
    ['- メニュー「⚙️ 勤怠管理」→「🚀 Apps Scriptエディタを開く（デプロイ用）」でApps Scriptエディタを簡単に開けます'],
    ['- メニュー「⚙️ 勤怠管理」→「🔗 アプリURLを設定シートに反映」でデプロイ済みのURLを自動取得できます'],
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
    [''],
    ['⑤ Google Driveフォルダ設定'],
    [''],
    ['初期設定時に自動的にGoogle Driveフォルダが作成されます。'],
    [''],
    ['【Google DriveフォルダID】'],
  ];
  
  // Google DriveフォルダIDを追加
  if (driveFolderId) {
    data.push(['Google DriveフォルダID: ' + driveFolderId]);
  } else {
    data.push(['Google DriveフォルダID: （未設定）']);
    data.push(['']);
    data.push(['手動で設定する場合:']);
    data.push(['1. Google Driveで「勤怠管理_CSV出力」という名前のフォルダを作成']);
    data.push(['2. フォルダを右クリックして「リンクを取得」を選択']);
    data.push(['3. リンクからフォルダIDを抽出（例: https://drive.google.com/drive/folders/XXXXXXXXXXXXXXXX）']);
    data.push(['4. 上記の「Google DriveフォルダID:」の行にIDを記入']);
  }
  
  // データを書き込み（3行目から開始、URL情報は既に1-2行目に設定済み）
  sheet.getRange(3, 1, data.length, 1).setValues(data.map(row => [row[0]]));
  
  // スタイル設定
  const headerRange = sheet.getRange(3, 1);
  headerRange.setFontSize(16);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#4CAF50');
  headerRange.setFontColor('#FFFFFF');
  
  // 列幅を調整
  sheet.setColumnWidth(1, 800);
  
  // セクション見出しのスタイル（URL情報行を考慮して+2）
  const sectionHeaders = [7, 16, 32, 52, 74, 92, data.length + 2 - (driveFolderId ? 3 : 9)]; // ①、②、③、④、共有設定の注意事項、注意事項、⑤の行番号
  sectionHeaders.forEach(row => {
    if (row <= data.length + 2 && row > 0) {
      const range = sheet.getRange(row, 1);
      range.setFontWeight('bold');
      range.setFontSize(12);
      range.setBackground('#E8F5E9');
    }
  });
  
  // Google DriveフォルダIDの行を強調（URL情報行を考慮して+2）
  if (driveFolderId) {
    const folderIdRow = data.length + 2;
    const folderIdRange = sheet.getRange(folderIdRow, 1);
    folderIdRange.setFontWeight('bold');
    folderIdRange.setFontColor('#1976D2');
    folderIdRange.setBackground('#E3F2FD');
  }
  
  // 設定方法シートの注釈に追加情報を記載
  if (!webAppUrl) {
    const noteText = 'デプロイしたアプリのURLをB2セルにメモできます。\n' +
                     'デプロイ方法は「② Webアプリとしてデプロイ」セクションを参照してください。\n' +
                     'または、メニュー「⚙️ 勤怠管理」→「🔗 アプリURLを設定シートに反映」で自動取得できます。';
    sheet.getRange(2, 2).setNote(noteText);
  }
}

/**
 * Apps Scriptエディタを開く
 * @return {void}
 */
function openScriptEditor() {
  try {
    const scriptId = ScriptApp.getScriptId();
    const scriptUrl = 'https://script.google.com/home/projects/' + scriptId + '/edit';
    
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      'Apps Scriptエディタを開く',
      'Apps Scriptエディタを開いてデプロイを実行できます。\n\n' +
      'デプロイ手順:\n' +
      '1. 「デプロイ」→「新しいデプロイ」を選択\n' +
      '2. 種類で「ウェブアプリ」を選択\n' +
      '3. 「次のユーザーとして実行」を「自分」に設定\n' +
      '4. 「アクセスできるユーザー」を「全員」に設定\n' +
      '5. 「デプロイ」をクリック\n' +
      '6. 表示されたURLをコピーして、設定シートのB2セルに貼り付け\n\n' +
      'Apps Scriptエディタを開きますか？',
      ui.ButtonSet.YES_NO
    );
    
    if (response === ui.Button.YES) {
      // HTMLダイアログでリンクを表示（新しいタブで開く）
      const html = HtmlService.createHtmlOutput(
        '<html><body>' +
        '<h2>Apps Scriptエディタを開く</h2>' +
        '<p>以下のリンクをクリックしてApps Scriptエディタを開いてください。</p>' +
        '<p><a href="' + scriptUrl + '" target="_blank" style="font-size: 16px; padding: 10px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 4px; display: inline-block;">Apps Scriptエディタを開く</a></p>' +
        '<p style="margin-top: 20px; color: #666;">または、以下のURLをコピーしてブラウザで開いてください:</p>' +
        '<p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">' + scriptUrl + '</p>' +
        '</body></html>'
      )
        .setWidth(600)
        .setHeight(400);
      
      SpreadsheetApp.getUi().showModalDialog(html, 'Apps Scriptエディタを開く');
    }
  } catch (error) {
    Logger.log('openScriptEditor エラー: ' + error.toString());
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', 'Apps Scriptエディタを開く際にエラーが発生しました: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * WebアプリのURLを取得して設定シートに反映
 * @return {void}
 */
function updateWebAppUrlInSettingSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const settingSheet = spreadsheet.getSheetByName('設定方法');
    
    if (!settingSheet) {
      Logger.log('updateWebAppUrlInSettingSheet: 設定方法シートが見つかりません');
      return;
    }
    
    // WebアプリのURLを取得
    const webAppUrlResult = getWebAppUrl();
    
    if (webAppUrlResult.success && webAppUrlResult.url) {
      const webAppUrl = webAppUrlResult.url;
      
      // B2セルにURLを設定
      settingSheet.getRange(2, 2).setValue(webAppUrl);
      settingSheet.getRange(2, 2).setFormula('=HYPERLINK("' + webAppUrl + '","' + webAppUrl + '")');
      settingSheet.getRange(2, 2).setNote(''); // 注釈をクリア
      
      Logger.log('updateWebAppUrlInSettingSheet: URLを設定しました: ' + webAppUrl);
      
      const ui = SpreadsheetApp.getUi();
      ui.alert('完了', 'アプリURLを設定シートに反映しました。\n\nURL: ' + webAppUrl, ui.ButtonSet.OK);
    } else {
      Logger.log('updateWebAppUrlInSettingSheet: URLが取得できませんでした: ' + webAppUrlResult.message);
      
      const ui = SpreadsheetApp.getUi();
      ui.alert('注意', 
        'アプリURLを取得できませんでした。\n\n' +
        '原因: ' + webAppUrlResult.message + '\n\n' +
        '対処方法:\n' +
        '1. Apps Scriptエディタで「デプロイ」→「新しいデプロイ」を実行してください\n' +
        '2. デプロイ後、表示されたURLを手動でB2セルに入力してください\n' +
        '3. または、再度「🔗 アプリURLを設定シートに反映」を実行してください',
        ui.ButtonSet.OK);
    }
  } catch (error) {
    Logger.log('updateWebAppUrlInSettingSheet エラー: ' + error.toString());
    Logger.log('スタックトレース: ' + (error.stack || 'スタックトレースなし'));
    
    const ui = SpreadsheetApp.getUi();
    ui.alert('エラー', 'アプリURLの反映中にエラーが発生しました: ' + error.toString(), ui.ButtonSet.OK);
  }
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
    ['- Webアプリの「労働時間」ページで確認できます'],
    ['- 月を選択して、過去の月の労働時間も確認可能です'],
    ['- 出勤・退勤記録後も自動的に更新されます'],
    ['- 表示形式: "120時間30分"（休憩時間を考慮した実労働時間）'],
    [''],
    ['【スプレッドシートを開く】'],
    ['- 「スプレッドシートを開く」ボタンをクリック'],
    ['- 新しいタブでスプレッドシートが開きます'],
    [''],
    ['【CSV出力（メニューから）】'],
    ['1. スプレッドシートを開く'],
    ['   - スプレッドシートを直接開くか、Webアプリの「スプレッドシートを開く」ボタンからアクセス'],
    [''],
    ['2. メニューからCSV出力を実行'],
    ['   - 上部メニューから「⚙️ 勤怠管理」→「📥 CSV最新版を出力」を選択'],
    ['   - シート選択ダイアログで出力したい月を選択'],
    ['   - CSVファイルがGoogle Driveフォルダに保存されます'],
    [''],
    ['3. 出力先の確認'],
    ['   - 「出力CSV一覧」シートでダウンロードリンクを確認できます'],
    ['   - Google Driveフォルダ「勤怠管理_CSV出力」にも保存されます'],
    [''],
    ['【記録の編集・削除】'],
    ['1. 「記録一覧」セクションで記録を確認'],
    ['   - すべての記録がテーブル形式で表示されます'],
    ['   - 新しい記録が上に表示されます'],
    ['2. 編集したい記録の「編集」ボタンをクリック'],
    ['3. モーダルフォームで以下の項目を修正可能:'],
    ['   - 日付（年・月・日のドロップダウンから選択）'],
    ['   - 開始時刻（時間・分のドロップダウンから選択）'],
    ['   - 終了時刻（時間・分のドロップダウンから選択）'],
    ['   - 休憩時間（時間・分のドロップダウンから選択）'],
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
    ['   - メニュー「⚙️ 勤怠管理」→「🚀 Apps Scriptエディタを開く（デプロイ用）」でデプロイを確認'],
    ['   - メニュー「⚙️ 勤怠管理」→「🔗 アプリURLを設定シートに反映」でURLを自動取得'],
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
    ['Q17: CSV出力ができません'],
    ['A17: 以下の点を確認してください。'],
    ['   1. スプレッドシートを開いてからメニューから「📥 CSV最新版を出力」を選択'],
    ['   2. シート選択ダイアログで出力したい月を選択'],
    ['   3. Google Driveフォルダが設定されているか確認（初期設定で自動作成されます）'],
    ['   4. 「出力CSV一覧」シートでダウンロードリンクを確認'],
    [''],
    ['Q16: デプロイしたアプリのURLを忘れてしまいました'],
    ['A16: 以下の方法で取得できます。'],
    ['   【自動取得する方法】'],
    ['   1. スプレッドシートのメニューから「⚙️ 勤怠管理」→「🔗 アプリURLを設定シートに反映」を選択'],
    ['   2. デプロイ済みの場合は自動的にURLが取得され、設定シートのB2セルに反映されます'],
    ['   【手動で確認する方法】'],
    ['   1. メニュー「⚙️ 勤怠管理」→「🚀 Apps Scriptエディタを開く（デプロイ用）」を選択'],
    ['   2. Apps Scriptエディタで「デプロイ」→「デプロイを管理」を選択'],
    ['   3. 既存のデプロイのURLを確認'],
    ['   【設定シートにメモする方法】'],
    ['   1. 取得したURLを「設定方法」シートのB2セルに直接入力'],
    ['   2. または、上記の自動取得機能を使用'],
    [''],
    ['Q17: CSV出力ができません'],
    ['A17: 以下の点を確認してください。'],
    ['   1. スプレッドシートを開いてからメニューから「📥 CSV最新版を出力」を選択'],
    ['   2. シート選択ダイアログで出力したい月を選択'],
    ['   3. Google Driveフォルダが設定されているか確認（初期設定で自動作成されます）'],
    ['   4. 「出力CSV一覧」シートでダウンロードリンクを確認'],
    [''],
    ['Q18: もっと詳しい情報が欲しいです'],
    ['A18: 以下のシートを確認してください。'],
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