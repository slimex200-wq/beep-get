import {
  getCurrentSeason,
  getSeasonIcons,
  getSeasonSkins,
} from "@/services/seasonService";

describe("v2 season compatibility", () => {
  it("has no current season while seasons are not in the v2 schema", async () => {
    await expect(getCurrentSeason()).resolves.toBeNull();
  });

  it("returns no season icons while icons are not in the v2 schema", async () => {
    await expect(getSeasonIcons("s1")).resolves.toEqual([]);
  });

  it("returns no season skins while season ownership is not in the v2 schema", async () => {
    await expect(getSeasonSkins("s1")).resolves.toEqual([]);
  });
});
