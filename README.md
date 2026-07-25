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

---

## 使い方・パースの2段階処理 / Usage & Two-Stage Parsing

本ライブラリのパース処理は、**マップ全体**と**個別コマンド**の2段階構造になっています。

1. **第1段階: マップ全体のパース (`RPGMap.parse(mapText)`)**
   * マップ全体のデータ（タイル、配置、イベントポイント等）を解析し、`RPGMap` オブジェクトを返します。
   * イベントフェイズ内のコマンドシーケンス (`phase.sequence`) は、テキストの相互変換（`stringify`）を可能にするため **`RawCommand`** オブジェクト（`#name` と未解釈の生文字列 `#body`）の配列として保持されます。

2. **第2段階: コマンドの構造化パース (`rawCommand.parse()`)**
   * 各 `RawCommand` の `.parse()` メソッドを呼び出すことで、選択肢（`#SEL`）の入れ子構造や各種パラメータが解釈され、型付けされた抽象構文木 **`Command`** オブジェクト（`SelectCommand`, `MessageCommand` など）に変換されます。

```ts
import { RPGMap } from "@rpgja/rpgen-map";

// 第1段階: マップ全体のパース
const rpgMap = RPGMap.parse(mapText);

// イベントポイントとフェイズの取得
const eventPoint = rpgMap.eventPoints.get(5, 3);
const phase = eventPoint?.phases[0];

// 第2段階: RawCommand[] から構造化された Command[] へ変換
const structuredCommands = phase?.sequence.map((rawCmd) => rawCmd.parse());
```

---

## パース結果のサンプル / Sample of parsing results

イベントポイント（`#EPOINT`）は、発動タイミング（`tm`）が自然言語の値にパースされます。
また `#SEL` は入れ子になった分岐構造もパース可能です（`#SEL0-0` の中にさらに `#SEL1-0` を含む例）。

入力（RPGENマップテキスト）:

```
#EPOINT tx:5,ty:3,
#PH0 tm:1,
#MSG
m:この先には　わなが　あるようだ,
#ED
#SEL0-0 x:50,y:220,c:1,i0:しらべる,i1:やめておく,
#SEL1-0 c:0,i0:はい,i1:いいえ,
#MSG
m:わなを　かいじょした！,
#ED
#SEL1-1
#MSG
m:なにも　しなかった,
#ED
#SELEND1
#SEL0-1
#MSG
m:やめておいた,
#ED
#SELEND0
#PHEND0
#END
```

コード:

```js
const rpgMap = RPGMap.parse(mapText);
const eventPoint = rpgMap.eventPoints.get(5, 3);
const primaryPhase = eventPoint.phases[0];
const commands = primaryPhase.sequence.map((c) => c.parse());
```

パース結果（`timing` が `1` ではなく `"touch"` になる点、`#SEL` が入れ子のまま `choices` 配列として表現される点に注目）:

```json
{
  "position": { "x": 5, "y": 3 },
  "timing": "touch",
  "sequence": [
    {
      "type": "MSG",
      "content": "この先には　わなが　あるようだ"
    },
    {
      "type": "SEL",
      "clearMessage": true,
      "choices": [
        {
          "label": "しらべる",
          "sequence": [
            {
              "type": "SEL",
              "clearMessage": false,
              "choices": [
                {
                  "label": "はい",
                  "sequence": [
                    { "type": "MSG", "content": "わなを　かいじょした！" }
                  ]
                },
                {
                  "label": "いいえ",
                  "sequence": [
                    { "type": "MSG", "content": "なにも　しなかった" }
                  ]
                }
              ]
            }
          ]
        },
        {
          "label": "やめておく",
          "sequence": [
            { "type": "MSG", "content": "やめておいた" }
          ]
        }
      ],
      "displayPosition": { "x": 50, "y": 220 }
    }
  ]
}
```

`timing` の値は `EventTiming.Confirm`（`"confirm"`、決定ボタンで発動）または `EventTiming.Touch`（`"touch"`、接触で発動）のいずれかです。

---

## ライセンス / License

- **MIT**  
  本プロジェクト全体には MIT ライセンスが適用されます。詳細は [`LICENSE`](./LICENSE) をご覧ください。

## コントリビュート / Contributing

バグ報告・機能提案・PR 大歓迎です。
Issue または Fork → PR にてご協力ください。
