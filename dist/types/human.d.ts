import type { HumanSprite } from "../types/sprite.js";
import type { Direction, Position } from "../types/types.js";
export declare const HumanBehavior: {
    readonly Still: 0;
    readonly RandomMove: 1;
    readonly RandomDirection: 2;
    readonly RandomMoveHorizontal: 3;
    readonly RandomMoveVertical: 4;
    readonly GoNear: 5;
    readonly RunAway: 6;
};
export type HumanBehavior = (typeof HumanBehavior)[keyof typeof HumanBehavior];
export type Human = {
    sprite: HumanSprite;
    position: Position;
    direction: Direction;
    behavior: HumanBehavior;
    speed: number;
    message: string;
};
//# sourceMappingURL=human.d.ts.map