import { readFileSync } from "fs";
import path from "path";

function readSource(filePath: string) {
  return readFileSync(path.join(process.cwd(), filePath), "utf8");
}

describe("production profile surfaces", () => {
  it("does not use mock photos as Account or My profile avatar fallbacks", () => {
    const settingsSource = readSource("src/screens/SettingsScreen.tsx");
    const mySource = readSource("src/screens/MyScreen.tsx");
    const authSource = readSource("src/screens/AuthScreen.tsx");
    const avatarPresetSource = readSource("src/design/avatarPresets.ts");

    expect(settingsSource).not.toContain("mockupPhotoUris");
    expect(mySource).not.toContain("mockupPhotoUris.profile");
    expect(authSource).not.toContain("mockupPhotoUris");
    expect(authSource).not.toContain("Mina's widget");
    expect(avatarPresetSource).not.toContain("mockupPhotoUris");
    expect(avatarPresetSource).toContain("classic-paper__basic-beepy.png");
    expect(settingsSource).toContain("getAvatarImageSource");
    expect(mySource).toContain("getAvatarImageSource");
    expect(authSource).toContain("DEFAULT_AVATAR_URI");
  });

  it("renders Friends and Send recipients from relationship avatar_url instead of synthesized mock photos", () => {
    const peopleSource = readSource("src/screens/PeopleScreen.tsx");
    const sendSource = readSource("src/screens/SendSignalScreen.tsx");
    const friendPickerSource = readSource("src/components/FriendPickerStrip.tsx");

    expect(peopleSource).not.toContain("getMockupFriendPhotoUri");
    expect(sendSource).not.toContain("getMockupFriendPhotoUri");
    expect(peopleSource).not.toContain('profile?.nickname ?? "Alex"');
    expect(peopleSource).not.toContain('profile?.beep_id ?? "alexb"');
    expect(sendSource).toContain("avatarUri: friend.friend.avatar_url");
    expect(peopleSource).toContain("avatarUri={friend.avatarUri}");
    expect(peopleSource).toContain("getAvatarImageSource");
    expect(friendPickerSource).toContain("getAvatarImageSource");
  });

  it("resolves avatar preset IDs on signal detail surfaces instead of passing raw uri strings", () => {
    const todaySource = readSource("src/screens/TodayScreen.tsx");
    const replySource = readSource("src/screens/SlipReplyRoomScreen.tsx");

    expect(todaySource).toContain("getAvatarImageSource");
    expect(replySource).toContain("getAvatarImageSource");
    expect(todaySource).not.toContain("source={{ uri: latestSignal.avatarUri }}");
    expect(replySource).not.toContain("source={{ uri: senderAvatarUri }}");
  });

  it("keeps UI Preview friend avatars on app preset IDs instead of hardcoded human mock photos", () => {
    const uiPreviewSource = readSource("src/lib/uiPreview.ts");

    expect(uiPreviewSource).not.toContain("mockupPhotoUris.");
    expect(uiPreviewSource).toContain("AVATAR_PRESETS");
  });

  it("personalizes skin pack previews instead of hardcoding a sample friend name", () => {
    const mySource = readSource("src/screens/MyScreen.tsx");
    const widgetCardSource = readSource("src/components/WidgetSkinPackCard.tsx");
    const widgetStatesSource = readSource("src/screens/WidgetStatesScreen.tsx");

    expect(mySource).toContain("skinPackPreviewName");
    expect(mySource).toContain("previewFrom={skinPackPreviewName}");
    expect(widgetCardSource).toContain("previewFrom");
    expect(widgetCardSource).not.toContain("pack.from}</Text>");
    expect(widgetStatesSource).toContain("widgetPreviewFrom");
    expect(widgetStatesSource).toContain("previewFrom={widgetPreviewFrom}");
    expect(widgetStatesSource).toContain("fromLabel={widgetPreviewFrom}");
  });
});
