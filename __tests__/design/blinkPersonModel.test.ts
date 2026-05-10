import { BLINK_PERSON_MODEL } from "@/design/blinkPersonModel";

describe("BLINK_PERSON_MODEL", () => {
  it("defines one readable three-frame motion model for Blink previews", () => {
    expect(BLINK_PERSON_MODEL.displayName).toBe("Mina");
    expect(BLINK_PERSON_MODEL.frames).toHaveLength(3);
    expect(BLINK_PERSON_MODEL.frames.map((frame) => frame.index)).toEqual([1, 2, 3]);
    expect(BLINK_PERSON_MODEL.frames.map((frame) => frame.pose)).toEqual(["wave", "jump", "peace"]);
    expect(new Set(BLINK_PERSON_MODEL.frames.map((frame) => frame.label)).size).toBe(3);
    expect(BLINK_PERSON_MODEL.stripAsset).toBeTruthy();
  });
});
