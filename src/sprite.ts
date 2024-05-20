import type { Position } from "@/types.js";

export enum SpriteType {
  DQStaticSprite,
  DQAnimationSprite,
  FreeStaticSprite,
  FreeAnimationSprite
}

export type DQStaticSprite = {
  type: SpriteType.DQStaticSprite,
  id: Position
};

export type DQAnimationSprite = {
  type: SpriteType.DQAnimationSprite,
  id: number
};

export type FreeStaticSprite = {
  type: SpriteType.FreeStaticSprite,
  id: number
};

export type FreeAnimationSprite = {
  type: SpriteType.FreeAnimationSprite,
  id: number
};
