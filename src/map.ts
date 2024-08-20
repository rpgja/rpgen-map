import { InfinityChipMap, TileChipMap } from "@/chip.js";
import { RawCommand } from "@/types/command.js";
import {
  type EventPoint,
  EventTiming,
  type SecondaryEventPhase,
} from "@/types/event-point.js";
import type { Human, HumanBehavior } from "@/types/human.js";
import type { LookPoint } from "@/types/look-point.js";
import {
  type DQAnimationSpriteSurface,
  type Sprite,
  SpriteType,
} from "@/types/sprite.js";
import type { TeleportPoint } from "@/types/teleport-point.js";
import { toRawTile } from "@/types/tile.js";
import type { TreasureBoxPoint } from "@/types/treasure-box-point.js";
import type { Direction, Position } from "@/types/types.js";
import { escapeMetaChars, unescapeMetaChars } from "@/utils/escape.js";
import { ChunkParser, parseCSP } from "@/utils/parser.js";

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
} as const;

export type WellKnownChunkName =
  (typeof WellKnownChunkName)[keyof typeof WellKnownChunkName];

export type UnknownChunkName = string & {};

export type ChunkName = WellKnownChunkName | UnknownChunkName;

export class RPGMap {
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

  static readonly #DEFAULT_BACKGROUND_IMAGE_URL =
    "http://i.imgur.com/qiN1und.jpg";

  constructor(init: RPGMapInit) {
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

  static readonly #WHITESPACE = /\s/;
  static readonly #NON_WHITESPACE = /\S/;

  static *#parseChunks(
    input: string,
    termination: string | ((chunkName: string) => string),
  ): IterableIterator<[name: string, value: string]> {
    const len = input.length;
    const WHITESPACE = RPGMap.#WHITESPACE;
    const NON_WHITESPACE = RPGMap.#NON_WHITESPACE;

    for (let pos = 0; pos < len; pos++) {
      // skip whitespaces
      while (pos < len && WHITESPACE.test(input[pos] as string)) {
        pos++;
      }

      if (input[pos] !== "#") {
        continue;
      }

      // skip "#"
      pos++;

      let name = "";

      while (pos < len && NON_WHITESPACE.test(input[pos] as string)) {
        name += input[pos++];
      }

      let value = "";

      const term =
        typeof termination === "function" ? termination(name) : termination;
      const termLen = term.length;

      while (pos < len && input.slice(pos, pos + termLen) !== term) {
        value += input[pos++];
      }

      pos += termLen;

      yield [name, value];
    }
  }

  static #parseCommands(input: string): RawCommand[] {
    const commands: RawCommand[] = [];
    const parser = new ChunkParser(input);

    while (!parser.isEnded()) {
      const name = parser.parseName();
      const end = name.startsWith("SEL")
        ? `#SELEND${name.match(/\d+$/)?.[0]}`
        : "#ED";
      const value = parser.parseChunk(end);

      commands.push(new RawCommand(name, value));
    }

    return commands;
  }

  static #parseInitialHeroPosition(value: string): Position {
    const [x, y] = value.trim().split(",");

    return {
      x: Number(x),
      y: Number(y),
    };
  }

  /**
   * Parse as URL without strict validation
   */
  static #parseLooseUrl(value: string): string | undefined {
    const maybeUrl = value.trim();

    if (maybeUrl) {
      return maybeUrl;
    }
  }

  static #parseHuman(value: string): Human {
    const [rawSprite, x, y, direction, behavior, speed, message = ""] = value
      .trimStart()
      .split(",");
    const position: Position = {
      x: Number(x),
      y: Number(y),
    };
    let sprite: Sprite;

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
          surface: Number(rawSprite) as DQAnimationSpriteSurface,
        };

        break;
      }
    }

    return {
      sprite,
      message: unescapeMetaChars(message),
      position,
      // TODO: パーサー自体は深く検証するべきではないがそうする場合は型もパース時点ではゆるくあるべき
      direction: Number(direction) as Direction,
      behavior: Number(behavior) as HumanBehavior,
      speed: Number(speed),
    };
  }

  static #parseTreasureBoxPoint(value: string): TreasureBoxPoint {
    const [x, y, message = ""] = value.trimStart().split(",");
    const position: Position = {
      x: Number(x),
      y: Number(y),
    };

    return {
      position,
      message: unescapeMetaChars(message),
    };
  }

  static #parseLookPoint(value: string): LookPoint {
    const [x, y, once, message = ""] = value.trimStart().split(",");
    const position: Position = {
      x: Number(x),
      y: Number(y),
    };

    return {
      position,
      once: once === "1",
      message: unescapeMetaChars(message),
    };
  }

  static #parseTeleportPoint(value: string): TeleportPoint {
    const [x, y, destMapId, destX, destY] = value.trim().split(",");
    const position: Position = {
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

  static #parseEventPoint(value: string): EventPoint {
    const [, pos = "", body = ""] =
      value.trimStart().match(/^(tx:\d+,ty:\d+),\r?\n(.+)$/s) ?? [];
    const { tx, ty } = parseCSP(pos);
    const eventPoint: EventPoint = {
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

      const [, cond = "", body = ""] =
        value.trimStart().match(/(.+?),\r?\n(.+)/s) ?? [];
      const { tm, sw, g } = parseCSP(cond);

      if (tm) {
        // TODO: enumからオブジェクトに変えた影響でas必須
        phase.timing = Number(tm) as EventTiming;
      }

      // Non primary phase and has phase condition
      if (name !== "PH0") {
        if (sw) {
          (phase as SecondaryEventPhase).condition.switch = Number(sw);
        }

        if (g) {
          (phase as SecondaryEventPhase).condition.gold = Number(g);
        }
      }

      phase.sequence = RPGMap.#parseCommands(body);
    }

    return eventPoint;
  }

  static #parseTileChipMap(value: string): TileChipMap {
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

  static parse(input: string): RPGMap {
    const parser = new ChunkParser(input);
    const lookPoints = new InfinityChipMap<LookPoint>();
    const treasureBoxPoints = new InfinityChipMap<TreasureBoxPoint>();
    const teleportPoints = new InfinityChipMap<TeleportPoint>();
    const eventPoints = new InfinityChipMap<EventPoint>();
    let floor: TileChipMap | undefined;
    let objects: TileChipMap | undefined;
    const humans = new InfinityChipMap<Human>();
    let bgmUrl: string | undefined;
    let backgroundImageUrl: string | undefined;
    let initialHeroPosition: Position | undefined;

    while (!parser.isEnded()) {
      const name = parser.parseName() as ChunkName;
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
          } else if (name === WellKnownChunkName.Objects) {
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

  static stringify(rpgMap: RPGMap): string {
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
        str += `${id},${human.position.x},${human.position.y},${
          human.direction
        },${human.behavior},${human.speed},${escapeMetaChars(
          human.message,
        )}#END\n`;
        str += "\n";
      }
    }
    if (rpgMap.treasureBoxPoints) {
      for (const p of rpgMap.treasureBoxPoints) {
        str += "#TBOX\n";
        str += `${p.position.x},${p.position.y},${escapeMetaChars(
          p.message,
        )}#END\n`;
        str += "\n";
      }
    }
    if (rpgMap.teleportPoints) {
      for (const p of rpgMap.teleportPoints) {
        str += "#MPOINT\n";
        str += `${p.position.x},${p.position.y},${p.destination.mapId},${p.position.x},${p.position.y}#END\n`;
        str += "\n";
      }
    }
    if (rpgMap.lookPoints) {
      for (const p of rpgMap.lookPoints) {
        str += "#SPOINT\n";
        str += `${p.position.x},${p.position.y},${
          p.once ? 1 : 0
        },${escapeMetaChars(p.message)}#END\n`;
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
          if (
            "condition" in p &&
            (p.condition.gold !== undefined || p.condition.switch !== undefined)
          ) {
            phaseHeader += `sw:${p.condition.switch ?? ""},g:${
              p.condition.gold ?? ""
            },`;
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
