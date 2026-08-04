# Site maintenance guide

## Source and generated files

日英ページの多くは生成物です。本文を長期的に変更する場合は、HTMLだけでなく対応するソースを編集します。

- 通常ページ・Methods: `scripts/i18n/*.mjs`
- 計算例: `scripts/add_calculation_examples.mjs`
- Multiwfn接続・研究ワークフロー: `scripts/add_cross_chapter_content.mjs`
- 用語集・検索・JSON-LD・表記統一: `scripts/enhance_site_features.mjs`
- 共通動作: `scripts/main.js`
- 共通表示: `styles/main.css`

## Required workflow

```sh
npm run verify:site
python3 -m http.server 8001
```

PC幅とモバイル幅で日本語・英語を確認します。検索はタイトル、見出し、description、本文の順に重み付けされ、30件まで表示されます。

## Terminology

日本語本文では、一般的な日本語訳が定着している語を文中で統一します。

| Preferred | Avoid in Japanese prose |
| --- | --- |
| エネルギー | energy |
| 電子密度 | density（変数名・固有名を除く） |
| グリッド | grid |
| 波動関数 | wavefunction |
| 記述子 | descriptor |
| 少数標本 | low sample |
| 一点計算 | single-point calculation |
| メタデータ | metadata |
| スクリプト | script |

ソフトウェア名、API名、ファイル形式、コード、数式中の記号は原表記を維持します。NCI/IGMHの可視化結果は相互作用エネルギーと断定せず、SHAPや回帰係数は因果効果と断定しません。

## Calculation examples

各結果ディレクトリの `metadata.json` には、少なくとも `example`、`software`、`note` を含めます。使用した構造、理論レベルまたは力場、ソフトウェアバージョン、乱数シードまたはグリッド条件、主要な検証値も可能な限り保存します。

## Release check

`npm run verify:site` は次を検査します。

- 日英ページの対応と翻訳漏れ
- ローカルリンクと画像・データファイル
- 重複ID、canonical、hreflang、JSON-LD
- 検索索引と実ページの対応
- 用語集の最低項目数
- 計算例メタデータの必須項目

公開前に `git diff --check` も実行し、ローカル表示で検索・用語絞り込み・研究ワークフローを操作確認します。
