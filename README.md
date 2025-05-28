# rpgen-map
Library on map data for RPGEN.

RPGEN 規格に基づいた RPG マップテキストデータをパースし、  
JavaScript/TypeScript で扱いやすいオブジェクトに変換するライブラリです。

---

## 概要 / Overview

`rpgen-map` は、RPGEN のマップテキストデータをプログラムで解釈可能な形に変換します。  
歩行グラフィック（歩行グラ）やスプライト素材、マップに付随する各種情報も解析可能です。

---

## リンク集
- 👀 [DEMO](https://rpgja.github.io/enrpg)
- 🛫 [仕様書](https://rpgja.github.io/rpgen-map)
- 🌟 [GitHubリポジトリ](https://github.com/rpgja/rpgen-map)
- 🌴 [npmパッケージ](https://www.npmjs.com/package/@rpgja/rpgen-map)

## 主な機能 / Features

- RPGEN マップテキストデータのパース  
- 歩行グラ・スプライト素材の解釈  
- マップ関連の補助ユーティリティ  
- TypeScript 対応

---

## インストール（Node.js）

```bash
npm install @rpgja/rpgen-map
# または
yarn add @rpgja/rpgen-map
```

```
import { RPGMap } from "@rpgja/rpgen-map";

const mapText = `...RPGENのマップテキストデータ...`;
const rpgMap = RPGMap.parse(mapText);
```

## インストール（ブラウザ）
※未対応

```
const { RPGMap } = await import("https://cdn.jsdelivr.net/npm/@rpgja/rpgen-map/dist/index.mjs");

const mapText = `...RPGENのマップテキストデータ...`;
const rpgMap = RPGMap.parse(mapText);
```


## ライセンス / License

- **MIT**  
  本プロジェクト全体には MIT ライセンスが適用されます。詳細は [`LICENSE`](./LICENSE) をご覧ください。

## コントリビュート / Contributing

バグ報告・機能提案・PR 大歓迎です。
Issue または Fork → PR にてご協力ください。
