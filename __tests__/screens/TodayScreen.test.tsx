import { existsSync, readFileSync } from "fs";
import path from "path";

const readSource = (rel: string) => readFileSync(path.join(process.cwd(), rel), "utf8");

describe("TodayScreen Signal Edition", () => {
  it("assembles Today from the primitives vocabulary with no legacy shell imports", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    expect(source).toContain('from "@/ui/primitives"');
    [
      "Screen",
      "SectionLabel",
      "Card",
      "ListRow",
      "Chip",
      "PrimaryButton",
      "SignalKindLabel",
      "StatusDot",
      "Perforation",
      "MonoValue",
    ].forEach((primitive) => {
      expect(source).toContain(primitive);
    });

    // The legacy mockup shell is banned from Today.
    expect(source).not.toContain("KotlinMockupUI");
    expect(source).not.toContain("MockupCard");
    expect(source).not.toContain("TodayMockupChrome");
    expect(source).not.toContain("TodayMockupHeader");
    expect(source).not.toContain("TodaySectionHeader");
    expect(source).not.toContain("TodayIncomingCard");
    expect(source).not.toContain("ActionButton");
    expect(source).not.toContain("MockupLineIcons");
    expect(source).not.toContain("AppSurface");

    // The dedicated hero component file is absorbed into the screen as a local slip.
    expect(existsSync(path.join(process.cwd(), "src/components/TodayIncomingCard.tsx"))).toBe(false);
    expect(source).toContain("function TodayHeroSlip(");
    expect(source).toContain('testID="today-incoming-slip"');
  });

  it("keeps Today hero-first with Korean section labels and no concept nouns", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    ["최근 신호", "친구"].forEach((label) => {
      expect(source).toContain(label);
    });

    expect(source).toContain("useAppPalette");

    // Concept nouns are banned from the user surface; only 신호/친구 remain.
    expect(source).not.toContain("Friend Pulse");
    expect(source).not.toContain("FriendPulseCard");
    expect(source).not.toContain("close only");
    expect(source).not.toContain("Incoming Now");
    expect(source).not.toContain("INCOMING NOW");
    expect(source).not.toContain("Widget Mirror");
    expect(source).not.toContain("My Beep Room");

    // The hero card adopts the widget grammar directly; the Widget Mirror panel is deleted.
    expect(source).not.toContain("WidgetPreviewPanel");
    expect(source).not.toContain("Home screen preview");
    expect(source).not.toContain("getIdentityPack");
    expect(source).not.toContain("useSkinStore");

    // No hardcoded lavender/purple chrome; palette tokens only.
    expect(source).not.toContain("colors.");
    expect(source).not.toContain("#8F5EC7");

    expect(source).not.toContain('<MockupSection label="Quick Reply"');
    expect(source).not.toContain("TodaySupportDock");
    expect(source).not.toContain("TODAY QUEUE");
    expect(source).not.toContain("widgetActionChip");
    expect(source).not.toContain('label: "Settings"');
    expect(source).not.toContain('navigation.navigate("Account")');
    expect(source).not.toContain("GearLineIcon");
  });

  it("uses the Screen shell with a mono date side label and pull-to-refresh", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    // Header: left "Today" title, right mono date (e.g. "7.2 WED"); no icon buttons.
    expect(source).toContain('<Screen title="Today" side={todayDateLabel}');
    expect(source).toContain("formatTodayDate(new Date())");
    expect(source).toContain('["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]');
    expect(source).not.toContain("actions={[");
    expect(source).not.toContain("RefreshLineIcon");
    expect(source).not.toContain("FriendsGroupIcon");

    // Refresh stays on the Screen primitive's native pull-to-refresh.
    expect(source).toContain("refreshing={refreshing}");
    expect(source).toContain("onRefresh={refresh}");
    expect(source).not.toContain("RefreshControl");
  });

  it("renders the incoming hero as a perforated Card slip with sig semantics from primitives", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    // Signal semantics come from primitives, never ad-hoc sig styling.
    expect(source).toContain("<SignalKindLabel>");
    expect(source).toContain('"INCOMING BLINK" : "INCOMING BEEP"');
    expect(source).not.toContain("color: palette.sig");
    expect(source).not.toContain("backgroundColor: palette.sig");

    // Perforation divider is the primitive punch-hole rule.
    expect(source).toContain("<Perforation />");

    // Time is a dim mono value beside the kind label.
    expect(source).toContain("<MonoValue dim style={styles.slipTime}>");

    expect(source).toContain("useAppPalette");
    expect(source).toContain('accessibilityLabel="Open signal"');

    expect(source).not.toContain("StatusPill");

    // Blink frames live in the hero slip (Widget Mirror is gone).
    expect(source).toContain("frameUris?.length");
    expect(source).toContain("const latestFrameUris = latestMessage?.media?.stripFrameUris ?? undefined");
    expect(source).toContain("frameUris={latestFrameUris}");
    expect(source).toContain("hasBlink={latestSignal.hasBlink}");
  });

  it("scales the hero code to mockup size with safe shrink for long tokens", () => {
    const source = readSource("src/screens/TodayScreen.tsx");
    const typographySource = readSource("src/design/typography.ts");

    // Mockup hero-code is 72px on a 390pt frame; type.codeHero is the app-side scale.
    expect(typographySource).toContain("codeHero");
    expect(source).toContain("...type.codeHero");
    expect(source).not.toContain("type.codeMedium");

    // Long codes (word/emoji tokens) shrink instead of clipping.
    expect(source).toContain("numberOfLines={1}");
    expect(source).toContain("adjustsFontSizeToFit");
    expect(source).toContain("minimumFontScale");
  });

  it("answers with three quick-reply slot chips reusing the reply-room send path", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    // Slots come from the shared quickReplySlots source (3-slot contract).
    expect(source).toContain("buildQuickReplySlots(entries, DEFAULT_QUICK_REPLY_SLOTS)");
    expect(source).toContain("slots={quickReplySlots}");
    expect(source).toContain("slots.slice(0, 3).map((slot)");

    // Chip tap replies immediately through the existing store send path; read on success.
    expect(source).toContain("await quickReply(latestMessage.id, slot)");
    expect(source).toContain("await read(latestMessage.id)");
    expect(source).toContain("onQuickReply={handleQuickReply}");
    expect(source).toContain('if (slot === "Done")');

    // Sending disables chips; the sent chip flips to the Chip selected ink fill.
    expect(source).toContain("selected={sentSlot === slot}");
    expect(source).toContain("disabled={sending}");
    expect(source).toContain("accessibilityLabel={`Quick reply ${slot}`}");

    // The dedicated OK/OPEN buttons are gone; the hero slip itself opens the reply room.
    expect(source).not.toContain('"OPEN"');
    expect(source).not.toContain('"OK"');
    expect(source).not.toContain("doneFeedback");
    expect(source).not.toContain('accessibilityLabel="Mark signal done"');
    expect(source).toContain("onPress={onView}");
    expect(source).toContain('navigation.navigate("ReplyRoom", { signalId: latestMessage.id })');
  });

  it("renders blink frames without index badges and with one muted caption", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    // Today renders its own strip: three rounded rule-bordered frames, no 1/2/3 badges, no "2s" chip.
    expect(source).not.toContain("MiniFrameStrip");
    expect(source).not.toContain("frameIndex");
    expect(source).not.toContain("cameraChip");
    expect(source).toContain("borderColor: palette.rule");
    expect(source).toContain("2.0s · 무음");
    expect(source).toContain("...type.tinyMono");
    expect(source).toContain("color: palette.muted");
  });

  it("marks the hero time as 방금 within five minutes", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    expect(source).toContain("isJustNow(latestMessage.created_at)");
    expect(source).toContain("`${latestSignal.time} · 방금`");
    expect(source).toContain("5 * 60 * 1000");
    expect(source).toContain("time={latestHeroTime}");
  });

  it("uses SectionLabel for both sections and keeps the left label primary", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    // Today passes no right-side hint; single left label per section.
    expect(source).toContain("<SectionLabel>최근 신호</SectionLabel>");
    expect(source).toContain("<SectionLabel>친구</SectionLabel>");
    expect(source).not.toContain("hint=");
  });

  it("renders the 친구 section as a Card of ListRows with sig reserved for new signals", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    // Up to 4 friends, quiet friends included with a "조용해요" meta.
    expect(source).toContain("friends.slice(0, 4).map((friend, index)");
    expect(source).toContain('formatPulseTime(recentSignal.created_at) : "조용해요"');

    // Status dot: new signal = sig, otherwise online = presence green — via StatusDot.
    expect(source).toContain("isNew: Boolean(recentSignal && !recentSignal.is_read)");
    expect(source).toContain('online: friend.friend.status_icon === "online"');
    expect(source).toContain('<StatusDot kind={isNew ? "new" : "on"} />');

    // Right-side mono code: sig only for unread new signals, dim otherwise — via MonoValue.
    expect(source).toContain("<MonoValue sig={row.isNew} dim={!row.isNew}>");
    expect(source).toContain("metaMono");

    // Row tap reuses the existing Send navigation contract.
    expect(source).toContain('navigation.navigate("Send", {');
    expect(source).toContain("friendId: row.id");
    expect(source).toContain("accessibilityLabel={`Send signal to ${row.name}`}");
  });

  it("does not synthesize fake Today values without real signals", () => {
    const source = readSource("src/screens/TodayScreen.tsx");

    expect(source).not.toContain('const fallbackCodes = ["OK", "8282", "BLINK"]');
    expect(source).not.toContain('latestSignal?.code ?? "8282"');
    expect(source).not.toContain('profile?.nickname?.trim() ?? "민아"');
    // Quiet friends show a null code rendered as a dim placeholder, never an invented code.
    expect(source).toContain('recentSignal ? (isBlink ? "BLINK" : recentSignal.number_code) : null');
    expect(source).toContain('{row.code ?? "—"}');
  });
});
