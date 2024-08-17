import { InfinityChipMap, TileChipMap } from "@/chip.js";
// TODO
// import { logger } from "@/utils/logger";
import {
  type Command,
  CommandType,
  ManipulateGoldCommandOperation,
  RawCommand,
} from "@/types/command.js";
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
import type { TreasureBoxPoint } from "@/types/treasure-box-point.js";
import type { Direction, Position } from "@/types/types.js";
import { escapeMetaChars, unescapeMetaChars } from "@/utils/escape.js";

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

  static #parseCommaSeparatedParams(input: string): Record<string, string> {
    const params: Partial<Record<string, string>> = {};

    for (const [name, value = ""] of input
      .trim()
      .split(",")
      .filter((p) => p.length > 0)
      .map((v) => v.split(":"))) {
      if (!name) {
        continue;
      }

      params[name] = value;
    }

    return params as Record<string, string>;
  }

  static #parseCommands(input: string): RawCommand[] {
    const commands: RawCommand[] = [];

    for (const [name, value] of RPGMap.#parseChunks(input, "#ED")) {
      const params = RPGMap.#parseCommaSeparatedParams(value.trimStart());

      commands.push(new RawCommand(name, params));
    }

    return commands;
  }

  static parse(input: string): RPGMap {
    const lookPoints = new InfinityChipMap<LookPoint>();
    const treasureBoxPoints = new InfinityChipMap<TreasureBoxPoint>();
    const teleportPoints = new InfinityChipMap<TeleportPoint>();
    const eventPoints = new InfinityChipMap<EventPoint>();
    const floor = new TileChipMap();
    const objects = new TileChipMap();
    const humans = new InfinityChipMap<Human>();
    let bgmUrl: string | undefined;
    let backgroundImageUrl: string | undefined;
    let initialHeroPosition: Position | undefined;

    for (const [name, value] of RPGMap.#parseChunks(input, "#END")) {
      switch (name) {
        case "HERO": {
          const [x, y] = value.trim().split(",");

          initialHeroPosition = {
            x: Number(x),
            y: Number(y),
          };

          break;
        }

        case "BGM": {
          bgmUrl = value.trim();

          break;
        }

        case "BGIMG": {
          backgroundImageUrl = value.trim();

          break;
        }

        case "HUMAN": {
          const [rawSprite, x, y, direction, behavior, speed, message = ""] =
            value.trim().split(",");
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
                surface: Number(rawSprite) as DQAnimationSpriteSurface,
              };

              break;
            }
          }

          const position: Position = {
            x: Number(x),
            y: Number(y),
          };

          humans.set(position.x, position.y, {
            sprite,
            message: unescapeMetaChars(message),
            position,
            direction: Number(direction) as Direction,
            behavior: Number(behavior) as HumanBehavior,
            speed: Number(speed),
          });

          break;
        }

        case "TBOX": {
          const [x, y, message = ""] = value.trimStart().split(",");
          const position: Position = {
            x: Number(x),
            y: Number(y),
          };

          treasureBoxPoints.set(position.x, position.y, {
            position,
            message: unescapeMetaChars(message),
          });

          break;
        }

        case "SPOINT": {
          const [x, y, once, message = ""] = value.trimStart().split(",");
          const position: Position = {
            x: Number(x),
            y: Number(y),
          };

          lookPoints.set(position.x, position.y, {
            position,
            once: once === "1",
            message: unescapeMetaChars(message),
          });

          break;
        }

        case "MPOINT": {
          const [x, y, destMapId, destX, destY] = value.trim().split(",");
          const position: Position = {
            x: Number(x),
            y: Number(y),
          };

          teleportPoints.set(position.x, position.y, {
            position,
            destination: {
              mapId: Number(destMapId),
              position: {
                x: Number(destX),
                y: Number(destY),
              },
            },
          });

          break;
        }

        // TODO
        case "EPOINT": {
          const [, pos = "", body = ""] =
            value.trimStart().match(/^(tx:\d+,ty:\d+),\r?\n(.+)$/s) ?? [];
          const { tx, ty } = RPGMap.#parseCommaSeparatedParams(pos);
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

          for (const [name, value] of RPGMap.#parseChunks(
            body,
            (name) => `#PHEND${name.at(-1)}`,
          )) {
            const phase = eventPoint.phases[Number(name.at(-1))];

            if (!phase) {
              continue;
            }

            const [, cond = "", body = ""] =
              value.trimStart().match(/(.+?),\r?\n(.+)/s) ?? [];
            const { tm, sw, g } = RPGMap.#parseCommaSeparatedParams(cond);

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

          eventPoints.set(
            eventPoint.position.x,
            eventPoint.position.y,
            eventPoint,
          );

          break;
        }

        case "FLOOR":
        case "MAP": {
          const tileMap = name === "FLOOR" ? floor : objects;
          const body = value.replace(/^\r?\n/, "");

          for (const [y, line] of body.split(/\r?\n/).entries()) {
            for (const [x, rawTile] of line.split(" ").entries()) {
              tileMap.set(x, y, rawTile);
            }
          }

          break;
        }

        default: {
          // TODO
          // logger.warn({ name, value }, "No parser");

          break;
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
      objects,
      floor,
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
            str += `#${c.name}\n`;

            let params = "";

            for (const [k, v] of Object.entries(c.params)) {
              params += `${k}:${escapeMetaChars(v)},`;
            }

            if (params.length > 0) {
              params += "\n";
            }

            str += params;
            str += "#ED\n";
          }

          str += `#PHEND${i}\n`;
        }

        str += "#END\n\n";
      }
    }
    return str;
  }
}
