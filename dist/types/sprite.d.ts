import type { Position } from "../types/types.js";
/**
 * Classification of Sprite.
 */
export declare const SpriteType: {
    /**
     * Standard still DQ material.
     */
    readonly DQStillSprite: "dqStillSprite";
    /**
     * Standard animation DQ material.
     */
    readonly DQAnimationSprite: "dqAnimationSprite";
    /**
     * User-created still material.
     */
    readonly CustomStillSprite: "customStillSprite";
    /**
     * User-created animation material.
     */
    readonly CustomAnimationSprite: "customAnimationSprite";
};
export type SpriteType = (typeof SpriteType)[keyof typeof SpriteType];
/**
 * #HUMANチャンクのスプライト指定における接頭辞
 *
 * 接頭辞がない場合は標準素材（DQAnimationSprite）を指す
 */
export declare const RawSpritePrefix: Record<typeof SpriteType.CustomAnimationSprite | typeof SpriteType.CustomStillSprite, string>;
/**
 * 標準素材の静止スプライトを表す生の値の区切り文字
 *
 * e.g. "12_3"
 */
export declare const RAW_DQ_STILL_SPRITE_SEPARATOR = "_";
export declare const DQAnimationSpriteSurface: {
    /**
     * 勇者
     */
    readonly Hero: 0;
    /**
     * 王様
     */
    readonly King: 20;
    /**
     * 姫
     */
    readonly Princess: 8;
    /**
     * 兵士A
     */
    readonly SoldierA: 18;
    /**
     * 兵士B
     */
    readonly SoldierB: 1;
    /**
     * 商人
     */
    readonly Merchant: 2;
    /**
     * 武器商人
     */
    readonly WeaponMerchant: 7;
    /**
     * 防具商人
     */
    readonly ArmorMerchant: 13;
    /**
     * 戦士A
     */
    readonly WarriorA: 6;
    /**
     * 戦士B
     */
    readonly WarriorB: 12;
    /**
     * 老人A
     */
    readonly ElderlyA: 3;
    /**
     * 老人B
     */
    readonly ElderlyB: 5;
    /**
     * 老人C
     */
    readonly ElderlyC: 10;
    /**
     * 女A
     */
    readonly WomanA: 9;
    /**
     * 女B
     */
    readonly WomanB: 11;
    /**
     * 女C
     */
    readonly WomanC: 15;
    /**
     * 女D
     */
    readonly WomanD: 17;
    /**
     * 男A
     */
    readonly ManA: 14;
    /**
     * 男B
     */
    readonly ManB: 16;
    /**
     * 尼
     */
    readonly Bhikkhuni: 21;
    /**
     * 子供
     */
    readonly Child: 4;
};
export type DQAnimationSpriteSurface = (typeof DQAnimationSpriteSurface)[keyof typeof DQAnimationSpriteSurface];
export type DQAnimationSprite = {
    type: typeof SpriteType.DQAnimationSprite;
    surface: DQAnimationSpriteSurface;
};
export type DQStillSprite = {
    type: typeof SpriteType.DQStillSprite;
    surface: Position;
};
export type CustomAnimationSprite = {
    type: typeof SpriteType.CustomAnimationSprite;
    id: number;
};
export type CustomStillSprite = {
    type: typeof SpriteType.CustomStillSprite;
    id: number;
};
export type DQSprite = DQAnimationSprite | DQStillSprite;
export type CustomSprite = CustomAnimationSprite | CustomStillSprite;
export type AnimationSprite = DQAnimationSprite | CustomAnimationSprite;
export type StillSprite = DQStillSprite | CustomStillSprite;
export type Sprite = AnimationSprite | StillSprite;
export type HumanSprite = DQAnimationSprite | CustomSprite;
//# sourceMappingURL=sprite.d.ts.map