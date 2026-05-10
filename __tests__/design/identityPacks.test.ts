import { identityPacks } from "@/design/identityPacks";

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
        expect(["placeholder", "asset"]).toContain(expression.source);
        if (expression.source === "asset") {
          expect(expression.asset).toBeTruthy();
        }
      });
    });
  });
});
