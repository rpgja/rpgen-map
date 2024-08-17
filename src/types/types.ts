export type Position = {
  x: number;
  y: number;
};

export type Size = {
  width: number;
  height: number;
};

export const Direction = {
  North: 0,
  East: 1,
  South: 2,
  West: 3,
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];
