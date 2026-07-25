import { describe, expect, test } from "bun:test";
import { RPGMap } from "@/map.js";
import { CommandType } from "@/types/command.js";
import { EventTiming } from "@/types/event-point.js";
import { HumanBehavior } from "@/types/human.js";
import { SpriteType } from "@/types/sprite.js";
import { Direction } from "@/types/types.js";

const createEventPointMap = (timing: string): string => `#EPOINT
tx:1,ty:2,
#PH0 tm:${timing},
#MSG
m:こんにちは,
#ED
#PHEND0
#END
`;

describe("RPGMap.parse()", () => {
  test("Event timing is parsed as a natural language value", () => {
    expect(
      RPGMap.parse(createEventPointMap("0")).eventPoints.get(1, 2)?.phases[0]
        .timing,
    ).toBe(EventTiming.Confirm);
    expect(
      RPGMap.parse(createEventPointMap("1")).eventPoints.get(1, 2)?.phases[0]
        .timing,
    ).toBe(EventTiming.Touch);
  });

  test("Unknown event timing falls back to the default", () => {
    expect(
      RPGMap.parse(createEventPointMap("")).eventPoints.get(1, 2)?.phases[0]
        .timing,
    ).toBe(EventTiming.Confirm);
  });

  test("Phase conditions are parsed", () => {
    const map = RPGMap.parse(`#EPOINT
tx:1,ty:2,
#PH0 tm:0,
#FIN_EV
#ED
#PHEND0
#PH1 tm:1,sw:99,g:100,
#FIN_EV
#ED
#PHEND1
#END
`);
    const phase = map.eventPoints.get(1, 2)?.phases[1];

    expect(phase?.timing).toBe(EventTiming.Touch);
    expect(phase?.condition).toStrictEqual({ switch: 99, gold: 100 });
  });

  test("Human direction and behavior are parsed as natural language values", () => {
    const human = RPGMap.parse("#HUMAN\n20,3,4,2,5,1,やあ#END\n").humans.get(
      3,
      4,
    );

    expect(human?.sprite).toStrictEqual({
      type: SpriteType.DQAnimationSprite,
      surface: 20,
    });
    expect(human?.direction).toBe(Direction.South);
    expect(human?.behavior).toBe(HumanBehavior.GoNear);
  });

  test("Look point flag is parsed", () => {
    const map = RPGMap.parse(
      "#SPOINT\n1,2,1,いちど#END\n#SPOINT\n3,4,0,なんど#END\n",
    );

    expect(map.lookPoints.get(1, 2)?.once).toBe(true);
    expect(map.lookPoints.get(3, 4)?.once).toBe(false);
  });

  test("Nested selects in an event point are parsed", () => {
    const map = RPGMap.parse(`#EPOINT
tx:1,ty:2,
#PH0 tm:1,
#SEL0-0 c:0,i0:はい,i1:いいえ,
#SEL1-0 c:0,i0:あか,i1:あお,
#SEL1-1
#SELEND1
#SEL0-1
#SELEND0
#PHEND0
#END
`);
    const [command] = map.eventPoints.get(1, 2)?.phases[0].sequence ?? [];
    const select = command?.parse();

    if (select?.type !== CommandType.Select) {
      throw new Error("Not a select command.");
    }

    const nested = select.choices[0]?.sequence[0];

    if (nested?.type !== CommandType.Select) {
      throw new Error("Not a select command.");
    }

    expect(select.choices.map((c) => c.label)).toStrictEqual([
      "はい",
      "いいえ",
    ]);
    expect(nested.choices.map((c) => c.label)).toStrictEqual(["あか", "あお"]);
  });
});

describe("RPGMap.stringify()", () => {
  test("Event timing is restored to its raw value", () => {
    const stringified = RPGMap.stringify(
      RPGMap.parse(createEventPointMap("1")),
    );

    expect(stringified).toContain("#PH0 tm:1,");
  });

  test("Human and look point are restored to their raw values", () => {
    const input = "#HUMAN\n20,3,4,2,5,1,やあ#END\n#SPOINT\n1,2,1,いちど#END\n";
    const stringified = RPGMap.stringify(RPGMap.parse(input));

    expect(stringified).toContain("#HUMAN\n20,3,4,2,5,1,やあ#END");
    expect(stringified).toContain("#SPOINT\n1,2,1,いちど#END");
  });
});
