import type { RawCommand } from "@/types/command.js";
import type { Position } from "@/types/types.js";

/**
 * イベントポイント
 *
 * マップ上の特定座標に配置されたイベント。
 * 最大4つのフェイズを持ち、`phases[0]` はプライマリフェイズ（条件なし）、
 * `phases[1]`〜`phases[3]` はそれぞれ独立した条件を持つセカンダリフェイズ。
 *
 * フェイズの評価順序: `phases[1]` → `phases[2]` → `phases[3]` → `phases[0]`（フォールバック）
 */
export type EventPoint = {
  position: Position;
  phases: [
    PrimaryEventPhase,
    SecondaryEventPhase,
    SecondaryEventPhase,
    SecondaryEventPhase,
  ];
};

/**
 * プライマリフェイズ（#PH0）
 *
 * 条件を持たず、`phases[0]` に固定される。
 * セカンダリフェイズ（#PH1〜#PH3）がいずれも発動しない場合に実行されるフォールバックフェイズ。
 * `timing` のみを持ち、`condition` は存在しない（TypeScriptの型レベルで区別される）。
 */
export type PrimaryEventPhase = {
  timing: EventTiming;
  sequence: RawCommand[];
};

/**
 * イベントが発動するきっかけ
 */
export const EventTiming = {
  /**
   * 決定ボタンを押したときに発動する
   */
  Confirm: "confirm",
  /**
   * 接触したときに発動する
   */
  Touch: "touch",
} as const;

export type EventTiming = (typeof EventTiming)[keyof typeof EventTiming];

/**
 * #PH<N>チャンクのtmパラメータにおける生の値
 */
export const RawEventTiming: Record<EventTiming, number> = {
  [EventTiming.Confirm]: 0,
  [EventTiming.Touch]: 1,
};

const EVENT_TIMING_BY_RAW = new Map<number, EventTiming>(
  Object.entries(RawEventTiming).map(([timing, raw]) => [
    raw,
    timing as EventTiming,
  ]),
);

/**
 * 未知の値の場合はundefinedを返す
 */
export const parseEventTiming = (
  raw: string | undefined,
): EventTiming | undefined =>
  raw === undefined || raw.trim() === ""
    ? undefined
    : EVENT_TIMING_BY_RAW.get(Number(raw));

export const stringifyEventTiming = (timing: EventTiming): string =>
  String(RawEventTiming[timing]);

/**
 * 1つのイベントが持てるフェイズ数
 */
export const EVENT_PHASE_COUNT = 4;

/**
 * 条件を持たないフェイズ（#PH0）のインデックス
 */
export const PRIMARY_EVENT_PHASE_INDEX = 0;

/**
 * セカンダリフェイズ（#PH1〜#PH3）の発動条件
 *
 * `switch` と `gold` はそれぞれ独立したフィールドであり、
 * **両方が指定された場合はAND条件**（スイッチがON かつ 所持金が条件以上）として扱われる。
 * どちらかのみ指定された場合はその条件のみ適用され、
 * **両方 `undefined` の場合は無条件で発動する**（常時アクティブ）。
 *
 * @example
 * // スイッチ5番がONのときのみ発動
 * { switch: 5 }
 *
 * @example
 * // 所持金が1000以上のときのみ発動
 * { gold: 1000 }
 *
 * @example
 * // スイッチ5番がONかつ所持金が1000以上のときのみ発動（AND条件）
 * { switch: 5, gold: 1000 }
 *
 * @example
 * // 無条件で発動（条件なし）
 * {}
 */
export type SecondaryEventPhaseCondition = {
  /**
   * 発動条件: 指定スイッチ番号がONであること。
   * 未指定（`undefined`）の場合はスイッチ条件なし。
   */
  switch?: number;
  /**
   * 発動条件: 所持金がこの値以上であること。
   * 未指定（`undefined`）の場合は所持金条件なし。
   */
  gold?: number;
};

/**
 * セカンダリフェイズ（#PH1〜#PH3）
 *
 * `phases[0]`（プライマリフェイズ）と異なり、`condition` を持つ。
 * `condition` の内容に基づいてフェイズが発動するかどうかが決まる。
 * `condition` が空オブジェクト（`{}`）の場合は**無条件で発動する**。
 *
 * フェイズの優先順位は配列インデックスが小さいほど高い（先に評価される）。
 * 最初に条件を満たしたフェイズのみが実行される。
 */
export type SecondaryEventPhase = {
  timing: EventTiming;
  condition: SecondaryEventPhaseCondition;
  sequence: RawCommand[];
};
