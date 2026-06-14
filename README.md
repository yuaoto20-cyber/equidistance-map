# 等距離マップ

地図上で任意の地点を選び、その地点を中心に指定半径の同心円を表示するWebアプリです。旅行計画や地理遊びで、直線距離の目安を確認できます。

## 使用技術

- React
- Vite
- TypeScript
- Leaflet
- React-Leaflet
- 国土地理院 標準地図タイル

## インストール方法

```bash
npm install
```

Windows PowerShellで`npm.ps1`の実行ポリシーエラーが出る場合は、以下のように`npm.cmd`を使ってください。

```bash
npm.cmd install
```

## 起動方法

```bash
npm run dev
```

Windows PowerShellの場合:

```bash
npm.cmd run dev
```

## ビルド方法

```bash
npm run build
```

Windows PowerShellの場合:

```bash
npm.cmd run build
```

## GitHub Pagesで公開する方法

このリポジトリをGitHubにpushすると、`.github/workflows/deploy.yml`のGitHub Actionsで自動ビルドされ、GitHub Pagesへ公開できます。

公開前にGitHub側で以下を設定してください。

1. リポジトリの`Settings`を開く
2. `Pages`を開く
3. `Build and deployment`の`Source`を`GitHub Actions`にする
4. `main`ブランチへpushする

公開後のURLは通常、以下の形式になります。

```txt
https://ユーザー名.github.io/リポジトリ名/
```

このアプリはバックエンド、ログイン、データ保存なしで動作します。中心地点と半径はURLクエリに含められますが、サーバーへ保存される仕組みはありません。
