# Play Store Metadata Draft

## App Identity

- App name: Beep Get
- Package name: `com.hypeboyo.beepget`
- Category: Social
- Initial track: Internal testing

## Short Description

홈 화면 위젯으로 주고받는 작은 삐삐 메시지.

## Full Description

Beep Get은 친구와 숫자 코드, 상태, 짧은 메시지를 주고받는 레트로 위젯형 소셜 앱입니다.

홈 화면에 작은 삐삐를 올려두고, 앱을 자주 열지 않아도 친구의 신호를 가볍게 확인할 수 있도록 설계했습니다. QR 코드와 삐삐 번호로 친구를 추가하고, 스킨과 상태를 바꿔 나만의 작은 호출기를 꾸밀 수 있습니다.

주요 기능:

- 삐삐 번호 기반 친구 추가
- QR 코드 스캔으로 빠른 친구 연결
- 짧은 코드 메시지 송수신
- 홈 화면 위젯으로 메시지 확인
- 상태와 스킨 커스터마이징

## Permission Notes

- Camera: QR 코드로 친구를 추가할 때만 사용합니다.
- Contacts: 연락처에서 Beep Get 친구를 찾기 위한 기능에 사용합니다. 현재 앱 코드는 연락처를 외부 서버로 업로드하지 않습니다.
- Notifications: 현재 코드에서 직접 요청하지 않습니다. 사용 시작 전 실제 필요 여부를 다시 확인해야 합니다.

## Data Safety Draft

- Account/user profile data: Supabase 인증 및 프로필 생성을 위해 사용합니다.
- User-generated messages/status: 친구 간 메시지와 상태 동기화를 위해 Supabase에 저장합니다.
- Contacts: 기기에서 읽을 수 있지만 현재 구현은 서버 전송 없이 빈 결과를 반환합니다.
- Camera: QR 스캔 화면에서만 사용하며 이미지/영상은 저장하지 않습니다.

## Store Blockers

- Privacy policy URL is required before public or wider testing if personal data/contacts are disclosed.
- Google Play Data Safety answers must be finalized against the live Supabase schema and runtime behavior.
- Screenshots should be captured from an Android device/emulator after runtime QA.
