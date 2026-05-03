# Remove App Pager Frame

## Decision

Runtime app screens should not render inside the black pager hardware shell. The shell remains available as a component for mockup/widget demonstration contexts, but operated app screens should use a direct cream paper surface.

## Scope

- Added `AppSurface` as the common runtime app screen wrapper.
- Replaced `PagerFrame` usage in Today, People, Send Beep, Send Blink, Reply Room, Studio, Logs, First Run, and Widget States screens.
- Kept the bottom tab bar black as navigation chrome, not as an outer pager/device frame.
- Added explicit status-bar styles so cream app screens use dark Android status icons and the black login stage keeps light icons.

## Verification

- `npm run typecheck`
- `npm test -- --runInBand`
- `npx --yes expo-doctor`
- Android emulator UI preview screenshots:
  - `C:/Users/slime/AppData/Local/Temp/beep-get-frameless-today-v3.png`
  - `C:/Users/slime/AppData/Local/Temp/beep-get-frameless-send.png`

## Remaining Gaps

- iOS status-bar behavior was not verified locally because this Windows environment cannot run the iOS app.
- Real Android launcher widget placement remains separate from this in-app UI frame cleanup.
