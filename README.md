# Sakaguchi Daimon Homepage

GitHub Pagesで公開するための、Sakaguchi Daimonの個人/学術ホームページです。ビルド不要の静的HTMLとして構成しています。

## Pages

- `index.html`: トップページ
- `pages/about.html`: プロフィール、研究関心、学歴、職歴
- `pages/research.html`: 研究テーマ、プロジェクト、発表
- `pages/publications.html`: 論文、プレプリント、技術報告、成果物
- `pages/cv.html`: CV、受賞歴、教育経験、サービス活動
- `pages/contact.html`: 連絡先、外部プロフィール

## Files

```text
homepage/
├── assets/
│   └── profile-placeholder.svg
├── pages/
│   ├── about.html
│   ├── contact.html
│   ├── cv.html
│   ├── publications.html
│   └── research.html
├── scripts/
│   └── main.js
├── styles/
│   └── main.css
├── _config.yml
├── index.html
├── package.json
└── README.md
```

## Local Preview

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。HTMLファイルを直接開いても確認できます。

## GitHub Pages

GitHubのリポジトリ設定で Pages を有効化し、次の設定にします。

- Source: Deploy from a branch
- Branch: `main`
- Folder: `/root`

公開URLは `https://saka-d.github.io/homepage/` です。

## Customize

まずは次を差し替えるとサイトらしくなります。

- `index.html`: 所属、研究分野、News
- `pages/about.html`: 略歴、学歴、職歴
- `pages/research.html`: 研究テーマ、プロジェクト、発表
- `pages/publications.html`: 論文リストとPDF/DOI/コードへのリンク
- `pages/contact.html`: 所属、研究室、Google Scholar/CiNii/PubMedなどの外部インデックス
- `assets/profile-placeholder.svg`: 顔写真や正式なプロフィール画像
