# Sakaguchi Daimon Homepage

坂口大門の個人・学術ホームページです。GitHub Pagesで公開する静的HTMLサイトで、日本語版と英語版、計算化学ノート、再現可能な計算例を含みます。

公開URL: https://saka-d.github.io/homepage/

## Local preview

```sh
python3 -m http.server 8001
```

`http://127.0.0.1:8001/` を開いて確認します。サイト内検索はJSONを取得するため、HTMLファイルを直接開かずHTTPサーバーを使用してください。

## Generate and verify

```sh
npm run verify:site
```

このコマンドは次を順に実行します。

- 日英29組のページを生成
- 計算例、Multiwfnへの接続、研究ワークフローを反映
- 用語集、検索ページ、検索索引、JSON-LDを生成
- Google Analyticsタグを公開ドメインに限定して全ページへ生成
- hreflang、翻訳漏れ、ローカルリンク、重複ID、canonical、アクセス解析、検索索引、計算メタデータを検査

計算結果そのものを再生成する場合だけ、Python環境とNCIplotを用意して `npm run examples:generate` を実行します。条件は [assets/calculations/README.md](assets/calculations/README.md) を参照してください。

## Main files

- `scripts/i18n/`: 日英ページの本文ソースとレンダラー
- `scripts/add_calculation_examples.mjs`: 計算結果と分子ビューアーの接続
- `scripts/add_cross_chapter_content.mjs`: Multiwfn接続と研究ワークフロー
- `scripts/enhance_site_features.mjs`: 検索、用語集、SEO、表記統一
- `scripts/validate_site.mjs`: 公開前の静的検査
- `scripts/site-config.mjs`: 公開URL、更新日、Google Analytics測定IDなどの共通設定
- `scripts/main.js`: 検索、絞り込み、ナビゲーションの動作
- `styles/main.css`: 全体の表示
- `assets/calculations/`: 計算結果と来歴メタデータ

編集と再生成の詳しい規則は [CONTRIBUTING.md](CONTRIBUTING.md) にまとめています。

## Deployment

`main` へのpush時にGitHub Actionsが `npm run verify:release` を実行し、再生成と冪等性検査に成功した内容をGitHub Pagesへ公開します。
