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
export declare const Direction: {
    readonly North: "north";
    readonly East: "east";
    readonly South: "south";
    readonly West: "west";
};
export type Direction = (typeof Direction)[keyof typeof Direction];
/**
 * マップデータにおける生の値
 */
export declare const RawDirection: Record<Direction, number>;
/**
 * 未知の値の場合はundefinedを返す
 */
export declare const parseDirection: (raw: string | undefined) => Direction | undefined;
export declare const stringifyDirection: (direction: Direction) => string;
//# sourceMappingURL=types.d.ts.map