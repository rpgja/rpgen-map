import type { PercentPosition, Position } from "@/types/types.js";
import { unescapeMetaChars } from "@/utils.js";
import { parseCSP } from "@/utils/parser.js";
import type { RgbaColor } from "./color.js";

export class RawCommand {
  readonly #name: string;
  readonly #body: string;

  constructor(name: string, body: string) {
    this.#name = name;
    this.#body = body;
  }

  toString(): string {
    let s = `#${this.#name}${this.#body}`;

    if (this.#name.startsWith("SEL")) {
      s += `#SELEND${this.#name.match(/\d+$/)?.[0]}`;
    } else {
      s += "#ED";
    }

    return s;
  }

  parse(): Command {
    const name = this.#name;
    const body = this.#body;
    let command: Command;

    if (name.startsWith("SEL")) {
      const [, paramsBody = "", commandsBody = ""] =
        body.match(/(.+?)\r?\n(.+)/s) ?? [];
      const params = parseCSP(paramsBody);

      console.log(commandsBody);

      command = {
        type: CommandType.Select,
        clearMessage: false,
        choices: new Map(),
      };
    } else {
      const params = parseCSP(body);

      switch (name) {
        // Message
        case CommandType.Message: {
          command = {
            type: CommandType.Message,
            content: unescapeMetaChars(params.m ?? ""),
          };

          break;
        }

        // NOTE: SEL is exotic command
        // case CommandType.Select:

        default: {
          throw new Error("Unimplemented");
        }
      }
    }

    return command;
  }
}

export const CommandType = {
  // Message
  Message: "MSG",
  Select: "SEL",
  ChangeMessageFont: "MSF",
  ShowGold: "SHOW_GLD",
  HideGold: "HIDE_GLD",
  // Screen
  Wait: "WAIT",
  StopScreenEffect: "EF_RGR",
  StartScreenEffect: "EF_GR",
} as const;

export type CommandType = (typeof CommandType)[keyof typeof CommandType];

export type EmptyCommandParams = Record<never, never>;

export const ScreenEffectColorType = {
  Color: "color",
  Gradient: "gradient",
} as const;

export type ScreenEffectColorType =
  (typeof ScreenEffectColorType)[keyof typeof ScreenEffectColorType];

export type ScreenEffectColor =
  | {
      type: typeof ScreenEffectColorType.Color;
      color: RgbaColor;
    }
  | {
      type: typeof ScreenEffectColorType.Gradient;
      aPosition: PercentPosition;
      bPosition: PercentPosition;
      aColor: RgbaColor;
      bColor: RgbaColor;
      /**
       * Gradient stop position in percent
       */
      stopPosition: number;
    };

export type CommandParamsMap = {
  // Message
  [CommandType.Message]: {
    content: string;
  };
  [CommandType.Select]: {
    /**
     * If this property is undefined, it will be randomly and automatically selected
     */
    displayPosition?: Position;
    clearMessage: boolean;
    choices: Map<string, RawCommand[]>;
  };
  [CommandType.ChangeMessageFont]: {
    font: number;
    googleFont?: string;
  };
  [CommandType.ShowGold]: EmptyCommandParams;
  [CommandType.HideGold]: EmptyCommandParams;
  // Screen
  [CommandType.Wait]: {
    /**
     * milliseconds
     */
    delay: number;
  };
  [CommandType.StopScreenEffect]: EmptyCommandParams;
  [CommandType.StartScreenEffect]: {
    colors: ScreenEffectColor;
  };
};

export type CommandMap = {
  [K in keyof CommandParamsMap]: CommandParamsMap[K] & {
    type: K;
  };
};

export type Command = CommandMap[keyof CommandMap];
