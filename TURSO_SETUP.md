# Turso DB セットアップ手順

## 1. Turso CLI インストール

```bash
# Windows (PowerShell)
irm https://get.tur.so/install.ps1 | iex

# macOS/Linux
curl -sSfL https://get.tur.so/install.sh | bash
```

## 2. Turso ログイン

```bash
turso auth login
```

ブラウザが開くので、GitHubアカウントでログイン。

## 3. データベース作成

```bash
turso db create herspecialist
```

## 4. 接続情報取得

```bash
# データベースURL取得
turso db show herspecialist --url

# 認証トークン取得
turso db tokens create herspecialist
```

## 5. 環境変数設定

`.env.local` に追加:

```
NEXT_PUBLIC_TURSO_DATABASE_URL=libsql://herspecialist-<your-username>.turso.io
NEXT_PUBLIC_TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

## 6. マイグレーション実行

```bash
# スキーマをDBに反映
npm run db:push
```

## 7. データ移行（LocalStorage → Turso）

開発サーバー起動後、ブラウザで以下にアクセス:
```
http://localhost:3000/migrate
```

---

## package.json に追加するスクリプト

```json
"scripts": {
  "db:push": "drizzle-kit push",
  "db:studio": "drizzle-kit studio"
}
```
