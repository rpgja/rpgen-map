import type { HumanSprite, StillSprite } from "@/types/sprite.js";
import type { Position } from "@/types/types.js";

export class RawCommand {
  readonly name: string;
  readonly params: Record<string, string>;

  constructor(name: string, params: Record<string, string>) {
    this.name = name;
    this.params = params;
  }

  translate(): Command | undefined {
    const { name, params } = this;

    // TODO
    switch (this.name) {
      case "MSG":
        return {
          type: CommandType.DisplayMessage,
          message: params.m ?? "",
        };

      case "PL_GLD":
        return {
          type: CommandType.ManipulateGold,
          operation: ManipulateGoldCommandOperation.Addition,
          value: Number(params.v),
        };

      default: {
        // TODO
        // logger.warn({ name, params }, "No command parser");

        break;
      }
    }
  }
}

export const CommandType = {
  // Message
  DisplayMessage: 0,
  DisplayConfirm: 1,
  DisplaySelect: 2,
  ChangeMessageFont: 3,
  DisplayGold: 4,
  HideGold: 5,

  // Screen control
  Wait: 6,
  ScreenEffect: 7,
  ChangeWeather: 8,

  // Graphics
  ChangeObjectSprite: 9,
  ChangeHumanSprite: 10,
  ChangeSpriteColor: 11,
  DisplayImage: 12,
  DisplayAnimation: 13,

  ChangeBackgroundImage: 14,
  ChangeDistantView: 15,

  // Movement
  ChangeDirection: 16,
  MoveParty: 17,
  MoveNPC: 18,
  ChangeNPCBehavior: 19,
  ChangeMap: 20,
  MoveCamera: 21,

  // Sound
  ChangeBGM: 22,
  PlaySound: 23,

  // Switch
  SwitchOn: 24,
  SwitchOff: 25,

  // Number
  ManipulateGold: 26,

  // Events
  SaveAndLoad: 27,
  EndEvent: 28,
  DeleteEvent: 29,
  Goto: 30,
  Comment: 31,
} as const;

export type CommandType = (typeof CommandType)[keyof typeof CommandType];

export type DisplayMessageCommand = {
  type: typeof CommandType.DisplayMessage;
  message: string;
};

export type DisplayConfirmCommand = {
  choices: [
    string, // yes
    string, // no
    ...string[], // additional choice
  ];
  displayPosition: Position;
  /**
   * 直前のメッセージを消さない
   */
  keepPreviousMessage: boolean;
};

// TODO
export type DisplaySelectCommand = {
  type: typeof CommandType.DisplaySelect;
};

export type ChangeMessageFontCommand = {
  type: typeof CommandType.ChangeMessageFont;
  fontFamily: string;
};

export type DisplayGoldCommand = {
  type: typeof CommandType.DisplayGold;
};

export type HideGoldCommand = {
  type: typeof CommandType.HideGold;
};

// Screen control

export type WaitCommand = {
  type: typeof CommandType.Wait;
  delay: number;
};

// TODO
export type ScreenEffectCommand = {
  type: typeof CommandType.ScreenEffect;
};

// TODO
export type ChangeWeatherCommand = {
  type: typeof CommandType.ChangeWeather;
};

// Graphics

export type ChangeObjectSpriteCommand = {
  type: typeof CommandType.ChangeObjectSprite;
  targetPosition: Position;
  sprite: StillSprite;
};

export type ChangeHumanSpriteCommand = {
  type: typeof CommandType.ChangeHumanSprite;
  targetPosition?: Position;
  sprite: HumanSprite;
};

// TODO
export type ChangeSpriteColorCommand = {
  type: typeof CommandType.ChangeSpriteColor;
};

// TODO
export type DisplayImageCommand = {
  type: typeof CommandType.DisplayImage;
};

// TODO
export type DisplayAnimationCommand = {
  type: typeof CommandType.DisplayAnimation;
};

export type ChangeBackgroundImageCommand = {
  type: typeof CommandType.ChangeBackgroundImage;
  backgroundImageUrl: string;
};

// TODO
export type ChangeDistantViewCommand = {
  type: typeof CommandType.ChangeDistantView;
};

// Movement
// TODO
export type ChangeDirectionCommand = {
  type: typeof CommandType.ChangeDirection;
};

// TODO
export type MovePartyCommand = {
  type: typeof CommandType.MoveParty;
};

// TODO
export type MoveNPCCommand = {
  type: typeof CommandType.MoveNPC;
};

// TODO
export type ChangeNPCBehaviorCommand = {
  type: typeof CommandType.ChangeNPCBehavior;
};

// TODO
export type ChangeMapCommand = {
  type: typeof CommandType.ChangeMap;
};

// TODO
export type MoveCameraCommand = {
  type: typeof CommandType.MoveCamera;
};

// Sound
// TODO
export type ChangeBGMCommand = {
  type: typeof CommandType.ChangeBGM;
};

export const PlaySoundCommandOperation = {
  Play: "PL",
  Stop: "ST",
} as const;

export type PlaySoundCommandOperation =
  (typeof PlaySoundCommandOperation)[keyof typeof PlaySoundCommandOperation];

export type PlaySoundCommandFade = {
  progressAt: number;
  volumeFrom: number;
  voluteTo: number;
};

export type PlaySoundCommand =
  | {
      type: typeof CommandType.PlaySound;
      soundEffectId: number;
      volume: number;
      loop: boolean;
      fade?: PlaySoundCommandFade;
      operation: typeof PlaySoundCommandOperation.Play;
    }
  | {
      type: typeof CommandType.PlaySound;
      operation: typeof PlaySoundCommandOperation.Stop;
    };

// Switch

export type SwitchOnCommand = {
  type: typeof CommandType.SwitchOn;
  switch: number;
};

export type SwitchOffCommand = {
  type: typeof CommandType.SwitchOff;
  switch: number;
};

// Number

export const ManipulateGoldCommandOperation = {
  Addition: 0,
  Subtraction: 1,
  Double: 2,
  Set: 3,
} as const;

export type ManipulateGoldCommandOperation =
  (typeof ManipulateGoldCommandOperation)[keyof typeof ManipulateGoldCommandOperation];

export type ManipulateGoldCommand = {
  type: typeof CommandType.ManipulateGold;
  value: number;
  operation: ManipulateGoldCommandOperation;
};

// Events

export type SaveAndLoadCommandCondition = {
  switch: boolean;
  gold: boolean;
  party: boolean;
  npc: boolean;
};

export const SaveAndLoadCommandOperation = {
  Save: 0,
  Load: 1,
} as const;

export type SaveAndLoadCommandOperation =
  (typeof SaveAndLoadCommandOperation)[keyof typeof SaveAndLoadCommandOperation];

export type SaveAndLoadCommand = {
  type: typeof CommandType.SaveAndLoad;
  operation: SaveAndLoadCommandOperation;
  condition: SaveAndLoadCommandCondition;
};

export type EndEventCommand = {
  type: typeof CommandType.EndEvent;
};

export type DeleteEventCommand = {
  type: typeof CommandType.DeleteEvent;
};

export type GotoCommand = {
  type: typeof CommandType.Goto;
  phase: number;
  eventPosition?: Position;
};

export type CommentCommand = {
  type: typeof CommandType.Comment;
  message: string;
};

export type Command =
  // Message
  | DisplayMessageCommand
  | DisplayConfirmCommand
  | DisplaySelectCommand
  | ChangeMessageFontCommand
  | DisplayGoldCommand
  | HideGoldCommand

  // Screen control
  | WaitCommand
  | ScreenEffectCommand
  | ChangeWeatherCommand

  // Graphics
  | ChangeObjectSpriteCommand
  | ChangeHumanSpriteCommand
  | ChangeSpriteColorCommand
  | DisplayImageCommand
  | DisplayAnimationCommand
  | ChangeBackgroundImageCommand
  | ChangeDistantViewCommand

  // Movement
  | ChangeDirectionCommand
  | MovePartyCommand
  | MoveNPCCommand
  | ChangeNPCBehaviorCommand
  | ChangeMapCommand
  | MoveCameraCommand

  // Sound
  | ChangeBGMCommand
  | PlaySoundCommand

  // Switch
  | SwitchOnCommand
  | SwitchOffCommand

  // Number
  | ManipulateGoldCommand

  // Events
  | SaveAndLoadCommand
  | EndEventCommand
  | DeleteEventCommand
  | GotoCommand
  | CommentCommand;
