# 勤怠管理アプリ

Google Apps Scriptで作成された勤怠記録管理アプリケーションです。

## 機能

- 出勤時刻の記録
- 退勤時刻と業務内容の記録
- 今日の勤怠状況の取得
- WebアプリとしてのHTMLインターフェース
- スプレッドシートとの連携（年月ごとにシートを自動生成）

## ファイル構成

- `Code.gs` - メインのGASコード
- `appsscript.json` - GASの設定ファイル

## セットアップ

1. Google Apps Scriptエディタでプロジェクトを作成
2. `Code.gs`と`appsscript.json`をアップロード
3. スプレッドシートIDを`Code.gs`の`SPREADSHEET_ID`に設定
4. Webアプリとしてデプロイ

## 使用方法

Webアプリとしてデプロイ後、URLにアクセスして出勤・退勤を記録できます。

