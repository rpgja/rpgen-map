import { SpriteType } from "../types/sprite.js";
export const toRawTile = (rawTile) => rawTile;
export const castTile2RawTile = (tile) => {
    switch (tile.sprite.type) {
        case SpriteType.CustomStillSprite: {
            let rawTile = "";
            rawTile += tile.sprite.id;
            if (tile.collision) {
                rawTile += "C";
            }
            return toRawTile(rawTile);
        }
        case SpriteType.DQStillSprite: {
            // collisionはここでは反映されず、checkWalkableTile(RawTile)にて判定される
            return toRawTile(`${tile.sprite.surface.x}_${tile.sprite.surface.y}`);
        }
        default: {
            throw new Error("Unknown tile layer.");
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy90eXBlcy90aWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQW9CLE1BQU0sbUJBQW1CLENBQUM7QUFTakUsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxPQUFrQixDQUFDO0FBUWpFLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHLENBQUMsSUFBVSxFQUFXLEVBQUU7SUFDdEQsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLEtBQUssVUFBVSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDakIsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQzFCLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO2dCQUNuQixPQUFPLElBQUksR0FBRyxDQUFDO1lBQ2pCLENBQUM7WUFDRCxPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBQ0QsS0FBSyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM5Qix3REFBd0Q7WUFDeEQsT0FBTyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RSxDQUFDO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNSLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN6QyxDQUFDO0lBQ0gsQ0FBQztBQUNILENBQUMsQ0FBQyJ9