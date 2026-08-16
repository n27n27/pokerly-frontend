# Pokerly Frontend

- Vue 3 + Quasar
- Axios
- Build: Vite

## Dev

1. `npm install`
2. `quasar dev`
3. `.env.development`:
   - `VITE_API_BASE_URL=http://localhost:8080/api`
   - `VITE_API_TIMEOUT=10000`

## Build

1. `quasar build`
2. 결과물: `dist/spa/`

## iOS / Android (Capacitor)

네이티브 앱 ID는 두 플랫폼 모두 `kr.pokerly.app`을 사용한다. 웹 코드를 빌드하고
플랫폼 프로젝트에 동기화하려면 다음 명령을 실행한다.

```bash
npm run mobile:build:ios
npm run mobile:build:android
```

IDE에서 실행하거나 에뮬레이터를 선택하려면 다음 명령을 사용한다.

```bash
npm run mobile:open:ios
npm run mobile:open:android
```

- iOS: Xcode와 iOS Simulator runtime이 필요하다.
- Android: Android Studio에서 SDK를 설치하고 `ANDROID_HOME` 또는
  `src-capacitor/android/local.properties`의 `sdk.dir`을 설정해야 한다.
- 실제 기기가 없어도 Xcode Simulator와 Android Emulator로 주요 흐름을 검증할 수 있다.
- `pokerly://app/home` 커스텀 딥 링크는 양쪽 플랫폼에서 바로 사용할 수 있다.
- `https://pokerly.kr/...` 앱 링크 자동 연결은 출시 서명 정보가 정해진 뒤 서버에
  AASA 및 `assetlinks.json`을 배포해야 완성된다.

네이티브 프로젝트를 다시 생성하지 말고 `src-capacitor/ios`,
`src-capacitor/android`를 앱 설정의 원본으로 관리한다.

## Production (EC2)

프런트는 정적 파일만 업로드하면 반영됨.

### 배포 절차

1. 기존 파일 삭제
   - `ssh ubuntu@pokerly.kr "rm -rf /srv/pokerly/frontend/*"`
2. 새 빌드 업로드
   - `scp -r dist/spa/* ubuntu@pokerly.kr:/srv/pokerly/frontend/`

## Nginx (요약)

- `root /srv/pokerly/frontend;`
- SPA 라우팅: `try_files $uri $uri/ /index.html;`
- API 프록시: `/api → http://127.0.0.1:9000`
