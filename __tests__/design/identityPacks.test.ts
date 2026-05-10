import { identityPacks } from "@/design/identityPacks";
import { beepyEmotePackAssets } from "@/design/beepyEmoteAssets.generated";

describe("identityPacks", () => {
  it("defines the approved pack catalog with at least five expressions each", () => {
    const slugs = identityPacks.map((pack) => pack.slug);
    expect(slugs).toEqual([
      "classic-paper",
      "school-desk",
      "cherry-dot",
      "photo-booth-blink",
      "night-signal",
    ]);

    identityPacks.forEach((pack) => {
      expect(pack.expressions.length).toBeGreaterThanOrEqual(5);
      pack.expressions.forEach((expression) => {
        expect(expression.id).toEqual(expect.any(String));
        expect(expression.label).toEqual(expect.any(String));
        expect(["canonical-beepy", "pack-native"]).toContain(expression.artFamily);
        expect(["placeholder", "asset"]).toContain(expression.source);
        expect(expression.source).toBe("asset");
        expect(expression.asset).toBeTruthy();
      });
    });
  });

  it("reserves the real Beepy mascot for the default skin and uses pack-native emotes for paid packs", () => {
    const [classicPaper, ...paidPacks] = identityPacks;

    expect(classicPaper.slug).toBe("classic-paper");
    expect(classicPaper.expressions.every((expression) => expression.artFamily === "canonical-beepy")).toBe(true);

    paidPacks.forEach((pack) => {
      expect(pack.expressions.every((expression) => expression.artFamily === "pack-native")).toBe(true);
    });
  });

  it("keeps the generated asset map aligned with the identity-pack expression ids", () => {
    const generatedBySlug = new Map(beepyEmotePackAssets.map((pack) => [pack.slug, pack]));

    identityPacks.forEach((pack) => {
      const generated = generatedBySlug.get(pack.slug);

      expect(generated?.artFamily).toBe(pack.expressions[0].artFamily);
      expect(generated?.expressions.map((expression) => expression.id)).toEqual(
        pack.expressions.map((expression) => expression.id),
      );
    });
  });
});
