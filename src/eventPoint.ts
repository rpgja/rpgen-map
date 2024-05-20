import type { Position } from "@/types.js";
export type EventPoint = {
  at: Position;
  phase: EventPhase[];
};

/**
 * 命令文
 */
export type Command = {};

export type Trigger = {
  z: 0; // 調べた時
  touch: 1; // 触った時
};

export type EventPhase = {
  if: {
    trigger: Trigger;
    sw: number;
    gold: number;
  };
  sequence: Command[];
};
