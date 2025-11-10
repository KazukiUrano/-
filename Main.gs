/**
 * 作成者：浦野一輝
 * 作成日：2025-11-11 02:32:19
 * 最終更新：2025-11-11 04:36:09
 * 説明：勤怠管理アプリ - Main（機能別分割）
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
 * - 2025-11-11 04:23:30 [浦野一輝]：onOpen関数にアプリURL自動反映機能を追加、メニューに「🔗 アプリURLを設定シートに反映」を追加
 * - 2025-11-11 04:25:15 [浦野一輝]：メニューに「🚀 Apps Scriptエディタを開く（デプロイ用）」を追加、onOpenでの自動取得エラーを無視するように変更
 * - 2025-11-11 04:36:09 [浦野一輝]：メニューから「スプレッドシート接続テスト」と「Apps Scriptエディタを開く（デプロイ用）」「アプリURLを設定シートに反映」を削除、onOpenでの自動URL反映を削除
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
                    font-size: 24px;
                    font-weight: bold;
                    margin-top: 12px;
                    padding: 12px;
                    background-color: #FFEBEE;
                    border-left: 4px solid #F44336;
                    border-radius: 4px;
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
                                // 開始時刻と終了時刻の関係に関するエラーの場合、終了時刻のエラーとして表示
                                if (result.message && (result.message.indexOf('開始時刻が終了時刻より遅い') !== -1 || result.message.indexOf('開始時刻は終了時刻より早い') !== -1)) {
                                    document.getElementById('editEndTimeError').textContent = '終了時刻は開始時刻より遅い時間を入力してください';
                                    showMessage('終了時刻は開始時刻より遅い時間を入力してください', 'error');
                                } else {
                                    showMessage(result.message, 'error');
                                }
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
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('⚙️ 勤怠管理')
    .addItem('🔧 初期設定をする', 'setupInitialConfiguration')
    .addSeparator()
    .addItem('📥 CSV最新版を出力', 'exportCSVToSheet')
    .addToUi();
}

/**
 * 初期設定：設定シートと使用方法シートを作成・設定
 * @return {Object} 成功時は{success: true, message: string}、失敗時は{success: false, message: string}
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