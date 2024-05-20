export type Position = {
  x: number;
  y: number;
};

export type TBox = {
  at: Position;
  msg: string;
};

export type MPoint = {
  at: Position;
  mapId: number; // 移動先
  to: Position; // 移動先
};

export type SPoint = {
  at: Position;
  once: boolean; // 一度きり
  msg: string;
};
