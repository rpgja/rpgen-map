import { InfinityChipMap, TileChipMap } from "./chip.js";
import { RawCommand } from "./types/command.js";
import { EventTiming, PRIMARY_EVENT_PHASE_INDEX, parseEventTiming, stringifyEventTiming, } from "./types/event-point.js";
import { HumanBehavior, parseHumanBehavior, stringifyHumanBehavior, } from "./types/human.js";
import { RawSpritePrefix, SpriteType, } from "./types/sprite.js";
import { toRawTile } from "./types/tile.js";
import { Direction, parseDirection, stringifyDirection, } from "./types/types.js";
import { escapeMetaChars, unescapeMetaChars } from "./utils/escape.js";
import { ChunkParser, parseCSP, parseFlag, stringifyFlag, } from "./utils/parser.js";
export const WellKnownChunkName = {
    Hero: "HERO",
    BGM: "BGM",
    BackgroundImage: "BGIMG",
    Floor: "FLOOR",
    Objects: "MAP",
    Human: "HUMAN",
    TreasureBoxPoint: "TBOX",
    LookPoint: "SPOINT",
    EventPoint: "EPOINT",
    TeleportPoint: "MPOINT",
};
export class RPGMap {
    initialHeroPosition;
    backgroundImageUrl;
    bgmUrl;
    lookPoints;
    eventPoints;
    teleportPoints;
    humans;
    treasureBoxPoints;
    objects;
    floor;
    static #DEFAULT_BACKGROUND_IMAGE_URL = "http://i.imgur.com/qiN1und.jpg";
    /**
     * tmが未指定の場合の発動のきっかけ
     */
    static #DEFAULT_EVENT_TIMING = EventTiming.Confirm;
    /**
     * フェイズを表すチャンク名 e.g. "#PH0"
     */
    static #PHASE_CHUNK_NAME = "PH";
    /**
     * フェイズの終端を表すチャンク名 e.g. "#PHEND0"
     */
    static #PHASE_TERMINATOR = "PHEND";
    constructor(init) {
        this.initialHeroPosition = init.initialHeroPosition ?? { x: 0, y: 0 };
        this.backgroundImageUrl =
            init.backgroundImageUrl ?? RPGMap.#DEFAULT_BACKGROUND_IMAGE_URL;
        this.bgmUrl = init.bgmUrl;
        this.lookPoints = init.lookPoints ?? new InfinityChipMap();
        this.eventPoints = init.eventPoints ?? new InfinityChipMap();
        this.teleportPoints = init.teleportPoints ?? new InfinityChipMap();
        this.humans = init.humans ?? new InfinityChipMap();
        this.treasureBoxPoints = init.treasureBoxPoints ?? new InfinityChipMap();
        this.objects = init.objects;
        this.floor = init.floor;
    }
    static #WHITESPACE = /\s/;
    static #NON_WHITESPACE = /\S/;
    static *#parseChunks(input, termination) {
        const len = input.length;
        const WHITESPACE = RPGMap.#WHITESPACE;
        const NON_WHITESPACE = RPGMap.#NON_WHITESPACE;
        for (let pos = 0; pos < len; pos++) {
            // skip whitespaces
            while (pos < len && WHITESPACE.test(input[pos])) {
                pos++;
            }
            if (input[pos] !== "#") {
                continue;
            }
            // skip "#"
            pos++;
            let name = "";
            while (pos < len && NON_WHITESPACE.test(input[pos])) {
                name += input[pos++];
            }
            let value = "";
            const term = typeof termination === "function" ? termination(name) : termination;
            const termLen = term.length;
            while (pos < len && input.slice(pos, pos + termLen) !== term) {
                value += input[pos++];
            }
            pos += termLen;
            yield [name, value];
        }
    }
    static #parseInitialHeroPosition(value) {
        const [x, y] = value.trim().split(",");
        return {
            x: Number(x),
            y: Number(y),
        };
    }
    /**
     * Parse as URL without strict validation
     */
    static #parseLooseUrl(value) {
        const maybeUrl = value.trim();
        if (maybeUrl) {
            return maybeUrl;
        }
    }
    static #parseHuman(value) {
        const [rawSprite, x, y, direction, behavior, speed, message = ""] = value
            .trimStart()
            .split(",");
        const position = {
            x: Number(x),
            y: Number(y),
        };
        let sprite;
        switch (rawSprite?.[0]) {
            case RawSpritePrefix[SpriteType.CustomAnimationSprite]: {
                sprite = {
                    type: SpriteType.CustomAnimationSprite,
                    id: Number(rawSprite.slice(1)),
                };
                break;
            }
            case RawSpritePrefix[SpriteType.CustomStillSprite]: {
                sprite = {
                    type: SpriteType.CustomStillSprite,
                    id: Number(rawSprite.slice(1)),
                };
                break;
            }
            default: {
                sprite = {
                    type: SpriteType.DQAnimationSprite,
                    // TODO: パーサー自体は深く検証するべきではないがそうする場合は型もパース時点ではゆるくあるべき
                    surface: Number(rawSprite),
                };
                break;
            }
        }
        return {
            sprite,
            message: unescapeMetaChars(message),
            position,
            // TODO: パーサー自体は深く検証するべきではないが、未知の値は既定値として扱う
            direction: parseDirection(direction) ?? Direction.North,
            behavior: parseHumanBehavior(behavior) ?? HumanBehavior.Still,
            speed: Number(speed),
        };
    }
    static #parseTreasureBoxPoint(value) {
        const [x, y, message = ""] = value.trimStart().split(",");
        const position = {
            x: Number(x),
            y: Number(y),
        };
        return {
            position,
            message: unescapeMetaChars(message),
        };
    }
    static #parseLookPoint(value) {
        const [x, y, once, message = ""] = value.trimStart().split(",");
        const position = {
            x: Number(x),
            y: Number(y),
        };
        return {
            position,
            once: parseFlag(once),
            message: unescapeMetaChars(message),
        };
    }
    static #parseTeleportPoint(value) {
        const [x, y, destMapId, destX, destY] = value.trim().split(",");
        const position = {
            x: Number(x),
            y: Number(y),
        };
        return {
            position,
            destination: {
                mapId: Number(destMapId),
                position: {
                    x: Number(destX),
                    y: Number(destY),
                },
            },
        };
    }
    static #parseEventPoint(value) {
        const [, pos = "", body = ""] = value.trimStart().match(/^(tx:\d+,ty:\d+),\r?\n(.+)$/s) ?? [];
        const { tx, ty } = parseCSP(pos);
        const primaryPhase = {
            timing: RPGMap.#DEFAULT_EVENT_TIMING,
            sequence: [],
        };
        const createSecondaryPhase = () => ({
            timing: RPGMap.#DEFAULT_EVENT_TIMING,
            condition: {},
            sequence: [],
        });
        const eventPoint = {
            position: {
                x: Number(tx),
                y: Number(ty),
            },
            phases: [
                primaryPhase,
                createSecondaryPhase(),
                createSecondaryPhase(),
                createSecondaryPhase(),
            ],
        };
        const parser = new ChunkParser(body);
        while (!parser.isEnded()) {
            const name = parser.parseName();
            const phaseNumber = name.match(/\d+$/)?.[0];
            const value = parser.parseChunk(`#${RPGMap.#PHASE_TERMINATOR}${phaseNumber}`);
            const phaseIndex = Number(phaseNumber);
            const phase = eventPoint.phases[phaseIndex];
            if (!phase) {
                continue;
            }
            const [, cond = "", body = ""] = value.trimStart().match(/(.+?),\r?\n(.+)/s) ?? [];
            const { tm, sw, g } = parseCSP(cond);
            const timing = parseEventTiming(tm);
            if (timing !== undefined) {
                phase.timing = timing;
            }
            // Non primary phase and has phase condition
            if (phaseIndex !== PRIMARY_EVENT_PHASE_INDEX) {
                if (sw && "condition" in phase) {
                    phase.condition.switch = Number(sw);
                }
                if (g && "condition" in phase) {
                    phase.condition.gold = Number(g);
                }
            }
            phase.sequence = RawCommand.parseSequence(body);
        }
        return eventPoint;
    }
    static #parseTileChipMap(value) {
        const tileChipMap = new TileChipMap();
        const body = value.replace(/^\r?\n/, "");
        for (const [y, line] of body.split(/\r?\n/).entries()) {
            for (const [x, rawTile] of line.split(" ").entries()) {
                // TODO: RawTileへのキャストが安全か未確認
                tileChipMap.set(x, y, toRawTile(rawTile));
            }
        }
        return tileChipMap;
    }
    static parse(input) {
        const parser = new ChunkParser(input);
        const lookPoints = new InfinityChipMap();
        const treasureBoxPoints = new InfinityChipMap();
        const teleportPoints = new InfinityChipMap();
        const eventPoints = new InfinityChipMap();
        let floor;
        let objects;
        const humans = new InfinityChipMap();
        let bgmUrl;
        let backgroundImageUrl;
        let initialHeroPosition;
        while (!parser.isEnded()) {
            const name = parser.parseName();
            const value = parser.parseChunk("#END");
            switch (name) {
                case WellKnownChunkName.Hero: {
                    initialHeroPosition = RPGMap.#parseInitialHeroPosition(value);
                    break;
                }
                case WellKnownChunkName.BGM: {
                    bgmUrl = RPGMap.#parseLooseUrl(value);
                    break;
                }
                case WellKnownChunkName.BackgroundImage: {
                    backgroundImageUrl = RPGMap.#parseLooseUrl(value);
                    break;
                }
                case WellKnownChunkName.Human: {
                    const human = RPGMap.#parseHuman(value);
                    humans.set(human.position.x, human.position.y, human);
                    break;
                }
                case WellKnownChunkName.TreasureBoxPoint: {
                    const point = RPGMap.#parseTreasureBoxPoint(value);
                    treasureBoxPoints.set(point.position.x, point.position.y, point);
                    break;
                }
                case WellKnownChunkName.LookPoint: {
                    const point = RPGMap.#parseLookPoint(value);
                    lookPoints.set(point.position.x, point.position.y, point);
                    break;
                }
                case WellKnownChunkName.TeleportPoint: {
                    const point = RPGMap.#parseTeleportPoint(value);
                    teleportPoints.set(point.position.x, point.position.y, point);
                    break;
                }
                case WellKnownChunkName.EventPoint: {
                    const point = RPGMap.#parseEventPoint(value);
                    eventPoints.set(point.position.x, point.position.y, point);
                    break;
                }
                case WellKnownChunkName.Floor:
                case WellKnownChunkName.Objects: {
                    const tileChipMap = RPGMap.#parseTileChipMap(value);
                    if (name === WellKnownChunkName.Floor) {
                        floor = tileChipMap;
                    }
                    else if (name === WellKnownChunkName.Objects) {
                        objects = tileChipMap;
                    }
                    break;
                }
                default: {
                    name;
                }
            }
        }
        return new RPGMap({
            initialHeroPosition,
            humans,
            lookPoints,
            bgmUrl,
            eventPoints,
            backgroundImageUrl,
            treasureBoxPoints,
            teleportPoints,
            objects: objects ?? new TileChipMap(),
            floor: floor ?? new TileChipMap(),
        });
    }
    static stringify(rpgMap) {
        let str = "";
        if (rpgMap.initialHeroPosition) {
            str += "#HERO\n";
            str += `${rpgMap.initialHeroPosition.x},${rpgMap.initialHeroPosition.y}#END\n`;
            str += "\n";
        }
        str += "#BGM\n";
        if (rpgMap.bgmUrl) {
            str += `${rpgMap.bgmUrl}\n`;
        }
        str += "#END\n\n";
        if (rpgMap.backgroundImageUrl) {
            str += "#BGIMG\n";
            str += `${rpgMap.backgroundImageUrl}#END\n`;
            str += "\n";
        }
        if (rpgMap.floor) {
            str += "#FLOOR\n";
            const { width, height } = rpgMap.floor.getSize();
            for (let y = 0; y < height; y++) {
                let line = "";
                for (let x = 0; x < width; x++) {
                    if (x > 0) {
                        line += " ";
                    }
                    line += rpgMap.floor.getRaw(x, y) ?? "";
                }
                line = line.trimEnd();
                if (y === height - 1) {
                    line += "#END";
                }
                line += "\n";
                str += line;
            }
            str += "\n";
        }
        // TODO: コード重複
        if (rpgMap.objects) {
            str += "#MAP\n";
            const { width, height } = rpgMap.objects.getSize();
            for (let y = 0; y < height; y++) {
                let line = "";
                for (let x = 0; x < width; x++) {
                    if (x > 0) {
                        line += " ";
                    }
                    line += rpgMap.objects.getRaw(x, y) ?? "";
                }
                line = line.trimEnd();
                if (y === height - 1) {
                    line += "#END";
                }
                line += "\n";
                str += line;
            }
            str += "\n";
        }
        if (rpgMap.humans) {
            for (const human of rpgMap.humans) {
                str += "#HUMAN\n";
                const id = (() => {
                    switch (human.sprite.type) {
                        case SpriteType.DQAnimationSprite:
                            return human.sprite.surface;
                        case SpriteType.CustomAnimationSprite:
                            return `${RawSpritePrefix[SpriteType.CustomAnimationSprite]}${human.sprite.id}`;
                        case SpriteType.CustomStillSprite:
                            return `${RawSpritePrefix[SpriteType.CustomStillSprite]}${human.sprite.id}`;
                    }
                })();
                str += `${id},${human.position.x},${human.position.y},${stringifyDirection(human.direction)},${stringifyHumanBehavior(human.behavior)},${human.speed},${escapeMetaChars(human.message)}#END\n`;
                str += "\n";
            }
        }
        if (rpgMap.treasureBoxPoints) {
            for (const p of rpgMap.treasureBoxPoints) {
                str += "#TBOX\n";
                str += `${p.position.x},${p.position.y},${escapeMetaChars(p.message)}#END\n`;
                str += "\n";
            }
        }
        if (rpgMap.teleportPoints) {
            for (const p of rpgMap.teleportPoints) {
                str += "#MPOINT\n";
                str += `${p.position.x},${p.position.y},${p.destination.mapId},${p.destination.position.x},${p.destination.position.y}#END\n`;
                str += "\n";
            }
        }
        if (rpgMap.lookPoints) {
            for (const p of rpgMap.lookPoints) {
                str += "#SPOINT\n";
                str += `${p.position.x},${p.position.y},${stringifyFlag(p.once)},${escapeMetaChars(p.message)}#END\n`;
                str += "\n";
            }
        }
        if (rpgMap.eventPoints) {
            for (const { position, phases } of rpgMap.eventPoints) {
                str += `#EPOINT tx:${position.x},ty:${position.y},\n`;
                for (const [i, p] of phases.entries()) {
                    if (p.sequence.length === 0) {
                        continue;
                    }
                    let phaseHeader = `#${RPGMap.#PHASE_CHUNK_NAME}${i} tm:${stringifyEventTiming(p.timing)},`;
                    // TODO: PH0がないと壊れたデータになる
                    if ("condition" in p &&
                        (p.condition.gold !== undefined || p.condition.switch !== undefined)) {
                        phaseHeader += `sw:${p.condition.switch ?? ""},g:${p.condition.gold ?? ""},`;
                    }
                    phaseHeader += "\n";
                    str += phaseHeader;
                    for (const c of p.sequence) {
                        str += c.toString();
                        str += "\n";
                    }
                    str += `#${RPGMap.#PHASE_TERMINATOR}${i}\n`;
                }
                str += "#END\n\n";
            }
        }
        return str;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUVMLFdBQVcsRUFDWCx5QkFBeUIsRUFHekIsZ0JBQWdCLEVBQ2hCLG9CQUFvQixHQUNyQixNQUFNLHdCQUF3QixDQUFDO0FBQ2hDLE9BQU8sRUFFTCxhQUFhLEVBQ2Isa0JBQWtCLEVBQ2xCLHNCQUFzQixHQUN2QixNQUFNLGtCQUFrQixDQUFDO0FBRTFCLE9BQU8sRUFFTCxlQUFlLEVBRWYsVUFBVSxHQUNYLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTVDLE9BQU8sRUFDTCxTQUFTLEVBRVQsY0FBYyxFQUNkLGtCQUFrQixHQUNuQixNQUFNLGtCQUFrQixDQUFDO0FBQzFCLE9BQU8sRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUN2RSxPQUFPLEVBQ0wsV0FBVyxFQUNYLFFBQVEsRUFDUixTQUFTLEVBQ1QsYUFBYSxHQUNkLE1BQU0sbUJBQW1CLENBQUM7QUFlM0IsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUc7SUFDaEMsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLGVBQWUsRUFBRSxPQUFPO0lBQ3hCLEtBQUssRUFBRSxPQUFPO0lBQ2QsT0FBTyxFQUFFLEtBQUs7SUFDZCxLQUFLLEVBQUUsT0FBTztJQUNkLGdCQUFnQixFQUFFLE1BQU07SUFDeEIsU0FBUyxFQUFFLFFBQVE7SUFDbkIsVUFBVSxFQUFFLFFBQVE7SUFDcEIsYUFBYSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBU1gsTUFBTSxPQUFPLE1BQU07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