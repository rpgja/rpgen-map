import type { Position } from "@/types.js";
export type TreasureBox = {
  at: Position;
  msg: string;
};

export type MovePoint = {
  at: Position;
  mapId: number; // 移動先
  to: Position; // 移動先
};

export type SiraberuPoint = {
  at: Position;
  once: boolean; // 一度きり
  msg: Position;
};
