import type { Position } from "@/types.js";

export enum SpriteType {
  DQStaticSprite,
  DQAnimationSprite,
  FreeStaticSprite,
  FreeAnimationSprite,
}

export type DQStaticSprite = {
  type: SpriteType.DQStaticSprite;
  id: Position;
};

export type DQAnimationSprite = {
  type: SpriteType.DQAnimationSprite;
  id: number;
};

export type FreeStaticSprite = {
  type: SpriteType.FreeStaticSprite;
  id: number;
};

export type FreeAnimationSprite = {
  type: SpriteType.FreeAnimationSprite;
  id: number;
};

export enum Way {
  Up = 0,
  Right = 1,
  Down = 2,
  Left = 3,
}

export enum Move {
  Stop = 0,
  Random = 1,
  RandomWay = 2,
  RandomHorizontal = 3,
  RandomVertical = 4,
  GoNear = 5,
  RunAway = 6,
}

export type Human = {
  sprite:
    | DQStaticSprite
    | DQAnimationSprite
    | FreeStaticSprite
    | FreeAnimationSprite;
  at: Position; // Human.at.x or Human.at.y
  way: Way;
  move: Move; // 動き方
  speed: number;
  msg: string;
};
