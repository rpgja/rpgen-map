import type { RawCommand } from "../types/command.js";
import type { Position } from "../types/types.js";
export type EventPoint = {
    position: Position;
    phases: [
        PrimaryEventPhase,
        SecondaryEventPhase,
        SecondaryEventPhase,
        SecondaryEventPhase
    ];
};
export type PrimaryEventPhase = {
    timing: EventTiming;
    sequence: RawCommand[];
};
/**
 * イベントが発動するきっかけ
 */
export declare const EventTiming: {
    /**
     * 決定ボタンを押したときに発動する
     */
    readonly Confirm: "confirm";
    /**
     * 接触したときに発動する
     */
    readonly Touch: "touch";
};
export type EventTiming = (typeof EventTiming)[keyof typeof EventTiming];
/**
 * #PH<N>チャンクのtmパラメータにおける生の値
 */
export declare const RawEventTiming: Record<EventTiming, number>;
/**
 * 未知の値の場合はundefinedを返す
 */
export declare const parseEventTiming: (raw: string | undefined) => EventTiming | undefined;
export declare const stringifyEventTiming: (timing: EventTiming) => string;
/**
 * 1つのイベントが持てるフェイズ数
 */
export declare const EVENT_PHASE_COUNT = 4;
/**
 * 条件を持たないフェイズ（#PH0）のインデックス
 */
export declare const PRIMARY_EVENT_PHASE_INDEX = 0;
export type SecondaryEventPhaseCondition = {
    gold?: number;
    switch?: number;
};
export type SecondaryEventPhase = {
    timing: EventTiming;
    condition: SecondaryEventPhaseCondition;
    sequence: RawCommand[];
};
//# sourceMappingURL=event-point.d.ts.map