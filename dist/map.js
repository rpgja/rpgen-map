import { InfinityChipMap, TileChipMap } from "./chip.js";
import { RawCommand } from "./types/command.js";
import { EventTiming, } from "./types/event-point.js";
import { SpriteType, } from "./types/sprite.js";
import { toRawTile } from "./types/tile.js";
import { escapeMetaChars, unescapeMetaChars } from "./utils/escape.js";
import { ChunkParser, parseCSP } from "./utils/parser.js";
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
            case "A": {
                sprite = {
                    type: SpriteType.CustomAnimationSprite,
                    id: Number(rawSprite.slice(1)),
                };
                break;
            }
            case "-": {
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
            // TODO: パーサー自体は深く検証するべきではないがそうする場合は型もパース時点ではゆるくあるべき
            direction: Number(direction),
            behavior: Number(behavior),
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
            once: once === "1",
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
        const eventPoint = {
            position: {
                x: Number(tx),
                y: Number(ty),
            },
            phases: [
                {
                    timing: EventTiming.Look,
                    sequence: [],
                },
                {
                    timing: EventTiming.Look,
                    condition: {},
                    sequence: [],
                },
                {
                    timing: EventTiming.Look,
                    condition: {},
                    sequence: [],
                },
                {
                    timing: EventTiming.Look,
                    condition: {},
                    sequence: [],
                },
            ],
        };
        const parser = new ChunkParser(body);
        while (!parser.isEnded()) {
            const name = parser.parseName();
            const phaseNumber = name.match(/\d+$/)?.[0];
            const value = parser.parseChunk(`#PHEND${phaseNumber}`);
            const phase = eventPoint.phases[Number(phaseNumber)];
            if (!phase) {
                continue;
            }
            const [, cond = "", body = ""] = value.trimStart().match(/(.+?),\r?\n(.+)/s) ?? [];
            const { tm, sw, g } = parseCSP(cond);
            if (tm) {
                // TODO: enumからオブジェクトに変えた影響でas必須
                phase.timing = Number(tm);
            }
            // Non primary phase and has phase condition
            if (name !== "PH0") {
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
        console.log({
            initialHeroPosition,
            bgmUrl,
            backgroundImageUrl,
        });
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
                            return `A${human.sprite.id}`;
                        case SpriteType.CustomStillSprite:
                            return `-${human.sprite.id}`;
                    }
                })();
                str += `${id},${human.position.x},${human.position.y},${human.direction},${human.behavior},${human.speed},${escapeMetaChars(human.message)}#END\n`;
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
                str += `${p.position.x},${p.position.y},${p.once ? 1 : 0},${escapeMetaChars(p.message)}#END\n`;
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
                    let phaseHeader = `#PH${i} tm:${p.timing},`;
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
                    str += `#PHEND${i}\n`;
                }
                str += "#END\n\n";
            }
        }
        return str;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21hcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDaEQsT0FBTyxFQUVMLFdBQVcsR0FFWixNQUFNLHdCQUF3QixDQUFDO0FBR2hDLE9BQU8sRUFHTCxVQUFVLEdBQ1gsTUFBTSxtQkFBbUIsQ0FBQztBQUUzQixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFHNUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFlMUQsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQUc7SUFDaEMsSUFBSSxFQUFFLE1BQU07SUFDWixHQUFHLEVBQUUsS0FBSztJQUNWLGVBQWUsRUFBRSxPQUFPO0lBQ3hCLEtBQUssRUFBRSxPQUFPO0lBQ2QsT0FBTyxFQUFFLEtBQUs7SUFDZCxLQUFLLEVBQUUsT0FBTztJQUNkLGdCQUFnQixFQUFFLE1BQU07SUFDeEIsU0FBUyxFQUFFLFFBQVE7SUFDbkIsVUFBVSxFQUFFLFFBQVE7SUFDcEIsYUFBYSxFQUFFLFFBQVE7Q0FDZixDQUFDO0FBU1gsTUFBTSxPQUFPLE1BQU07SUFDUixtQkFBbUIsQ0FBVztJQUM5QixrQkFBa0IsQ0FBUztJQUMzQixNQUFNLENBQVU7SUFDaEIsVUFBVSxDQUE2QjtJQUN2QyxXQUFXLENBQThCO0lBQ3pDLGNBQWMsQ0FBaUM7SUFDL0MsTUFBTSxDQUF5QjtJQUMvQixpQkFBaUIsQ0FBb0M7SUFDckQsT0FBTyxDQUFjO0lBQ3JCLEtBQUssQ0FBYztJQUU1QixNQUFNLENBQVUsNkJBQTZCLEdBQzNDLGdDQUFn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