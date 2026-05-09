import { identityPacks } from "@/lib/identityPacks";

describe("identityPacks", () => {
  it("keeps the GPT image style shop catalog without LCD or Pixel packs", () => {
    const names = identityPacks.map((pack) => pack.name);

    expect(names).toEqual([
      "Classic Paper",
      "School Desk",
      "Cherry Dot",
      "Photo Booth Blink",
      "Night Signal",
    ]);
    expect(names.join(" ")).not.toMatch(/LCD|Pixel/i);
  });

  it("keeps Blink as a common three-frame mechanic instead of a separate LCD-like pack", () => {
    const photoBooth = identityPacks.find((pack) => pack.slug === "photo-booth-blink");

    expect(photoBooth?.slots).toEqual(["3 CUTS", "OPEN", "REPLY"]);
    expect(identityPacks.every((pack) => pack.slots.length === 3)).toBe(true);
  });

  it("keeps every purchasable pack structurally distinct, not just recolored", () => {
    const layouts = identityPacks.map((pack) => pack.layout);

    expect(new Set(layouts).size).toBe(identityPacks.length);
    expect(layouts).toEqual([
      "classic-slip",
      "school-note",
      "cherry-sticker",
      "photo-booth",
      "night-signal",
    ]);
  });
});
