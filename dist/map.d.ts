import { InfinityChipMap, TileChipMap } from "./chip.js";
import { type EventPoint } from "./types/event-point.js";
import { type Human } from "./types/human.js";
import type { LookPoint } from "./types/look-point.js";
import type { TeleportPoint } from "./types/teleport-point.js";
import type { TreasureBoxPoint } from "./types/treasure-box-point.js";
import { type Position } from "./types/types.js";
export type RPGMapInit = {
    initialHeroPosition?: Position;
    backgroundImageUrl?: string;
    bgmUrl?: string;
    lookPoints?: InfinityChipMap<LookPoint>;
    eventPoints?: InfinityChipMap<EventPoint>;
    teleportPoints?: InfinityChipMap<TeleportPoint>;
    humans?: InfinityChipMap<Human>;
    treasureBoxPoints?: InfinityChipMap<TreasureBoxPoint>;
    floor: TileChipMap;
    objects: TileChipMap;
};
export declare const WellKnownChunkName: {
    readonly Hero: "HERO";
    readonly BGM: "BGM";
    readonly BackgroundImage: "BGIMG";
    readonly Floor: "FLOOR";
    readonly Objects: "MAP";
    readonly Human: "HUMAN";
    readonly TreasureBoxPoint: "TBOX";
    readonly LookPoint: "SPOINT";
    readonly EventPoint: "EPOINT";
    readonly TeleportPoint: "MPOINT";
};
export type WellKnownChunkName = (typeof WellKnownChunkName)[keyof typeof WellKnownChunkName];
export type UnknownChunkName = string & {};
export type ChunkName = WellKnownChunkName | UnknownChunkName;
export declare class RPGMap {
    #private;
    readonly initialHeroPosition: Position;
    readonly backgroundImageUrl: string;
    readonly bgmUrl?: string;
    readonly lookPoints: InfinityChipMap<LookPoint>;
    readonly eventPoints: InfinityChipMap<EventPoint>;
    readonly teleportPoints: InfinityChipMap<TeleportPoint>;
    readonly humans: InfinityChipMap<Human>;
    readonly treasureBoxPoints: InfinityChipMap<TreasureBoxPoint>;
    readonly objects: TileChipMap;
    readonly floor: TileChipMap;
    constructor(init: RPGMapInit);
    static parse(input: string): RPGMap;
    static stringify(rpgMap: RPGMap): string;
}
//# sourceMappingURL=map.d.ts.map