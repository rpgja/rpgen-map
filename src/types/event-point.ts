import type { RawCommand } from "@/types/command.js";
import type { Position } from "@/types/types.js";

export type EventPoint = {
  position: Position;
  phases: [
    PrimaryEventPhase,
    SecondaryEventPhase,
    SecondaryEventPhase,
    SecondaryEventPhase,
  ];
};

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

export type SecondaryEventPhaseCondition = {
  gold?: number;
  switch?: number;
};

export type SecondaryEventPhase = {
  timing: EventTiming;
  condition: SecondaryEventPhaseCondition;
  sequence: RawCommand[];
};
