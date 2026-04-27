# Sakaguchi Daimon - Homepage

このリポジトリは、GitHub Pagesを用いたsakaguchi daimonの個人ホームページです。

## 構成

```
homepage/
├── index.html                 # メインページ
├── pages/
│   ├── about.html            # 自己紹介ページ
│   ├── publications.html      # 論文・出版物ページ
│   └── contact.html          # お問い合わせページ
├── styles/
│   └── main.css              # メインスタイルシート
├── scripts/
│   └── main.js               # メイン機能スクリプト
├── README.md                 # このファイル
├── package.json              # プロジェクト情報
└── .gitignore                # Git無視ファイル
```

## ページ構成

### 1. Home (index.html)
- ホームページのメインランディングページ
- プロフィール紹介セクション
- 最新論文へのリンク

### 2. About (pages/about.html)
- 自己紹介
- 学歴
- 研究興味
- 職務経歴

### 3. Publications (pages/publications.html)
- 年ごとの論文リスト
- 掲載誌・学会情報
- PDF・ArXiv・DOIなどへのリンク

### 4. Contact (pages/contact.html)
- メールアドレス
- ソーシャルメディアリンク
- お問い合わせフォーム（実装予定）

## 使用方法

1. **ローカル開発**
   - このリポジトリをクローン
   - `index.html`をブラウザで開く

2. **GitHub Pagesでの公開**
   - リポジトリ設定で "GitHub Pages" を有効化
   - Branch: `main`、Folder: `/root` を選択
   - `https://saka-d.github.io/homepage` でアクセス可能

## カスタマイズ

各ファイルを編集して、以下の情報を更新してください：

- **index.html**: プロフィール情報、リンク
- **pages/about.html**: 学歴、職務経歴、研究興味
- **pages/publications.html**: 論文リスト、リンク
- **pages/contact.html**: メールアドレス、SNSリンク
- **styles/main.css**: カラースキーム、フォント

## スタイル設定

`styles/main.css`のルート変数を変更してカラースキームをカスタマイズできます：

```css
:root {
    --primary-color: #2c3e50;
    --secondary-color: #3498db;
    --accent-color: #e74c3c;
    --bg-color: #ecf0f1;
    /* ... 他の変数 */
}
```

## ライセンス

MIT License

## 今後の追加予定機能

- [ ] お問い合わせフォームの完全実装
- [ ] 研究プロジェクトページ
- [ ] ブログ機能
- [ ] 画像・アイコンの追加
- [ ] 多言語対応（日本語・英語）
- [ ] ダークモードサポート
- [ ] アクセス解析

---

作成日: 2026年4月27日
