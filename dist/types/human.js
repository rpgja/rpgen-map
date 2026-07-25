/**
 * 人の動き方
 */
export const HumanBehavior = {
    /**
     * 静止
     */
    Still: "still",
    /**
     * ランダムに移動
     */
    RandomMove: "randomMove",
    /**
     * ランダムに方向転換
     */
    RandomDirection: "randomDirection",
    /**
     * ランダムに左右移動
     */
    RandomMoveHorizontal: "randomMoveHorizontal",
    /**
     * ランダムに上下移動
     */
    RandomMoveVertical: "randomMoveVertical",
    /**
     * 近づいてくる
     */
    GoNear: "goNear",
    /**
     * 逃げていく
     */
    RunAway: "runAway",
};
/**
 * #HUMANチャンクにおける生の値
 */
export const RawHumanBehavior = {
    [HumanBehavior.Still]: 0,
    [HumanBehavior.RandomMove]: 1,
    [HumanBehavior.RandomDirection]: 2,
    [HumanBehavior.RandomMoveHorizontal]: 3,
    [HumanBehavior.RandomMoveVertical]: 4,
    [HumanBehavior.GoNear]: 5,
    [HumanBehavior.RunAway]: 6,
};
const HUMAN_BEHAVIOR_BY_RAW = new Map(Object.entries(RawHumanBehavior).map(([behavior, raw]) => [
    raw,
    behavior,
]));
/**
 * 未知の値の場合はundefinedを返す
 */
export const parseHumanBehavior = (raw) => raw === undefined || raw.trim() === ""
    ? undefined
    : HUMAN_BEHAVIOR_BY_RAW.get(Number(raw));
export const stringifyHumanBehavior = (behavior) => String(RawHumanBehavior[behavior]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHVtYW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdHlwZXMvaHVtYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0E7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUc7SUFDM0I7O09BRUc7SUFDSCxLQUFLLEVBQUUsT0FBTztJQUNkOztPQUVHO0lBQ0gsVUFBVSxFQUFFLFlBQVk7SUFDeEI7O09BRUc7SUFDSCxlQUFlLEVBQUUsaUJBQWlCO0lBQ2xDOztPQUVHO0lBQ0gsb0JBQW9CLEVBQUUsc0JBQXNCO0lBQzVDOztPQUVHO0lBQ0gsa0JBQWtCLEVBQUUsb0JBQW9CO0lBQ3hDOztPQUVHO0lBQ0gsTUFBTSxFQUFFLFFBQVE7SUFDaEI7O09BRUc7SUFDSCxPQUFPLEVBQUUsU0FBUztDQUNWLENBQUM7QUFJWDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFrQztJQUM3RCxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0lBQ3hCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7SUFDN0IsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQztJQUNsQyxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLENBQUM7SUFDdkMsQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDO0lBQ3JDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDekIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztDQUMzQixDQUFDO0FBRUYsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsQ0FDbkMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQztJQUN4RCxHQUFHO0lBQ0gsUUFBeUI7Q0FDMUIsQ0FBQyxDQUNILENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUFHLENBQ2hDLEdBQXVCLEVBQ0ksRUFBRSxDQUM3QixHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0lBQ3BDLENBQUMsQ0FBQyxTQUFTO0lBQ1gsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUU3QyxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBRyxDQUFDLFFBQXVCLEVBQVUsRUFBRSxDQUN4RSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyJ9