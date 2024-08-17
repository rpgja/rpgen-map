import type { Command, RawCommand } from "@/types/command.js";
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

export const EventTiming = {
  Look: 0,
  Touch: 1,
} as const;

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
