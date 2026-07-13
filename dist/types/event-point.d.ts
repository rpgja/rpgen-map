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
export declare const EventTiming: {
    readonly Look: 0;
    readonly Touch: 1;
};
export type EventTiming = (typeof EventTiming)[keyof typeof EventTiming];
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