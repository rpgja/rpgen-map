import type { HumanSprite } from "../types/sprite.js";
import type { Direction, Position } from "../types/types.js";
/**
 * 人の動き方
 */
export declare const HumanBehavior: {
    /**
     * 静止
     */
    readonly Still: "still";
    /**
     * ランダムに移動
     */
    readonly RandomMove: "randomMove";
    /**
     * ランダムに方向転換
     */
    readonly RandomDirection: "randomDirection";
    /**
     * ランダムに左右移動
     */
    readonly RandomMoveHorizontal: "randomMoveHorizontal";
    /**
     * ランダムに上下移動
     */
    readonly RandomMoveVertical: "randomMoveVertical";
    /**
     * 近づいてくる
     */
    readonly GoNear: "goNear";
    /**
     * 逃げていく
     */
    readonly RunAway: "runAway";
};
export type HumanBehavior = (typeof HumanBehavior)[keyof typeof HumanBehavior];
/**
 * #HUMANチャンクにおける生の値
 */
export declare const RawHumanBehavior: Record<HumanBehavior, number>;
/**
 * 未知の値の場合はundefinedを返す
 */
export declare const parseHumanBehavior: (raw: string | undefined) => HumanBehavior | undefined;
export declare const stringifyHumanBehavior: (behavior: HumanBehavior) => string;
export type Human = {
    sprite: HumanSprite;
    position: Position;
    direction: Direction;
    behavior: HumanBehavior;
    speed: number;
    message: string;
};
//# sourceMappingURL=human.d.ts.map