/**
 * Classification of Sprite.
 */
export const SpriteType = {
    /**
     * Standard still DQ material.
     */
    DQStillSprite: "dqStillSprite",
    /**
     * Standard animation DQ material.
     */
    DQAnimationSprite: "dqAnimationSprite",
    /**
     * User-created still material.
     */
    CustomStillSprite: "customStillSprite",
    /**
     * User-created animation material.
     */
    CustomAnimationSprite: "customAnimationSprite",
};
/**
 * #HUMANチャンクのスプライト指定における接頭辞
 *
 * 接頭辞がない場合は標準素材（DQAnimationSprite）を指す
 */
export const RawSpritePrefix = {
    [SpriteType.CustomAnimationSprite]: "A",
    [SpriteType.CustomStillSprite]: "-",
};
/**
 * 標準素材の静止スプライトを表す生の値の区切り文字
 *
 * e.g. "12_3"
 */
export const RAW_DQ_STILL_SPRITE_SEPARATOR = "_";
export const DQAnimationSpriteSurface = {
    /**
     * 勇者
     */
    Hero: 0,
    /**
     * 王様
     */
    King: 20,
    /**
     * 姫
     */
    Princess: 8,
    /**
     * 兵士A
     */
    SoldierA: 18,
    /**
     * 兵士B
     */
    SoldierB: 1,
    /**
     * 商人
     */
    Merchant: 2,
    /**
     * 武器商人
     */
    WeaponMerchant: 7,
    /**
     * 防具商人
     */
    ArmorMerchant: 13,
    /**
     * 戦士A
     */
    WarriorA: 6,
    /**
     * 戦士B
     */
    WarriorB: 12,
    /**
     * 老人A
     */
    ElderlyA: 3,
    /**
     * 老人B
     */
    ElderlyB: 5,
    /**
     * 老人C
     */
    ElderlyC: 10,
    /**
     * 女A
     */
    WomanA: 9,
    /**
     * 女B
     */
    WomanB: 11,
    /**
     * 女C
     */
    WomanC: 15,
    /**
     * 女D
     */
    WomanD: 17,
    /**
     * 男A
     */
    ManA: 14,
    /**
     * 男B
     */
    ManB: 16,
    /**
     * 尼
     */
    Bhikkhuni: 21,
    /**
     * 子供
     */
    Child: 4,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ByaXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3R5cGVzL3Nwcml0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRztJQUN4Qjs7T0FFRztJQUNILGFBQWEsRUFBRSxlQUFlO0lBQzlCOztPQUVHO0lBQ0gsaUJBQWlCLEVBQUUsbUJBQW1CO0lBQ3RDOztPQUVHO0lBQ0gsaUJBQWlCLEVBQUUsbUJBQW1CO0lBQ3RDOztPQUVHO0lBQ0gscUJBQXFCLEVBQUUsdUJBQXVCO0NBQ3RDLENBQUM7QUFJWDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUd4QjtJQUNGLENBQUMsVUFBVSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsR0FBRztJQUN2QyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEdBQUc7Q0FDcEMsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSw2QkFBNkIsR0FBRyxHQUFHLENBQUM7QUFFakQsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQUc7SUFDdEM7O09BRUc7SUFDSCxJQUFJLEVBQUUsQ0FBQztJQUNQOztPQUVHO0lBQ0gsSUFBSSxFQUFFLEVBQUU7SUFDUjs7T0FFRztJQUNILFFBQVEsRUFBRSxDQUFDO0lBQ1g7O09BRUc7SUFDSCxRQUFRLEVBQUUsRUFBRTtJQUNaOztPQUVHO0lBQ0gsUUFBUSxFQUFFLENBQUM7SUFDWDs7T0FFRztJQUNILFFBQVEsRUFBRSxDQUFDO0lBQ1g7O09BRUc7SUFDSCxjQUFjLEVBQUUsQ0FBQztJQUNqQjs7T0FFRztJQUNILGFBQWEsRUFBRSxFQUFFO0lBQ2pCOztPQUVHO0lBQ0gsUUFBUSxFQUFFLENBQUM7SUFDWDs7T0FFRztJQUNILFFBQVEsRUFBRSxFQUFFO0lBQ1o7O09BRUc7SUFDSCxRQUFRLEVBQUUsQ0FBQztJQUNYOztPQUVHO0lBQ0gsUUFBUSxFQUFFLENBQUM7SUFDWDs7T0FFRztJQUNILFFBQVEsRUFBRSxFQUFFO0lBQ1o7O09BRUc7SUFDSCxNQUFNLEVBQUUsQ0FBQztJQUNUOztPQUVHO0lBQ0gsTUFBTSxFQUFFLEVBQUU7SUFDVjs7T0FFRztJQUNILE1BQU0sRUFBRSxFQUFFO0lBQ1Y7O09BRUc7SUFDSCxNQUFNLEVBQUUsRUFBRTtJQUNWOztPQUVHO0lBQ0gsSUFBSSxFQUFFLEVBQUU7SUFDUjs7T0FFRztJQUNILElBQUksRUFBRSxFQUFFO0lBQ1I7O09BRUc7SUFDSCxTQUFTLEVBQUUsRUFBRTtJQUNiOztPQUVHO0lBQ0gsS0FBSyxFQUFFLENBQUM7Q0FDQSxDQUFDIn0=