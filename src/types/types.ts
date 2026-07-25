export type PercentPosition = {
  xPercent: number;
  yPercent: number;
};

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export const Direction = {
  North: "north",
  East: "east",
  South: "south",
  West: "west",
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

/**
 * マップデータにおける生の値
 */
export const RawDirection: Record<Direction, number> = {
  [Direction.North]: 0,
  [Direction.East]: 1,
  [Direction.South]: 2,
  [Direction.West]: 3,
};

const DIRECTION_BY_RAW = new Map<number, Direction>(
  Object.entries(RawDirection).map(([direction, raw]) => [
    raw,
    direction as Direction,
  ]),
);

/**
 * 未知の値の場合はundefinedを返す
 */
export const parseDirection = (
  raw: string | undefined,
): Direction | undefined =>
  raw === undefined || raw.trim() === ""
    ? undefined
    : DIRECTION_BY_RAW.get(Number(raw));

export const stringifyDirection = (direction: Direction): string =>
  String(RawDirection[direction]);
