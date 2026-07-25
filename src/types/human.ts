import type { HumanSprite } from "@/types/sprite.js";
import type { Direction, Position } from "@/types/types.js";

/**
 * 人の動き方
 */
export const HumanBehavior = {
  /**
   * 静止
   */
  Still: "still",
  /**
   * ランダムに移動
   */
  RandomMove: "randomMove",
  /**
   * ランダムに方向転換
   */
  RandomDirection: "randomDirection",
  /**
   * ランダムに左右移動
   */
  RandomMoveHorizontal: "randomMoveHorizontal",
  /**
   * ランダムに上下移動
   */
  RandomMoveVertical: "randomMoveVertical",
  /**
   * 近づいてくる
   */
  GoNear: "goNear",
  /**
   * 逃げていく
   */
  RunAway: "runAway",
} as const;

export type HumanBehavior = (typeof HumanBehavior)[keyof typeof HumanBehavior];

/**
 * #HUMANチャンクにおける生の値
 */
export const RawHumanBehavior: Record<HumanBehavior, number> = {
  [HumanBehavior.Still]: 0,
  [HumanBehavior.RandomMove]: 1,
  [HumanBehavior.RandomDirection]: 2,
  [HumanBehavior.RandomMoveHorizontal]: 3,
  [HumanBehavior.RandomMoveVertical]: 4,
  [HumanBehavior.GoNear]: 5,
  [HumanBehavior.RunAway]: 6,
};

const HUMAN_BEHAVIOR_BY_RAW = new Map<number, HumanBehavior>(
  Object.entries(RawHumanBehavior).map(([behavior, raw]) => [
    raw,
    behavior as HumanBehavior,
  ]),
);

/**
 * 未知の値の場合はundefinedを返す
 */
export const parseHumanBehavior = (
  raw: string | undefined,
): HumanBehavior | undefined =>
  raw === undefined || raw.trim() === ""
    ? undefined
    : HUMAN_BEHAVIOR_BY_RAW.get(Number(raw));

export const stringifyHumanBehavior = (behavior: HumanBehavior): string =>
  String(RawHumanBehavior[behavior]);

export type Human = {
  sprite: HumanSprite;
  position: Position;
  direction: Direction;
  behavior: HumanBehavior;
  speed: number;
  message: string;
};
