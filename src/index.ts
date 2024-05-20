export * from "@/map.js";
export * from "@/types.js";
export * from "@/sprite.js";
import { RPGMap } from "@/map.js";
const m = RPGMap.parse(`
#HERO
3,7#END

#SPOINT
1,5,0,しらべた#END

#SPOINT
5,5,0,一度きりしらべた#END

#SPOINT
7,5,1,本当#END
`);

console.log(m);
